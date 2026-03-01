import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatPanel } from "./ChatPanel";
import { useVibeStore } from "../store";

describe("ChatPanel", () => {
  beforeEach(() => {
    useVibeStore.setState({
      chatMessages: [],
      currentZoneId: null,
    });
  });

  it("renders empty state", () => {
    render(<ChatPanel onSend={vi.fn()} />);
    expect(screen.getByText("No messages yet")).toBeTruthy();
  });

  it("renders chat header", () => {
    render(<ChatPanel onSend={vi.fn()} />);
    expect(screen.getByText("Chat")).toBeTruthy();
  });

  it("shows zone name in header when in a zone", () => {
    useVibeStore.setState({ currentZoneId: "talk-area" });
    render(<ChatPanel onSend={vi.fn()} />);
    expect(screen.getByText("Chat — talk-area")).toBeTruthy();
  });

  it("renders messages from store", () => {
    useVibeStore.setState({
      chatMessages: [
        {
          id: "1",
          senderId: "s1",
          senderName: "Alice",
          text: "Hello world",
          timestamp: Date.now(),
        },
      ],
    });
    render(<ChatPanel onSend={vi.fn()} />);
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  it("calls onSend when clicking Send button", () => {
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);

    const input = screen.getByLabelText("Chat message input");
    fireEvent.change(input, { target: { value: "test message" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(onSend).toHaveBeenCalledWith("test message");
  });

  it("calls onSend when pressing Enter", () => {
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);

    const input = screen.getByLabelText("Chat message input");
    fireEvent.change(input, { target: { value: "enter test" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSend).toHaveBeenCalledWith("enter test");
  });

  it("clears input after sending", () => {
    render(<ChatPanel onSend={vi.fn()} />);

    const input = screen.getByLabelText("Chat message input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "will clear" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(input.value).toBe("");
  });

  it("does not send empty messages", () => {
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);

    fireEvent.click(screen.getByLabelText("Send message"));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send whitespace-only messages", () => {
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);

    const input = screen.getByLabelText("Chat message input");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("renders multiple messages in order", () => {
    useVibeStore.setState({
      chatMessages: [
        { id: "1", senderId: "s1", senderName: "Alice", text: "First", timestamp: 1000 },
        { id: "2", senderId: "s2", senderName: "Bob", text: "Second", timestamp: 2000 },
      ],
    });
    render(<ChatPanel onSend={vi.fn()} />);

    expect(screen.getByText("First")).toBeTruthy();
    expect(screen.getByText("Second")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
  });
});
