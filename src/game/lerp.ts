/**
 * Linear interpolation for smooth remote avatar movement.
 * Interpolates between known positions over time.
 */

export interface LerpTarget {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startTime: number;
  duration: number;
}

/**
 * Create a lerp target from old position to new position.
 * Duration matches the expected update interval for smooth movement.
 */
export function createLerpTarget(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  now: number,
  durationMs: number,
): LerpTarget {
  return { fromX, fromY, toX, toY, startTime: now, duration: durationMs };
}

/**
 * Get the interpolated position at a given time.
 * Returns the target position if interpolation is complete.
 */
export function lerpPosition(target: LerpTarget, now: number): { x: number; y: number } {
  const elapsed = now - target.startTime;
  if (elapsed >= target.duration) {
    return { x: target.toX, y: target.toY };
  }

  const t = elapsed / target.duration;
  return {
    x: target.fromX + (target.toX - target.fromX) * t,
    y: target.fromY + (target.toY - target.fromY) * t,
  };
}
