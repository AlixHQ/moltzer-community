# Getting Started with Moltzer

Get Moltzer up and chatting in about 5 minutes. Here's exactly what you need.

---

## Prerequisites

| What | Why |
|------|-----|
| **Node.js 18+** | Moltzer Gateway runs on Node |
| **An AI API key** | Claude, OpenAI, or Google (one is enough to start) |

**Where to get API keys:**
- [Claude (Anthropic)](https://console.anthropic.com/) — free tier available
- [OpenAI (GPT-4)](https://platform.openai.com/api-keys) — free tier available
- [Google (Gemini)](https://aistudio.google.com/app/apikey) — free tier available

---

## Step 1 — Install Moltzer Gateway

Moltzer Gateway is the open-source backend that securely routes your chats to AI providers. It runs locally on your machine — your API keys never leave your computer.

```bash
npm install -g moltbot
moltbot setup
```

The setup wizard will:
1. Ask which AI providers you want to use
2. Prompt for your API key(s)
3. Start the gateway on `ws://localhost:18789`

**Verify it's running:**
```bash
moltbot gateway status
```

> 💡 The gateway starts automatically on login once set up. You can also manage it manually: `moltbot gateway start` / `moltbot gateway stop`

---

## Step 2 — Download & Install Moltzer

| Platform | Download |
|----------|----------|
| **macOS** (Apple Silicon & Intel) | [Download for Mac →](https://github.com/AlixHQ/moltzer-community/releases) |
| **Windows** | [Download for Windows →](https://github.com/AlixHQ/moltzer-community/releases) |
| **Linux** | [Download for Linux →](https://github.com/AlixHQ/moltzer-community/releases) |

Install normally — drag to Applications on Mac, run the `.exe` on Windows, or use the `.deb`/`.rpm` on Linux.

---

## Step 3 — Connect & Chat

1. **Launch Moltzer** — find it in your Applications or start menu
2. **First launch** — the onboarding wizard guides you through connecting to your Gateway
3. If prompted manually: open **Settings** (`Cmd+,` on Mac, `Ctrl+,` on Windows) and enter:
   ```
   Gateway URL: ws://localhost:18789
   ```
4. Click **Connect** — you should see your available models appear
5. **Start chatting!** 🎉

---

## Quick Reference

| Action | Shortcut |
|--------|----------|
| Open Moltzer from anywhere | `Cmd/Ctrl + Shift + Space` |
| New conversation | `Cmd/Ctrl + N` |
| Search conversations | `Cmd/Ctrl + K` |
| Open settings | `Cmd/Ctrl + ,` |

---

## Troubleshooting

### "Connection failed"
- Check that Moltzer Gateway is running: `moltbot gateway status`
- Restart it if needed: `moltbot gateway restart`
- Verify the URL in Settings matches `ws://localhost:18789`

### "No models available"
- Your API key may be invalid or missing. Check: `moltbot config`
- Make sure you've enabled at least one AI provider during `moltbot setup`

### App won't launch (macOS)
- You may need to allow it: **System Settings → Security → Allow Moltzer**

### Port already in use
- Something else is on port 18789. Stop it, or configure a custom port: `moltbot setup --port 18790` and update the URL in Moltzer Settings.

---

For full Gateway documentation, visit [Moltbot on GitHub](https://github.com/moltbot/moltbot).

Having trouble? Open an [issue on GitHub](https://github.com/AlixHQ/moltzer-community/issues) — we're happy to help!
