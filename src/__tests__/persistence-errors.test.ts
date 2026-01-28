/**
 * Persistence Error Handling Tests
 *
 * Tests error paths and edge cases in the persistence layer
 * that aren't covered by integration tests.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  searchPersistedMessages,
  clearAllData,
  getStorageStats,
  loadPersistedData,
  persistConversation,
  deletePersistedConversation,
} from "../lib/persistence";
import { db } from "../lib/db";
import type { Conversation } from "../stores/store";

// Mock keychain for encryption
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn((command: string) => {
    if (command === "keychain_get") {
      return Promise.resolve("mock-encryption-key");
    }
    return Promise.reject(new Error("Unknown command"));
  }),
}));

describe("Persistence Error Handling", () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.conversations.clear();
    await db.messages.clear();
  });

  afterEach(async () => {
    // Cleanup after tests
    await db.conversations.clear();
    await db.messages.clear();
  });

  describe("searchPersistedMessages", () => {
    it("should return empty array when database fails", async () => {
      // Mock database failure
      const originalToArray = db.messages.toArray;
      vi.spyOn(db.messages, "toArray").mockRejectedValueOnce(
        new Error("Database error"),
      );

      const results = await searchPersistedMessages("test query");

      expect(results).toEqual([]);

      // Restore
      db.messages.toArray = originalToArray;
    });

    it("should handle empty query", async () => {
      const results = await searchPersistedMessages("");
      expect(results).toEqual([]);
    });

    it("should filter by conversationId when provided", async () => {
      const conv: Conversation = {
        id: "conv-1",
        title: "Test Conversation",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "searchable content",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);

      const results = await searchPersistedMessages("searchable", "conv-1");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].conversationId).toBe("conv-1");
    });

    it("should handle messages with missing conversation", async () => {
      // Add a message without a corresponding conversation
      const { encrypt } = await import("../lib/encryption");
      const encryptedContent = await encrypt("orphaned message content");

      await db.messages.add({
        id: "orphan-msg",
        conversationId: "nonexistent-conv",
        role: "user",
        content: encryptedContent,
        timestamp: new Date(),
        searchText: "orphaned message content",
      });

      const results = await searchPersistedMessages("orphaned");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].conversationTitle).toBe("Unknown");
    });

    it("should skip messages with decryption failures", async () => {
      // Add a message with invalid encrypted content
      await db.messages.add({
        id: "corrupt-msg",
        conversationId: "conv-1",
        role: "user",
        content: "not-actually-encrypted-data",
        timestamp: new Date(),
        searchText: "corrupt message",
      });

      const results = await searchPersistedMessages("corrupt");

      // Should return empty since decryption will fail
      // (The function catches and logs the error but doesn't add to results)
      expect(results).toEqual([]);
    });

    it("should handle multiple search words", async () => {
      const conv: Conversation = {
        id: "multi-search",
        title: "Multi Search Test",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "the quick brown fox",
            timestamp: new Date(),
          },
          {
            id: "msg-2",
            role: "user",
            content: "the lazy dog",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);

      // Search for multiple words - should match first message
      const results = await searchPersistedMessages("quick brown");
      expect(results.length).toBe(1);
      expect(results[0].content).toContain("quick");
      expect(results[0].content).toContain("brown");
    });
  });

  describe("clearAllData", () => {
    it("should remove all conversations and messages", async () => {
      // Add some test data
      const conv1: Conversation = {
        id: "clear-test-1",
        title: "Conv 1",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Message 1",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      const conv2: Conversation = {
        id: "clear-test-2",
        title: "Conv 2",
        messages: [
          {
            id: "msg-2",
            role: "user",
            content: "Message 2",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv1);
      await persistConversation(conv2);

      // Verify data exists
      const beforeConvCount = await db.conversations.count();
      const beforeMsgCount = await db.messages.count();
      expect(beforeConvCount).toBe(2);
      expect(beforeMsgCount).toBe(2);

      // Clear all data
      await clearAllData();

      // Verify data is gone
      const afterConvCount = await db.conversations.count();
      const afterMsgCount = await db.messages.count();
      expect(afterConvCount).toBe(0);
      expect(afterMsgCount).toBe(0);
    });

    it("should not throw when database is already empty", async () => {
      await expect(clearAllData()).resolves.not.toThrow();
    });

    it("should handle database errors gracefully", async () => {
      const originalClear = db.conversations.clear;
      vi.spyOn(db.conversations, "clear").mockRejectedValueOnce(
        new Error("Clear failed"),
      );

      // Should log error but not throw
      await expect(clearAllData()).rejects.toThrow();

      // Restore
      db.conversations.clear = originalClear;
    });
  });

  describe("getStorageStats", () => {
    it("should return zero stats for empty database", async () => {
      const stats = await getStorageStats();

      expect(stats.conversationCount).toBe(0);
      expect(stats.messageCount).toBe(0);
      expect(stats.estimatedSize).toBe("0 KB");
    });

    it("should calculate stats correctly", async () => {
      const conv: Conversation = {
        id: "stats-test",
        title: "Stats Test",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Message 1",
            timestamp: new Date(),
          },
          {
            id: "msg-2",
            role: "assistant",
            content: "Message 2",
            timestamp: new Date(),
          },
          {
            id: "msg-3",
            role: "user",
            content: "Message 3",
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

      expect(stats.conversationCount).toBe(1);
      expect(stats.messageCount).toBe(3);
      expect(stats.estimatedSize).toMatch(/\d+\.\d+ KB/);
    });

    it("should handle database errors and return defaults", async () => {
      const originalCount = db.conversations.count;
      vi.spyOn(db.conversations, "count").mockRejectedValueOnce(
        new Error("Count failed"),
      );

      const stats = await getStorageStats();

      expect(stats.conversationCount).toBe(0);
      expect(stats.messageCount).toBe(0);
      expect(stats.estimatedSize).toBe("0 KB");

      // Restore
      db.conversations.count = originalCount;
    });
  });

  describe("loadPersistedData error handling", () => {
    it("should skip corrupted messages during load", async () => {
      const { encrypt } = await import("../lib/encryption");
      const encryptedTitle = await encrypt("Test Conversation");

      // Add conversation
      await db.conversations.add({
        id: "load-error-test",
        title: encryptedTitle,
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      });

      // Add valid message
      const validContent = await encrypt("Valid message");
      await db.messages.add({
        id: "valid-msg",
        conversationId: "load-error-test",
        role: "user",
        content: validContent,
        timestamp: new Date(),
        searchText: "valid message",
      });

      // Add corrupted message
      await db.messages.add({
        id: "corrupt-msg",
        conversationId: "load-error-test",
        role: "user",
        content: "definitely-not-encrypted",
        timestamp: new Date(),
        searchText: "corrupt",
      });

      const result = await loadPersistedData();

      expect(result.conversations).toHaveLength(1);
      // Should only have the valid message (corrupted one skipped)
      expect(result.conversations[0].messages).toHaveLength(1);
      expect(result.conversations[0].messages[0].id).toBe("valid-msg");
    });

    it("should handle unencrypted legacy conversation titles", async () => {
      // Add conversation with unencrypted title (migration case)
      await db.conversations.add({
        id: "legacy-conv",
        title: "Plain Text Legacy Title",
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      });

      const result = await loadPersistedData();

      expect(result.conversations).toHaveLength(1);
      // Should use title as-is when decryption fails
      expect(result.conversations[0].title).toBe("Plain Text Legacy Title");
    });

    it("should return empty array on database failure", async () => {
      const originalOrderBy = db.conversations.orderBy;
      vi.spyOn(db.conversations, "orderBy").mockReturnValueOnce({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValue(new Error("Database error")),
        }),
      } as any);

      const result = await loadPersistedData();

      expect(result.conversations).toEqual([]);

      // Restore
      db.conversations.orderBy = originalOrderBy;
    });
  });

  describe("deletePersistedConversation error handling", () => {
    it("should throw error on database failure", async () => {
      const originalDelete = db.conversations.delete;
      vi.spyOn(db.conversations, "delete").mockRejectedValueOnce(
        new Error("Delete failed"),
      );

      await expect(
        deletePersistedConversation("some-id"),
      ).rejects.toThrow();

      // Restore
      db.conversations.delete = originalDelete;
    });
  });

  describe("edge cases", () => {
    it("should handle conversations with no messages", async () => {
      const conv: Conversation = {
        id: "no-messages",
        title: "Empty Conversation",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);

      const result = await loadPersistedData();

      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].messages).toHaveLength(0);
    });

    it("should handle messages with thinking content", async () => {
      const conv: Conversation = {
        id: "thinking-test",
        title: "Thinking Test",
        messages: [
          {
            id: "thinking-msg",
            role: "assistant",
            content: "Final answer",
            timestamp: new Date(),
            thinkingContent: "Let me think about this...",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: true,
        isPinned: false,
      };

      await persistConversation(conv);

      const result = await loadPersistedData();

      expect(result.conversations[0].messages[0].thinkingContent).toBe(
        "Let me think about this...",
      );
    });

    it("should handle very large conversation titles", async () => {
      const longTitle = "a".repeat(10000);
      const conv: Conversation = {
        id: "long-title",
        title: longTitle,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conv);

      const result = await loadPersistedData();

      expect(result.conversations[0].title).toBe(longTitle);
    });
  });
});
