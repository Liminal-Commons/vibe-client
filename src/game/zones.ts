/**
 * Zone boundary detection for client-side zone transitions.
 * Determines which zone a position falls within.
 */

export interface ZoneBounds {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

/**
 * Find which zone a point falls within.
 * Returns the zone ID or null if not in any zone.
 */
export function findZoneAtPosition(x: number, y: number, zones: ZoneBounds[]): ZoneBounds | null {
  for (const zone of zones) {
    if (x >= zone.x && x < zone.x + zone.width && y >= zone.y && y < zone.y + zone.height) {
      return zone;
    }
  }
  return null;
}

/**
 * Detect zone transitions: returns { entered, left } if zone changed.
 */
export function detectZoneTransition(
  prevZoneId: string | null,
  currentZoneId: string | null,
): { entered: string | null; left: string | null } {
  if (prevZoneId === currentZoneId) {
    return { entered: null, left: null };
  }
  return {
    entered: currentZoneId,
    left: prevZoneId,
  };
}
