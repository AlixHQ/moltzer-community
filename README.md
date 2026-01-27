# Molt Client

A native cross-platform client for [Moltbot](https://github.com/moltbot/moltbot) — ChatGPT-style interface for your personal AI assistant.

Built with **Tauri** for lightweight, native performance on macOS, Windows, and Linux.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)
![Tauri](https://img.shields.io/badge/tauri-v2-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🚀 **Lightweight** — ~10MB binary (not Electron!)
- 🎨 **Native feel** — Uses system webview, respects OS conventions
- 💬 **Streaming responses** — See AI responses as they're generated
- 📎 **File attachments** — Upload images, PDFs, and documents
- 🎤 **Voice messages** — Record and send audio
- 🧠 **Thinking mode** — Enable extended reasoning for complex tasks
- 🌙 **Dark/Light mode** — Auto-follows system appearance
- 📚 **Large history** — Local storage handles unlimited conversations
- ⚡ **Model picker** — Choose from available AI models
- 📋 **Code highlighting** — Syntax-colored code blocks with copy button
- 📌 **Pinned chats** — Keep important conversations at the top
- 🔒 **Privacy first** — Your data stays on your device

## Screenshots

*Coming soon*

## Requirements

### Runtime
- macOS 10.15+ / Windows 10+ / Linux (with WebKit2GTK)
- Running [Moltbot Gateway](https://docs.clawd.bot/gateway)

### Development
- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) 18+
- Platform-specific dependencies (see below)

#### macOS
```bash
xcode-select --install
```

#### Windows
```bash
# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools
```

#### Linux (Debian/Ubuntu)
```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

## Installation

### From Releases

Download the latest release for your platform from the [Releases](https://github.com/dokterdok/molt-client/releases) page.

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/dokterdok/molt-client.git
   cd molt-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

4. Build for production:
   ```bash
   npm run tauri build
   ```

## Configuration

On first launch, configure your Moltbot Gateway connection:

1. Open Settings (gear icon)
2. Enter your Gateway URL (default: `ws://localhost:18789`)
3. Enter your auth token (from `clawdbot.json`)

## Architecture

```
molt-client/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── ChatView.tsx    # Main chat interface
│   │   ├── Sidebar.tsx     # Conversation list
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   ├── stores/             # Zustand state management
│   ├── hooks/              # React hooks
│   └── lib/                # Utilities
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs          # App entry point
│   │   └── gateway.rs      # WebSocket client
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
└── package.json            # Node dependencies
```

## Tech Stack

- **[Tauri v2](https://v2.tauri.app/)** — Rust-based app framework
- **[React 18](https://react.dev/)** — UI framework
- **[TypeScript](https://www.typescriptlang.org/)** — Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** — Styling
- **[Zustand](https://zustand-demo.pmnd.rs/)** — State management
- **[Vite](https://vitejs.dev/)** — Build tool

## Development

### Commands

```bash
# Start dev server
npm run tauri dev

# Build production binary
npm run tauri build

# Lint
npm run lint

# Format
npm run format

# Run tests
npm test
```

### Project Setup

The frontend is a standard Vite + React + TypeScript setup. The backend is Rust with Tauri.

Key files:
- `src-tauri/src/gateway.rs` — WebSocket connection to Moltbot Gateway
- `src/stores/store.ts` — Application state (conversations, messages, settings)
- `src/components/` — React components

## Roadmap

- [ ] Voice recording and playback
- [ ] Image generation display
- [ ] Markdown table rendering
- [ ] Search within conversations
- [ ] Export conversations
- [ ] Keyboard shortcuts
- [ ] System tray (macOS/Windows/Linux)
- [ ] iOS/Android support (Tauri v2 mobile)
- [ ] GitHub Actions CI/CD

## Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Moltbot](https://github.com/moltbot/moltbot) — The AI gateway this client connects to
- [Tauri](https://tauri.app/) — Making native apps lightweight again
- The open source community

---

Made with 🦞 by the Moltbot community
