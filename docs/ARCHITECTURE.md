# Moltz Architecture

This document provides a comprehensive overview of Moltz's system architecture, design decisions, and technical implementation.

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [Architecture Layers](#architecture-layers)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Storage & Persistence](#storage--persistence)
- [Security Architecture](#security-architecture)
- [Performance Optimizations](#performance-optimizations)
- [Platform Integration](#platform-integration)

---

## High-Level Overview

Moltz is a **native desktop application** built with Tauri v2, combining:
- **Frontend:** React 18 + TypeScript for the UI
- **Backend:** Rust for native capabilities and WebSocket communication
- **Storage:** IndexedDB for local data persistence
- **Security:** End-to-end encryption with OS keychain integration

```
+-----------------------------------------+
¦         Moltz Desktop App             ¦
+-----------------------------------------¦
¦  React UI (TypeScript)                  ¦
¦  +- Components (ChatView, Sidebar...)   ¦
¦  +- State (Zustand stores)              ¦
¦  +- Storage (IndexedDB via Dexie)       ¦
+-----------------------------------------¦
¦  Tauri Bridge (IPC)                     ¦
+-----------------------------------------¦
¦  Rust Backend                           ¦
¦  +- WebSocket Client (Gateway comms)    ¦
¦  +- Keychain (OS credential storage)    ¦
¦  +- System Integration (notifications)  ¦
+-----------------------------------------+
         ? WebSocket (ws:// or wss://)
+-----------------------------------------+
¦      OpenClaw Gateway                   ¦
¦      (AI Model Orchestration)           ¦
+-----------------------------------------+
```

---

## Architecture Layers

### 1. Presentation Layer (React)

**Location:** `src/components/`

The presentation layer handles all UI rendering and user interactions:

- **Components:** Reusable UI building blocks (buttons, dialogs, message bubbles)
- **Views:** Page-level components (ChatView, WelcomeView, SettingsDialog)
- **Hooks:** Custom React hooks for shared logic (useMessages, useGateway)
- **Styling:** Tailwind CSS with custom design tokens

**Key characteristics:**
- Pure functional components with TypeScript
- No direct network or storage access (uses stores)
- Declarative UI based on global state
- Optimized with React.memo for expensive renders

### 2. State Management Layer (Zustand)

**Location:** `src/stores/store.ts`

Zustand provides a lightweight global state solution:

```typescript
interface MoltStore {
  // Gateway connection
  gatewayUrl: string;
  isConnected: boolean;
  
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Record<string, Message[]>;
  
  // UI state
  sidebarVisible: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  createConversation: () => void;
  deleteConversation: (id: string) => Promise<void>;
  // ...
}
```

**Why Zustand?**
- Minimal boilerplate vs Redux
- No Context API re-render issues
- Easy to test and debug
- TypeScript-first design

### 3. Persistence Layer (IndexedDB)

**Location:** `src/lib/db.ts`, `src/lib/persistence.ts`

IndexedDB (via Dexie) provides unlimited local storage:

**Schema:**
```typescript
// Conversations table
{
  id: string (primary key)
  title: string
  createdAt: Date
  updatedAt: Date (indexed)
  model?: string
  thinkingEnabled: boolean
  isPinned: boolean (indexed)
}

// Messages table
{
  id: string (primary key)
  conversationId: string (indexed)
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date (indexed)
  modelUsed?: string
  thinkingContent?: string
  searchWords: string[] (multi-entry index)
}

// Settings table
{
  key: string (primary key)
  value: string
}
```

**Features:**
- Full-text search via multi-entry indexes
- Transaction support for data consistency
- Automatic synchronization with Zustand store
- Optimistic updates with rollback on failure

### 4. Communication Layer (Tauri + Rust)

**Location:** `src-tauri/src/`

The Rust backend handles native capabilities:

**Gateway Connection (`gateway.rs`):**
- WebSocket client using `tokio-tungstenite`
- Automatic reconnection with exponential backoff
- JSON message parsing and routing
- Streaming response handling

**Keychain Integration (`keychain.rs`):**
- Cross-platform credential storage via `keyring-rs`
- Stores encryption master key securely
- Fallback to file-based storage if keychain unavailable

**System Integration (`lib.rs`):**
- Native notifications
- Window management
- File system access (for exports)
- Deep linking (future)

---

## Data Flow

### Sending a Message

```
User types message ? ChatInput component
         ?
Updates Zustand store (optimistic update)
         ?
Encrypts message content (Web Crypto API)
         ?
Saves to IndexedDB
         ?
Sends to Rust via Tauri IPC
         ?
Rust sends WebSocket message to Gateway
         ?
Gateway streams response back
         ?
Rust forwards chunks to React via events
         ?
React updates Zustand store in real-time
         ?
UI re-renders with streaming message
         ?
Final message saved to IndexedDB
```

### Loading Conversations on Startup

```
App launches ? useEffect in App.tsx
         ?
Calls loadConversationsFromDB()
         ?
IndexedDB query (all conversations sorted)
         ?
Decrypt conversation data
         ?
Populate Zustand store
         ?
React re-renders with conversation list
         ?
Background: Check for Gateway connection
```

---

## Component Architecture

### Core Components

**App.tsx**
- Root component
- Handles app-level initialization
- Manages Gateway connection lifecycle
- Provides global context (theme, etc.)

**ChatView.tsx**
- Main chat interface
- Message list with virtualization
- Handles scrolling and auto-scroll behavior
- Renders streaming messages in real-time

**Sidebar.tsx**
- Conversation list
- Search and filter functionality
- Pin/unpin conversations
- Delete with confirmation

**MessageBubble.tsx**
- Individual message rendering
- Markdown parsing with syntax highlighting
- Copy button, timestamp, model badge
- Thinking content accordion

**ChatInput.tsx**
- Message composition area
- Auto-resizing textarea
- Keyboard shortcuts (Enter, Shift+Enter)
- Attachment button (future)

**SettingsDialog.tsx**
- Gateway URL configuration
- Theme selection
- Model preferences
- Encryption key management

### UI Primitives

**Location:** `src/components/ui/`

Reusable, unstyled components based on Radix UI:
- Button, Dialog, DropdownMenu
- ScrollArea, Separator, Switch
- Tooltip

These provide:
- Accessibility (ARIA attributes)
- Keyboard navigation
- Focus management
- Unstyled base (styled with Tailwind)

---

## State Management

### Store Structure

```typescript
// Global state split into logical domains
{
  // Connection state
  gateway: {
    url: string;
    token: string | null;
    isConnected: boolean;
    availableModels: string[];
  },
  
  // Data
  conversations: Conversation[];
  messages: Record<conversationId, Message[]>;
  
  // UI state
  ui: {
    sidebarVisible: boolean;
    theme: Theme;
    currentConversationId: string | null;
  },
  
  // Settings
  settings: {
    defaultModel: string;
    thinkingEnabled: boolean;
    fontSize: 'small' | 'medium' | 'large';
  }
}
```

### State Updates

**Optimistic Updates:**
```typescript
// Immediately update UI, then sync to DB/Gateway
sendMessage: async (content: string) => {
  const tempMessage = createTempMessage(content);
  
  // 1. Update UI immediately
  set(state => ({
    messages: {
      ...state.messages,
      [currentId]: [...state.messages[currentId], tempMessage]
    }
  }));
  
  // 2. Save to DB
  await db.messages.add(tempMessage);
  
  // 3. Send to Gateway (response updates state later)
  await gateway.send({ content });
}
```

**Event-Driven Updates:**
```typescript
// Gateway responses update state via events
gateway.on('message', (chunk) => {
  set(state => {
    const messages = state.messages[conversationId];
    const lastMessage = messages[messages.length - 1];
    
    // Append to streaming message
    return {
      messages: {
        ...state.messages,
        [conversationId]: [
          ...messages.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + chunk }
        ]
      }
    };
  });
});
```

---

## Storage & Persistence

### Encryption Strategy

**Master Key:**
- Generated on first run using `crypto.subtle.generateKey()`
- 256-bit AES-GCM key
- Stored in OS keychain via Rust backend
- Never leaves the device

**Message Encryption:**
```typescript
// Encrypt before saving to IndexedDB
async function encryptMessage(content: string): Promise<string> {
  const masterKey = await getMasterKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    masterKey,
    new TextEncoder().encode(content)
  );
  
  return `${arrayBufferToBase64(iv)}:${arrayBufferToBase64(encrypted)}`;
}
```

**Why encrypt locally?**
- Defense in depth (even if disk is compromised)
- Compliance with data protection regulations
- User trust and privacy

### Database Optimization

**Indexes:**
- `conversationId` on messages for fast filtering
- `updatedAt` on conversations for sorting
- `isPinned` for quick access to pinned conversations
- `searchWords` (multi-entry) for full-text search

**Transactions:**
```typescript
// Atomic operations for data consistency
await db.transaction('rw', db.conversations, db.messages, async () => {
  await db.conversations.put(conversation);
  await db.messages.bulkPut(messages);
});
```

**Cleanup:**
- No automatic deletion (user controls their data)
- Manual cleanup via Settings ? Advanced
- Future: Automatic archival of old conversations

---

## Security Architecture

### Threat Model

**Protected against:**
- ? Local disk access (encrypted data at rest)
- ? Network sniffing (wss:// encryption)
- ? Memory dumps (master key in OS keychain)
- ? XSS attacks (Content Security Policy)

**Not protected against:**
- ? Malware with root access
- ? Compromised OS keychain
- ? Physical access to unlocked device

### Content Security Policy

```json
{
  "default-src": "'self'",
  "connect-src": ["'self'", "ws://localhost:*", "wss://*"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"]
}
```

### Input Sanitization

- Markdown rendered with `rehype-sanitize`
- No inline JavaScript allowed
- XSS-safe HTML generation

---

## Performance Optimizations

### React Optimizations

**Memoization:**
```typescript
// Prevent unnecessary re-renders
const MessageBubble = React.memo(({ message }) => {
  // ...
});
```

**Virtualization:**
- Message list uses virtual scrolling (future)
- Only render visible messages
- Reduces DOM nodes from 1000s to ~20

**Code Splitting:**
```typescript
// Lazy load heavy components
const SettingsDialog = lazy(() => import('./SettingsDialog'));
```

### IndexedDB Optimizations

- Bulk operations for batch inserts
- Compound indexes for common queries
- Cursor-based pagination for large result sets

### Tauri Optimizations

- Small binary size (~10MB vs 300MB Electron)
- Uses system webview (no bundled Chromium)
- Rust async runtime for efficient I/O

---

## Platform Integration

### macOS
- Native menu bar
- Keychain for credential storage
- App sandboxing for security
- Retina display support

### Windows
- Credential Manager integration
- WebView2 for rendering
- Windows notifications
- Installer via WiX

### Linux
- Secret Service API for credentials
- WebKitGTK for rendering
- .AppImage for easy distribution
- System tray integration

---

## Future Architecture Improvements

### Planned Enhancements

1. **Sync Service:**
   - Optional cloud sync for conversations
   - End-to-end encrypted
   - Conflict resolution

2. **Plugin System:**
   - JavaScript/WASM plugins
   - Custom UI components
   - Extended functionality

3. **Mobile Support:**
   - Tauri v2 iOS/Android support
   - Shared core logic with desktop
   - Platform-specific UI

4. **Offline Mode:**
   - Local AI models via ONNX
   - Queue messages for later sync
   - Smart caching

---

## References

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [Dexie.js Guide](https://dexie.org/docs/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OpenClaw Gateway Protocol](./PROTOCOL.md)

---

**Last Updated:** 2024-01-15  
**Architecture Version:** 1.0
