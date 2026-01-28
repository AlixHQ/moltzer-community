# Troubleshooting

Real solutions to real problems. No "have you tried turning it off and on again?"

---

## Connection Problems

### "Cannot connect to Gateway"

**Fix #1: Gateway isn't running (95% of cases)**

```bash
# Check if Gateway is running
clawdbot gateway status

# Not running? Start it:
clawdbot gateway start
```

Wait 5 seconds, then click "Test Connection" in Moltz again.

**Still not working?** Move to Fix #2.

---

**Fix #2: Gateway is running but not accessible**

```bash
# Can you reach Gateway?
curl http://localhost:18789/health

# Should return: {"status":"ok"}
```

If curl fails:
- Gateway might be on a different port
- Firewall might be blocking it
- Check Gateway config: `clawdbot config get gateway`

**Still not working?** Move to Fix #3.

---

**Fix #3: Gateway is on a different port**

```bash
# Check Gateway config
clawdbot config get gateway

# Look for "port" in the output
```

If Gateway is on a different port (not 18789):
1. Settings → Connection in Moltz
2. Change `ws://localhost:18789` to `ws://localhost:YOUR_PORT`
3. Test connection

**Still not working?** [Open an issue](https://github.com/AlixHQ/moltz/issues) with:
- Output of `clawdbot gateway status`
- Output of `clawdbot gateway probe`
- Error from Moltz (Settings → View Logs)

---

### "Connection timeout" (takes forever, then fails)

**macOS + Tailscale?** This is normal on first connection. Grab coffee, wait 2-3 minutes. After the first time, it connects instantly.

**Not using Tailscale?** Your network is slow or unreachable.

**Fix:**
```bash
# Can you reach the Gateway?
ping your-gateway-hostname

# Can you reach the Gateway port?
curl -v ws://your-gateway:18789
```

If ping fails → Network/DNS problem  
If curl fails → Gateway not accessible

**Solution:**
- Check firewall rules
- Check VPN is connected
- Verify Gateway URL is correct

---

### "Protocol version mismatch"

Your Moltz and Gateway versions don't match.

**Fix:**
```bash
# Check Gateway version
clawdbot --version

# Check Moltz version
# In Moltz: Settings → About
```

**If Gateway is older:**
```bash
npm update -g clawdbot
```

**If Moltz is older:**  
Download latest from [releases](https://github.com/AlixHQ/moltz/releases/latest)

---

## Performance Problems

### App is slow/laggy

**Fix #1: Too many conversations**

Count your conversations. If you have > 500, that's the problem.

**Solution:**
1. Export old conversations (right-click → Export)
2. Delete them
3. Restart Moltz

**Performance target:** < 100 conversations for best experience.

---

**Fix #2: One giant conversation**

How many messages in your longest conversation? If > 1000, that's the problem.

**Solution:**  
Start a new conversation for new topics. Don't put everything in one mega-thread.

---

**Fix #3: Hardware is slow**

**Enable Performance Mode:**
1. Settings → Advanced → Performance Mode ON
2. Restart Moltz

This disables animations and reduces resource usage.

---

### Scrolling is janky

**This was fixed in v1.0.** Update to latest version.

Still janky after updating? [Report it](https://github.com/AlixHQ/moltz/issues) with:
- Your OS and version
- Number of messages in the conversation
- Video of the jank (screen recording)

---

## Installation Problems

### macOS: "Moltz is damaged and can't be opened"

This is Gatekeeper being paranoid about new apps.

**Fix:**
```bash
# Remove the quarantine flag
xattr -cr /Applications/Moltz.app
```

Then open Moltz normally.

---

### macOS: Keychain prompts on every launch

**Fix:**
1. Open Keychain Access app
2. Search for "Moltz"
3. Double-click the Moltz entry
4. Click "Access Control" tab
5. Select "Allow all applications to access this item"

Never see that prompt again.

---

### Windows: "Windows protected your PC"

We're a new publisher without expensive code signing certificates. The app is safe (open-source = auditable).

**Fix:**
1. Click "More info"
2. Click "Run anyway"
3. Continue with installation

---

### Linux: Missing dependencies

**Debian/Ubuntu:**
```bash
sudo apt install libwebkit2gtk-4.0-37 libgtk-3-0 libayatana-appindicator3-1
```

**Fedora:**
```bash
sudo dnf install webkit2gtk3 gtk3
```

Then reinstall Moltz.

---

## Data Problems

### Lost conversations after update

**Fix: Restore from automatic backup**

Moltz creates backups before updates:

```bash
# macOS
ls ~/Library/Application\ Support/com.moltz.client/backups/

# Windows
dir %APPDATA%\com.moltz.client\backups

# Linux
ls ~/.config/com.moltz.client/backups/
```

Find the most recent backup, then:
1. Settings → Import Data
2. Select the backup file
3. Choose "Merge" (keeps both old and new)

---

### Messages show as encrypted gibberish

You lost your encryption key. **Messages are unrecoverable by design.**

**Prevention for next time:**
- Use Time Machine / Windows Backup (backs up keychain too)
- Or: Export conversations regularly (Settings → Export Data)

Exported conversations are unencrypted, so you can always read them.

---

### Database corrupted / App won't start

**Nuclear option: Reset everything**

⚠️ **This deletes all conversations**. Export first if possible.

```bash
# macOS
rm -rf ~/Library/Application\ Support/com.moltz.client/

# Windows
rmdir /s "%APPDATA%\com.moltz.client"

# Linux
rm -rf ~/.config/com.moltz.client/
```

Restart Moltz. Fresh start.

---

## Platform-Specific Problems

### macOS: App freezes randomly

**Known issue on macOS Ventura+.** We're working on a fix.

**Temporary workaround:**
1. Force quit Moltz
2. Reopen
3. Enable Performance Mode (Settings → Advanced)

---

### Windows: WebView2 error

**Fix: Install WebView2 Runtime**

[Download here](https://go.microsoft.com/fwlink/p/?LinkId=2124703) (official Microsoft link)

Install, restart Moltz.

---

### Linux: Tray icon not showing

**If using Wayland:** System tray doesn't work by default.

**Fix for GNOME:**
```bash
# Install extension
sudo apt install gnome-shell-extension-appindicator

# Enable it
gnome-extensions enable appindicatorsupport@ubuntu.com
```

Restart Moltz.

**Using KDE?** Should work out of the box.

---

## Getting More Help

### Before Opening an Issue

Collect this info:

```bash
# Your versions
clawdbot --version
# In Moltz: Settings → About → Version

# Gateway status
clawdbot status

# Gateway config
clawdbot config show

# Moltz logs
# In Moltz: Settings → Advanced → View Logs
# Copy the last 50 lines
```

### Open an Issue

[Create issue](https://github.com/AlixHQ/moltz/issues/new) with:

1. **What you tried** (step-by-step)
2. **What happened** (copy exact error message)
3. **What you expected**
4. **Your setup** (OS, versions from above)
5. **Logs** (last 50 lines)

We'll help!

---

## FAQ

### Can I use Moltz without Gateway?

No. Gateway handles API keys and AI routing. It's required.

### Does Moltz work offline?

You can read old conversations offline. Can't send new messages (needs Gateway, which needs internet to reach AI providers).

### Where is my data stored?

Locally on your computer, encrypted:
- macOS: `~/Library/Application Support/com.moltz.client/`
- Windows: `%APPDATA%\com.moltz.client\`
- Linux: `~/.config/com.moltz.client/`

### Can I move my data to another computer?

Yes:
1. Old computer: Settings → Export Data
2. Copy the JSON file to new computer
3. New computer: Settings → Import Data

### How do I uninstall completely?

**macOS:**
```bash
rm -rf /Applications/Moltz.app
rm -rf ~/Library/Application\ Support/com.moltz.client/
rm ~/Library/Preferences/com.moltz.client.plist
```

**Windows:**
1. Control Panel → Uninstall Moltz
2. Delete `%APPDATA%\com.moltz.client\`

**Linux:**
```bash
sudo apt remove moltz  # or equivalent
rm -rf ~/.config/com.moltz.client/
```

---

**Still stuck?** [Ask in Discussions](https://github.com/AlixHQ/moltz/discussions) or [open an issue](https://github.com/AlixHQ/moltz/issues).

---

**Last updated:** January 2026
