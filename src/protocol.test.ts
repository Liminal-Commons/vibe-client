import { describe, it, expect } from "vitest";
import { encode, decode } from "@msgpack/msgpack";
import { isWireMessage } from "./protocol";
import type {
  PositionMessage,
  ChatMessage,
  ZoneJoinMessage,
  IdentityMessage,
  TranscriptMessage,
  PresenceMessage,
  AudioMessage,
  ErrorMessage,
  WireMessage,
} from "./protocol";

describe("isWireMessage", () => {
  it("accepts all valid message types", () => {
    const types = [
      "position",
      "chat",
      "zone:join",
      "zone:leave",
      "identity",
      "identity:ack",
      "transcript",
      "presence",
      "audio",
      "error",
    ];
    for (const type of types) {
      expect(isWireMessage({ type })).toBe(true);
    }
  });

  it("rejects unknown types", () => {
    expect(isWireMessage({ type: "unknown" })).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(isWireMessage(null)).toBe(false);
    expect(isWireMessage(42)).toBe(false);
    expect(isWireMessage("position")).toBe(false);
  });

  it("rejects objects without type", () => {
    expect(isWireMessage({})).toBe(false);
  });
});

describe("MessagePack round-trip (client-side)", () => {
  function roundTrip<T extends WireMessage>(msg: T): unknown {
    return decode(encode(msg));
  }

  it("round-trips position messages", () => {
    const msg: PositionMessage = { type: "position", x: 42, y: 84 };
    expect(roundTrip(msg)).toEqual(msg);
  });

  it("round-trips chat messages with all fields", () => {
    const msg: ChatMessage = {
      type: "chat",
      text: "hi",
      senderId: "u1",
      senderName: "Alice",
      timestamp: 1234567890,
    };
    expect(roundTrip(msg)).toEqual(msg);
  });

  it("round-trips zone join", () => {
    const msg: ZoneJoinMessage = { type: "zone:join", spaceId: "cafe", zoneId: "floor" };
    expect(roundTrip(msg)).toEqual(msg);
  });

  it("round-trips identity with photo", () => {
    const msg: IdentityMessage = { type: "identity", displayName: "Bob", photo: "base64..." };
    expect(roundTrip(msg)).toEqual(msg);
  });

  it("round-trips transcript", () => {
    const msg: TranscriptMessage = {
      type: "transcript",
      speakerId: "u2",
      speakerName: "Carol",
      text: "hello world",
      timestamp: Date.now(),
    };
    expect(roundTrip(msg)).toEqual(msg);
  });

  it("round-trips presence", () => {
    const msg: PresenceMessage = {
      type: "presence",
      userId: "u3",
      displayName: "Dan",
      photo: null,
      x: 100,
      y: 200,
      zoneId: "talk",
      spaceId: "cafe",
    };
    expect(roundTrip(msg)).toEqual(msg);
  });

  it("round-trips audio", () => {
    const msg: AudioMessage = { type: "audio", data: "base64chunk" };
    expect(roundTrip(msg)).toEqual(msg);
  });

  it("round-trips error", () => {
    const msg: ErrorMessage = { type: "error", code: "ERR", message: "something broke" };
    expect(roundTrip(msg)).toEqual(msg);
  });

  it("produces smaller output than JSON", () => {
    const msg: PositionMessage = { type: "position", x: 123.456, y: 789.012 };
    const msgpackSize = encode(msg).byteLength;
    const jsonSize = new TextEncoder().encode(JSON.stringify(msg)).byteLength;
    expect(msgpackSize).toBeLessThan(jsonSize);
  });
});
