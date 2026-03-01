import { describe, it, expect } from "vitest";
import { findZoneAtPosition, detectZoneTransition, type ZoneBounds } from "./zones";

const TEST_ZONES: ZoneBounds[] = [
  { id: "zone-floor", name: "The Floor", x: 0, y: 0, width: 800, height: 600, color: 0x2a1f14 },
  {
    id: "zone-talk",
    name: "Talk Area",
    x: 200,
    y: 150,
    width: 400,
    height: 300,
    color: 0x3a2f24,
  },
];

describe("findZoneAtPosition", () => {
  it("finds zone at a position inside it", () => {
    const zone = findZoneAtPosition(400, 300, TEST_ZONES);
    // Talk Area is on top (later in array), but both match — returns first match
    expect(zone).not.toBeNull();
    expect(zone!.id).toBe("zone-floor");
  });

  it("returns null for position outside all zones", () => {
    const zone = findZoneAtPosition(-10, -10, TEST_ZONES);
    expect(zone).toBeNull();
  });

  it("detects position at zone boundary (inclusive start)", () => {
    const zone = findZoneAtPosition(0, 0, TEST_ZONES);
    expect(zone!.id).toBe("zone-floor");
  });

  it("detects position at zone boundary (exclusive end)", () => {
    const zone = findZoneAtPosition(800, 600, TEST_ZONES);
    expect(zone).toBeNull();
  });

  it("returns first matching zone for overlapping zones", () => {
    // Position inside both zones
    const zone = findZoneAtPosition(300, 200, TEST_ZONES);
    expect(zone!.id).toBe("zone-floor"); // first in array
  });

  it("returns empty array zone as null", () => {
    const zone = findZoneAtPosition(100, 100, []);
    expect(zone).toBeNull();
  });
});

describe("detectZoneTransition", () => {
  it("returns no transition when zone unchanged", () => {
    const result = detectZoneTransition("zone-1", "zone-1");
    expect(result.entered).toBeNull();
    expect(result.left).toBeNull();
  });

  it("detects entering a zone from null", () => {
    const result = detectZoneTransition(null, "zone-1");
    expect(result.entered).toBe("zone-1");
    expect(result.left).toBeNull();
  });

  it("detects leaving a zone to null", () => {
    const result = detectZoneTransition("zone-1", null);
    expect(result.entered).toBeNull();
    expect(result.left).toBe("zone-1");
  });

  it("detects zone-to-zone transition", () => {
    const result = detectZoneTransition("zone-1", "zone-2");
    expect(result.entered).toBe("zone-2");
    expect(result.left).toBe("zone-1");
  });

  it("returns no transition for null-to-null", () => {
    const result = detectZoneTransition(null, null);
    expect(result.entered).toBeNull();
    expect(result.left).toBeNull();
  });
});
