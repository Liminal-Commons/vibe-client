/**
 * Zustand store for vibe-client state.
 * Manages identity, position, remote peers, and connection state.
 */

import { create } from "zustand";

/** A remote peer's state */
export interface PeerState {
  userId: string;
  displayName: string;
  photo: string | null;
  x: number;
  y: number;
  zoneId: string;
  spaceId: string;
  lastUpdated: number;
}

/** Local player identity */
export interface IdentityState {
  displayName: string;
  photo: string | null;
  sessionToken: string | null;
}

/** A chat message in the history */
export interface ChatMessageState {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

const MAX_CHAT_MESSAGES = 100;

export interface VibeStore {
  // Identity
  identity: IdentityState;
  setIdentity: (displayName: string, photo: string | null) => void;
  setSessionToken: (token: string) => void;

  // Local position
  x: number;
  y: number;
  setPosition: (x: number, y: number) => void;

  // Remote peers
  peers: Map<string, PeerState>;
  updatePeer: (peer: PeerState) => void;
  removePeer: (userId: string) => void;

  // Connection
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // Chat
  chatMessages: ChatMessageState[];
  addChatMessage: (msg: ChatMessageState) => void;
  currentZoneId: string | null;
  setCurrentZoneId: (zoneId: string | null) => void;
}

export const useVibeStore = create<VibeStore>((set) => ({
  // Identity
  identity: { displayName: "", photo: null, sessionToken: null },
  setIdentity: (displayName, photo) =>
    set((state) => ({
      identity: { ...state.identity, displayName, photo },
    })),
  setSessionToken: (token) =>
    set((state) => ({
      identity: { ...state.identity, sessionToken: token },
    })),

  // Local position (center of a 800x600 default scene)
  x: 400,
  y: 300,
  setPosition: (x, y) => set({ x, y }),

  // Remote peers
  peers: new Map(),
  updatePeer: (peer) =>
    set((state) => {
      const next = new Map(state.peers);
      next.set(peer.userId, peer);
      return { peers: next };
    }),
  removePeer: (userId) =>
    set((state) => {
      const next = new Map(state.peers);
      next.delete(userId);
      return { peers: next };
    }),

  // Connection
  connected: false,
  setConnected: (connected) => set({ connected }),

  // Chat
  chatMessages: [],
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, msg].slice(-MAX_CHAT_MESSAGES),
    })),
  currentZoneId: null,
  setCurrentZoneId: (zoneId) => set({ currentZoneId: zoneId }),
}));
