import { describe, it, expect, beforeEach, vi } from "vitest";
import { useStore } from "../stores/store";

// Mock localStorage for persistence
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Store", () => {
  beforeEach(() => {
    // Clear localStorage mock
    localStorageMock.clear();

    // Reset store state by deleting all conversations
    const state = useStore.getState();
    state.conversations.forEach((c) => state.deleteConversation(c.id));
    state.setConnected(false);
  });

  describe("Conversations", () => {
    it("should create a new conversation", () => {
      const conv = useStore.getState().createConversation();

      expect(conv).toBeDefined();
      expect(conv.id).toBeDefined();
      expect(conv.title).toBe("New Chat");
      expect(conv.messages).toHaveLength(0);

      // Check state was updated
      const state = useStore.getState();
      expect(state.conversations).toHaveLength(1);
    });

    it("should delete a conversation", () => {
      const conv = useStore.getState().createConversation();
      expect(useStore.getState().conversations).toHaveLength(1);

      useStore.getState().deleteConversation(conv.id);
      expect(useStore.getState().conversations).toHaveLength(0);
    });

    it("should pin and unpin a conversation", () => {
      const conv = useStore.getState().createConversation();
      expect(conv.isPinned).toBe(false);

      useStore.getState().pinConversation(conv.id);
      expect(useStore.getState().conversations[0].isPinned).toBe(true);

      useStore.getState().pinConversation(conv.id);
      expect(useStore.getState().conversations[0].isPinned).toBe(false);
    });
  });

  describe("Messages", () => {
    it("should add a message to a conversation", () => {
      const conv = useStore.getState().createConversation();

      const message = useStore.getState().addMessage(conv.id, {
        role: "user",
        content: "Hello, world!",
      });

      expect(message).toBeDefined();
      expect(message.content).toBe("Hello, world!");
      expect(message.role).toBe("user");

      const updatedConv = useStore.getState().conversations[0];
      expect(updatedConv.messages).toHaveLength(1);
    });

    it("should handle streaming messages", () => {
      const conv = useStore.getState().createConversation();

      useStore.getState().addMessage(conv.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      expect(useStore.getState().currentStreamingMessageId).not.toBeNull();

      useStore.getState().appendToCurrentMessage("Hello");
      useStore.getState().appendToCurrentMessage(" world");

      const updatedConv = useStore.getState().conversations[0];
      expect(updatedConv.messages[0].content).toBe("Hello world");

      useStore.getState().completeCurrentMessage();

      expect(useStore.getState().currentStreamingMessageId).toBeNull();
      expect(useStore.getState().conversations[0].messages[0].isStreaming).toBe(
        false,
      );
    });
  });

  describe("Settings", () => {
    it("should update settings", () => {
      useStore.getState().updateSettings({
        gatewayUrl: "ws://custom:8080",
        theme: "dark",
      });

      const settings = useStore.getState().settings;
      expect(settings.gatewayUrl).toBe("ws://custom:8080");
      expect(settings.theme).toBe("dark");
    });
  });

  describe("Connection", () => {
    it("should track connection status", () => {
      expect(useStore.getState().connected).toBe(false);

      useStore.getState().setConnected(true);
      expect(useStore.getState().connected).toBe(true);

      useStore.getState().setConnected(false);
      expect(useStore.getState().connected).toBe(false);
    });
  });
});
