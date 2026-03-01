/**
 * Microphone state management.
 * Pure logic for mute/unmute state tracking.
 * Actual MediaRecorder integration happens in the React component layer.
 */

export interface MicrophoneState {
  /** Whether the mic is currently muted */
  muted: boolean;
  /** Whether we have mic permission */
  hasPermission: boolean;
  /** Whether the mic is currently capturing */
  active: boolean;
}

export function createMicrophoneState(): MicrophoneState {
  return {
    muted: true,
    hasPermission: false,
    active: false,
  };
}

export function toggleMute(state: MicrophoneState): MicrophoneState {
  return { ...state, muted: !state.muted };
}

export function setPermission(state: MicrophoneState, granted: boolean): MicrophoneState {
  return { ...state, hasPermission: granted };
}

export function setActive(state: MicrophoneState, active: boolean): MicrophoneState {
  return { ...state, active };
}
