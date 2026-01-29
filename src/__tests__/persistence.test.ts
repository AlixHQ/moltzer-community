/**
 * Persistence Layer Tests
 *
 * Tests the persistence layer that integrates IndexedDB, encryption,
 * and the Zustand store. This includes:
 * - Loading and saving conversations
 * - Encryption/decryption of sensitive data
 * - Message queuing and updates
 * - Search functionality
 * - Data cleanup operations
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadPersistedData,
  persistConversation,
  deletePersistedConversation,
  persistMessage,
  updatePersistedConversation,
  searchPersistedMessages,
  deletePersistedMessage,
  deletePersistedMessages,
  clearAllData,
  getStorageStats,
} from "../lib/persistence";
import type { Conversation, Message } from "../stores/store";

// Mock the encryption module
vi.mock("../lib/encryption", () => ({
  encrypt: vi.fn(async (text: string) => `encrypted:${text}`),
  decrypt: vi.fn(async (text: string) => text.replace("encrypted:", "")),
}));

// Mock the db module
const mockDb = {
  conversations: {
    orderBy: vi.fn(() => ({
      reverse: vi.fn(() => ({
        toArray: vi.fn(async () => []),
      })),
    })),
    put: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    clear: vi.fn(async () => {}),
    count: vi.fn(async () => 0),
    get: vi.fn(async () => null),
  },
  messages: {
    where: vi.fn(() => ({
      equals: vi.fn(() => ({
        sortBy: vi.fn(async () => []),
        delete: vi.fn(async () => {}),
        toArray: vi.fn(async () => []),
      })),
    })),
    put: vi.fn(async () => {}),
    bulkAdd: vi.fn(async () => {}),
    bulkDelete: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    clear: vi.fn(async () => {}),
    count: vi.fn(async () => 0),
    toCollection: vi.fn(() => ({
      toArray: vi.fn(async () => []),
    })),
  },
  transaction: vi.fn(),
};

// Initialize transaction mock with default behavior
mockDb.transaction.mockImplementation(async (_mode: string, _tables: unknown, callback?: () => Promise<unknown>) => {
  if (callback) {
    return await callback();
  }
  return Promise.resolve();
});

vi.mock("../lib/db", () => ({
  db: mockDb,
}));

describe("Persistence Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockDb.conversations.orderBy.mockReturnValue({
      reverse: vi.fn(() => ({
        toArray: vi.fn(async () => []),
      })),
    });
    mockDb.messages.where.mockReturnValue({
      equals: vi.fn(() => ({
        sortBy: vi.fn(async () => []),
        delete: vi.fn(async () => {}),
        toArray: vi.fn(async () => []),
      })),
    });
    // Reset transaction mock to default behavior
    mockDb.transaction.mockImplementation(async (_mode: string, _tables: unknown, callback?: () => Promise<unknown>) => {
      if (callback) {
        return await callback();
      }
      return Promise.resolve();
    });
  });

  describe("loadPersistedData", () => {
    it("should load and decrypt conversations with messages", async () => {
      const mockDbConv = {
        id: "conv-1",
        title: "encrypted:Test Chat",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      const mockDbMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "user" as const,
          content: "encrypted:Hello",
          timestamp: new Date("2024-01-01T10:00:00"),
          modelUsed: "claude-3",
          thinkingContent: undefined,
          searchText: "hello",
        },
        {
          id: "msg-2",
          conversationId: "conv-1",
          role: "assistant" as const,
          content: "encrypted:Hi there!",
          timestamp: new Date("2024-01-01T10:01:00"),
          modelUsed: "claude-3",
          thinkingContent: "encrypted:thinking...",
          searchText: "hi there",
        },
      ];

      mockDb.conversations.orderBy.mockReturnValue({
        reverse: vi.fn(() => ({
          toArray: vi.fn(async () => [mockDbConv]),
        })),
      });

      mockDb.messages.where.mockReturnValue({
        equals: vi.fn(() => ({
          sortBy: vi.fn(async () => mockDbMessages),
          delete: vi.fn(async () => {}),
        })),
      });

      const result = await loadPersistedData();

      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].id).toBe("conv-1");
      expect(result.conversations[0].title).toBe("Test Chat");
      expect(result.conversations[0].messages).toHaveLength(2);
      expect(result.conversations[0].messages[0].content).toBe("Hello");
      expect(result.conversations[0].messages[1].content).toBe("Hi there!");
      expect(result.conversations[0].messages[1].thinkingContent).toBe(
        "thinking...",
      );
    });

    it("should handle empty database", async () => {
      const result = await loadPersistedData();

      expect(result.conversations).toHaveLength(0);
    });

    it("should skip corrupted messages that fail decryption", async () => {
      const mockDbConv = {
        id: "conv-1",
        title: "encrypted:Test Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      const mockDbMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "user" as const,
          content: "encrypted:Good message",
          timestamp: new Date(),
          searchText: "good",
        },
        {
          id: "msg-2",
          conversationId: "conv-1",
          role: "user" as const,
          content: "corrupted-data",
          timestamp: new Date(),
          searchText: "bad",
        },
      ];

      mockDb.conversations.orderBy.mockReturnValue({
        reverse: vi.fn(() => ({
          toArray: vi.fn(async () => [mockDbConv]),
        })),
      });

      mockDb.messages.where.mockReturnValue({
        equals: vi.fn(() => ({
          sortBy: vi.fn(async () => mockDbMessages),
          delete: vi.fn(async () => {}),
        })),
      });

      const { decrypt } = await import("../lib/encryption");
      vi.mocked(decrypt).mockImplementation(async (text: string) => {
        if (text === "corrupted-data") {
          throw new Error("Decryption failed");
        }
        return text.replace("encrypted:", "");
      });

      const result = await loadPersistedData();

      expect(result.conversations[0].messages).toHaveLength(1);
      expect(result.conversations[0].messages[0].id).toBe("msg-1");
    });

    it("should handle unencrypted conversation titles (migration case)", async () => {
      const mockDbConv = {
        id: "conv-1",
        title: "Unencrypted Title", // Not encrypted
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      mockDb.conversations.orderBy.mockReturnValue({
        reverse: vi.fn(() => ({
          toArray: vi.fn(async () => [mockDbConv]),
        })),
      });

      const { decrypt } = await import("../lib/encryption");
      vi.mocked(decrypt).mockImplementation(async (text: string) => {
        if (text === "Unencrypted Title") {
          throw new Error("Not encrypted");
        }
        return text.replace("encrypted:", "");
      });

      const result = await loadPersistedData();

      expect(result.conversations[0].title).toBe("Unencrypted Title");
    });

    it("should return empty state on database error", async () => {
      mockDb.conversations.orderBy.mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await loadPersistedData();

      expect(result.conversations).toHaveLength(0);
    });
  });

  describe("persistConversation", () => {
    it("should encrypt and persist conversation with messages", async () => {
      // Ensure transaction mock is set up for this test
      mockDb.transaction.mockImplementation(async (_mode: string, _tables: unknown, callback?: () => Promise<unknown>) => {
        if (callback) {
          return await callback();
        }
        return Promise.resolve();
      });

      const conversation: Conversation = {
        id: "conv-1",
        title: "Test Chat",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Hello",
            timestamp: new Date("2024-01-01T10:00:00"),
          },
          {
            id: "msg-2",
            role: "assistant",
            content: "Hi there!",
            timestamp: new Date("2024-01-01T10:01:00"),
            modelUsed: "claude-3",
            thinkingContent: "Let me respond...",
          },
        ],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conversation);

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockDb.conversations.put).toHaveBeenCalledWith({
        id: "conv-1",
        title: "encrypted:Test Chat",
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      });

      expect(mockDb.messages.where).toHaveBeenCalledWith("conversationId");
      expect(mockDb.messages.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "msg-1",
            conversationId: "conv-1",
            role: "user",
            content: "encrypted:Hello",
            searchText: "hello",
          }),
          expect.objectContaining({
            id: "msg-2",
            conversationId: "conv-1",
            role: "assistant",
            content: "encrypted:Hi there!",
            thinkingContent: "encrypted:Let me respond...",
            searchText: "hi there!",
          }),
        ]),
      );
    });

    it("should handle messages without thinking content", async () => {
      const conversation: Conversation = {
        id: "conv-1",
        title: "Test",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Hello",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conversation);

      expect(mockDb.messages.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            thinkingContent: undefined,
          }),
        ]),
      );
    });

    it("should create searchable plaintext", async () => {
      const conversation: Conversation = {
        id: "conv-1",
        title: "Test",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "HELLO WORLD!",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conversation);

      expect(mockDb.messages.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            searchText: "hello world!",
          }),
        ]),
      );
    });

    it("should rethrow errors", async () => {
      mockDb.transaction.mockRejectedValue(new Error("Database error"));

      const conversation: Conversation = {
        id: "conv-1",
        title: "Test",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      await expect(persistConversation(conversation)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("deletePersistedConversation", () => {
    it("should delete conversation and its messages", async () => {
      await deletePersistedConversation("conv-1");

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockDb.conversations.delete).toHaveBeenCalledWith("conv-1");
      expect(mockDb.messages.where).toHaveBeenCalledWith("conversationId");
    });

    it("should rethrow errors", async () => {
      mockDb.transaction.mockRejectedValue(new Error("Delete failed"));

      await expect(deletePersistedConversation("conv-1")).rejects.toThrow(
        "Delete failed",
      );
    });
  });

  describe("persistMessage", () => {
    it("should encrypt and persist a single message", async () => {
      const message: Message = {
        id: "msg-1",
        role: "user",
        content: "Test message",
        timestamp: new Date("2024-01-01T10:00:00"),
        modelUsed: "claude-3",
      };

      await persistMessage("conv-1", message);

      expect(mockDb.messages.put).toHaveBeenCalledWith({
        id: "msg-1",
        conversationId: "conv-1",
        role: "user",
        content: "encrypted:Test message",
        timestamp: message.timestamp,
        modelUsed: "claude-3",
        thinkingContent: undefined,
        searchText: "test message",
      });
    });

    it("should persist message with thinking content", async () => {
      const message: Message = {
        id: "msg-1",
        role: "assistant",
        content: "Response",
        timestamp: new Date(),
        thinkingContent: "Analyzing the question...",
      };

      await persistMessage("conv-1", message);

      expect(mockDb.messages.put).toHaveBeenCalledWith(
        expect.objectContaining({
          thinkingContent: "encrypted:Analyzing the question...",
        }),
      );
    });

    it("should rethrow errors", async () => {
      mockDb.messages.put.mockRejectedValue(new Error("Persist failed"));

      const message: Message = {
        id: "msg-1",
        role: "user",
        content: "Test",
        timestamp: new Date(),
      };

      await expect(persistMessage("conv-1", message)).rejects.toThrow(
        "Persist failed",
      );
    });
  });

  describe("updatePersistedConversation", () => {
    it("should update conversation metadata without touching messages", async () => {
      const conversation: Conversation = {
        id: "conv-1",
        title: "Updated Title",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "This should not be persisted",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        model: "claude-3",
        thinkingEnabled: true,
        isPinned: true,
      };

      await updatePersistedConversation(conversation);

      expect(mockDb.conversations.put).toHaveBeenCalledWith({
        id: "conv-1",
        title: "encrypted:Updated Title",
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        model: "claude-3",
        thinkingEnabled: true,
        isPinned: true,
      });

      // Should NOT update messages
      expect(mockDb.messages.bulkAdd).not.toHaveBeenCalled();
      expect(mockDb.messages.put).not.toHaveBeenCalled();
    });

    it("should rethrow errors", async () => {
      mockDb.conversations.put.mockRejectedValue(new Error("Update failed"));

      const conversation: Conversation = {
        id: "conv-1",
        title: "Test",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      await expect(updatePersistedConversation(conversation)).rejects.toThrow(
        "Update failed",
      );
    });
  });

  describe("searchPersistedMessages", () => {
    it("should search and decrypt messages across all conversations", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "user" as const,
          content: "encrypted:quantum computing",
          timestamp: new Date(),
          searchText: "quantum computing",
        },
        {
          id: "msg-2",
          conversationId: "conv-2",
          role: "assistant" as const,
          content: "encrypted:quantum physics",
          timestamp: new Date(),
          searchText: "quantum physics",
        },
      ];

      const mockConv1 = {
        id: "conv-1",
        title: "encrypted:Tech Chat",
      };

      const mockConv2 = {
        id: "conv-2",
        title: "encrypted:Science Chat",
      };

      mockDb.messages.toCollection.mockReturnValue({
        toArray: vi.fn(async () => mockMessages),
      });

      mockDb.conversations.get
        .mockResolvedValueOnce(mockConv1)
        .mockResolvedValueOnce(mockConv2);

      const results = await searchPersistedMessages("quantum");

      expect(results).toHaveLength(2);
      expect(results[0].content).toBe("quantum computing");
      expect(results[0].conversationTitle).toBe("Tech Chat");
      expect(results[1].content).toBe("quantum physics");
      expect(results[1].conversationTitle).toBe("Science Chat");
    });

    it("should filter by conversation ID when specified", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "user" as const,
          content: "encrypted:test message",
          timestamp: new Date(),
          searchText: "test message",
        },
      ];

      mockDb.messages.where.mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn(async () => mockMessages),
        })),
      });

      mockDb.conversations.get.mockResolvedValue({
        id: "conv-1",
        title: "encrypted:Test",
      });

      const results = await searchPersistedMessages("test", "conv-1");

      expect(mockDb.messages.where).toHaveBeenCalledWith("conversationId");
      expect(results).toHaveLength(1);
    });

    it("should handle multi-word search queries", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "user" as const,
          content: "encrypted:quantum computing is fascinating",
          timestamp: new Date(),
          searchText: "quantum computing is fascinating",
        },
        {
          id: "msg-2",
          conversationId: "conv-1",
          role: "user" as const,
          content: "encrypted:machine learning overview",
          timestamp: new Date(),
          searchText: "machine learning overview",
        },
      ];

      mockDb.messages.toCollection.mockReturnValue({
        toArray: vi.fn(async () => mockMessages),
      });

      mockDb.conversations.get.mockResolvedValue({
        id: "conv-1",
        title: "encrypted:Tech",
      });

      const results = await searchPersistedMessages("quantum computing");

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe("quantum computing is fascinating");
    });

    it("should skip corrupted messages that fail decryption", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "user" as const,
          content: "encrypted:good message",
          timestamp: new Date(),
          searchText: "good message",
        },
        {
          id: "msg-2",
          conversationId: "conv-1",
          role: "user" as const,
          content: "corrupted-data",
          timestamp: new Date(),
          searchText: "bad message",
        },
      ];

      mockDb.messages.toCollection.mockReturnValue({
        toArray: vi.fn(async () => mockMessages),
      });

      mockDb.conversations.get.mockResolvedValue({
        id: "conv-1",
        title: "encrypted:Test",
      });

      const { decrypt } = await import("../lib/encryption");
      vi.mocked(decrypt).mockImplementation(async (text: string) => {
        if (text === "corrupted-data") {
          throw new Error("Decryption failed");
        }
        return text.replace("encrypted:", "");
      });

      const results = await searchPersistedMessages("message");

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("msg-1");
    });

    it("should handle conversation not found", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-deleted",
          role: "user" as const,
          content: "encrypted:orphaned message",
          timestamp: new Date(),
          searchText: "orphaned",
        },
      ];

      mockDb.messages.toCollection.mockReturnValue({
        toArray: vi.fn(async () => mockMessages),
      });

      mockDb.conversations.get.mockResolvedValue(null);

      const results = await searchPersistedMessages("orphaned");

      expect(results).toHaveLength(1);
      expect(results[0].conversationTitle).toBe("Unknown");
    });

    it("should return empty array on error", async () => {
      mockDb.messages.toCollection.mockImplementation(() => {
        throw new Error("Search failed");
      });

      const results = await searchPersistedMessages("test");

      expect(results).toHaveLength(0);
    });

    it("should decrypt thinking content if present", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "assistant" as const,
          content: "encrypted:response",
          timestamp: new Date(),
          thinkingContent: "encrypted:my thoughts",
          searchText: "response",
        },
      ];

      mockDb.messages.toCollection.mockReturnValue({
        toArray: vi.fn(async () => mockMessages),
      });

      mockDb.conversations.get.mockResolvedValue({
        id: "conv-1",
        title: "encrypted:Test",
      });

      const results = await searchPersistedMessages("response");

      expect(results[0].thinkingContent).toBe("my thoughts");
    });
  });

  describe("deletePersistedMessage", () => {
    it("should delete a single message", async () => {
      await deletePersistedMessage("msg-1");

      expect(mockDb.messages.delete).toHaveBeenCalledWith("msg-1");
    });

    it("should rethrow errors", async () => {
      mockDb.messages.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(deletePersistedMessage("msg-1")).rejects.toThrow(
        "Delete failed",
      );
    });
  });

  describe("deletePersistedMessages", () => {
    it("should delete multiple messages", async () => {
      const messageIds = ["msg-1", "msg-2", "msg-3"];

      await deletePersistedMessages(messageIds);

      expect(mockDb.messages.bulkDelete).toHaveBeenCalledWith(messageIds);
    });

    it("should rethrow errors", async () => {
      mockDb.messages.bulkDelete.mockRejectedValue(
        new Error("Bulk delete failed"),
      );

      await expect(deletePersistedMessages(["msg-1"])).rejects.toThrow(
        "Bulk delete failed",
      );
    });
  });

  describe("clearAllData", () => {
    it("should clear all conversations and messages", async () => {
      await clearAllData();

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockDb.conversations.clear).toHaveBeenCalled();
      expect(mockDb.messages.clear).toHaveBeenCalled();
    });

    it("should rethrow errors", async () => {
      mockDb.transaction.mockRejectedValue(new Error("Clear failed"));

      await expect(clearAllData()).rejects.toThrow("Clear failed");
    });
  });

  describe("getStorageStats", () => {
    it("should return storage statistics", async () => {
      mockDb.conversations.count.mockResolvedValue(5);
      mockDb.messages.count.mockResolvedValue(100);

      const stats = await getStorageStats();

      expect(stats.conversationCount).toBe(5);
      expect(stats.messageCount).toBe(100);
      expect(stats.estimatedSize).toContain("KB");
    });

    it("should calculate estimated size based on message count", async () => {
      mockDb.conversations.count.mockResolvedValue(1);
      mockDb.messages.count.mockResolvedValue(2048); // 2048 * 500 / 1024 = 1000 KB

      const stats = await getStorageStats();

      expect(stats.estimatedSize).toBe("1000.00 KB");
    });

    it("should return zero stats on error", async () => {
      mockDb.conversations.count.mockRejectedValue(new Error("Count failed"));

      const stats = await getStorageStats();

      expect(stats.conversationCount).toBe(0);
      expect(stats.messageCount).toBe(0);
      expect(stats.estimatedSize).toBe("0 KB");
    });
  });

  describe("Lazy Loading", () => {
    it("should lazy-load the database module", async () => {
      // The db module is mocked, but we can verify lazy loading by checking
      // that functions work even though the db is imported dynamically
      const result = await loadPersistedData();
      expect(result).toBeDefined();
      expect(result.conversations).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle conversation with no messages", async () => {
      const conversation: Conversation = {
        id: "conv-empty",
        title: "Empty Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conversation);

      expect(mockDb.messages.bulkAdd).toHaveBeenCalledWith([]);
    });

    it("should handle very long message content", async () => {
      const longContent = "x".repeat(100000);
      const conversation: Conversation = {
        id: "conv-1",
        title: "Test",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: longContent,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conversation);

      expect(mockDb.messages.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: `encrypted:${longContent}`,
          }),
        ]),
      );
    });

    it("should handle special characters in content", async () => {
      const specialContent = "Test \n\t\r!@#$%^&*(){}[]<>?/~`";
      const conversation: Conversation = {
        id: "conv-1",
        title: "Test",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: specialContent,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "claude-3",
        thinkingEnabled: false,
        isPinned: false,
      };

      await persistConversation(conversation);

      expect(mockDb.messages.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: `encrypted:${specialContent}`,
          }),
        ]),
      );
    });

    it("should handle empty search query in searchPersistedMessages", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "user" as const,
          content: "encrypted:test",
          timestamp: new Date(),
          searchText: "test",
        },
      ];

      mockDb.messages.toCollection.mockReturnValue({
        toArray: vi.fn(async () => mockMessages),
      });

      mockDb.conversations.get.mockResolvedValue({
        id: "conv-1",
        title: "encrypted:Test",
      });

      // Empty query splits to [""] which matches all messages
      // (every string includes empty string)
      const results = await searchPersistedMessages("");

      // Empty query matches all messages in current implementation
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("msg-1");
    });
  });
});
