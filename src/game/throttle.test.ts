import { describe, it, expect } from "vitest";
import { createThrottleState, shouldSendUpdate, markSent } from "./throttle";

describe("throttle", () => {
  const INTERVAL = 100; // 10 Hz

  it("allows first update immediately", () => {
    const state = createThrottleState();
    expect(shouldSendUpdate(state, 10, 20, 1000, INTERVAL)).toBe(true);
  });

  it("blocks update before interval elapsed", () => {
    const state = createThrottleState();
    markSent(state, 10, 20, 1000);
    expect(shouldSendUpdate(state, 15, 25, 1050, INTERVAL)).toBe(false);
  });

  it("allows update after interval elapsed", () => {
    const state = createThrottleState();
    markSent(state, 10, 20, 1000);
    expect(shouldSendUpdate(state, 15, 25, 1100, INTERVAL)).toBe(true);
  });

  it("blocks update if position unchanged", () => {
    const state = createThrottleState();
    markSent(state, 10, 20, 1000);
    expect(shouldSendUpdate(state, 10, 20, 1200, INTERVAL)).toBe(false);
  });

  it("allows update if only X changed", () => {
    const state = createThrottleState();
    markSent(state, 10, 20, 1000);
    expect(shouldSendUpdate(state, 11, 20, 1100, INTERVAL)).toBe(true);
  });

  it("allows update if only Y changed", () => {
    const state = createThrottleState();
    markSent(state, 10, 20, 1000);
    expect(shouldSendUpdate(state, 10, 21, 1100, INTERVAL)).toBe(true);
  });

  it("markSent updates state correctly", () => {
    const state = createThrottleState();
    markSent(state, 42, 84, 5000);
    expect(state.lastSentAt).toBe(5000);
    expect(state.lastX).toBe(42);
    expect(state.lastY).toBe(84);
  });

  it("works across multiple send cycles", () => {
    const state = createThrottleState();

    // First send
    expect(shouldSendUpdate(state, 10, 20, 1000, INTERVAL)).toBe(true);
    markSent(state, 10, 20, 1000);

    // Too soon
    expect(shouldSendUpdate(state, 15, 25, 1050, INTERVAL)).toBe(false);

    // Ready
    expect(shouldSendUpdate(state, 15, 25, 1100, INTERVAL)).toBe(true);
    markSent(state, 15, 25, 1100);

    // Too soon again
    expect(shouldSendUpdate(state, 20, 30, 1150, INTERVAL)).toBe(false);

    // Ready again
    expect(shouldSendUpdate(state, 20, 30, 1200, INTERVAL)).toBe(true);
  });
});
