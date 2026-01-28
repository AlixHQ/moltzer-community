# Configuration Guide

Complete reference for Moltz settings and configuration options.

---

## Accessing Settings

**Keyboard:** `Cmd+,` (macOS) or `Ctrl+,` (Windows/Linux)  
**Menu:** Moltz → Settings (macOS) or File → Settings (Windows/Linux)  
**Icon:** Click ⚙️ in sidebar

---

## Settings Sections

### 1. General

#### Theme
**Options:** Light, Dark, System  
**Default:** System

Controls the app appearance:
- **Light** — Always use light theme
- **Dark** — Always use dark theme
- **System** — Follow macOS/Windows/Linux system preference

**Keyboard shortcut:** `Cmd/Ctrl+Shift+T` to toggle

---

#### Language
**Options:** English  
**Default:** English

UI language. Additional languages are on the roadmap—see [Roadmap](./Roadmap.md).

**Want to help translate?** We'd love community contributions! See [Contributing](./Contributing.md)

---

#### Font Size
**Range:** 12-20 px  
**Default:** 14 px

Adjusts text size throughout the app:
- **12-13 px** — Compact (fits more on screen)
- **14-16 px** — Standard (comfortable)
- **17-20 px** — Large (accessibility)

**Applies to:** Message text, sidebar, settings

---

#### Message Density
**Options:** Compact, Comfortable  
**Default:** Comfortable

Controls spacing between messages:
- **Compact** — Less padding, more messages visible
- **Comfortable** — More whitespace, easier to read

---

### 2. Connection

#### Gateway URL
**Format:** `ws://host:port` or `wss://host:port`  
**Default:** `ws://localhost:18789`

WebSocket URL of your Clawdbot Gateway.

**Examples:**
```
ws://localhost:18789          # Local
wss://gateway.example.com     # Remote (TLS)
wss://host.ts.net             # Tailscale
```

**Important:**
- Use `ws://` for localhost (plain)
- Use `wss://` for remote (TLS required)
- Port 18789 is Gateway default

---

#### Gateway Token
**Format:** Alphanumeric string  
**Storage:** System keychain (encrypted)

Authentication token from your Gateway.

**Find your token:**
```bash
clawdbot token show
```

**Regenerate if compromised:**
```bash
clawdbot token regenerate
```

**Security:**
- Never share your token
- Stored in OS keychain (not localStorage)
- Not visible in UI (password field)
- Not logged

---

#### Auto-Connect on Startup
**Options:** On, Off  
**Default:** On

Automatically connect to Gateway when Moltz launches.

- **On** — Connect immediately (convenient)
- **Off** — Manual connection required (safer)

---

#### Connection Timeout
**Range:** 5-60 seconds  
**Default:** 30 seconds

How long to wait before giving up on connection.

**Recommendations:**
- **Local Gateway:** 10-15 seconds
- **Remote Gateway:** 30 seconds
- **Tailscale (macOS):** 120 seconds (first connection only)

---

#### Test Connection
**Button:** Test Connection

Verifies Gateway reachability before saving settings.

**Tests:**
1. Network connectivity
2. WebSocket handshake
3. Token authentication
4. Protocol compatibility

**Result:** ✅ Success or ❌ Error with details

---

### 3. Keyboard Shortcuts

#### Global Shortcuts

##### Quick Ask
**Default:** `Cmd+Shift+Space` (macOS), `Ctrl+Shift+Space` (Windows/Linux)

Summons Moltz from any app:
1. Press hotkey
2. Moltz appears
3. Type question
4. Press Enter
5. Get answer

**Custom binding:**
1. Click on shortcut
2. Press desired key combination
3. Save

**Conflicts:** Warns if shortcut is already used by system

---

#### App Shortcuts

