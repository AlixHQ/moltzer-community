import { describe, it, expect } from "vitest";

/**
 * URL validation and parsing tests
 * Tests common URL validation scenarios for Gateway URLs and other URLs
 */

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidWebSocketUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "ws:" || parsed.protocol === "wss:";
  } catch {
    return false;
  }
}

function parseGatewayUrl(
  url: string,
): { host: string; port: number; protocol: string } | null {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || (parsed.protocol === "wss:" ? 443 : 80),
      protocol: parsed.protocol.replace(":", ""),
    };
  } catch {
    return null;
  }
}

describe("URL Utilities", () => {
  describe("isValidUrl", () => {
    it("should validate HTTP URLs", () => {
      expect(isValidUrl("http://localhost:8080")).toBe(true);
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("https://api.example.com/v1")).toBe(true);
    });

    it("should validate WebSocket URLs", () => {
      expect(isValidUrl("ws://localhost:18789")).toBe(true);
      expect(isValidUrl("wss://gateway.example.com")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isValidUrl("not a url")).toBe(false);
      expect(isValidUrl("ftp://invalid")).toBe(true); // FTP is still valid URL format
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl("http://")).toBe(false);
    });

    it("should handle URLs with ports", () => {
      expect(isValidUrl("http://localhost:3000")).toBe(true);
      expect(isValidUrl("ws://127.0.0.1:18789")).toBe(true);
    });

    it("should handle URLs with paths", () => {
      expect(isValidUrl("https://example.com/api/v1/users")).toBe(true);
      expect(isValidUrl("http://localhost:8080/websocket")).toBe(true);
    });

    it("should handle URLs with query parameters", () => {
      expect(isValidUrl("https://example.com?foo=bar&baz=qux")).toBe(true);
    });
  });

  describe("isValidWebSocketUrl", () => {
    it("should accept WebSocket URLs", () => {
      expect(isValidWebSocketUrl("ws://localhost:18789")).toBe(true);
      expect(isValidWebSocketUrl("wss://gateway.example.com")).toBe(true);
    });

    it("should reject non-WebSocket URLs", () => {
      expect(isValidWebSocketUrl("http://localhost:8080")).toBe(false);
      expect(isValidWebSocketUrl("https://example.com")).toBe(false);
      expect(isValidWebSocketUrl("ftp://example.com")).toBe(false);
    });

    it("should reject invalid URLs", () => {
      expect(isValidWebSocketUrl("not a url")).toBe(false);
      expect(isValidWebSocketUrl("")).toBe(false);
    });
  });

  describe("parseGatewayUrl", () => {
    it("should parse WebSocket URLs correctly", () => {
      const result = parseGatewayUrl("ws://localhost:18789");
      expect(result).toEqual({
        host: "localhost",
        port: 18789,
        protocol: "ws",
      });
    });

    it("should parse secure WebSocket URLs", () => {
      const result = parseGatewayUrl("wss://gateway.example.com:8443");
      expect(result).toEqual({
        host: "gateway.example.com",
        port: 8443,
        protocol: "wss",
      });
    });

    it("should use default ports when not specified", () => {
      const result = parseGatewayUrl("ws://localhost");
      expect(result).toEqual({
        host: "localhost",
        port: 80,
        protocol: "ws",
      });

      const secureResult = parseGatewayUrl("wss://gateway.example.com");
      expect(secureResult).toEqual({
        host: "gateway.example.com",
        port: 443,
        protocol: "wss",
      });
    });

    it("should handle IP addresses", () => {
      const result = parseGatewayUrl("ws://127.0.0.1:18789");
      expect(result).toEqual({
        host: "127.0.0.1",
        port: 18789,
        protocol: "ws",
      });
    });

    it("should return null for invalid URLs", () => {
      expect(parseGatewayUrl("not a url")).toBeNull();
      expect(parseGatewayUrl("")).toBeNull();
      expect(parseGatewayUrl("http://")).toBeNull();
    });

    it("should handle URLs with paths (ignoring the path)", () => {
      const result = parseGatewayUrl("ws://localhost:18789/websocket");
      expect(result?.host).toBe("localhost");
      expect(result?.port).toBe(18789);
    });
  });

  describe("Gateway URL validation scenarios", () => {
    it("should validate common Gateway URL patterns", () => {
      const validGatewayUrls = [
        "ws://localhost:18789",
        "ws://127.0.0.1:18789",
        "wss://gateway.example.com",
        "wss://moltzer.example.com:8443",
      ];

      validGatewayUrls.forEach((url) => {
        expect(isValidWebSocketUrl(url)).toBe(true);
        expect(parseGatewayUrl(url)).not.toBeNull();
      });
    });

    it("should reject invalid Gateway URL patterns", () => {
      const invalidGatewayUrls = [
        "http://localhost:18789", // HTTP instead of WS
        "localhost:18789", // Missing protocol
        "ws://", // Incomplete
        "", // Empty
        "gateway.example.com", // Missing protocol
      ];

      invalidGatewayUrls.forEach((url) => {
        expect(isValidWebSocketUrl(url)).toBe(false);
      });
    });
  });
});
