# Quick Start

Get Moltz running in under 5 minutes.

---

## 1. Install Gateway (30 seconds)

```bash
npm install -g clawdbot
clawdbot setup
```

Gateway is now running in the background.

**Don't have npm?** [Download Node.js](https://nodejs.org/) first (2-minute install).

---

## 2. Download Moltz (10 seconds)

**macOS:** [Apple Silicon](https://github.com/AlixHQ/moltz/releases/latest/download/Moltz_aarch64.dmg) | [Intel](https://github.com/AlixHQ/moltz/releases/latest/download/Moltz_x64.dmg)

**Windows:** [Download installer](https://github.com/AlixHQ/moltz/releases/latest/download/Moltz_x64.msi)

**Linux:** [.deb](https://github.com/AlixHQ/moltz/releases/latest/download/moltz_amd64.deb) | [.rpm](https://github.com/AlixHQ/moltz/releases/latest/download/moltz.rpm) | [AppImage](https://github.com/AlixHQ/moltz/releases/latest/download/moltz.AppImage)

---

## 3. Install Moltz (20 seconds)

**macOS:** Open `.dmg` → Drag to Applications → Open  
**Windows:** Run `.msi` → Click through installer  
**Linux:** `sudo dpkg -i moltz_amd64.deb` (or equivalent)

**Security warnings?** Right-click → Open (macOS) or "More info" → "Run anyway" (Windows). We're a new open-source app, not yet code-signed.

---

## 4. Connect & Chat (1 minute)

1. Launch Moltz
2. Click "Test Connection" (Gateway URL is already filled in)
3. Type a message
4. Press Enter

Done! You're chatting with AI.

---

## Need Help?

**Connection failed?**
```bash
# Check Gateway is running
clawdbot status

# If not, start it
clawdbot start
```

**Still stuck?** [Full setup guide](./Getting-Started.md) | [Troubleshooting](./Troubleshooting.md)

---

## Keyboard Shortcuts to Remember

- `Cmd/Ctrl + N` — New conversation
- `Cmd/Ctrl + K` — Search all conversations
- `Cmd/Ctrl + Shift + Space` — Summon Moltz from anywhere
- `Shift + Enter` — New line without sending

[See all shortcuts](./Configuration.md#keyboard-shortcuts)

---

**Want to learn more?** Check out the [User Guide](./User-Guide.md).