| Action | Default | Customizable |
|--------|---------|--------------|
| **New Conversation** | `Cmd/Ctrl+N` | ✅ |
| **Search** | `Cmd/Ctrl+K` | ✅ |
| **Settings** | `Cmd/Ctrl+,` | ✅ |
| **Toggle Sidebar** | `Cmd/Ctrl+\` | ✅ |
| **Send Message** | `Enter` | ❌ |
| **New Line** | `Shift+Enter` | ❌ |
| **Edit Last Message** | `↑` (in empty input) | ❌ |
| **Cancel Streaming** | `Esc` | ❌ |

**Note:** Some shortcuts are hardcoded for consistency.

---

### 4. Privacy & Security

#### Encryption Status
**Display only** — Shows encryption status

- ✅ **Enabled** — Messages encrypted with AES-256-GCM
- 🔑 **Key Stored** — Encryption key in system keychain
- 🔒 **Secure** — No plaintext storage

**Always enabled** — Cannot be disabled.

---

#### Data Location
**Display only** — Shows where data is stored

**Locations:**
- **macOS:** `~/Library/Application Support/com.moltz.client/`
- **Windows:** `%APPDATA%\com.moltz.client\`
- **Linux:** `~/.config/com.moltz.client/`

**Contains:**
- IndexedDB (conversations, messages)
- Settings JSON
- Logs
- Cache

---

#### Clear All Data
**Button:** Clear All Data  
**Warning:** ⚠️ PERMANENT DELETION - THIS CANNOT BE UNDONE!

Deletes ALL conversations, messages, and settings.

**Before you click:**
1. **Export your data first!** (see Export All Data below)
2. Make sure exports are saved safely
3. Know that you can't recover after clicking

**Confirmation:** Requires typing "DELETE" to confirm (not "delete" or "deLeTe" - must be exact).

**When to use:**
- Starting fresh after switching workflows
- Privacy: Before selling/giving away computer
- Database corruption that export/import can't fix

**When NOT to use:**
- Don't use this to "free up space" — just delete old conversations instead
- Don't use this for performance — try Performance Mode first

---

#### Export All Data
**Button:** Export All Data

Saves all conversations and settings to JSON file.

**File format:**
```json
{
  "version": "1.0.0",
  "exportDate": "2025-01-28T12:00:00Z",
  "conversations": [ ... ],
  "messages": [ ... ],
  "settings": { ... }
}
```

**⚠️ Warning:** Exported data is **unencrypted**. Protect the file.

**Use cases:**
- Backup before major updates
- Transfer to another machine
- Archive old conversations

---

#### Import Data
**Button:** Import Data

Restores conversations from JSON export.

**Steps:**
1. Click Import Data
2. Select JSON file
3. Choose merge strategy:
   - **Replace** — Delete existing, import new
   - **Merge** — Keep existing, add new
4. Confirm

**Validation:** Checks JSON format before import.

---

### 5. Advanced

#### Developer Console
**Options:** Enabled, Disabled  
**Default:** Disabled (production), Enabled (dev builds)

Enables Chromium DevTools:
- Press `Cmd+Shift+I` to open
- Inspect DOM
- View console logs
- Debug JavaScript
- Profile performance

**⚠️ Warning:** Advanced users only.

---

#### Log Level
**Options:** Quiet, Normal, Verbose  
**Default:** Normal

Controls log verbosity:
- **Quiet** — Errors only
- **Normal** — Errors + warnings + info
- **Verbose** — Everything (debug logs)

**Log location:** Settings → View Logs

---

#### View Logs
**Button:** View Logs

Opens log file in default text editor.

**Useful for:**
- Troubleshooting connection issues
- Reporting bugs
- Performance debugging

---

#### Performance Mode
**Options:** On, Off  
**Default:** Off

Reduces resource usage:
- Disables animations
- Reduces rendering quality
- Lowers frame rate target
- Increases debounce delays

**Enable if:**
- Running on slower/older hardware
- Battery life is critical
- App feels sluggish

**Disables:**
- Smooth scrolling
- Fade-in animations
- Transition effects

---

#### Beta Features
**Options:** Individual toggles  
**Default:** Off

Opt into experimental features as they become available. Currently available beta features will appear here with toggle switches.

**⚠️ Warning:** Beta features may be unstable or change without notice. Report issues on GitHub.

---

### 6. About

#### Version Information
**Display only**

- **App Version:** e.g., 1.0.0
- **Tauri Version:** e.g., 2.2.0
- **Build Date:** e.g., 2026-01-28

---

#### Check for Updates
**Button:** Check for Updates

Manually checks for app updates:
- Normally checks every 24 hours
- Click to check immediately

**Auto-update:**
- Downloads in background
- Installs on next restart
- Never interrupts work

---

#### Credits
**Button:** View Credits

Shows:
- Core contributors
- Open-source licenses
- Third-party dependencies

---

## Configuration Files

### Settings Storage

**Location:**
- **macOS:** `~/Library/Preferences/com.moltz.client.plist`
- **Windows:** `%APPDATA%\com.moltz.client\config.json`
- **Linux:** `~/.config/com.moltz.client/config.json`

**Format:** JSON

**Example:**
```json
{
  "theme": "system",
  "fontSize": 14,
  "gatewayUrl": "ws://localhost:18789",
  "autoConnect": true,
  "shortcuts": {
    "quickAsk": "CommandOrControl+Shift+Space"
  }
}
```

**⚠️ Warning:** Manual editing not recommended. Use Settings UI.

---

### Database Location

**IndexedDB:**
- **macOS:** `~/Library/Application Support/com.moltz.client/IndexedDB/`
- **Windows:** `%APPDATA%\com.moltz.client\IndexedDB\`
- **Linux:** `~/.config/com.moltz.client/IndexedDB/`

**Contains:**
- `conversations` table
- `messages` table (encrypted)
- `attachments` table

**⚠️ Warning:** Do not modify manually. Use app UI or export/import.

---

## Environment Variables

### Development

```bash
# Enable DevTools in production
MOLTZ_DEV=1 ./Moltz

