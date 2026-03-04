import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "./App";
import { useVibeStore } from "./store";

// Mock Phaser — jsdom has no Canvas/WebGL
vi.mock("phaser", () => ({
  default: {
    AUTO: 0,
    Scale: { RESIZE: 0, CENTER_BOTH: 0 },
    Math: { Clamp: (v: number, min: number, max: number) => Math.min(Math.max(v, min), max) },
    Input: { Keyboard: { KeyCodes: { W: 87, A: 65, S: 83, D: 68 } } },
    Scene: class {
      constructor() {}
    },
    Game: class {
      constructor() {}
      destroy() {}
    },
  },
}));

describe("App", () => {
  beforeEach(() => {
    useVibeStore.setState({
      identity: { displayName: "", photo: null, sessionToken: null },
    });
  });

  it("shows name prompt when no identity", () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Display name")).toBeTruthy();
    expect(screen.getByRole("button", { name: /join/i })).toBeTruthy();
  });

  it("shows game after identity is set", () => {
    useVibeStore.setState({
      identity: { displayName: "Alice", photo: null, sessionToken: null },
    });
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
    expect((container.firstChild as HTMLElement).style.width).toBe("100vw");
  });

  it("transitions from prompt to game on submit", () => {
    const { container } = render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Display name"), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join/i }));
    expect((container.firstChild as HTMLElement).style.width).toBe("100vw");
  });
});
