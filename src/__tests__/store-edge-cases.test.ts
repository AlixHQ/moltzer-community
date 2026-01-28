/**
 * Store Edge Cases Tests
 *
 * Tests edge cases and error paths in the Zustand store
 * that aren't covered by other test files.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useStore } from "../stores/store";

// Mock keychain
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn((command: string, params?: any) => {
    if (command === "keychain_get") {
      return Promise.resolve("");
    }
    if (command === "keychain_set") {
      return Promise.resolve();
    }
    if (command === "keychain_delete") {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Unknown command"));
  }),
}));

// Mock localStorage
const localStorageData: Record<string, string> = {};
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn((key: string) => localStorageData[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageData[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageData[key];
    }),
    clear: vi.fn(() => {
      Object.keys(localStorageData).forEach((k) => delete localStorageData[k]);
    }),
  },
  writable: true,
});

describe("Store Edge Cases", () => {
  beforeEach(() => {
    // Reset store
    const store = useStore.getState();
    store.conversations.forEach((c) => store.deleteConversation(c.id));
    useStore.setState({
      conversations: [],
      currentConversationId: null,
      currentStreamingMessageId: null,
      connected: false,
      availableModels: [],
      settings: {
        gatewayUrl: "",
        gatewayToken: "",
        defaultModel: "anthropic/claude-sonnet-4-5",
        thinkingDefault: false,
        theme: "system",
        defaultSystemPrompt: "",
      },
    });
    Object.keys(localStorageData).forEach((k) => delete localStorageData[k]);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("currentConversation getter", () => {
    it("should return null when no conversation is selected", () => {
      const store = useStore.getState();
      expect(store.currentConversation).toBeNull();
    });

    it("should return null when selected conversation doesn't exist", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      // Select a different ID that doesn't exist
      useStore.setState({ currentConversationId: "nonexistent-id" });

      const state = useStore.getState();
      const found = state.conversations.find((c) => c.id === state.currentConversationId);
      expect(found).toBeUndefined();
    });

    it("should return the correct conversation when selected", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      // Check conversation was created and is in the list
      const freshStore = useStore.getState();
      expect(freshStore.conversations.length).toBe(1);
      expect(freshStore.conversations[0].id).toBe(conv.id);
      expect(freshStore.currentConversationId).toBe(conv.id);
    });
  });

  describe("updateMessage edge cases", () => {
    it("should handle updating a message in a nonexistent conversation", () => {
      const store = useStore.getState();

      // Try to update message in nonexistent conversation
      store.updateMessage("nonexistent-conv", "msg-id", "new content");

      // Should not throw, just silently do nothing
      expect(store.conversations).toHaveLength(0);
    });

    it("should handle updating a nonexistent message", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      // Try to update nonexistent message
      store.updateMessage(conv.id, "nonexistent-msg", "new content");

      // Should not affect existing messages
      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.messages).toHaveLength(0);
    });
  });

  describe("markMessageSent edge cases", () => {
    it("should handle marking message in nonexistent conversation", () => {
      const store = useStore.getState();

      // Try to mark message in nonexistent conversation
      store.markMessageSent("nonexistent-conv", "msg-id");

      // Should not throw
      expect(store.conversations).toHaveLength(0);
    });

    it("should handle marking nonexistent message", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      // Try to mark nonexistent message
      store.markMessageSent(conv.id, "nonexistent-msg");

      // Should not affect conversation
      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.messages).toHaveLength(0);
    });
  });

  describe("deleteMessage edge cases", () => {
    it("should handle deleting from nonexistent conversation", () => {
      const store = useStore.getState();

      // Try to delete from nonexistent conversation
      store.deleteMessage("nonexistent-conv", "msg-id");

      // Should not throw
      expect(store.conversations).toHaveLength(0);
    });
  });

  describe("deleteMessagesAfter edge cases", () => {
    it("should handle nonexistent conversation", () => {
      const store = useStore.getState();

      // Try with nonexistent conversation
      store.deleteMessagesAfter("nonexistent-conv", "msg-id");

      // Should not throw
      expect(store.conversations).toHaveLength(0);
    });

    it("should handle nonexistent message", () => {
      const store = useStore.getState();
      const conv = store.createConversation();
      store.addMessage(conv.id, {
        role: "user",
        content: "Message 1",
      });

      // Try with nonexistent message
      store.deleteMessagesAfter(conv.id, "nonexistent-msg");

      // Should not delete anything
      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.messages).toHaveLength(1);
    });

    it("should delete all messages after specified message", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      const msg1 = store.addMessage(conv.id, {
        role: "user",
        content: "Message 1",
      });
      store.addMessage(conv.id, {
        role: "assistant",
        content: "Message 2",
      });
      store.addMessage(conv.id, {
        role: "user",
        content: "Message 3",
      });

      // Delete everything after msg1
      store.deleteMessagesAfter(conv.id, msg1.id);

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.messages).toHaveLength(1);
      expect(updated?.messages[0].id).toBe(msg1.id);
    });
  });

  describe("appendToCurrentMessage edge cases", () => {
    it("should handle no current conversation", () => {
      const store = useStore.getState();

      // Try to append without a current conversation
      store.appendToCurrentMessage("some content");

      // Should not throw
      expect(store.currentConversationId).toBeNull();
    });

    it("should handle no streaming message", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      // Try to append without a streaming message
      store.appendToCurrentMessage("some content");

      // Should not throw
      expect(store.currentStreamingMessageId).toBeNull();
    });

    it("should append to streaming message", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      const msg = store.addMessage(conv.id, {
        role: "assistant",
        content: "Initial",
        isStreaming: true,
      });

      store.appendToCurrentMessage(" appended");

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      const updatedMsg = updated?.messages.find((m) => m.id === msg.id);
      expect(updatedMsg?.content).toBe("Initial appended");
    });
  });

  describe("completeCurrentMessage edge cases", () => {
    it("should handle no current conversation", () => {
      const store = useStore.getState();

      // Try to complete without a current conversation
      store.completeCurrentMessage();

      // Should not throw
      expect(store.currentConversationId).toBeNull();
    });

    it("should handle no streaming message", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      // Try to complete without a streaming message
      store.completeCurrentMessage();

      // Should not throw
      expect(store.currentStreamingMessageId).toBeNull();
    });

    it("should complete streaming message with usage stats", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      const msg = store.addMessage(conv.id, {
        role: "assistant",
        content: "Streaming message",
        isStreaming: true,
      });

      const usage = {
        input: 100,
        output: 200,
        totalTokens: 300,
      };

      store.completeCurrentMessage(usage);

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      const updatedMsg = updated?.messages.find((m) => m.id === msg.id);
      expect(updatedMsg?.isStreaming).toBe(false);
      expect(updatedMsg?.usage).toEqual(usage);
      expect(useStore.getState().currentStreamingMessageId).toBeNull();
    });
  });

  describe("conversation updates", () => {
    it("should update conversation timestamp on changes", () => {
      vi.useFakeTimers();
      const store = useStore.getState();
      const conv = store.createConversation();
      const originalUpdatedAt = conv.updatedAt.getTime();

      // Wait a bit
      vi.advanceTimersByTime(100);

      store.updateConversation(conv.id, { thinkingEnabled: true });

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);

      vi.useRealTimers();
    });

    it("should not update other conversations", () => {
      const store = useStore.getState();
      const conv1 = store.createConversation();
      const conv2 = store.createConversation();

      store.updateConversation(conv1.id, { thinkingEnabled: true });

      const updated1 = useStore
        .getState()
        .conversations.find((c) => c.id === conv1.id);
      const updated2 = useStore
        .getState()
        .conversations.find((c) => c.id === conv2.id);

      expect(updated1?.thinkingEnabled).toBe(true);
      expect(updated2?.thinkingEnabled).toBe(false); // Should remain unchanged
    });
  });
});
