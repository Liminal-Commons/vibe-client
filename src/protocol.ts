/**
 * Wire protocol types for vibe-client ↔ vibe-server communication.
 * Mirrors packages/vibe-server/src/protocol.ts — kept in sync via tests.
 */

export type MessageType =
  | "position"
  | "chat"
  | "zone:join"
  | "zone:leave"
  | "identity"
  | "identity:ack"
  | "transcript"
  | "presence"
  | "audio"
  | "error";

export interface BaseMessage {
  type: MessageType;
}

export interface PositionMessage extends BaseMessage {
  type: "position";
  x: number;
  y: number;
}

export interface ChatMessage extends BaseMessage {
  type: "chat";
  text: string;
  senderId?: string;
  senderName?: string;
  timestamp?: number;
}

export interface ZoneJoinMessage extends BaseMessage {
  type: "zone:join";
  spaceId: string;
  zoneId: string;
}

export interface ZoneLeaveMessage extends BaseMessage {
  type: "zone:leave";
  spaceId: string;
  zoneId: string;
}

export interface IdentityMessage extends BaseMessage {
  type: "identity";
  displayName: string;
  photo?: string | null;
}

export interface IdentityAckMessage extends BaseMessage {
  type: "identity:ack";
  sessionToken: string;
  displayName: string;
}

export interface TranscriptMessage extends BaseMessage {
  type: "transcript";
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: number;
}

export interface PresenceMessage extends BaseMessage {
  type: "presence";
  userId: string;
  displayName: string;
  photo?: string | null;
  x: number;
  y: number;
  zoneId: string;
  spaceId: string;
}

export interface AudioMessage extends BaseMessage {
  type: "audio";
  data: string;
}

export interface ErrorMessage extends BaseMessage {
  type: "error";
  code: string;
  message: string;
}

export type WireMessage =
  | PositionMessage
  | ChatMessage
  | ZoneJoinMessage
  | ZoneLeaveMessage
  | IdentityMessage
  | IdentityAckMessage
  | TranscriptMessage
  | PresenceMessage
  | AudioMessage
  | ErrorMessage;

const VALID_TYPES: ReadonlySet<string> = new Set<MessageType>([
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
]);

export function isWireMessage(obj: unknown): obj is WireMessage {
  if (typeof obj !== "object" || obj === null) return false;
  const msg = obj as Record<string, unknown>;
  if (typeof msg["type"] !== "string") return false;
  return VALID_TYPES.has(msg["type"]);
}
