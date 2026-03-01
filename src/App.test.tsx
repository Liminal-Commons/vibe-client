import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { App } from "./App";

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
  it("renders the game container", () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
    expect((container.firstChild as HTMLElement).style.width).toBe("100vw");
  });
});
