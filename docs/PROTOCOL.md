# OpenClaw Gateway Protocol

This document describes the WebSocket protocol used by Moltz to communicate with the OpenClaw Gateway.

## Table of Contents

- [Connection](#connection)
- [Message Format](#message-format)
- [Client ? Gateway Messages](#client--gateway-messages)
- [Gateway ? Client Messages](#gateway--client-messages)
- [Error Handling](#error-handling)
- [Streaming Responses](#streaming-responses)
- [Authentication](#authentication)
- [Reconnection Strategy](#reconnection-strategy)

---

## Connection

### Endpoint

The Gateway listens for WebSocket connections on:
- **Development:** `ws://localhost:18789`
- **Production:** `wss://gateway.yourdomain.com`

### Handshake

1. Client initiates WebSocket connection
2. Gateway accepts and sends welcome message (optional)
3. Client sends authentication if required
4. Connection ready for bidirectional communication

**Example:**
```javascript
const ws = new WebSocket('ws://localhost:18789');

ws.onopen = () => {
  console.log('Connected to Gateway');
  // Optionally send auth token
  if (authToken) {
    ws.send(JSON.stringify({
      type: 'auth',
      token: authToken
    }));
  }
};
```

---

## Message Format

All messages are **JSON-encoded** with the following structure:

```typescript
interface Message {
  type: string;          // Message type identifier
  id?: string;           // Optional correlation ID
  timestamp?: number;    // Unix timestamp (ms)
  payload?: any;         // Type-specific data
}
```

### Design Principles

- **Type safety:** Every message has a `type` field
- **Idempotency:** Use `id` for request/response matching
- **Extensibility:** `payload` allows flexible data structures
- **Timestamps:** Help with ordering and debugging

---

## Client ? Gateway Messages

### 1. Send Message

Send a chat message to an AI model.

```json
{
  "type": "chat.send",
  "id": "msg_12345",
  "payload": {
    "conversationId": "conv_abc",
    "content": "Hello, Claude!",
    "model": "claude-sonnet-4",
    "thinking": false,
    "temperature": 0.7,
    "maxTokens": 4096
  }
}
```

**Fields:**
- `conversationId` (string): Unique conversation identifier
- `content` (string): User message text
- `model` (string, optional): Model to use (defaults to user's default)
- `thinking` (boolean, optional): Enable extended reasoning mode
- `temperature` (number, optional): Sampling temperature (0-1)
- `maxTokens` (number, optional): Max response length

**Response:** Stream of `chat.chunk` messages (see below)

### 2. List Models

Request available AI models.

```json
{
  "type": "models.list",
  "id": "req_67890"
}
```

**Response:**
```json
{
  "type": "models.list.response",
  "id": "req_67890",
  "payload": {
    "models": [
      {
        "id": "claude-sonnet-4",
        "name": "Claude Sonnet 4",
        "provider": "anthropic",
        "contextWindow": 200000,
        "supportsThinking": true
      },
      {
        "id": "gpt-4-turbo",
        "name": "GPT-4 Turbo",
        "provider": "openai",
        "contextWindow": 128000,
        "supportsThinking": false
      }
    ]
  }
}
```

### 3. Cancel Request

Cancel an in-progress request.

```json
{
  "type": "chat.cancel",
  "id": "msg_12345"
}
```

**Response:**
```json
{
  "type": "chat.cancelled",
  "id": "msg_12345"
}
```

### 4. Ping

Health check / keepalive.

```json
{
  "type": "ping",
  "timestamp": 1705334400000
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": 1705334400050
}
```

---

## Gateway ? Client Messages

### 1. Chat Response Chunk (Streaming)

The Gateway sends multiple chunks as the AI generates a response.

```json
{
  "type": "chat.chunk",
  "id": "msg_12345",
  "payload": {
    "delta": "Hello! I'm Claude",
    "index": 0,
    "role": "assistant"
  }
}
```

**Fields:**
- `delta` (string): Incremental text to append
- `index` (number): Chunk sequence number
- `role` (string): Message role ('assistant', 'thinking', etc.)

**Complete message assembly:**
```typescript
let fullMessage = '';
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'chat.chunk' && msg.id === requestId) {
    fullMessage += msg.payload.delta;
    // Update UI with partial response
  }
};
```

### 2. Chat Complete

Indicates the response stream has ended.

```json
{
  "type": "chat.complete",
  "id": "msg_12345",
  "payload": {
    "model": "claude-sonnet-4",
    "tokensUsed": 512,
    "finishReason": "end_turn"
  }
}
```

**Finish reasons:**
- `end_turn`: Normal completion
- `max_tokens`: Hit token limit
- `stop_sequence`: Hit stop sequence
- `cancelled`: Cancelled by user
- `error`: Error occurred

### 3. Error

Error response for any request.

```json
{
  "type": "error",
  "id": "msg_12345",
  "payload": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

**Common error codes:**
- `auth_required`: Authentication token needed
- `auth_invalid`: Invalid token
- `rate_limit_exceeded`: Too many requests
- `model_not_found`: Requested model unavailable
- `invalid_request`: Malformed request
- `internal_error`: Server error

### 4. System Events

Gateway status updates.

```json
{
  "type": "system.status",
  "payload": {
    "status": "healthy",
    "version": "2.1.0",
    "uptime": 86400
  }
}
```

---

## Error Handling

### Client-Side Error Handling

```typescript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Show connection error to user
  showNotification('Connection error. Retrying...');
};

ws.onclose = (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
  
  if (event.code === 1000) {
    // Normal closure
    console.log('Connection closed normally');
  } else if (event.code === 1006) {
    // Abnormal closure (network issue)
    attemptReconnect();
  }
};
```

### Gateway Error Responses

The Gateway will send an `error` message and **keep the connection open** for most errors:

```json
{
  "type": "error",
  "id": "msg_12345",
  "payload": {
    "code": "invalid_request",
    "message": "Field 'content' is required",
    "field": "content"
  }
}
```

For authentication errors, the Gateway will close the connection with code `4401`.

---

## Streaming Responses

### How Streaming Works

1. Client sends `chat.send` message
2. Gateway immediately acknowledges (optional)
3. Gateway streams `chat.chunk` messages as AI generates text
4. Gateway sends `chat.complete` when done
5. Client assembles full message from chunks

**Timing example:**
```
T+0ms:   Client sends chat.send
T+10ms:  Gateway responds chat.acknowledged
T+50ms:  Gateway sends chat.chunk (delta: "Hello")
T+100ms: Gateway sends chat.chunk (delta: " there")
T+150ms: Gateway sends chat.chunk (delta: "!")
T+200ms: Gateway sends chat.complete
```

### Handling Out-of-Order Chunks

Use the `index` field to ensure correct ordering:

```typescript
const chunks: Map<number, string> = new Map();
let nextExpectedIndex = 0;

function handleChunk(chunk: ChatChunk) {
  chunks.set(chunk.payload.index, chunk.payload.delta);
  
  // Process in order
  while (chunks.has(nextExpectedIndex)) {
    const delta = chunks.get(nextExpectedIndex)!;
    appendToUI(delta);
    chunks.delete(nextExpectedIndex);
    nextExpectedIndex++;
  }
}
```

### Thinking Mode

When `thinking: true`, the Gateway sends two types of chunks:

```json
{
  "type": "chat.chunk",
  "id": "msg_12345",
  "payload": {
    "delta": "Let me analyze this...",
    "index": 0,
    "role": "thinking"
  }
}
```

```json
{
  "type": "chat.chunk",
  "id": "msg_12345",
  "payload": {
    "delta": "Based on my analysis...",
    "index": 10,
    "role": "assistant"
  }
}
```

The client should separate `thinking` content from the main `assistant` response.

---

## Authentication

### Token-Based Auth

If the Gateway requires authentication, send a token on connection:

```json
{
  "type": "auth",
  "payload": {
    "token": "your-secret-token-here"
  }
}
```

**Response (success):**
```json
{
  "type": "auth.success",
  "payload": {
    "userId": "user_123",
    "expiresAt": 1705420800000
  }
}
```

**Response (failure):**
```json
{
  "type": "error",
  "payload": {
    "code": "auth_invalid",
    "message": "Invalid token"
  }
}
```

The connection will be closed with code `4401` if auth fails.

### Where to Get Tokens

Check your Gateway configuration:
```bash
OpenClaw gateway status
# Shows auth token if required
```

Or look in `~/.config/OpenClaw/OpenClaw.json`:
```json
{
  "gateway": {
    "auth": {
      "enabled": true,
      "token": "your-secret-token"
    }
  }
}
```

---

## Reconnection Strategy

### Exponential Backoff

When connection drops, use exponential backoff to avoid overwhelming the Gateway:

```typescript
let reconnectDelay = 1000; // Start at 1 second
const maxDelay = 30000;    // Cap at 30 seconds

function attemptReconnect() {
  console.log(`Reconnecting in ${reconnectDelay}ms...`);
  
  setTimeout(() => {
    connect();
    reconnectDelay = Math.min(reconnectDelay * 2, maxDelay);
  }, reconnectDelay);
}

function connect() {
  const ws = new WebSocket(gatewayUrl);
  
  ws.onopen = () => {
    console.log('Reconnected!');
    reconnectDelay = 1000; // Reset delay on success
  };
  
  ws.onerror = attemptReconnect;
}
```

### Connection States

Track connection state to update UI:

```typescript
type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';
```

Show appropriate UI for each state:
- **disconnected:** "Not connected. Click to connect"
- **connecting:** "Connecting..." (spinner)
- **connected:** Normal chat interface
- **reconnecting:** "Connection lost. Reconnecting..." (auto-retry)
- **error:** "Connection failed. Retry?" (manual retry)

---

## WebSocket Close Codes

Standard close codes used by the Gateway:

| Code | Meaning | Client Action |
|------|---------|---------------|
| 1000 | Normal closure | Don't reconnect |
| 1001 | Going away | Reconnect after delay |
| 1006 | Abnormal closure | Reconnect immediately |
| 4000 | Gateway error | Reconnect after delay |
| 4401 | Unauthorized | Prompt for new token |
| 4429 | Rate limited | Wait before reconnecting |

---

## Example Implementation

### Complete Client Example

```typescript
class GatewayClient {
  private ws: WebSocket | null = null;
  private reconnectDelay = 1000;
  private pendingRequests = new Map<string, (data: any) => void>();
  
  constructor(private url: string, private token?: string) {}
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('Connected to Gateway');
        this.reconnectDelay = 1000;
        
        if (this.token) {
          this.send({ type: 'auth', payload: { token: this.token } });
        }
        
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code);
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };
    });
  }
  
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket not connected');
    }
  }
  
  async sendMessage(
    conversationId: string,
    content: string,
    options?: { model?: string; thinking?: boolean }
  ): Promise<string> {
    const id = `msg_${Date.now()}`;
    
    this.send({
      type: 'chat.send',
      id,
      payload: {
        conversationId,
        content,
        ...options
      }
    });
    
    return new Promise((resolve) => {
      let fullResponse = '';
      
      this.pendingRequests.set(id, (message) => {
        if (message.type === 'chat.chunk') {
          fullResponse += message.payload.delta;
        } else if (message.type === 'chat.complete') {
          this.pendingRequests.delete(id);
          resolve(fullResponse);
        }
      });
    });
  }
  
  private handleMessage(message: any): void {
    const handler = this.pendingRequests.get(message.id);
    if (handler) {
      handler(message);
    }
  }
  
  private attemptReconnect(): void {
    setTimeout(() => {
      console.log('Attempting reconnect...');
      this.connect().catch(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        this.attemptReconnect();
      });
    }, this.reconnectDelay);
  }
  
  disconnect(): void {
    this.ws?.close(1000, 'Client disconnecting');
  }
}
```

**Usage:**
```typescript
const client = new GatewayClient('ws://localhost:18789', 'my-token');
await client.connect();

const response = await client.sendMessage(
  'conv_123',
  'Hello, Claude!',
  { model: 'claude-sonnet-4', thinking: false }
);

console.log('Response:', response);
```

---

## Protocol Versioning

The protocol follows semantic versioning:
- **Major version:** Breaking changes (incompatible)
- **Minor version:** New features (backward compatible)
- **Patch version:** Bug fixes

Current version: **2.0.0**

Clients should check the Gateway version on connect:
```json
{
  "type": "system.version",
  "payload": {
    "protocol": "2.0.0",
    "gateway": "2.1.5"
  }
}
```

---

## References

- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [RFC 6455: WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [OpenClaw Gateway Documentation](https://github.com/OpenClaw/OpenClaw)

---

**Last Updated:** 2024-01-15  
**Protocol Version:** 2.0.0
