# Getting Started with Moltz

This guide will help you install Moltz and connect to Clawdbot Gateway for the first time.

---

## Prerequisites

Before installing Moltz, you need **Clawdbot Gateway** running on your machine or accessible over your network.

### Install Clawdbot Gateway

Clawdbot Gateway is the AI routing service that connects Moltz to AI providers (Claude, GPT, Gemini, etc.).

**Installation:**
```bash
npm install -g clawdbot
clawdbot setup
```

For detailed instructions, see the [official Clawdbot documentation](https://github.com/clawdbot/clawdbot).

**Default Gateway URL:** `ws://localhost:18789`

---

## Installation

### macOS

#### Download

1. Go to [Moltz Releases](https://github.com/AlixHQ/moltz/releases)
2. Download the latest `.dmg` file
   - **Apple Silicon:** `Moltz_1.0.0_aarch64.dmg`
   - **Intel:** `Moltz_1.0.0_x64.dmg`

#### Install

1. Open the downloaded `.dmg` file
2. Drag **Moltz** to your Applications folder
3. Launch Moltz from Applications or Spotlight

**First Launch:** macOS will ask permission to run the app. Click "Open" when prompted.

#### Code Signing Note
Early releases may show "unidentified developer" warnings. This is normal for new apps. Right-click → Open to bypass.

---

### Windows

#### Download

1. Go to [Moltz Releases](https://github.com/AlixHQ/moltz/releases)
2. Download the latest `.msi` installer: `Moltz_1.0.0_x64_en-US.msi`

#### Install

1. Double-click the downloaded `.msi` file
2. Follow the installation wizard
3. Launch Moltz from the Start Menu or Desktop shortcut

**Windows Defender:** May show SmartScreen warning on first run. Click "More info" → "Run anyway"

---

### Linux

#### Download

Choose the appropriate package for your distribution:

- **Debian/Ubuntu:** `moltz_1.0.0_amd64.deb`
- **Red Hat/Fedora:** `moltz-1.0.0-1.x86_64.rpm`
- **AppImage (Universal):** `moltz_1.0.0_amd64.AppImage`

#### Install

**Debian/Ubuntu:**
```bash
sudo dpkg -i moltz_1.0.0_amd64.deb
sudo apt-get install -f  # Install dependencies if needed
```

**Fedora:**
```bash
sudo rpm -i moltz-1.0.0-1.x86_64.rpm
```

**AppImage:**
```bash
chmod +x moltz_1.0.0_amd64.AppImage
./moltz_1.0.0_amd64.AppImage
```

---

## First Launch

### Onboarding Flow

When you launch Moltz for the first time, you'll go through a brief onboarding:

#### Step 1: Welcome
Introduction to Moltz and its features.

#### Step 2: Gateway Setup
Enter your Clawdbot Gateway connection details:

**Local Gateway (Default):**
- **URL:** `ws://localhost:18789`
- **Token:** (from your Gateway setup)

**Remote Gateway:**
- **URL:** `wss://your-gateway.example.com`
- **Token:** Your authentication token

**Finding Your Token:**
```bash
# In your Gateway terminal
clawdbot token show
```

Or check `~/.config/clawdbot/config.json`

#### Step 3: Test Connection
Moltz will verify the connection to your Gateway. You should see:
- ✅ **Connected** — Gateway is reachable
- 🔒 **Secure** — TLS enabled (for wss:// URLs)
- 🤖 **Ready** — AI models available

**Connection Issues?** See [Troubleshooting → Connection Problems](./Troubleshooting.md#connection-problems)

#### Step 4: Feature Tour
Quick walkthrough of key features (optional, can skip).

---

## Connection Setup

### Local Connection

Most users run Gateway on the same machine:

```
URL: ws://localhost:18789
Token: <your-token>
```

**Pros:**
- Fastest connection
- No network configuration needed
- Most secure (traffic doesn't leave your machine)

**Cons:**
- Gateway must run on same machine

---

### Remote Connection

Connect to Gateway on another machine (e.g., home server, VPS):

```
URL: wss://gateway.example.com
Token: <your-token>
```

**Important:** Always use `wss://` (secure WebSocket) for remote connections.

#### Tailscale Connection

Connecting over Tailscale VPN:

```
URL: wss://gateway-machine.tailnet-name.ts.net
Token: <your-token>
```

**Known Issue (macOS):** Initial connection may take 2-3 minutes on macOS + Tailscale. This is a macOS networking limitation, not a Moltz bug. Subsequent connections are instant.

**Workaround:** Be patient on first connection, or use IPv4-only endpoint if available.

---

### Testing Your Connection

Use the **Test Connection** button in Gateway Setup to verify:

1. **Network reachability** — Can Moltz reach the Gateway URL?
2. **WebSocket handshake** — Does the Gateway respond?
3. **Authentication** — Is your token valid?
4. **Protocol compatibility** — Client/Gateway versions compatible?

**Expected result:** Connection test completes in 2-10 seconds.

---

## Your First Conversation

Once connected:

1. Click **+ New Conversation** or press `Cmd/Ctrl+N`
2. Type a message in the input field
3. Press `Enter` or click Send
4. Watch the AI response stream in real-time

**Tips:**
- Use `Shift+Enter` for multi-line messages
- Attach files with the 📎 button (up to 10 MB)
- Edit your last message with `↑` arrow key

---

## Quick Setup Checklist

- [ ] Clawdbot Gateway installed and running
- [ ] Gateway token retrieved
- [ ] Moltz installed
- [ ] Connection tested successfully
- [ ] First conversation created
- [ ] Keyboard shortcuts explored (see [Configuration](./Configuration.md))

---

## Next Steps

- **[User Guide](./User-Guide.md)** — Learn to use Moltz effectively
- **[Configuration](./Configuration.md)** — Customize settings, themes, shortcuts
- **[Features](./Features.md)** — Discover all available features
- **[Troubleshooting](./Troubleshooting.md)** — Solve common issues

---

## Common First-Time Issues

### "Cannot connect to Gateway"

**Causes:**
1. Gateway not running → Start Gateway: `clawdbot start`
2. Wrong URL → Check Gateway settings
3. Wrong token → Regenerate: `clawdbot token regenerate`
4. Firewall blocking connection → Allow port 18789

**See:** [Troubleshooting → Connection Problems](./Troubleshooting.md#connection-problems)

---

### "Connection timeout"

**For Tailscale users:**
- First connection can take 2-3 minutes on macOS
- Wait patiently, don't cancel
- Subsequent connections will be instant

**For others:**
- Check network connectivity
- Verify Gateway is reachable: `curl http://your-gateway:18789/health`
- Try increasing timeout in Settings

---

### "Protocol version mismatch"

Your Moltz version is incompatible with your Gateway version.

**Solution:**
- Update both to latest versions
- Or use compatible versions (check [Compatibility Matrix](./API-Reference.md#version-compatibility))

---

## System Integration

### Global Hotkey

Set up the **Quick Ask** hotkey to summon Moltz from anywhere:

**Default:** `Cmd+Shift+Space` (macOS) / `Ctrl+Shift+Space` (Windows/Linux)

**To customize:**
1. Open Settings (`Cmd/Ctrl+,`)
2. Go to Keyboard Shortcuts
3. Click on Quick Ask
4. Press your desired key combination

---

### System Tray

Moltz runs in the system tray for quick access:

- **Left-click** — Show/hide main window
- **Right-click** — Menu (New conversation, Settings, Quit)

**macOS:** Icon appears in menu bar (top-right)  
**Windows:** Icon in system tray (bottom-right)  
**Linux:** Depends on desktop environment

---

## Privacy & Security

### Data Storage

All conversations are stored **locally on your device** in an encrypted database:

- **Location:**
  - macOS: `~/Library/Application Support/com.moltz.client/`
  - Windows: `%APPDATA%\com.moltz.client\`
  - Linux: `~/.config/com.moltz.client/`

- **Encryption:** AES-256-GCM with key derived from system keyring
- **No cloud sync** — Your data never leaves your device (unless you configure backups)

**See:** [Security](./Security.md) for details

---

### Token Security

Your Gateway token grants full access to your AI account. **Keep it secret.**

**Best practices:**
- Don't share tokens
- Regenerate if compromised
- Use different tokens for different devices
- Revoke unused tokens

---

## Need Help?

- **Troubleshooting:** [Troubleshooting Guide](./Troubleshooting.md)
- **User Guide:** [User Guide](./User-Guide.md)
- **GitHub Issues:** [Report a bug](https://github.com/AlixHQ/moltz/issues)
- **Discussions:** [Ask questions](https://github.com/AlixHQ/moltz/discussions)

---

**Next:** [User Guide](./User-Guide.md) — Learn to use Moltz effectively
