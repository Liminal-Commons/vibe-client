import { useCallback } from "react";
import { PhaserGame } from "./game/PhaserGame";
import { ChatPanel } from "./chat/ChatPanel";

export function App() {
  const handleChatSend = useCallback((_text: string) => {
    // Will be wired to WebSocket in a later story
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
    </div>
  );
}
