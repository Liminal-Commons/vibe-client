import { useCallback } from "react";
import { PhaserGame } from "./game/PhaserGame";
import { ChatPanel } from "./chat/ChatPanel";
import { MicToggle } from "./audio/MicToggle";

export function App() {
  const handleChatSend = useCallback((_text: string) => {
    // Will be wired to WebSocket in a later story
  }, []);

  const handleMicToggle = useCallback((_muted: boolean) => {
    // Will start/stop MediaRecorder when wired to WebSocket
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
      <PhaserGame />
      <ChatPanel onSend={handleChatSend} />
      <MicToggle onToggle={handleMicToggle} />
    </div>
  );
}
