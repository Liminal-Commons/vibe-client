import { useState } from "react";
import { useVibeStore } from "./store";

export function NamePrompt() {
  const [name, setName] = useState("");
  const setIdentity = useVibeStore((s) => s.setIdentity);

  const trimmed = name.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) {
      setIdentity(trimmed, null);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "32px",
          borderRadius: "12px",
          background: "#1a1a2e",
          minWidth: "280px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#e0e0e0",
            fontSize: "1.25rem",
            textAlign: "center",
          }}
        >
          What should we call you?
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
          autoFocus
          maxLength={32}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#0f0f1a",
            color: "#e0e0e0",
            fontSize: "1rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!trimmed}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "none",
            background: trimmed ? "#4ecdc4" : "#333",
            color: trimmed ? "#0a0a0a" : "#666",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: trimmed ? "pointer" : "default",
          }}
        >
          Join
        </button>
      </form>
    </div>
  );
}
