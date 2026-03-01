import { PhaserGame } from "./game/PhaserGame";

export function App() {
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
    </div>
  );
}
