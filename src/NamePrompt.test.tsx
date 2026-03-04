import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { NamePrompt } from "./NamePrompt";
import { useVibeStore } from "./store";

describe("NamePrompt", () => {
  beforeEach(() => {
    useVibeStore.setState({
      identity: { displayName: "", photo: null, sessionToken: null },
    });
  });

  it("renders a name input and join button", () => {
    render(<NamePrompt />);
    expect(screen.getByPlaceholderText("Display name")).toBeTruthy();
    expect(screen.getByRole("button", { name: /join/i })).toBeTruthy();
  });

  it("join button is disabled when input is empty", () => {
    render(<NamePrompt />);
    expect(screen.getByRole("button", { name: /join/i })).toBeDisabled();
  });

  it("join button is enabled when name is entered", () => {
    render(<NamePrompt />);
    fireEvent.change(screen.getByPlaceholderText("Display name"), {
      target: { value: "Alice" },
    });
    expect(screen.getByRole("button", { name: /join/i })).toBeEnabled();
  });

  it("sets identity in store on submit", () => {
    render(<NamePrompt />);
    fireEvent.change(screen.getByPlaceholderText("Display name"), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join/i }));
    expect(useVibeStore.getState().identity.displayName).toBe("Alice");
  });

  it("trims whitespace from name", () => {
    render(<NamePrompt />);
    fireEvent.change(screen.getByPlaceholderText("Display name"), {
      target: { value: "  Bob  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /join/i }));
    expect(useVibeStore.getState().identity.displayName).toBe("Bob");
  });

  it("does not set identity for whitespace-only input", () => {
    render(<NamePrompt />);
    fireEvent.change(screen.getByPlaceholderText("Display name"), {
      target: { value: "   " },
    });
    expect(screen.getByRole("button", { name: /join/i })).toBeDisabled();
  });

  it("submits on Enter key", () => {
    render(<NamePrompt />);
    const input = screen.getByPlaceholderText("Display name");
    fireEvent.change(input, { target: { value: "Charlie" } });
    fireEvent.submit(input.closest("form")!);
    expect(useVibeStore.getState().identity.displayName).toBe("Charlie");
  });
});