# Use custom Gateway
GATEWAY_URL=ws://localhost:8080 ./Moltz

# Verbose logging
RUST_LOG=debug ./Moltz
```

### Production

**Not recommended.** Use Settings UI instead.

---

## Command-Line Flags

### macOS

```bash
# Open with DevTools
open -a Moltz --args --dev

# Disable auto-update
open -a Moltz --args --no-update
```

### Windows

```bash
# Open with DevTools
Moltz.exe --dev

# Disable auto-update
Moltz.exe --no-update
```

### Linux

```bash
# Open with DevTools
./moltz --dev

# Disable auto-update
./moltz --no-update
```

---

## Keyboard Shortcut Reference

### Global

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+Shift+Space` | Quick Ask (summon) |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+N` | New conversation |
| `Cmd/Ctrl+K` | Search |
| `Cmd/Ctrl+,` | Settings |
| `Cmd/Ctrl+\` | Toggle sidebar |
| `Cmd/Ctrl+[` | Previous conversation |
| `Cmd/Ctrl+]` | Next conversation |

### Editing

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Cmd/Ctrl+Enter` | Send (alternative) |
| `↑` (empty input) | Edit last message |
| `Esc` | Cancel streaming |

### Conversation

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+P` | Pin/unpin |
| `Cmd/Ctrl+Backspace` | Delete |
| `Cmd/Ctrl+E` | Export as Markdown |

---

## Default Settings

**If you need to reset to defaults:**

1. Open Settings
2. Scroll to bottom
3. Click "Reset to Defaults"
4. Confirm

**Or delete config file:**
```bash
# macOS
rm ~/Library/Preferences/com.moltz.client.plist

# Windows
del %APPDATA%\com.moltz.client\config.json

# Linux
rm ~/.config/com.moltz.client/config.json
```

**Restart app** to regenerate with defaults.

---

## Recommended Settings

### For Remote Work (Home + Office)

**Connection:**
- Timeout: 30 seconds
- Auto-connect: Off (manual when you switch networks)

**Privacy:**
- Export data weekly to backup drive
- Different tokens for home vs. work Gateway

---

### For Laptop Users (Battery Life)

**Appearance:**
- Font size: 12-13px (less to render)
- Message density: Compact
- Reduce Motion: On (in OS settings)

**Advanced:**
- Performance mode: On
- Log level: Quiet

**Expected:** 30% longer battery life

---

### For Accessibility

**Appearance:**
- Font size: 17-20px
- Theme: High contrast (system setting)
- Message density: Comfortable

**Keyboard Shortcuts:**
- Customize to avoid conflicts
- Use simple combinations (Ctrl+number keys)

---

### For Power Users

**Keyboard Shortcuts:**
- Customize everything to muscle memory
- Quick Ask: Easy-to-reach combo (e.g., `Ctrl+Space`)

**Privacy:**
- Export data: Monthly to encrypted drive
- Keep exports encrypted (password-protect)

**Advanced:**
- Developer console: Enabled
- Log level: Verbose (for debugging)

---

## Tips

### Optimize for Your Setup

**Local Gateway (same machine):**
- Timeout: 10 seconds
- Auto-connect: On
- Performance mode: Off

**Remote Gateway (fast connection):**
- Timeout: 30 seconds
- Auto-connect: On
- Performance mode: Off

**Remote Gateway (slow/Tailscale):**
- Timeout: 60-120 seconds
- Auto-connect: Off (manual connection)
- Performance mode: Consider enabling

**Slow Hardware:**
- Font size: 12-13px (less to render)
- Message density: Compact
- Performance mode: On

---

## Troubleshooting Settings

### Settings Not Saving

**Cause:** File permissions or disk full.

**Solution:**
```bash
# Check permissions (macOS/Linux)
ls -la ~/Library/Preferences/com.moltz.client.plist
# Should be readable/writable by you

# Check disk space
df -h
```

### Settings Reset on Update

**Cause:** Bug in migration.

**Solution:**
- Export settings before updating
- Report bug with version numbers
- Restore from export

### Custom Shortcuts Not Working

**Causes:**
- Conflict with system shortcuts
- Invalid key combination
- macOS Accessibility permissions

**Solution:**
- Try different shortcut
- Check System Preferences → Keyboard → Shortcuts
- Grant Accessibility permission (macOS)

---

## Related Documentation

- **[User Guide](./User-Guide.md)** — Using Moltz
- **[Troubleshooting](./Troubleshooting.md)** — Solving problems
- **[Security](./Security.md)** — Privacy and encryption

---

**Last updated:** January 2025
