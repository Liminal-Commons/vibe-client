/**
 * Hook that manages the WebSocket connection to vibe-server.
 * Wires protocol messages to the Zustand store and exposes
 * send functions for outbound messages.
 */

import { useEffect, useRef, useCallback } from "react";
import { createVibeSocket, type VibeSocket } from "./ws";
import { useVibeStore } from "./store";
import type {
  IdentityAckMessage,
  PresenceMessage,
  ChatMessage,
  TranscriptMessage,
  ErrorMessage,
} from "./protocol";

const WS_URL = import.meta.env.VITE_WS_URL as string | undefined ?? "ws://192.168.1.163:30104/ws";

export interface VibeConnection {
  sendChat: (text: string) => void;
  sendPosition: (x: number, y: number) => void;
  sendZoneJoin: (spaceId: string, zoneId: string) => void;
  sendZoneLeave: (spaceId: string, zoneId: string) => void;
}

export function useVibeConnection(): VibeConnection {
  const socketRef = useRef<VibeSocket | null>(null);

  useEffect(() => {
    const store = useVibeStore.getState();
    const displayName = store.identity.displayName || "Anonymous";

    const socket = createVibeSocket({
      url: WS_URL,

      onOpen: () => {
        useVibeStore.getState().setConnected(true);
        // Send identity immediately on connect
        socket.send({
          type: "identity",
          displayName,
          photo: useVibeStore.getState().identity.photo,
        });
      },

      onClose: () => {
        useVibeStore.getState().setConnected(false);
      },

      onError: () => {
        useVibeStore.getState().setConnected(false);
      },

      onUnknownMessage: (type) => {
        console.warn("[vibe] unknown message type:", type);
      },
    });

    // Handle identity acknowledgment
    socket.on<IdentityAckMessage>("identity:ack", (msg) => {
      useVibeStore.getState().setSessionToken(msg.sessionToken);
      useVibeStore.getState().setIdentity(msg.displayName, null);
    });

    // Handle presence updates from other peers
    socket.on<PresenceMessage>("presence", (msg) => {
      useVibeStore.getState().updatePeer({
        userId: msg.userId,
        displayName: msg.displayName,
        photo: msg.photo ?? null,
        x: msg.x,
        y: msg.y,
        zoneId: msg.zoneId,
        spaceId: msg.spaceId,
        lastUpdated: Date.now(),
      });
    });

    // Handle incoming chat messages
    socket.on<ChatMessage>("chat", (msg) => {
      useVibeStore.getState().addChatMessage({
        id: `${msg.senderId ?? "unknown"}-${msg.timestamp ?? Date.now()}`,
        senderId: msg.senderId ?? "unknown",
        senderName: msg.senderName ?? "Unknown",
        text: msg.text,
        timestamp: msg.timestamp ?? Date.now(),
      });
    });

    // Handle transcripts (speech-to-text results)
    socket.on<TranscriptMessage>("transcript", (msg) => {
      useVibeStore.getState().addChatMessage({
        id: `transcript-${msg.speakerId}-${msg.timestamp}`,
        senderId: msg.speakerId,
        senderName: msg.speakerName,
        text: msg.text,
        timestamp: msg.timestamp,
      });
    });

    // Handle errors from server
    socket.on<ErrorMessage>("error", (msg) => {
      console.error("[vibe] server error:", msg.code, msg.message);
    });

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
      useVibeStore.getState().setConnected(false);
    };
  }, []);

  const sendChat = useCallback((text: string) => {
    socketRef.current?.send({ type: "chat", text });
  }, []);

  const sendPosition = useCallback((x: number, y: number) => {
    socketRef.current?.send({ type: "position", x, y });
  }, []);

  const sendZoneJoin = useCallback((spaceId: string, zoneId: string) => {
    socketRef.current?.send({ type: "zone:join", spaceId, zoneId });
  }, []);

  const sendZoneLeave = useCallback((spaceId: string, zoneId: string) => {
    socketRef.current?.send({ type: "zone:leave", spaceId, zoneId });
  }, []);

  return { sendChat, sendPosition, sendZoneJoin, sendZoneLeave };
}
