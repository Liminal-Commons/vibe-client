/**
 * WebSocket client utility for connecting to vibe-server.
 * Handles MessagePack encoding/decoding and typed message dispatch.
 */

import { encode, decode } from "@msgpack/msgpack";
import type { MessageType, WireMessage } from "./protocol";
import { isWireMessage } from "./protocol";

export type MessageHandler<T extends WireMessage = WireMessage> = (message: T) => void;

export interface VibeSocket {
  /** Send a typed message to the server. */
  send(message: WireMessage): void;

  /** Register a handler for a specific message type. */
  on<T extends WireMessage>(type: T["type"], handler: MessageHandler<T>): void;

  /** Remove a handler for a specific message type. */
  off(type: MessageType): void;

  /** Close the WebSocket connection. */
  close(): void;

  /** Whether the connection is currently open. */
  readonly connected: boolean;
}

export interface VibeSocketOptions {
  /** WebSocket URL (e.g., ws://chora-node:30104) */
  url: string;
  /** Called when connection opens */
  onOpen?: () => void;
  /** Called when connection closes */
  onClose?: (code: number, reason: string) => void;
  /** Called on connection error */
  onError?: (error: Event) => void;
  /** Called when a message with an unknown type arrives */
  onUnknownMessage?: (type: string) => void;
}

export function createVibeSocket(options: VibeSocketOptions): VibeSocket {
  const handlers = new Map<MessageType, MessageHandler>();
  const ws = new WebSocket(options.url);
  ws.binaryType = "arraybuffer";

  ws.addEventListener("open", () => {
    options.onOpen?.();
  });

  ws.addEventListener("close", (event) => {
    options.onClose?.(event.code, event.reason);
  });

  ws.addEventListener("error", (event) => {
    options.onError?.(event);
  });

  ws.addEventListener("message", (event) => {
    const data = event.data as ArrayBuffer | Uint8Array | unknown;
    if (!(data instanceof ArrayBuffer || ArrayBuffer.isView(data))) return;

    let decoded: unknown;
    try {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
      decoded = decode(bytes);
    } catch {
      return;
    }

    if (!isWireMessage(decoded)) {
      const type =
        typeof decoded === "object" && decoded !== null
          ? String((decoded as Record<string, unknown>)["type"] ?? "unknown")
          : "non-object";
      options.onUnknownMessage?.(type);
      return;
    }

    const handler = handlers.get(decoded.type);
    handler?.(decoded);
  });

  function send(message: WireMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(encode(message));
    }
  }

  function on<T extends WireMessage>(type: T["type"], handler: MessageHandler<T>): void {
    handlers.set(type, handler as MessageHandler);
  }

  function off(type: MessageType): void {
    handlers.delete(type);
  }

  function close(): void {
    ws.close();
  }

  return {
    send,
    on,
    off,
    close,
    get connected() {
      return ws.readyState === WebSocket.OPEN;
    },
  };
}
