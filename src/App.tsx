import { useCallback } from "react";
import { PhaserGame } from "./game/PhaserGame";
import { ChatPanel } from "./chat/ChatPanel";
import { MicToggle } from "./audio/MicToggle";
import { useVibeConnection } from "./useVibeConnection";

const DEFAULT_SPACE_ID = "lobby";

export function App() {
  const { sendChat, sendPosition, sendZoneJoin, sendZoneLeave } = useVibeConnection();

  const handlePositionUpdate = useCallback(
    (x: number, y: number) => {
      sendPosition(x, y);
    },
    [sendPosition],
  );

  const handleZoneEnter = useCallback(
    (zoneId: string) => {
      sendZoneJoin(DEFAULT_SPACE_ID, zoneId);
    },
    [sendZoneJoin],
  );

  const handleZoneLeave = useCallback(
    (zoneId: string) => {
      sendZoneLeave(DEFAULT_SPACE_ID, zoneId);
    },
    [sendZoneLeave],
  );

  const handleMicToggle = useCallback((_muted: boolean) => {
    // Will start/stop MediaRecorder when audio pipeline is wired
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#0a0a0a",
        overflow: "hidden",
      }}
    >
      <PhaserGame
        onPositionUpdate={handlePositionUpdate}
        onZoneEnter={handleZoneEnter}
        onZoneLeave={handleZoneLeave}
      />
      <ChatPanel onSend={sendChat} />
      <MicToggle onToggle={handleMicToggle} />
    </div>
  );
}
