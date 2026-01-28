# Troubleshooting Guide

Common issues and solutions for Moltz users.

---

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Performance Issues](#performance-issues)
3. [Installation Issues](#installation-issues)
4. [Data & Storage Issues](#data--storage-issues)
5. [Platform-Specific Issues](#platform-specific-issues)

---

## Connection Issues

### Cannot Connect to Gateway

**Symptoms:**
- "Connection refused" error
- "Connection timeout" error
- Onboarding stuck on "Testing connection..."

**Possible Causes:**

#### 1. Gateway Not Running

**Check:**
```bash
# Check if Gateway process is running
ps aux | grep clawdbot   # macOS/Linux
tasklist | findstr clawdbot   # Windows
```

**Solution:**
```bash
clawdbot start
```

#### 2. Wrong URL

**Check:**
- Default: `ws://localhost:18789`
- Remote: `wss://your-gateway.example.com`

**Solution:**
- Verify URL in Gateway config
- Test connectivity: `curl http://localhost:18789/health`

#### 3. Wrong Token

**Check:**
```bash
clawdbot token show
```

**Solution:**
```bash
# Regenerate token
clawdbot token regenerate

# Copy new token to Moltz Settings
```

#### 4. Firewall Blocking

**Check:**
- macOS: System Preferences → Security & Privacy → Firewall
- Windows: Windows Defender Firewall → Allow an app
- Linux: `sudo ufw status`

**Solution:**
- Allow Moltz through firewall
- Allow port 18789 for Gateway

---

### Connection Timeout (Tailscale)

**Symptom:** First connection to Tailscale Gateway takes 2-3 minutes.

**Cause:** macOS async TCP + Tailscale Network Extension interaction.

**Solution:**
- **Be patient** on first connection (known issue)
- Subsequent connections are instant
- Use IPv4-only endpoint if available

**Workaround:**
```bash
# Find Gateway's Tailscale IPv4
tailscale status | grep gateway-machine

# Use direct IPv4 in Moltz
wss://100.70.200.79:443
```

---

### Connection Drops Randomly

**Symptoms:**
- "Reconnecting..." appears frequently
- Messages fail to send
- Gateway shows as offline intermittently

**Possible Causes:**

#### 1. Network Instability

**Check:**
```bash
# Test connection stability
ping -c 100 gateway-host

# Check for packet loss
```

**Solution:**
- Use wired connection instead of WiFi
- Check router/firewall logs
- Contact network admin

#### 2. Gateway Crashing

**Check Gateway logs:**
```bash
clawdbot logs --tail 100
```

**Solution:**
- Update Gateway to latest version
- Report bug with logs
- Increase Gateway memory/CPU allocation

#### 3. Moltz Bug

**Check Moltz logs:**
- macOS: `~/Library/Logs/Moltz/`
- Windows: `%APPDATA%\Moltz\logs\`
- Linux: `~/.local/share/moltz/logs/`

**Solution:**
- Update Moltz to latest version
- Report issue with logs

---

### "Protocol Version Mismatch"

**Symptom:** Connection fails with version incompatibility error.

**Cause:** Moltz version incompatible with Gateway version.

**Solution:**
```bash
# Update both to latest versions
npm update -g clawdbot
# Download latest Moltz from GitHub Releases
```

**Version Compatibility:**
- Moltz 1.0.x ↔ Gateway 2026.1.x ✅
- Check [Version Compatibility Matrix](./API-Reference.md#version-compatibility)

---

## Performance Issues

### App Feels Slow

**Symptoms:**
- Laggy scrolling
- Delayed typing
- High CPU usage

**Diagnostics:**

#### 1. Check Memory Usage

**macOS:**
```bash
# Check Moltz memory usage
ps aux | grep Moltz
```

**Windows:** Task Manager → Details → Moltz.exe

**Expected:**
- Idle: 80-100 MB
- Active: 150-250 MB
- Heavy use: 250-400 MB

**If higher:** Possible memory leak, restart app.

#### 2. Check Conversation Count

**Too many conversations?**
- Open Settings → Advanced → Statistics
- If > 500 conversations, performance degrades

**Solution:**
- Delete old conversations
- Export + delete archived conversations

#### 3. Check Message Count

**In Developer Console (Cmd+Shift+I):**
```javascript
// Count total messages
localStorage.getItem('moltz:message_count')
```

**If > 100K messages:** Consider exporting + clearing history.

#### 4. Reduce Animations

**macOS:**
- System Preferences → Accessibility → Display → Reduce motion

**Windows:**
- Settings → Ease of Access → Display → Show animations (off)

**Moltz respects OS preference and disables animations.**

---

### Slow Search

**Symptom:** Search takes > 5 seconds to return results.

**Cause:** Large database (> 50K messages) without indexes.

**Solution:**
1. Rebuild search index: Settings → Advanced → Rebuild Index
2. If still slow, export + import data (rebuilds database)

---

### High CPU Usage

**Check:**
- Which process? (Moltz or Gateway?)
- When? (Idle, streaming, scrolling?)

**Common Causes:**

#### During Streaming
- **Expected:** 10-20% CPU during AI response
- **If higher:** Check Gateway logs for issues

#### During Idle
- **Expected:** < 5% CPU
- **If higher:** Check for:
  - Runaway background tasks
  - Memory leaks
  - Restart app

---

## Installation Issues

### macOS: "Moltz is damaged and can't be opened"

**Cause:** Gatekeeper blocking unsigned app.

**Solution:**
```bash
# Remove quarantine flag
xattr -cr /Applications/Moltz.app

# Or right-click → Open → Open anyway
```

**Future:** Moltz will be properly signed.

---

### macOS: "Moltz wants to access your keychain"

**Cause:** Moltz stores encryption key in macOS Keychain.

**Solution:**
- Click "Always Allow" to avoid repeated prompts
- Or click "Allow" each time (less convenient)

---

### Windows: "Windows protected your PC"

**Cause:** SmartScreen blocking unsigned app.

**Solution:**
1. Click "More info"
2. Click "Run anyway"

**Future:** Moltz will be properly signed.

---

### Linux: Missing Dependencies

**Symptom:** App fails to launch, errors about missing libraries.

**Solution (Debian/Ubuntu):**
```bash
sudo apt install libwebkit2gtk-4.0-37 libgtk-3-0
```

**Solution (Fedora):**
```bash
sudo dnf install webkit2gtk3 gtk3
```

---

### Auto-Update Fails

**Symptom:** "Update failed" notification.

**Causes:**
1. No internet connection
2. Update server down
3. Disk full
4. Insufficient permissions

**Solution:**
1. Check internet connection
2. Free up disk space (need 500 MB)
3. Download and install manually from [GitHub Releases](https://github.com/AlixHQ/moltz/releases)

---

## Data & Storage Issues

### Lost Conversations After Update

**Cause:** Database migration failed.

**Solution:**

#### 1. Check Backup

Moltz creates automatic backups before updates:

**Backup Location:**
- macOS: `~/Library/Application Support/com.moltz.client/backups/`
- Windows: `%APPDATA%\com.moltz.client\backups\`
- Linux: `~/.config/com.moltz.client/backups/`

#### 2. Restore from Backup

```bash
# macOS
cd ~/Library/Application\ Support/com.moltz.client/
cp backups/latest.json conversations.json

# Restart Moltz
```

#### 3. Manual Recovery

If no backup:
1. Open Developer Console (Cmd+Shift+I)
2. Application → IndexedDB → moltz-db → conversations
3. Export to JSON
4. Import via Settings → Import Data

---

### Cannot Decrypt Messages

**Symptom:** Messages show as encrypted gibberish.

**Causes:**
1. Lost encryption key
2. Corrupted keychain
3. Reinstalled OS without backup

**Solution:**

**If you have system backup:**
1. Restore from Time Machine / Windows Backup
2. Keychain should be restored

**If no backup:**
- **Messages are unrecoverable** (by design, for security)
- Start fresh, export conversations as plain text in future

---

### Database Corrupted

**Symptom:** App crashes on launch, "Database error" message.

**Solution:**

#### 1. Clear Database (Nuclear Option)

**Warning:** This deletes all conversations!

```bash
# macOS
rm -rf ~/Library/Application\ Support/com.moltz.client/IndexedDB/

# Windows
rmdir /s "%APPDATA%\com.moltz.client\IndexedDB"

# Linux
rm -rf ~/.config/com.moltz.client/IndexedDB/
```

#### 2. Rebuild from Export

If you have exports:
1. Clear database (above)
2. Restart Moltz
3. Settings → Import Data → Select export file

---

### Running Out of Disk Space

**Check Moltz disk usage:**

**macOS:**
```bash
du -sh ~/Library/Application\ Support/com.moltz.client/
```

**Expected:**
- 1,000 messages: ~10 MB
- 10,000 messages: ~100 MB
- 100,000 messages: ~1 GB

**Solution:**
- Delete old conversations
- Export + clear history
- Increase disk space

---

## Platform-Specific Issues

### macOS

#### Can't Open App After Update

**Solution:**
```bash
# Re-sign the app
codesign --force --deep --sign - /Applications/Moltz.app
```

#### Keychain Prompts on Every Launch

**Solution:**
1. Open Keychain Access
2. Find "Moltz encryption key"
3. Double-click → Access Control
4. Add Moltz to "Always allow"

#### App Freezes on macOS Ventura+

**Known Issue:** Interaction with macOS WindowServer.

**Workaround:**
1. Disable window animations: Settings → Reduce Motion
2. Update to latest Moltz (fix pending)

---

### Windows

#### App Won't Launch After Install

**Check:**
1. Installed .NET Framework? (required)
2. WebView2 installed? (required)

**Solution:**
```bash
# Download and install WebView2 Runtime
https://developer.microsoft.com/microsoft-edge/webview2/
```

#### Firewall Blocks Connection

**Solution:**
1. Windows Defender Firewall → Allow an app
2. Click "Change settings"
3. Click "Allow another app"
4. Browse to Moltz.exe
5. Check both Private and Public networks

---

### Linux

#### App Not Listed in Application Menu

**Solution:**
```bash
# Copy .desktop file
sudo cp /opt/Moltz/moltz.desktop /usr/share/applications/

# Update desktop database
sudo update-desktop-database
```

#### Tray Icon Not Showing

**Cause:** Desktop environment doesn't support tray icons (Wayland).

**Workaround:**
- Install GNOME Shell extension for system tray
- Or use window mode (disable "Close to tray")

---

## Getting Help

### Before Reporting an Issue

**Collect this information:**

1. **Version:**
   - Settings → About → Version

2. **OS:**
   - macOS version (e.g., macOS 13.5)
   - Windows version (e.g., Windows 11 22H2)
   - Linux distro + version (e.g., Ubuntu 22.04)

3. **Gateway Version:**
   ```bash
   clawdbot version
   ```

4. **Error Logs:**
   - Settings → Advanced → View Logs
   - Copy relevant errors

5. **Steps to Reproduce:**
   - What did you do?
   - What happened?
   - What did you expect?

---

### Reporting Issues

**GitHub Issues:**
https://github.com/AlixHQ/moltz/issues

**Template:**
```
### Bug Description
Briefly describe the issue.

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
What should happen.

### Actual Behavior
What actually happened.

### Environment
- OS: macOS 13.5
- Moltz Version: 1.0.0
- Gateway Version: 2026.1.28

### Logs
Paste relevant logs here.
```

---

### Community Support

- **Discussions:** https://github.com/AlixHQ/moltz/discussions
- **Discord:** (coming soon)
- **Email:** support@alix.com (critical issues only)

---

## FAQ

### How do I reset Moltz to defaults?

**Warning:** Deletes all data!

**macOS:**
```bash
rm -rf ~/Library/Application\ Support/com.moltz.client/
rm -rf ~/Library/Preferences/com.moltz.client.plist
```

**Windows:**
```bash
rmdir /s "%APPDATA%\com.moltz.client"
```

**Linux:**
```bash
rm -rf ~/.config/com.moltz.client/
```

---

### Can I move my data to another machine?

**Yes:**

1. **Export on old machine:**
   - Settings → Export All Data
   - Save JSON file

2. **Import on new machine:**
   - Install Moltz
   - Settings → Import Data
   - Select JSON file

**Note:** Encryption keys don't transfer. Exported data is unencrypted.

---

### Why is app size so large?

**Moltz bundle sizes:**
- macOS: ~10 MB (.dmg), ~20 MB installed
- Windows: ~15 MB (.msi), ~30 MB installed
- Linux: ~12 MB (AppImage)

**Includes:** Tauri runtime + Rust backend + React + dependencies.

**Compared to Electron apps (100-150 MB), Moltz is tiny.**

---

## Related Documentation

- **[User Guide](./User-Guide.md)** — How to use Moltz
- **[Configuration](./Configuration.md)** — Settings reference
- **[Performance](./Performance.md)** — Optimization tips

---

**Last updated:** January 2026
