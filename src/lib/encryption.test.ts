import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  encrypt,
  decrypt,
  encryptMessage,
  decryptMessage,
  isEncryptionAvailable,
  clearCachedKey,
} from "./encryption";

describe("Encryption", () => {
  beforeEach(() => {
    // Clear cached key before each test
    clearCachedKey();

    // Mock Tauri keychain invoke
    vi.mock("@tauri-apps/api/core", () => ({
      invoke: vi.fn((command: string) => {
        if (command === "keychain_get") {
          // Simulate no existing key
          throw new Error("Key not found");
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
  });

  afterEach(() => {
    clearCachedKey();
  });

  describe("isEncryptionAvailable", () => {
    it("should return true when crypto.subtle is available", () => {
      expect(isEncryptionAvailable()).toBe(true);
    });
  });

  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt a simple string", async () => {
      const plaintext = "Hello, World!";
      const encrypted = await encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(0);

      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("should handle empty strings", async () => {
      const result = await encrypt("");
      expect(result).toBe("");

      const decrypted = await decrypt("");
      expect(decrypted).toBe("");
    });

    it("should produce different ciphertexts for the same plaintext", async () => {
      const plaintext = "Test message";
      const encrypted1 = await encrypt(plaintext);
      const encrypted2 = await encrypt(plaintext);

      // Should be different because of random IV
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same plaintext
      expect(await decrypt(encrypted1)).toBe(plaintext);
      expect(await decrypt(encrypted2)).toBe(plaintext);
    });

    it("should handle unicode characters", async () => {
      const plaintext = "你好世界 🌍 Привет мир";
      const encrypted = await encrypt(plaintext);
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should handle long text", async () => {
      const plaintext = "a".repeat(10000);
      const encrypted = await encrypt(plaintext);
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should handle special characters", async () => {
      const plaintext = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/~`";
      const encrypted = await encrypt(plaintext);
      const decrypted = await decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe("encryptMessage and decryptMessage", () => {
    it("should encrypt and decrypt a message object", async () => {
      const message = {
        id: "123",
        role: "user" as const,
        content: "Secret message",
        timestamp: new Date(),
      };

      const encrypted = await encryptMessage(message);

      expect(encrypted.id).toBe(message.id);
      expect(encrypted.role).toBe(message.role);
      expect(encrypted.content).not.toBe(message.content);
      expect(encrypted.timestamp).toBe(message.timestamp);

      const decrypted = await decryptMessage(encrypted);

      expect(decrypted.content).toBe(message.content);
      expect(decrypted.id).toBe(message.id);
      expect(decrypted.role).toBe(message.role);
    });

    it("should preserve all message properties except content", async () => {
      const message = {
        id: "msg-1",
        role: "assistant" as const,
        content: "This is the response",
        timestamp: new Date(),
        isStreaming: false,
        modelUsed: "claude-3-opus",
        sources: [{ title: "Source 1", url: "https://example.com" }],
      };

      const encrypted = await encryptMessage(message);
      const decrypted = await decryptMessage(encrypted);

      expect(decrypted).toEqual(message);
    });
  });

  describe("key caching", () => {
    it("should reuse cached key for multiple operations", async () => {
      const text1 = "First message";
      const text2 = "Second message";

      await encrypt(text1);
      await encrypt(text2);

      // Both encryptions should have used the same cached key
      // We can't directly test this, but we can verify they both work
      const encrypted1 = await encrypt(text1);
      const decrypted1 = await decrypt(encrypted1);
      expect(decrypted1).toBe(text1);
    });

    it("should clear cached key when requested", async () => {
      await encrypt("test");
      clearCachedKey();

      // Should still work after clearing (will generate/load new key)
      const encrypted = await encrypt("test2");
      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe("test2");
    });
  });
});
