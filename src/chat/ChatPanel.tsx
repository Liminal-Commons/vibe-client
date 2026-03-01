/**
 * Chat overlay panel — renders on top of the Phaser canvas.
 * Shows message history (scrollable, last 100), input field, and send button.
 * Enter key sends, zone-scoped via store state.
 */

import { useEffect, useRef, useState } from "react";
import { useVibeStore, type ChatMessageState } from "../store";

/** Format a unix timestamp to HH:MM */
function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export interface ChatPanelProps {
  onSend: (text: string) => void;
}

export function ChatPanel({ onSend }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messages = useVibeStore((s) => s.chatMessages);
  const currentZoneId = useVibeStore((s) => s.currentZoneId);

  // Auto-scroll to bottom on new messages (guarded for jsdom)
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Block keyboard events from reaching Phaser's window-level listener
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("keydown", stop);
    el.addEventListener("keyup", stop);
    return () => {
      el.removeEventListener("keydown", stop);
      el.removeEventListener("keyup", stop);
    };
  }, []);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>{currentZoneId ? `Chat — ${currentZoneId}` : "Chat"}</div>
      <div style={messagesContainerStyle}>
        {messages.length === 0 && <div style={emptyStyle}>No messages yet</div>}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={inputContainerStyle}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={inputStyle}
          aria-label="Chat message input"
        />
        <button onClick={handleSend} style={sendButtonStyle} aria-label="Send message">
          Send
        </button>
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessageState }) {
  return (
    <div style={bubbleStyle}>
      <span style={senderStyle}>{msg.senderName}</span>
      <span style={timeStyle}>{formatTime(msg.timestamp)}</span>
      <div style={textStyle}>{msg.text}</div>
    </div>
  );
}

// --- Styles ---

const panelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 16,
  right: 16,
  width: 320,
  maxHeight: 400,
  display: "flex",
  flexDirection: "column",
  background: "rgba(20, 20, 30, 0.92)",
  borderRadius: 8,
  border: "1px solid rgba(255, 255, 255, 0.15)",
  overflow: "hidden",
  zIndex: 100,
  fontFamily: "sans-serif",
};

const headerStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 600,
  color: "#aaa",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
};

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "8px 12px",
  maxHeight: 280,
  minHeight: 80,
};

const emptyStyle: React.CSSProperties = {
  color: "#666",
  fontSize: 13,
  textAlign: "center",
  padding: "20px 0",
};

const inputContainerStyle: React.CSSProperties = {
  display: "flex",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  padding: 8,
  gap: 6,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: 4,
  padding: "6px 10px",
  color: "#eee",
  fontSize: 13,
  outline: "none",
};

const sendButtonStyle: React.CSSProperties = {
  background: "#4ecdc4",
  border: "none",
  borderRadius: 4,
  padding: "6px 14px",
  color: "#111",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const bubbleStyle: React.CSSProperties = {
  marginBottom: 8,
};

const senderStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 12,
  color: "#4ecdc4",
  marginRight: 6,
};

const timeStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#666",
};

const textStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#ddd",
  marginTop: 2,
  wordBreak: "break-word",
};
