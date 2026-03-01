import { describe, it, expect } from "vitest";
import { createMicrophoneState, toggleMute, setPermission, setActive } from "./useMicrophone";

describe("MicrophoneState", () => {
  it("starts muted without permission", () => {
    const state = createMicrophoneState();
    expect(state.muted).toBe(true);
    expect(state.hasPermission).toBe(false);
    expect(state.active).toBe(false);
  });

  it("toggles mute", () => {
    let state = createMicrophoneState();
    state = toggleMute(state);
    expect(state.muted).toBe(false);
    state = toggleMute(state);
    expect(state.muted).toBe(true);
  });

  it("sets permission", () => {
    let state = createMicrophoneState();
    state = setPermission(state, true);
    expect(state.hasPermission).toBe(true);
  });

  it("sets active state", () => {
    let state = createMicrophoneState();
    state = setActive(state, true);
    expect(state.active).toBe(true);
  });

  it("preserves other fields on toggle", () => {
    let state = createMicrophoneState();
    state = setPermission(state, true);
    state = setActive(state, true);
    state = toggleMute(state);
    expect(state.hasPermission).toBe(true);
    expect(state.active).toBe(true);
    expect(state.muted).toBe(false);
  });
});
