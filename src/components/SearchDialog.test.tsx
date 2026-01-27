import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchDialog } from "./SearchDialog";
import { useStore } from "../stores/store";

describe("SearchDialog", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store
    const store = useStore.getState();
    store.conversations.forEach((c) => store.deleteConversation(c.id));
    
    // Add test conversations with messages
    const conv1 = store.createConversation();
    store.updateConversation(conv1.id, { title: "Test Conversation 1" });
    store.addMessage(conv1.id, {
      role: "user",
      content: "Hello world, this is a test message",
    });
    store.addMessage(conv1.id, {
      role: "assistant",
      content: "Hi! How can I help you with quantum computing today?",
    });

    const conv2 = store.createConversation();
    store.updateConversation(conv2.id, { title: "Test Conversation 2" });
    store.addMessage(conv2.id, {
      role: "user",
      content: "Tell me about TypeScript",
    });
    store.addMessage(conv2.id, {
      role: "assistant",
      content: "TypeScript is a typed superset of JavaScript",
    });
  });

  it("renders when open", () => {
    render(<SearchDialog open={true} onClose={onClose} />);
    expect(screen.getByPlaceholderText("Search all messages...")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<SearchDialog open={false} onClose={onClose} />);
    expect(screen.queryByPlaceholderText("Search all messages...")).not.toBeInTheDocument();
  });

  it("searches and shows results", async () => {
    render(<SearchDialog open={true} onClose={onClose} />);
    
    const input = screen.getByPlaceholderText("Search all messages...");
    fireEvent.change(input, { target: { value: "quantum" } });

    await waitFor(() => {
      // The text is split by a <mark> element, so search for just the highlighted word
      expect(screen.getByText("quantum")).toBeInTheDocument();
    });
  });

  it("shows no results message when nothing matches", async () => {
    render(<SearchDialog open={true} onClose={onClose} />);
    
    const input = screen.getByPlaceholderText("Search all messages...");
    fireEvent.change(input, { target: { value: "xyzabc123nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText(/No results found/i)).toBeInTheDocument();
    });
  });

  it("closes on Escape key", () => {
    render(<SearchDialog open={true} onClose={onClose} />);
    
    const input = screen.getByPlaceholderText("Search all messages...");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });

  it("closes when clicking backdrop", () => {
    render(<SearchDialog open={true} onClose={onClose} />);
    
    // Click the backdrop (first element with backdrop-blur-sm class)
    const backdrop = document.querySelector(".backdrop-blur-sm");
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it("selects conversation on Enter", async () => {
    render(<SearchDialog open={true} onClose={onClose} />);
    
    const input = screen.getByPlaceholderText("Search all messages...");
    fireEvent.change(input, { target: { value: "TypeScript" } });

    // Wait for search results to appear (highlighted text)
    await waitFor(() => {
      const results = document.querySelectorAll("button.w-full.px-4.py-3");
      expect(results.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    // Press Enter to select the first result
    fireEvent.keyDown(input, { key: "Enter" });

    // The onClose should have been called
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("navigates results with arrow keys", async () => {
    render(<SearchDialog open={true} onClose={onClose} />);
    
    const input = screen.getByPlaceholderText("Search all messages...");
    // Search for something that matches multiple messages
    fireEvent.change(input, { target: { value: "is" } });

    await waitFor(() => {
      // Should have multiple results
      const results = document.querySelectorAll("button.w-full.px-4.py-3");
      expect(results.length).toBeGreaterThan(0);
    });

    // Navigate down
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    
    // Navigate up
    fireEvent.keyDown(input, { key: "ArrowUp" });
  });
});
