import { describe, it, expect, beforeEach } from "vitest";
import { useVibeStore } from "./store";

describe("VibeStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useVibeStore.setState({
      identity: { displayName: "", photo: null, sessionToken: null },
      x: 400,
      y: 300,
      peers: new Map(),
      connected: false,
    });
  });

  describe("identity", () => {
    it("sets display name and photo", () => {
      useVibeStore.getState().setIdentity("Alice", "photo.png");
      const { identity } = useVibeStore.getState();
      expect(identity.displayName).toBe("Alice");
      expect(identity.photo).toBe("photo.png");
    });

    it("sets session token", () => {
      useVibeStore.getState().setSessionToken("token-123");
      expect(useVibeStore.getState().identity.sessionToken).toBe("token-123");
    });

    it("preserves other identity fields when setting token", () => {
      useVibeStore.getState().setIdentity("Alice", "photo.png");
      useVibeStore.getState().setSessionToken("token-123");
      const { identity } = useVibeStore.getState();
      expect(identity.displayName).toBe("Alice");
      expect(identity.photo).toBe("photo.png");
      expect(identity.sessionToken).toBe("token-123");
    });
  });

  describe("position", () => {
    it("has default center position", () => {
      const { x, y } = useVibeStore.getState();
      expect(x).toBe(400);
      expect(y).toBe(300);
    });

    it("updates position", () => {
      useVibeStore.getState().setPosition(100, 200);
      const { x, y } = useVibeStore.getState();
      expect(x).toBe(100);
      expect(y).toBe(200);
    });
  });

  describe("peers", () => {
    it("adds a peer", () => {
      useVibeStore.getState().updatePeer({
        userId: "peer-1",
        displayName: "Bob",
        photo: null,
        x: 50,
        y: 60,
        zoneId: "zone-1",
        spaceId: "space-1",
        lastUpdated: Date.now(),
      });
      expect(useVibeStore.getState().peers.size).toBe(1);
      expect(useVibeStore.getState().peers.get("peer-1")?.displayName).toBe("Bob");
    });

    it("updates existing peer", () => {
      const peer = {
        userId: "peer-1",
        displayName: "Bob",
        photo: null,
        x: 50,
        y: 60,
        zoneId: "zone-1",
        spaceId: "space-1",
        lastUpdated: Date.now(),
      };
      useVibeStore.getState().updatePeer(peer);
      useVibeStore.getState().updatePeer({ ...peer, x: 100 });
      expect(useVibeStore.getState().peers.get("peer-1")?.x).toBe(100);
    });

    it("removes a peer", () => {
      useVibeStore.getState().updatePeer({
        userId: "peer-1",
        displayName: "Bob",
        photo: null,
        x: 50,
        y: 60,
        zoneId: "zone-1",
        spaceId: "space-1",
        lastUpdated: Date.now(),
      });
      useVibeStore.getState().removePeer("peer-1");
      expect(useVibeStore.getState().peers.size).toBe(0);
    });
  });

  describe("connection", () => {
    it("starts disconnected", () => {
      expect(useVibeStore.getState().connected).toBe(false);
    });

    it("sets connected state", () => {
      useVibeStore.getState().setConnected(true);
      expect(useVibeStore.getState().connected).toBe(true);
    });
  });
});
