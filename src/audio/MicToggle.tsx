/**
 * Microphone mute/unmute toggle button.
 * Renders as a floating button overlay on the Phaser canvas.
 */

import { useVibeStore } from "../store";

export interface MicToggleProps {
  onToggle: (muted: boolean) => void;
}

export function MicToggle({ onToggle }: MicToggleProps) {
  const muted = useVibeStore((s) => s.micMuted);

  function handleClick() {
    const newMuted = !muted;
    useVibeStore.getState().setMicMuted(newMuted);
    onToggle(newMuted);
  }

  return (
    <button
      onClick={handleClick}
      style={{
        ...buttonStyle,
        background: muted ? "rgba(255, 80, 80, 0.85)" : "rgba(78, 205, 196, 0.85)",
      }}
      aria-label={muted ? "Unmute microphone" : "Mute microphone"}
      title={muted ? "Click to unmute" : "Click to mute"}
    >
      {muted ? "Mic Off" : "Mic On"}
    </button>
  );
}

const buttonStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 16,
  left: 16,
  padding: "8px 16px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: 20,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "sans-serif",
  cursor: "pointer",
  zIndex: 100,
};
