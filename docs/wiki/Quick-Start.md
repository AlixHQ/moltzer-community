# Quick Start: Get Moltz Running in 5 Minutes

Get up and running with Moltz in just a few minutes.

---

## Prerequisites

You need **Clawdbot Gateway** installed first. Don't have it?

```bash
npm install -g clawdbot
clawdbot setup
clawdbot start
```

✅ **Gateway running?** Continue below.

---

## Step 1: Install Moltz (2 minutes)

### macOS
1. Download [Moltz.dmg](https://github.com/AlixHQ/moltz/releases/latest)
2. Drag to Applications
3. Open Moltz (right-click → Open if you get a security warning)

### Windows
1. Download [Moltz.msi](https://github.com/AlixHQ/moltz/releases/latest)
2. Run installer
3. Click "More info" → "Run anyway" if SmartScreen blocks it

### Linux
```bash
# Debian/Ubuntu
wget https://github.com/AlixHQ/moltz/releases/latest/download/moltz_amd64.deb
sudo dpkg -i moltz_amd64.deb
```

---

## Step 2: Connect to Gateway (1 minute)

When Moltz opens:

1. **Gateway URL:** `ws://localhost:18789` (already filled in)
2. **Token:** Get it with `clawdbot token show` in terminal
3. Click **Test Connection**
4. Click **Continue**

✅ **Connected?** You're ready!

---

## Step 3: Send Your First Message (30 seconds)

1. Click **+ New Conversation** (or press `Cmd/Ctrl+N`)
2. Type: "Explain what Moltz is in one sentence"
3. Press `Enter`
4. Watch the AI respond in real-time

🎉 **You're chatting with AI!**

---

## What's Next?

### Essential Shortcuts

| Action | Shortcut |
|--------|----------|
| **Quick Ask** (summon from anywhere) | `Cmd/Ctrl+Shift+Space` |
| New conversation | `Cmd/Ctrl+N` |
| Search conversations | `Cmd/Ctrl+K` |
| Settings | `Cmd/Ctrl+,` |

### Learn More

- **[User Guide](./User-Guide.md)** — Master all features
- **[Configuration](./Configuration.md)** — Customize Moltz
- **[Troubleshooting](./Troubleshooting.md)** — Fix issues

---

## Common First-Time Issues

### "Cannot connect to Gateway"

**Fix:**
```bash
# Make sure Gateway is running
clawdbot start

# Check the URL is correct
clawdbot config
```

### "Wrong token"

**Fix:**
```bash
# Get your token
clawdbot token show

# Or regenerate if lost
clawdbot token regenerate
```

### macOS "Can't open app"

**Fix:**
1. Right-click Moltz in Applications
2. Click "Open"
3. Click "Open" again in dialog

---

## That's It!

You're now using Moltz. Explore the features, customize your setup, and enjoy native AI chat on your desktop.

**Questions?** Check the [User Guide](./User-Guide.md) or [open an issue](https://github.com/AlixHQ/moltz/issues).
