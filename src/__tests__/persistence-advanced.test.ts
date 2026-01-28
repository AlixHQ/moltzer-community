/**
 * Advanced Persistence Tests
 *
 * Tests advanced scenarios in the persistence layer including
 * performance, data integrity, and complex operations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  persistConversation,
  loadPersistedData,
  searchPersistedMessages,
  getStorageStats,
  clearAllData,
} from "../lib/persistence";
import { db } from "../lib/db";
import type { Conversation } from "../stores/store";

// Mock keychain for encryption
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn((command: string) => {
    if (command === "keychain_get") {
      return Promise.resolve("mock-encryption-key-for-testing");
    }
    if (command === "keychain_set") {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Unknown command"));
  }),
}));

describe("Advanced Persistence Tests", () => {
  beforeEach(async () => {
    await db.conversations.clear();
    await db.messages.clear();
  });

  afterEach(async () => {
    await db.conversations.clear();
    await db.messages.clear();
  });

  describe("data integrity", () => {
    it("should preserve all conversation fields after round-trip", async () => {
      const conv: Conversation = {
        id: "integrity-test",
        title: "Test Conversation with Unicode: 你好 🌍",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "User message with emoji 🎉",
            timestamp: new Date("2024-01-15T10:30:00Z"),
          },
          {
            id: "msg-2",
            role: "assistant",
            content: "Assistant response",
            timestamp: new Date("2024-01-15T10:30:05Z"),
            modelUsed: "claude-sonnet-4-5",
            usage: {
              input: 100,
              output: 200,
              totalTokens: 300,
            },
          },
        ],
        createdAt: new Date("2024-01-15T10:00:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z"),
        model: "test-model",
        thinkingEnabled: true,
        isPinned: true,
        systemPrompt: "Custom system prompt",
      };

      await persistConversation(conv);
      const result = await loadPersistedData();

      expect(result.conversations).toHaveLength(1);
      const loaded = result.conversations[0];

      // Check all fields
      expect(loaded.id).toBe(conv.id);
      expect(loaded.title).toBe(conv.title);
      expect(loaded.model).toBe(conv.model);
      expect(loaded.thinkingEnabled).toBe(true);
      expect(loaded.isPinned).toBe(true);
      expect(loaded.systemPrompt).toBe(conv.systemPrompt);
      expect(loaded.messages).toHaveLength(2);

      // Check message fields
      const msg2 = loaded.messages[1];
      expect(msg2.modelUsed).toBe("claude-sonnet-4-5");
      expect(msg2.usage).toEqual({
        input: 100,
        output: 200,
        totalTokens: 300,
      });
    });

    it("should handle conversations with thinking content", async () => {
      const conv: Conversation = {
        id: "thinking-conv",
        title: "Thinking Test",
        messages: [
          {
            id: "msg-1",
            role: "assistant",
            content: "Final answer",
            timestamp: new Date(),
            thinkingContent:
              "Let me think step by step:\n1. First\n2. Second\n3. Conclusion",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: true,
        isPinned: false,
      };

      await persistConversation(conv);
      const result = await loadPersistedData();

      const loaded = result.conversations[0];
      expect(loaded.messages[0].thinkingContent).toBe(
        conv.messages[0].thinkingContent,
      );
    });

    it("should maintain timestamp precision", async () => {
      const now = new Date();
      const conv: Conversation = {
        id: "timestamp-test",
        title: "Timestamp Test",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Message",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);
      const result = await loadPersistedData();

      const loaded = result.conversations[0];
      expect(loaded.createdAt.getTime()).toBe(now.getTime());
      expect(loaded.updatedAt.getTime()).toBe(now.getTime());
      expect(loaded.messages[0].timestamp.getTime()).toBe(now.getTime());
    });
  });

  describe("search functionality", () => {
    beforeEach(async () => {
      // Create test conversations with various content
      const convs: Conversation[] = [
        {
          id: "search-1",
          title: "JavaScript Tutorial",
          messages: [
            {
              id: "msg-1",
              role: "user",
              content: "How do I create a React component?",
              timestamp: new Date(),
            },
            {
              id: "msg-2",
              role: "assistant",
              content:
                "Here's how to create a React component using hooks...",
              timestamp: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          thinkingEnabled: false,
          isPinned: false,
        },
        {
          id: "search-2",
          title: "Python Debugging",
          messages: [
            {
              id: "msg-3",
              role: "user",
              content: "How to debug Python code?",
              timestamp: new Date(),
            },
            {
              id: "msg-4",
              role: "assistant",
              content: "You can use pdb for debugging Python code...",
              timestamp: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          thinkingEnabled: false,
          isPinned: false,
        },
      ];

      for (const conv of convs) {
        await persistConversation(conv);
      }
    });

    it("should search case-insensitively", async () => {
      const results1 = await searchPersistedMessages("react");
      const results2 = await searchPersistedMessages("REACT");
      const results3 = await searchPersistedMessages("ReAcT");

      expect(results1.length).toBeGreaterThan(0);
      expect(results1.length).toBe(results2.length);
      expect(results1.length).toBe(results3.length);
    });

    it("should search in both user and assistant messages", async () => {
      const results = await searchPersistedMessages("debug");

      // Should find both the question and the answer
      expect(results.length).toBe(2);
      expect(results.some((r) => r.role === "user")).toBe(true);
      expect(results.some((r) => r.role === "assistant")).toBe(true);
    });

    it("should handle partial word matches", async () => {
      const results = await searchPersistedMessages("comp");

      // Should match "component"
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain("component");
    });

    it("should return results with conversation context", async () => {
      const results = await searchPersistedMessages("Python");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].conversationId).toBe("search-2");
      expect(results[0].conversationTitle).toBe("Python Debugging");
    });

    it("should handle searches with special regex characters", async () => {
      // Add conversation with special characters
      const conv: Conversation = {
        id: "special-chars",
        title: "Special Characters",
        messages: [
          {
            id: "msg-special",
            role: "user",
            content: "How to use regex with [brackets] and (parentheses)?",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);

      // These should not throw
      await expect(searchPersistedMessages("[brackets]")).resolves.not.toThrow();
      await expect(searchPersistedMessages("(test)")).resolves.not.toThrow();
      await expect(searchPersistedMessages("$special")).resolves.not.toThrow();
      await expect(searchPersistedMessages("test.*")).resolves.not.toThrow();
    });

    it("should limit results to conversation when specified", async () => {
      const results1 = await searchPersistedMessages("code");
      const results2 = await searchPersistedMessages("code", "search-2");

      // results2 should be a subset of results1
      expect(results2.length).toBeLessThanOrEqual(results1.length);
      results2.forEach((r) => {
        expect(r.conversationId).toBe("search-2");
      });
    });

    it("should handle empty search results gracefully", async () => {
      const results = await searchPersistedMessages(
        "this-definitely-does-not-exist-xyzabc123",
      );
      expect(results).toEqual([]);
    });
  });

  describe("storage statistics", () => {
    it("should calculate accurate message count", async () => {
      const convs: Conversation[] = [
        {
          id: "stats-1",
          title: "Conv 1",
          messages: Array.from({ length: 10 }, (_, i) => ({
            id: `msg-${i}`,
            role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
            content: `Message ${i}`,
            timestamp: new Date(),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          thinkingEnabled: false,
          isPinned: false,
        },
        {
          id: "stats-2",
          title: "Conv 2",
          messages: Array.from({ length: 5 }, (_, i) => ({
            id: `msg-b-${i}`,
            role: "user" as const,
            content: `Message ${i}`,
            timestamp: new Date(),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          thinkingEnabled: false,
          isPinned: false,
        },
      ];

      for (const conv of convs) {
        await persistConversation(conv);
      }

      const stats = await getStorageStats();
      expect(stats.conversationCount).toBe(2);
      expect(stats.messageCount).toBe(15);
    });

    it("should provide reasonable size estimate", async () => {
      const conv: Conversation = {
        id: "size-test",
        title: "Size Test",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "A".repeat(1000), // 1KB message
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);
      const stats = await getStorageStats();

      // Should report non-zero size
      expect(stats.estimatedSize).not.toBe("0 KB");
      expect(stats.estimatedSize).toMatch(/\d+\.\d+ (KB|MB)/);
    });
  });

  describe("concurrent persistence", () => {
    it("should handle multiple conversations persisted simultaneously", async () => {
      const convs: Conversation[] = Array.from({ length: 10 }, (_, i) => ({
        id: `concurrent-${i}`,
        title: `Conv ${i}`,
        messages: [
          {
            id: `msg-${i}`,
            role: "user" as const,
            content: `Message ${i}`,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      }));

      // Persist all at once
      await Promise.all(convs.map((c) => persistConversation(c)));

      const result = await loadPersistedData();
      expect(result.conversations).toHaveLength(10);
    });

    it("should handle updates to same conversation", async () => {
      const conv: Conversation = {
        id: "update-test",
        title: "Original Title",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);

      // Update multiple times
      conv.title = "Updated Title 1";
      await persistConversation(conv);

      conv.title = "Updated Title 2";
      await persistConversation(conv);

      conv.title = "Final Title";
      await persistConversation(conv);

      const result = await loadPersistedData();
      expect(result.conversations[0].title).toBe("Final Title");
    });
  });

  describe("large data handling", () => {
    it("should handle conversations with many messages", async () => {
      const conv: Conversation = {
        id: "large-conv",
        title: "Large Conversation",
        messages: Array.from({ length: 500 }, (_, i) => ({
          id: `msg-${i}`,
          role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
          content: `Message number ${i} with some content`,
          timestamp: new Date(Date.now() + i * 1000),
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);
      const result = await loadPersistedData();

      expect(result.conversations[0].messages).toHaveLength(500);
      // Check order is preserved
      expect(result.conversations[0].messages[0].content).toContain("number 0");
      expect(result.conversations[0].messages[499].content).toContain(
        "number 499",
      );
    });

    it("should handle very long message content", async () => {
      const longContent = "A".repeat(100000); // 100KB message

      const conv: Conversation = {
        id: "long-message",
        title: "Long Message Test",
        messages: [
          {
            id: "long-msg",
            role: "assistant",
            content: longContent,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);
      const result = await loadPersistedData();

      expect(result.conversations[0].messages[0].content).toBe(longContent);
      expect(result.conversations[0].messages[0].content.length).toBe(100000);
    });

    it("should handle many conversations", async () => {
      const convs: Conversation[] = Array.from({ length: 100 }, (_, i) => ({
        id: `conv-${i}`,
        title: `Conversation ${i}`,
        messages: [
          {
            id: `msg-${i}`,
            role: "user" as const,
            content: `Message in conversation ${i}`,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(Date.now() - (100 - i) * 60000), // Spread over time
        updatedAt: new Date(Date.now() - (100 - i) * 60000),
        thinkingEnabled: false,
        isPinned: i % 10 === 0, // Every 10th is pinned
      }));

      for (const conv of convs) {
        await persistConversation(conv);
      }

      const result = await loadPersistedData();
      expect(result.conversations).toHaveLength(100);

      // Check pinned conversations
      const pinned = result.conversations.filter((c) => c.isPinned);
      expect(pinned).toHaveLength(10);
    });
  });

  describe("clear all data", () => {
    it("should remove all data and allow fresh start", async () => {
      // Add some data
      const convs: Conversation[] = Array.from({ length: 5 }, (_, i) => ({
        id: `clear-${i}`,
        title: `Conv ${i}`,
        messages: [
          {
            id: `msg-${i}`,
            role: "user" as const,
            content: `Message ${i}`,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      }));

      for (const conv of convs) {
        await persistConversation(conv);
      }

      // Verify data exists
      let result = await loadPersistedData();
      expect(result.conversations).toHaveLength(5);

      // Clear all
      await clearAllData();

      // Verify empty
      result = await loadPersistedData();
      expect(result.conversations).toHaveLength(0);

      // Should be able to add new data
      const newConv: Conversation = {
        id: "new-after-clear",
        title: "New Conversation",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(newConv);

      result = await loadPersistedData();
      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].id).toBe("new-after-clear");
    });
  });

  describe("special characters and encoding", () => {
    it("should handle all unicode characters", async () => {
      const specialContent = [
        "English: Hello World",
        "Chinese: 你好世界",
        "Arabic: مرحبا بالعالم",
        "Emoji: 🌍🎉👨‍👩‍👧‍👦",
        "Math: ∑∫√π≠≈",
        "Currency: $€£¥₹",
        "Special: \t\n\r\\\"'",
      ].join("\n");

      const conv: Conversation = {
        id: "unicode-test",
        title: "Unicode Test 🌐",
        messages: [
          {
            id: "unicode-msg",
            role: "user",
            content: specialContent,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);
      const result = await loadPersistedData();

      expect(result.conversations[0].title).toBe("Unicode Test 🌐");
      expect(result.conversations[0].messages[0].content).toBe(specialContent);
    });
  });
});
