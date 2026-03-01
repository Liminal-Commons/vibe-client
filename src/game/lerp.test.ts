import { describe, it, expect } from "vitest";
import { createLerpTarget, lerpPosition } from "./lerp";

describe("lerp", () => {
  it("returns start position at t=0", () => {
    const target = createLerpTarget(0, 0, 100, 200, 1000, 200);
    const pos = lerpPosition(target, 1000);
    expect(pos.x).toBe(0);
    expect(pos.y).toBe(0);
  });

  it("returns end position at t=duration", () => {
    const target = createLerpTarget(0, 0, 100, 200, 1000, 200);
    const pos = lerpPosition(target, 1200);
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(200);
  });

  it("returns end position after duration (clamp)", () => {
    const target = createLerpTarget(0, 0, 100, 200, 1000, 200);
    const pos = lerpPosition(target, 2000);
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(200);
  });

  it("interpolates at midpoint", () => {
    const target = createLerpTarget(0, 0, 100, 200, 1000, 200);
    const pos = lerpPosition(target, 1100);
    expect(pos.x).toBe(50);
    expect(pos.y).toBe(100);
  });

  it("interpolates at quarter", () => {
    const target = createLerpTarget(0, 0, 100, 200, 1000, 200);
    const pos = lerpPosition(target, 1050);
    expect(pos.x).toBe(25);
    expect(pos.y).toBe(50);
  });

  it("works with negative coordinates", () => {
    const target = createLerpTarget(-50, -100, 50, 100, 0, 100);
    const pos = lerpPosition(target, 50);
    expect(pos.x).toBe(0);
    expect(pos.y).toBe(0);
  });

  it("handles zero-distance movement", () => {
    const target = createLerpTarget(42, 84, 42, 84, 0, 100);
    const pos = lerpPosition(target, 50);
    expect(pos.x).toBe(42);
    expect(pos.y).toBe(84);
  });

  it("creates target with correct fields", () => {
    const target = createLerpTarget(10, 20, 30, 40, 5000, 150);
    expect(target.fromX).toBe(10);
    expect(target.fromY).toBe(20);
    expect(target.toX).toBe(30);
    expect(target.toY).toBe(40);
    expect(target.startTime).toBe(5000);
    expect(target.duration).toBe(150);
  });
});
