import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MicToggle } from "./MicToggle";
import { useVibeStore } from "../store";

describe("MicToggle", () => {
  beforeEach(() => {
    useVibeStore.setState({ micMuted: true });
  });

  it("shows Mic Off when muted", () => {
    render(<MicToggle onToggle={vi.fn()} />);
    expect(screen.getByText("Mic Off")).toBeTruthy();
  });

  it("shows Mic On when unmuted", () => {
    useVibeStore.setState({ micMuted: false });
    render(<MicToggle onToggle={vi.fn()} />);
    expect(screen.getByText("Mic On")).toBeTruthy();
  });

  it("toggles mute state on click", () => {
    const onToggle = vi.fn();
    render(<MicToggle onToggle={onToggle} />);

    fireEvent.click(screen.getByLabelText("Unmute microphone"));
    expect(useVibeStore.getState().micMuted).toBe(false);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("calls onToggle with new muted state", () => {
    useVibeStore.setState({ micMuted: false });
    const onToggle = vi.fn();
    render(<MicToggle onToggle={onToggle} />);

    fireEvent.click(screen.getByLabelText("Mute microphone"));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
