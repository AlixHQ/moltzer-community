import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./store";

describe("Store", () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useStore.getState();
    store.conversations.forEach((c) => store.deleteConversation(c.id));
    store.setConnected(false);
  });

  describe("Conversations", () => {
    it("should create a new conversation", () => {
      const conversation = useStore.getState().createConversation();

      expect(conversation).toBeDefined();
      expect(conversation.id).toBeDefined();
      expect(conversation.title).toBe("New Chat");
      expect(conversation.messages).toHaveLength(0);

      // Get fresh state after mutation
      const state = useStore.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.currentConversationId).toBe(conversation.id);
    });

    it("should select a conversation", () => {
      const store = useStore.getState();
      const conv1 = store.createConversation();
      const conv2 = store.createConversation();

      store.selectConversation(conv1.id);
      expect(useStore.getState().currentConversationId).toBe(conv1.id);

      store.selectConversation(conv2.id);
      expect(useStore.getState().currentConversationId).toBe(conv2.id);
    });

    it("should delete a conversation", () => {
      const conv = useStore.getState().createConversation();
      expect(useStore.getState().conversations).toHaveLength(1);

      useStore.getState().deleteConversation(conv.id);
      expect(useStore.getState().conversations).toHaveLength(0);
      expect(useStore.getState().currentConversationId).toBeNull();
    });

    it("should update a conversation", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      store.updateConversation(conv.id, { title: "Updated Title" });

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.title).toBe("Updated Title");
    });

    it("should pin and unpin a conversation", () => {
      const store = useStore.getState();
      const conv = store.createConversation();
      expect(conv.isPinned).toBe(false);

      store.pinConversation(conv.id);
      expect(useStore.getState().conversations[0].isPinned).toBe(true);

      store.pinConversation(conv.id);
      expect(useStore.getState().conversations[0].isPinned).toBe(false);
    });
  });

  describe("Messages", () => {
    it("should add a message to a conversation", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      const message = store.addMessage(conv.id, {
        role: "user",
        content: "Hello!",
      });

      expect(message.id).toBeDefined();
      expect(message.content).toBe("Hello!");
      expect(message.role).toBe("user");

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.messages).toHaveLength(1);
    });

    it("should auto-generate title from first user message", () => {
      const store = useStore.getState();
      const conv = store.createConversation();
      expect(conv.title).toBe("New Chat");

      store.addMessage(conv.id, {
        role: "user",
        content: "What is the meaning of life?",
      });

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.title).toBe("What is the meaning of life?");
    });

    it("should truncate long titles", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      const longMessage = "A".repeat(100);
      store.addMessage(conv.id, {
        role: "user",
        content: longMessage,
      });

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.title.length).toBeLessThanOrEqual(43); // 40 + "..."
    });

    it("should handle streaming messages", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      // Add a streaming message
      const message = store.addMessage(conv.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      expect(useStore.getState().currentStreamingMessageId).toBe(message.id);

      // Append content
      store.appendToCurrentMessage("Hello");
      store.appendToCurrentMessage(" world");

      const updated = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(updated?.messages[0].content).toBe("Hello world");

      // Complete streaming
      store.completeCurrentMessage();
      expect(useStore.getState().currentStreamingMessageId).toBeNull();
      expect(
        useStore.getState().conversations.find((c) => c.id === conv.id)
          ?.messages[0].isStreaming,
      ).toBe(false);
    });
  });

  describe("Connection", () => {
    it("should update connection status", () => {
      const store = useStore.getState();
      expect(store.connected).toBe(false);

      store.setConnected(true);
      expect(useStore.getState().connected).toBe(true);

      store.setConnected(false);
      expect(useStore.getState().connected).toBe(false);
    });
  });

  describe("Settings", () => {
    it("should have default settings", () => {
      const store = useStore.getState();
      // gatewayUrl is empty by default to force onboarding
      expect(store.settings.gatewayUrl).toBe("");
      expect(store.settings.theme).toBe("system");
    });

    it("should update settings", () => {
      const store = useStore.getState();

      store.updateSettings({
        gatewayUrl: "ws://example.com:8080",
        theme: "dark",
      });

      expect(useStore.getState().settings.gatewayUrl).toBe(
        "ws://example.com:8080",
      );
      expect(useStore.getState().settings.theme).toBe("dark");
    });
  });
});
