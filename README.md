<div align="center">

# Moltzer

### Your AI, your Mac, your rules.

**A beautiful, private AI chat app that lives in your menu bar.**

[**Download for Mac**](https://github.com/AlixHQ/moltzer-community/releases) ·
[Windows](https://github.com/AlixHQ/moltzer-community/releases) ·
[Linux](https://github.com/AlixHQ/moltzer-community/releases)

</div>

---

## Why Moltzer?

**Cmd+Shift+Space** — Ask anything, from anywhere. Moltzer lives in your menu bar, ready when you need it.

| ChatGPT/Claude.ai | Moltzer |
|-------------------|---------|
| Browser tab you lose | Native app that's always there |
| Your data on their servers | Everything stays on your Mac |
| Generic web interface | Feels like a real Mac app |
| No offline access | Read old chats anytime |

### What makes it different

- **Global hotkey** — Cmd+Shift+Space opens Quick Ask from anywhere
- **Private by default** — Conversations stored locally, encrypted
- **Actually fast** — Native app, not a browser in disguise
- **Mac-native** — Proper menus, shortcuts, menu bar icon
- **Any AI model** — Claude, GPT, Gemini, local models via Moltbot Gateway

---

## Get Started

### Step 1: Install Moltbot Gateway

Moltzer connects to [Moltbot](https://github.com/moltbot/moltbot), the open-source AI gateway.

**Install Moltbot:**
```bash
npm install -g moltbot
moltbot setup
```

See the [official Moltbot installation guide](https://github.com/moltbot/moltbot#installation) for full instructions.

### Step 2: Download Moltzer

Download the latest release for your platform:

- [Mac (Apple Silicon)](https://github.com/AlixHQ/moltzer-community/releases)
- [Mac (Intel)](https://github.com/AlixHQ/moltzer-community/releases)
- [Windows](https://github.com/AlixHQ/moltzer-community/releases)
- [Linux](https://github.com/AlixHQ/moltzer-community/releases)

### Step 3: Connect

1. Launch Moltzer
2. Enter your Gateway URL (default: `ws://localhost:18789`)
3. Start chatting!

---

## Features

### Performance
- **Lightning fast** — Native binary with zero bloat
- **Streaming responses** — See AI responses as they're generated
- **Instant search** — Full-text search across all conversations
- **Smart caching** — Local storage for instant conversation loading

### Conversations
- **Unlimited chat history** — All conversations stored locally with encryption
- **Pin important chats** — Keep your most-used conversations at the top
- **Auto-generated titles** — First message becomes the conversation title
- **Rich markdown** — Code blocks, syntax highlighting, tables, lists

### Security & Privacy
- **End-to-end encryption** — AES-GCM 256-bit encryption at rest
- **OS keychain integration** — Keys stored in macOS Keychain / Windows Credential Manager
- **Zero cloud storage** — Your data never leaves your device
- **Secure WebSocket** — Automatic wss:// for secure connections

### Native Experience
- **Global hotkey** — Cmd+Shift+Space (Mac) / Ctrl+Shift+Space (Windows)
- **System tray icon** — Always accessible from menu bar
- **Native menus** — Full Mac/Windows menu bar with standard shortcuts
- **Spring animations** — Messages pop in with physics-based animations

---

## Keyboard Shortcuts

### Global (System-wide)
| Shortcut | Action |
|----------|--------|
| Cmd+Shift+Space | Quick Ask (works from anywhere) |

### In App
| Shortcut | Action |
|----------|--------|
| Cmd+N | New conversation |
| Cmd+K | Search messages |
| Cmd+, | Open settings |
| Cmd+W | Close conversation |
| Cmd+\\ | Toggle sidebar |

---

## Building from Source

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Platform-specific dependencies (see [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

### Build
```bash
git clone https://github.com/AlixHQ/moltzer-community.git
cd moltzer-community
npm install
npm run tauri build
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Apache 2.0 — see [LICENSE](./LICENSE)
