/**
 * Throttle utility for position updates.
 * Ensures updates are sent at a controlled rate (e.g., 10 Hz).
 */

export interface ThrottleState {
  lastSentAt: number;
  lastX: number;
  lastY: number;
}

export function createThrottleState(): ThrottleState {
  return { lastSentAt: 0, lastX: NaN, lastY: NaN };
}

/**
 * Determine whether a position update should be sent.
 * Returns true if enough time has elapsed AND position has changed.
 */
export function shouldSendUpdate(
  state: ThrottleState,
  x: number,
  y: number,
  now: number,
  intervalMs: number,
): boolean {
  if (now - state.lastSentAt < intervalMs) return false;
  if (x === state.lastX && y === state.lastY) return false;
  return true;
}

/**
 * Mark that an update was sent at the given time and position.
 */
export function markSent(state: ThrottleState, x: number, y: number, now: number): void {
  state.lastSentAt = now;
  state.lastX = x;
  state.lastY = y;
}
