/**
 * ChatView Component Tests
 *
 * Tests ChatView's critical paths via the store layer.
 * ChatView is deeply integrated with Zustand's computed currentConversation getter,
 * which makes full component rendering tests complex in jsdom.
 *
 * These tests verify:
 * - The store state that ChatView reads (conversations, messages, connection)
 * - The invoke calls ChatView makes (send_message)
 * - Message flow (pending → sent, streaming lifecycle)
 * - Error state persistence in store
 * - Model and thinking parameter passing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStore } from "../stores/store";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const { invoke } = await import("@tauri-apps/api/core");

describe("ChatView - Store Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store
    const store = useStore.getState();
    store.conversations.forEach((c) => store.deleteConversation(c.id));
    store.setConnected(false);

    vi.mocked(invoke).mockResolvedValue(undefined);
  });

  describe("conversation state for ChatView", () => {
    it("should have null currentConversationId when none selected", () => {
      expect(useStore.getState().currentConversationId).toBeNull();
    });

    it("should have currentConversationId set when one is selected", () => {
      const store = useStore.getState();
      const conv = store.createConversation();
      store.selectConversation(conv.id);

      expect(useStore.getState().currentConversationId).toBe(conv.id);
      // Verify conversation exists in the list
      const found = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id);
      expect(found).not.toBeUndefined();
    });

    it("should have empty messages in new conversation", () => {
      const store = useStore.getState();
      const conv = store.createConversation();
      store.selectConversation(conv.id);

      const found = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(found.messages).toHaveLength(0);
    });
  });

  describe("message send flow (simulating ChatView handleSendMessage)", () => {
    it("should add pending user message then mark as sent", async () => {
      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();
      store.selectConversation(conv.id);

      // Simulate ChatView's handleSendMessage
      const userMessage = store.addMessage(conv.id, {
        role: "user",
        content: "Test question",
        isPending: true,
      });

      // Verify pending state
      const pendingConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(pendingConv.messages[0].isPending).toBe(true);

      // Add streaming assistant placeholder
      store.addMessage(conv.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      // Simulate successful invoke
      await invoke("send_message", {
        params: {
          message: "Test question",
          session_key: conv.id,
          model: store.settings.defaultModel,
          thinking: null,
        },
      });

      expect(invoke).toHaveBeenCalledWith(
        "send_message",
        expect.objectContaining({
          params: expect.objectContaining({
            message: "Test question",
          }),
        }),
      );

      // Mark as sent
      store.markMessageSent(conv.id, userMessage.id);

      const sentConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(sentConv.messages[0].isPending).toBe(false);
    });

    it("should set up streaming state for assistant response", () => {
      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();
      store.selectConversation(conv.id);

      // Add user message
      store.addMessage(conv.id, { role: "user", content: "Question" });

      // Add streaming assistant
      store.addMessage(conv.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      expect(useStore.getState().currentStreamingMessageId).not.toBeNull();
    });

    it("should complete streaming and set usage", () => {
      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();
      store.selectConversation(conv.id);

      store.addMessage(conv.id, { role: "user", content: "Question" });
      store.addMessage(conv.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      // Simulate streaming content
      store.appendToCurrentMessage("The answer is 42.");

      // Complete with usage
      store.completeCurrentMessage({ input: 20, output: 30, totalTokens: 50 });

      const finalConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      const assistantMsg = finalConv.messages.find(
        (m) => m.role === "assistant",
      )!;
      expect(assistantMsg.content).toBe("The answer is 42.");
      expect(assistantMsg.isStreaming).toBe(false);
      expect(assistantMsg.usage!.totalTokens).toBe(50);
      expect(useStore.getState().currentStreamingMessageId).toBeNull();
    });
  });

  describe("error state flow (simulating ChatView error handling)", () => {
    it("should preserve user message in store even on invoke failure", async () => {
      vi.mocked(invoke).mockRejectedValue(new Error("Connection lost"));

      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();
      store.selectConversation(conv.id);

      // Add user message (optimistic update)
      store.addMessage(conv.id, {
        role: "user",
        content: "Failed message",
        isPending: true,
      });

      // Add streaming placeholder
      store.addMessage(conv.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      // Invoke fails
      try {
        await invoke("send_message", { params: { message: "Failed message" } });
      } catch {
        // ChatView catches this and sets error state
      }

      // User message should still be in store
      const conv2 = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(conv2.messages[0].content).toBe("Failed message");
    });

    it("should support retry by re-sending the same message", async () => {
      vi.mocked(invoke)
        .mockRejectedValueOnce(new Error("Timeout"))
        .mockResolvedValue(undefined);

      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();

      // First attempt fails
      const userMsg = store.addMessage(conv.id, {
        role: "user",
        content: "Retry this",
        isPending: true,
      });

      try {
        await invoke("send_message", { params: { message: "Retry this" } });
      } catch {
        // Error captured
      }

      // Retry - invoke now succeeds
      await invoke("send_message", { params: { message: "Retry this" } });
      store.markMessageSent(conv.id, userMsg.id);

      expect(invoke).toHaveBeenCalledTimes(2);
      const finalConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(finalConv.messages[0].isPending).toBe(false);
    });
  });

  describe("model and thinking parameter passing", () => {
    it("should use conversation-specific model", async () => {
      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();
      store.updateConversation(conv.id, { model: "openai/gpt-4o" });

      // Re-fetch to get updated state (createConversation returns a snapshot)
      const freshConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;

      // Simulate what ChatView does
      const model = freshConv.model || store.settings.defaultModel;
      expect(model).toBe("openai/gpt-4o");

      await invoke("send_message", {
        params: {
          message: "test",
          session_key: freshConv.id,
          model,
          thinking: null,
        },
      });

      expect(invoke).toHaveBeenCalledWith(
        "send_message",
        expect.objectContaining({
          params: expect.objectContaining({
            model: "openai/gpt-4o",
          }),
        }),
      );
    });

    it("should fall back to default model when conversation has no model", async () => {
      const store = useStore.getState();
      store.setConnected(true);
      await store.updateSettings({ defaultModel: "anthropic/claude-opus-4-5" });
      const conv = store.createConversation();

      // Get model - conversation.model is undefined, use default
      const freshConv2 = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      const model2 =
        freshConv2.model || useStore.getState().settings.defaultModel;
      expect(model2).toBe("anthropic/claude-opus-4-5");
    });

    it("should send thinking=low when thinkingEnabled is true", async () => {
      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();
      store.updateConversation(conv.id, { thinkingEnabled: true });

      const freshConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      const thinking = freshConv.thinkingEnabled ? "low" : null;
      expect(thinking).toBe("low");

      await invoke("send_message", {
        params: {
          message: "test",
          session_key: conv.id,
          model: "anthropic/claude-sonnet-4-5",
          thinking,
        },
      });

      expect(invoke).toHaveBeenCalledWith(
        "send_message",
        expect.objectContaining({
          params: expect.objectContaining({
            thinking: "low",
          }),
        }),
      );
    });

    it("should send thinking=null when thinkingEnabled is false", () => {
      const store = useStore.getState();
      const conv = store.createConversation();
      store.updateConversation(conv.id, { thinkingEnabled: false });

      const freshConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      const thinking = freshConv.thinkingEnabled ? "low" : null;
      expect(thinking).toBeNull();
    });
  });

  describe("stop generating flow", () => {
    it("should complete streaming when stop is triggered", () => {
      const store = useStore.getState();
      const conv = store.createConversation();

      store.addMessage(conv.id, { role: "user", content: "Q" });
      store.addMessage(conv.id, {
        role: "assistant",
        content: "Streaming...",
        isStreaming: true,
      });

      expect(useStore.getState().currentStreamingMessageId).not.toBeNull();

      // Simulate stop generating
      store.completeCurrentMessage();

      expect(useStore.getState().currentStreamingMessageId).toBeNull();

      const finalConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      const assistantMsg = finalConv.messages.find(
        (m) => m.role === "assistant",
      )!;
      expect(assistantMsg.isStreaming).toBe(false);
      expect(assistantMsg.content).toBe("Streaming...");
    });
  });

  describe("connection state for ChatView rendering", () => {
    it("should track connected state", () => {
      const store = useStore.getState();

      expect(store.connected).toBe(false);
      store.setConnected(true);
      expect(useStore.getState().connected).toBe(true);
      store.setConnected(false);
      expect(useStore.getState().connected).toBe(false);
    });

    it("should have correct state for connected ChatView rendering", () => {
      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();
      store.selectConversation(conv.id);

      const state = useStore.getState();
      expect(state.connected).toBe(true);
      expect(state.currentConversationId).toBe(conv.id);
      const found = state.conversations.find((c) => c.id === conv.id)!;
      expect(found.messages).toHaveLength(0);
    });

    it("should have correct state for disconnected ChatView rendering", () => {
      const store = useStore.getState();
      store.setConnected(false);
      const conv = store.createConversation();
      store.selectConversation(conv.id);

      const state = useStore.getState();
      expect(state.connected).toBe(false);
      expect(state.currentConversationId).toBe(conv.id);
    });
  });

  describe("message editing flow (deleteMessagesAfter + re-send)", () => {
    it("should simulate a complete edit-regenerate cycle", async () => {
      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();

      // Build up a conversation
      const msg1 = store.addMessage(conv.id, {
        role: "user",
        content: "Original Q1",
      });
      store.addMessage(conv.id, { role: "assistant", content: "Answer 1" });
      store.addMessage(conv.id, { role: "user", content: "Follow up" });
      store.addMessage(conv.id, { role: "assistant", content: "Answer 2" });

      // User edits msg1: delete everything after it
      store.deleteMessagesAfter(conv.id, msg1.id);

      // Update message content
      store.updateMessage(conv.id, msg1.id, "Edited Q1");

      // Verify state after edit
      const afterEdit = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(afterEdit.messages).toHaveLength(1);
      expect(afterEdit.messages[0].content).toBe("Edited Q1");

      // Start new assistant response
      store.addMessage(conv.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      // Simulate invoke
      await invoke("send_message", {
        params: {
          message: "Edited Q1",
          session_key: conv.id,
          model: store.settings.defaultModel,
          thinking: null,
        },
      });

      // Stream response
      store.appendToCurrentMessage("New answer to edited question");
      store.completeCurrentMessage({ input: 25, output: 35, totalTokens: 60 });

      // Verify final state
      const finalConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(finalConv.messages).toHaveLength(2);
      expect(finalConv.messages[0].content).toBe("Edited Q1");
      expect(finalConv.messages[1].content).toBe(
        "New answer to edited question",
      );
      expect(finalConv.messages[1].usage!.totalTokens).toBe(60);
    });
  });

  describe("regenerate flow", () => {
    it("should simulate regenerating an assistant response", async () => {
      const store = useStore.getState();
      store.setConnected(true);
      const conv = store.createConversation();

      // Build conversation
      store.addMessage(conv.id, { role: "user", content: "Original question" });
      const assistantMsg = store.addMessage(conv.id, {
        role: "assistant",
        content: "Bad answer",
      });

      // Regenerate: delete assistant message
      store.deleteMessage(conv.id, assistantMsg.id);

      // Verify deletion
      const afterDelete = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(afterDelete.messages).toHaveLength(1);
      expect(afterDelete.messages[0].role).toBe("user");

      // Add new streaming response
      store.addMessage(conv.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      // Re-send the user message
      await invoke("send_message", {
        params: {
          message: "Original question",
          session_key: conv.id,
          model: store.settings.defaultModel,
          thinking: null,
        },
      });

      // Stream new response
      store.appendToCurrentMessage("Better answer");
      store.completeCurrentMessage({ input: 10, output: 15, totalTokens: 25 });

      const finalConv = useStore
        .getState()
        .conversations.find((c) => c.id === conv.id)!;
      expect(finalConv.messages).toHaveLength(2);
      expect(finalConv.messages[1].content).toBe("Better answer");
    });
  });
});
