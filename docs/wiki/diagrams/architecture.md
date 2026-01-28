# Moltz Architecture Diagrams

Collection of architectural diagrams for Moltz.

---

## System Architecture

```mermaid
graph TB
    subgraph "User Layer"
        User[User]
    end
    
    subgraph "Moltz Desktop App"
        UI[React UI<br/>Components]
        Store[Zustand Store<br/>State Management]
        DB[(Dexie<br/>IndexedDB)]
        Tauri[Tauri Backend<br/>Rust]
    end
    
    subgraph "External Services"
        Gateway[Clawdbot Gateway<br/>WebSocket Server]
        AI[AI Providers<br/>Claude, GPT, etc.]
    end
    
    User --> UI
    UI <--> Store
    Store <--> DB
    UI --> Tauri
    Tauri <--> Gateway
    Gateway <--> AI
    
    style User fill:#e1f5ff
    style UI fill:#e3f2fd
    style Store fill:#fff3e0
    style DB fill:#f3e5f5
    style Tauri fill:#e8f5e9
    style Gateway fill:#fce4ec
    style AI fill:#fff9c4
```

---

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend"
        App[App.tsx]
        ChatView[ChatView]
        Sidebar[Sidebar]
        Settings[Settings]
        MessageBubble[MessageBubble]
        MarkdownRenderer[MarkdownRenderer]
    end
    
    subgraph "State"
        Zustand[Zustand Store]
        Dexie[Dexie DB]
    end
    
    subgraph "Backend"
        Gateway[gateway.rs]
        IPC[Tauri Commands]
    end
    
    App --> ChatView
    App --> Sidebar
    App --> Settings
    ChatView --> MessageBubble
    MessageBubble --> MarkdownRenderer
    
    ChatView --> Zustand
    Sidebar --> Zustand
    Zustand --> Dexie
    
    App --> IPC
    IPC --> Gateway
    
    style App fill:#bbdefb
    style Zustand fill:#fff9c4
    style Dexie fill:#f3e5f5
    style Gateway fill:#c8e6c9
```

---

## Data Flow - User Sends Message

```mermaid
sequenceDiagram
    participant User
    participant UI as ChatView
    participant Store as Zustand
    participant DB as Dexie
    participant Tauri as Rust Backend
    participant Gateway as Gateway
    
    User->>UI: Type + press Enter
    UI->>Store: addMessage(userMessage)
    Store->>DB: Save (encrypted)
    Store->>Tauri: send_message(content)
    Tauri->>Gateway: WebSocket: chat request
    
    Gateway-->>Tauri: Stream: chunk
    Tauri-->>Store: Update streaming message
    Store-->>UI: Re-render
    
    Gateway-->>Tauri: Stream: done
    Tauri-->>Store: Complete message
    Store->>DB: Save assistant message
```

---

## State Management

```mermaid
graph TB
    subgraph "Zustand Store"
        State[Global State]
        Conversations[Conversations Slice]
        Messages[Messages Slice]
        Settings[Settings Slice]
        Activities[Activities Slice]
    end
    
    subgraph "Components"
        ChatView[ChatView]
        Sidebar[Sidebar]
        SettingsDialog[Settings Dialog]
        ActivityIndicator[Activity Indicator]
    end
    
    State --> Conversations
    State --> Messages
    State --> Settings
    State --> Activities
    
    Conversations --> Sidebar
    Messages --> ChatView
    Settings --> SettingsDialog
    Activities --> ActivityIndicator
    
    style State fill:#fff9c4
    style Conversations fill:#e1bee7
    style Messages fill:#c5e1a5
    style Settings fill:#b3e5fc
    style Activities fill:#ffccbc
```

---

## Connection State Machine

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    
    Disconnected --> Connecting: connect()
    Connecting --> Connected: handshake success
    Connecting --> Error: handshake fail
    
    Connected --> Reconnecting: connection lost
    Reconnecting --> Connected: success
    Reconnecting --> Disconnected: max retries
    
    Error --> Disconnected: dismiss
    Connected --> Disconnected: disconnect()
    
    note right of Connecting
        Timeout: 30s
        TLS validation
    end note
    
    note right of Reconnecting
        Exponential backoff
        Max 10 attempts
    end note
```

---

## Message Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: User typing
    Draft --> Sending: Press Enter
    Sending --> Sent: Stored in DB
    Sent --> Streaming: Gateway responds
    Streaming --> Complete: Stream finished
    Complete --> [*]
    
    Sending --> Error: Network error
    Streaming --> Error: Connection lost
    Error --> Draft: User retry
    
    Complete --> Editing: User edits
    Editing --> Sending: Save edit
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        UI[React UI]
        Store[Zustand Store]
    end
    
    subgraph "Data Layer"
        DB[(IndexedDB<br/>Encrypted)]
        Keychain[OS Keychain<br/>Key Storage]
    end
    
    subgraph "Transport Layer"
        WS[WebSocket]
        TLS[TLS 1.2+]
    end
    
    subgraph "External"
        Gateway[Gateway]
    end
    
    UI --> Store
    Store <-->|AES-256-GCM| DB
    Store <-->|Read key| Keychain
    Store --> WS
    WS --> TLS
    TLS --> Gateway
    
    style DB fill:#f3e5f5
    style Keychain fill:#e8f5e9
    style TLS fill:#ffccbc
    style Gateway fill:#fce4ec
```

---

## Performance Optimization: Message Virtualization

```mermaid
graph LR
    subgraph "Without Virtualization"
        M1[Message 1]
        M2[Message 2]
        Mdot1[...]
        M1000[Message 1000]
    end
    
    subgraph "With Virtualization"
        Viewport[Viewport]
        V1[Visible 1]
        V2[Visible 2]
        Vdot[...]
        V10[Visible 10]
    end
    
    M1 -.-> Render1[Render ALL<br/>1000 nodes]
    M2 -.-> Render1
    Mdot1 -.-> Render1
    M1000 -.-> Render1
    
    Viewport --> V1
    Viewport --> V2
    Viewport --> Vdot
    Viewport --> V10
    V1 -.-> Render2[Render ONLY<br/>10-15 nodes]
    
    style Render1 fill:#ffcdd2
    style Render2 fill:#c8e6c9
```

---

## Deployment Architecture (Future Team Mode)

```mermaid
graph TB
    subgraph "Client"
        App1[Moltz App<br/>User 1]
        App2[Moltz App<br/>User 2]
        AppN[Moltz App<br/>User N]
    end
    
    subgraph "Moltz Backend"
        Proxy[WebSocket Proxy]
        Auth[Auth Service]
        RBAC[RBAC Engine]
        Audit[Audit Logger]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Redis[(Redis<br/>PubSub)]
        S3[(S3<br/>Attachments)]
    end
    
    subgraph "Gateway"
        GW[Clawdbot Gateway]
    end
    
    App1 <--> Proxy
    App2 <--> Proxy
    AppN <--> Proxy
    
    Proxy --> Auth
    Proxy --> RBAC
    Proxy --> Audit
    Proxy <--> DB
    Proxy <--> Redis
    Proxy <--> S3
    Proxy <--> GW
    
    style Proxy fill:#ffccbc
    style DB fill:#c5e1a5
    style Redis fill:#b3e5fc
    style Audit fill:#fff9c4
```

---

**See also:** [Architecture.md](../Architecture.md) for detailed explanations
