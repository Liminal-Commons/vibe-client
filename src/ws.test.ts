import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { encode } from "@msgpack/msgpack";
import type { PositionMessage, ChatMessage } from "./protocol";

/**
 * Mock WebSocket for testing. Simulates the browser WebSocket API.
 */
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  binaryType = "blob";

  private listeners = new Map<string, Array<(event: unknown) => void>>();

  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  addEventListener(type: string, handler: (event: unknown) => void) {
    const existing = this.listeners.get(type) ?? [];
    existing.push(handler);
    this.listeners.set(type, existing);
  }

  /** Test helper: simulate receiving a message */
  receiveMessage(data: ArrayBuffer) {
    const handlers = this.listeners.get("message") ?? [];
    for (const h of handlers) {
      h({ data });
    }
  }

  /** Test helper: simulate connection open */
  triggerOpen() {
    const handlers = this.listeners.get("open") ?? [];
    for (const h of handlers) h({});
  }

  /** Test helper: simulate connection close */
  triggerClose(code: number, reason: string) {
    const handlers = this.listeners.get("close") ?? [];
    for (const h of handlers) h({ code, reason });
  }
}

/** Captures the last instance constructed, for test assertions. */
const instances: MockWebSocket[] = [];

let createVibeSocket: typeof import("./ws").createVibeSocket;

beforeEach(async () => {
  instances.length = 0;
  const OrigMock = MockWebSocket;

  // Subclass that tracks instances without aliasing `this`
  class TrackingMock extends OrigMock {
    constructor() {
      super();
      instances.push(this);
    }
  }

  vi.stubGlobal(
    "WebSocket",
    Object.assign(TrackingMock, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 }),
  );
  const mod = await import("./ws");
  createVibeSocket = mod.createVibeSocket;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("createVibeSocket", () => {
  it("sends MessagePack-encoded messages", () => {
    const socket = createVibeSocket({ url: "ws://localhost:8000" });

    const msg: PositionMessage = { type: "position", x: 10, y: 20 };
    socket.send(msg);

    expect(instances[0]!.send).toHaveBeenCalledOnce();
    expect(instances[0]!.send).toHaveBeenCalledWith(expect.any(Uint8Array));
    expect(socket.connected).toBe(true);
  });

  it("dispatches incoming messages to type-specific handlers", () => {
    const handler = vi.fn();
    const socket = createVibeSocket({ url: "ws://localhost:8000" });
    socket.on("position", handler);

    const msg: PositionMessage = { type: "position", x: 42, y: 84 };
    instances[0]!.receiveMessage(new Uint8Array(encode(msg)).buffer.slice(0) as ArrayBuffer);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: "position", x: 42, y: 84 }),
    );
  });

  it("calls onUnknownMessage for unrecognized types", () => {
    const onUnknown = vi.fn();
    createVibeSocket({ url: "ws://localhost:8000", onUnknownMessage: onUnknown });

    const msg = { type: "bogus" };
    instances[0]!.receiveMessage(new Uint8Array(encode(msg)).buffer.slice(0) as ArrayBuffer);

    expect(onUnknown).toHaveBeenCalledWith("bogus");
  });

  it("removes handlers with off()", () => {
    const handler = vi.fn();
    const socket = createVibeSocket({ url: "ws://localhost:8000" });
    socket.on("chat", handler);
    socket.off("chat");

    const msg: ChatMessage = { type: "chat", text: "hello" };
    instances[0]!.receiveMessage(new Uint8Array(encode(msg)).buffer.slice(0) as ArrayBuffer);

    expect(handler).not.toHaveBeenCalled();
  });

  it("calls onOpen when connection opens", () => {
    const onOpen = vi.fn();
    createVibeSocket({ url: "ws://localhost:8000", onOpen });

    instances[0]!.triggerOpen();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("calls onClose when connection closes", () => {
    const onClose = vi.fn();
    createVibeSocket({ url: "ws://localhost:8000", onClose });

    instances[0]!.triggerClose(1000, "Normal closure");
    expect(onClose).toHaveBeenCalledWith(1000, "Normal closure");
  });
});
