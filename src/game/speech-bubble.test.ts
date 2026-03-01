import { describe, it, expect } from "vitest";
import { SpeechBubbleManager } from "./speech-bubble";

describe("SpeechBubbleManager", () => {
  it("adds a bubble", () => {
    const mgr = new SpeechBubbleManager();
    const bubble = mgr.addBubble("speaker-1", "Hello!", 1000);
    expect(bubble.speakerId).toBe("speaker-1");
    expect(bubble.text).toBe("Hello!");
    expect(mgr.count).toBe(1);
  });

  it("assigns unique IDs", () => {
    const mgr = new SpeechBubbleManager();
    const b1 = mgr.addBubble("s1", "a", 1000);
    const b2 = mgr.addBubble("s1", "b", 1000);
    expect(b1.id).not.toBe(b2.id);
  });

  it("sets correct timing", () => {
    const mgr = new SpeechBubbleManager({ displayMs: 5000, fadeDurationMs: 2000 });
    const bubble = mgr.addBubble("s1", "test", 1000);
    expect(bubble.createdAt).toBe(1000);
    expect(bubble.fadeAt).toBe(6000); // 1000 + 5000
    expect(bubble.expireAt).toBe(8000); // 1000 + 5000 + 2000
  });

  describe("opacity", () => {
    it("returns 1.0 during display phase", () => {
      const mgr = new SpeechBubbleManager({ displayMs: 5000, fadeDurationMs: 2000 });
      const bubble = mgr.addBubble("s1", "test", 1000);
      expect(mgr.getOpacity(bubble, 1000)).toBe(1.0);
      expect(mgr.getOpacity(bubble, 5999)).toBe(1.0);
    });

    it("returns decreasing opacity during fade phase", () => {
      const mgr = new SpeechBubbleManager({ displayMs: 5000, fadeDurationMs: 2000 });
      const bubble = mgr.addBubble("s1", "test", 1000);
      // Halfway through fade (6000 + 1000 = 7000)
      expect(mgr.getOpacity(bubble, 7000)).toBeCloseTo(0.5);
    });

    it("returns 0.0 after expiry", () => {
      const mgr = new SpeechBubbleManager({ displayMs: 5000, fadeDurationMs: 2000 });
      const bubble = mgr.addBubble("s1", "test", 1000);
      expect(mgr.getOpacity(bubble, 8000)).toBe(0.0);
      expect(mgr.getOpacity(bubble, 9000)).toBe(0.0);
    });
  });

  describe("cleanup", () => {
    it("removes expired bubbles", () => {
      const mgr = new SpeechBubbleManager({ displayMs: 1000, fadeDurationMs: 500 });
      mgr.addBubble("s1", "a", 0);
      mgr.addBubble("s2", "b", 500);

      // At t=1500, first bubble expired (0 + 1000 + 500 = 1500)
      const removed = mgr.cleanup(1500);
      expect(removed).toHaveLength(1);
      expect(mgr.count).toBe(1);
    });

    it("returns IDs of removed bubbles", () => {
      const mgr = new SpeechBubbleManager({ displayMs: 100, fadeDurationMs: 100 });
      const b = mgr.addBubble("s1", "a", 0);
      const removed = mgr.cleanup(200);
      expect(removed).toContain(b.id);
    });
  });

  describe("max per speaker", () => {
    it("evicts oldest bubble when max reached", () => {
      const mgr = new SpeechBubbleManager({ maxPerSpeaker: 2 });
      const b1 = mgr.addBubble("s1", "first", 0);
      mgr.addBubble("s1", "second", 100);
      mgr.addBubble("s1", "third", 200);

      const all = mgr.getAll();
      expect(all).toHaveLength(2);
      expect(all.find((b) => b.id === b1.id)).toBeUndefined();
    });

    it("does not evict other speakers' bubbles", () => {
      const mgr = new SpeechBubbleManager({ maxPerSpeaker: 1 });
      mgr.addBubble("s1", "hello", 0);
      mgr.addBubble("s2", "world", 100);
      expect(mgr.count).toBe(2);
    });
  });

  describe("getBySpeaker", () => {
    it("returns bubbles for a specific speaker", () => {
      const mgr = new SpeechBubbleManager();
      mgr.addBubble("s1", "a", 0);
      mgr.addBubble("s2", "b", 0);
      mgr.addBubble("s1", "c", 0);

      const s1Bubbles = mgr.getBySpeaker("s1");
      expect(s1Bubbles).toHaveLength(2);
    });
  });

  describe("removeSpeaker", () => {
    it("removes all bubbles for a speaker", () => {
      const mgr = new SpeechBubbleManager();
      mgr.addBubble("s1", "a", 0);
      mgr.addBubble("s2", "b", 0);
      mgr.removeSpeaker("s1");
      expect(mgr.count).toBe(1);
      expect(mgr.getBySpeaker("s1")).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("removes all bubbles", () => {
      const mgr = new SpeechBubbleManager();
      mgr.addBubble("s1", "a", 0);
      mgr.addBubble("s2", "b", 0);
      mgr.clear();
      expect(mgr.count).toBe(0);
    });
  });
});
