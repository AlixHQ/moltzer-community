# Moltz User Guide

Complete guide to using Moltz effectively for AI conversations.

---

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Common Workflows](#common-workflows)
3. [Conversations](#conversations)
4. [Messages](#messages)
5. [Search](#search)
6. [Settings](#settings)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Tips & Tricks](#tips--tricks)

---

## Basic Usage

### Starting a New Conversation

**Method 1: Keyboard**
- Press `Cmd+N` (macOS) or `Ctrl+N` (Windows/Linux)

**Method 2: Sidebar**
- Click **+ New** button at top of sidebar

**Method 3: Menu**
- Menu Bar → File → New Conversation

**Result:** A new untitled conversation appears in the sidebar and opens in the main view.

---

### Sending Your First Message

1. Type your message in the input field at the bottom
2. Press `Enter` to send (or click the Send button)
3. Watch the AI response stream in real-time—you'll see it typing character by character

**Pro tips:**
- **Multi-line messages:** `Shift+Enter` adds a new line without sending
- **Quick edits:** `↑` arrow key edits your last message instantly
- **Stop generation:** Hit `Esc` if the AI is going off track

---

## Common Workflows

### How do I... ask a quick question without opening the app?

1. Press `Cmd/Ctrl+Shift+Space` (Quick Ask hotkey)
2. Moltz appears on top of your current app
3. Type your question
4. Get your answer
5. Press `Esc` to dismiss

**Perfect for:** Quick lookups while coding, writing, or browsing.

---

### How do I... attach a file for the AI to analyze?

1. Click the 📎 button in the message input
2. Select your file (image, PDF, code file, etc.)
3. The file appears as a preview above the input
4. Type your question about the file
5. Press `Enter`

**Example:** "What's wrong with this code?" + attach `buggy-script.py`

---

### How do I... find an old conversation?

**Method 1: Search (fastest)**
1. Press `Cmd/Ctrl+K`
2. Type keywords from the conversation
3. Click the result to jump to it

**Method 2: Scroll the sidebar**
- Recent conversations appear at the top
- Pinned conversations stay at the very top
- Scroll down to find older ones

---

### How do I... get a better response?

**Try these:**

1. **Regenerate:** Hover over AI response → Click 🔄 to get a different answer
2. **Edit your question:** Press `↑` to edit your last message, then send again
3. **Add context:** Include more details, examples, or constraints
4. **Be specific:** Instead of "help with code," say "fix this Python syntax error"

---

### How do I... copy code from an AI response?

Hover over the code block → Click the **Copy** button in the top-right corner.

The code is now on your clipboard, ready to paste.

---

### How do I... export a conversation for sharing?

1. Open the conversation you want to export
2. Click the **⋯** menu (top-right)
3. Select **Export as Markdown**
4. Choose where to save the `.md` file
5. Share the file with teammates, or commit it to your repo

---

### How do I... keep important conversations at the top?

Right-click the conversation → **Pin to top**

Pinned conversations show a 📌 icon and always appear first in your sidebar.

---

### How do I... switch between dark and light mode?

**Automatic (recommended):**
- Settings → General → Theme → **System**
- Moltz follows your OS theme automatically

**Manual:**
- Settings → General → Theme → **Dark** or **Light**
- Or press `Cmd/Ctrl+Shift+T` to toggle quickly

---

## Conversations

### Conversation List

The **sidebar** shows all your conversations, sorted by most recently updated.

**Conversation Card shows:**
- Title (auto-generated or custom)
- Preview of last message
- Timestamp
- Pin status (📌 icon if pinned)

---

### Naming Conversations

**Auto-naming:**
- First message automatically becomes the title
- Updates as conversation evolves

**Manual naming:**
1. Right-click conversation in sidebar
2. Select "Rename"
3. Enter new title
4. Press `Enter`

---

### Pinning Conversations

Keep important conversations at the top:

1. Right-click conversation
2. Select "Pin to top"
3. Pinned conversations show 📌 icon

**Unpinning:**
- Right-click → "Unpin"

**Keyboard shortcut:**
- Select conversation + `Cmd/Ctrl+P`

---

### Deleting Conversations

**Warning:** Deletion is permanent (no undo).

1. Right-click conversation
2. Select "Delete"
3. Confirm deletion

**Keyboard shortcut:**
- Select conversation + `Cmd/Ctrl+Backspace`

---

### Exporting Conversations

Save conversations as Markdown files:

1. Open conversation
2. Click ⋯ menu (top-right)
3. Select "Export as Markdown"
4. Choose save location

**Exported format:**
```markdown
# Conversation Title

**You:** First message

**Assistant:** AI response

**You:** Follow-up question

...
```

---

## Messages

### Composing Messages

#### Text Messages

Type in the input field and press `Enter`.

**Formatting:**
- Markdown is preserved in display
- Code blocks: Use triple backticks
- Links: Automatically detected and clickable

#### Multi-line Messages

- `Shift+Enter` — Add new line
- `Cmd/Ctrl+Enter` — Send (alternative)

---

### Attachments

Moltz supports file attachments (images, PDFs, text files, code files).

**Attaching Files:**
1. Click 📎 button in input field
2. Select file(s) from file picker
3. Attachments appear as previews above input
4. Send message

**Supported Types:**
- **Images:** JPG, PNG, GIF, WebP (up to 10 MB)
- **Documents:** PDF, TXT, MD, JSON, CSV
- **Code:** JS, TS, PY, RS, and 50+ file extensions

**Limits:**
- Max file size: 10 MB per file
- Max attachments: 10 per message

**Removing Attachments:**
- Click ✕ on attachment preview

---

### Viewing Messages

#### Text Messages

- Displayed with full markdown rendering
- Code blocks have syntax highlighting
- Tables, lists, and blockquotes supported

#### Code Blocks

```python
# Example code block
def hello():
    print("Hello, world!")
```

**Features:**
- Syntax highlighting for 100+ languages
- **Copy** button (top-right of code block)
- Line numbers (for blocks > 10 lines)

---

### Message Actions

Hover over any message to reveal action buttons:

| Action | Icon | Description |
|--------|------|-------------|
| **Copy** | 📋 | Copy message text to clipboard |
| **Edit** | ✏️ | Edit your own messages (user only) |
| **Regenerate** | 🔄 | Re-generate AI response |
| **Delete** | 🗑️ | Delete message and all after it |

---

### Editing Messages

You can edit your own messages:

1. Hover over message
2. Click ✏️ Edit button
3. Modify text in input field
4. Press `Enter` to save

**Effect:**
- Message updates
- All AI responses after the edited message are deleted
- Conversation continues from the edited message

**Keyboard shortcut:**
- `↑` (in empty input) — Edit last message

---

### Regenerating Responses

Get a different AI response:

1. Hover over assistant message
2. Click 🔄 Regenerate
3. New response streams in, replacing old one

**Use cases:**
- Didn't like the response
- Want a different perspective
- Response was incomplete

---

### Canceling Streaming

Stop a response mid-stream:

- Press `Esc` key
- Or click **Stop** button (appears during streaming)

**Result:** Partial response is saved as-is.

---

## Search

### Full-Text Search

Search across all conversations:

1. Press `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux)
2. Type search query
3. Results appear instantly

**Search Dialog:**
- Shows matching conversations
- Highlights matched text snippets
- Groups by conversation
- Sorts by relevance

**Clicking a result:**
- Opens that conversation
- Scrolls to matching message
- Highlights matched text

---

### Search Syntax

**Basic search:**
```
machine learning
```
Finds "machine" AND "learning" (any order)

**Phrase search:**
```
"neural networks"
```
Exact phrase match

**Exclude words:**
```
python -javascript
```
Python but not JavaScript

---

## Settings

Access settings: `Cmd+,` (macOS) or `Ctrl+,` (Windows/Linux)

### General

- **Theme:** Light, Dark, or System
- **Font size:** 12-20px
- **Message density:** Compact or Comfortable
- **Language:** English (more coming soon)

---

### Connection

- **Gateway URL:** WebSocket endpoint (e.g., `ws://localhost:18789`)
- **Token:** Authentication token
- **Auto-connect:** Reconnect on startup
- **Connection timeout:** Seconds to wait before giving up

**Test Connection:**
- Click "Test Connection" to verify settings

---

### Keyboard Shortcuts

Customize global and app-specific shortcuts.

**Global Shortcuts:**
- **Quick Ask:** Summon Moltz from anywhere (default: `Cmd+Shift+Space`)

**App Shortcuts:**
- **New Conversation:** `Cmd/Ctrl+N`
- **Search:** `Cmd/Ctrl+K`
- **Settings:** `Cmd/Ctrl+,`
- **Toggle Sidebar:** `Cmd/Ctrl+\`

---

### Privacy

- **Clear History:** Delete all conversations and messages
- **Export Data:** Save all data as JSON
- **Encryption:** View encryption status (always enabled)

**Data Location:**
- macOS: `~/Library/Application Support/com.moltz.client/`
- Windows: `%APPDATA%\com.moltz.client\`
- Linux: `~/.config/com.moltz.client/`

---

### Advanced

- **Developer Tools:** Enable for debugging (Cmd+Shift+I)
- **Log Level:** Verbose, Normal, or Quiet
- **Performance Mode:** Reduce animations for slower machines
- **Beta Features:** Opt into experimental features

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+Shift+Space` | Quick Ask (summon from anywhere) |

---

### Navigation

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+N` | New conversation |
| `Cmd/Ctrl+K` | Search conversations |
| `Cmd/Ctrl+,` | Open settings |
| `Cmd/Ctrl+\` | Toggle sidebar |
| `Cmd/Ctrl+[` | Previous conversation |
| `Cmd/Ctrl+]` | Next conversation |

---

### Message Actions

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Cmd/Ctrl+Enter` | Send (alternative) |
| `↑` (in empty input) | Edit last message |
| `Esc` | Cancel streaming |
| `Cmd/Ctrl+/` | Focus input field |

---

### Conversation Actions

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+P` | Pin/unpin conversation |
| `Cmd/Ctrl+Backspace` | Delete conversation |
| `Cmd/Ctrl+E` | Export as Markdown |

---

## Tips & Tricks

### 1. Quick Ask from Anywhere

Set up the global hotkey (`Cmd+Shift+Space`) to summon Moltz instantly:

1. Press hotkey while in any app
2. Moltz appears in front
3. Type your question
4. Press `Enter`
5. Moltz stays on top until you dismiss it

**Perfect for:**
- Quick questions while coding
- Checking facts while writing
- Getting code snippets without context switching

---

### 2. Multi-line Editing

Compose complex prompts:

1. Type first line
2. Press `Shift+Enter` for new line
3. Continue typing
4. Press `Enter` to send

**Example:**
```
Please explain:
1. How React hooks work
2. When to use useEffect
3. Common pitfalls
```

---

### 3. Code Block Language Hints

Help the AI understand code context:

**Instead of:**
```
function hello() { }
```

**Do this:**
```javascript
function hello() { }
```

The AI knows it's JavaScript and responds accordingly.

---

### 4. Pinning Important Conversations

Keep frequently-used conversations accessible:

- Pin onboarding docs conversation
- Pin daily journal conversation
- Pin project-specific research

**Pinned = always at top of sidebar**

---

### 5. Export for Documentation

Generate documentation from AI conversations:

1. Have AI write tutorial/docs
2. Export as Markdown
3. Copy into your project's docs folder
4. Edit as needed

**Pro tip:** Use this to create README files, API docs, or tutorial content. The AI can write in your project's style if you give it examples.

---

## Troubleshooting

Running into issues? Check these common solutions:

- **Connection problems:** [Troubleshooting → Connection](./Troubleshooting.md#connection-issues)
- **App feels slow:** [Troubleshooting → Performance](./Troubleshooting.md#performance-issues)
- **Lost conversations:** [Troubleshooting → Data Recovery](./Troubleshooting.md#data--storage-issues)
- **Keyboard shortcuts not working:** [Troubleshooting → Platform Issues](./Troubleshooting.md#platform-specific-issues)

---

## Need Help?

**Can't find what you're looking for?**
- **Quick answers:** [Troubleshooting → FAQ](./Troubleshooting.md#faq)
- **Report bugs:** [GitHub Issues](https://github.com/AlixHQ/moltz/issues)
- **Ask questions:** [GitHub Discussions](https://github.com/AlixHQ/moltz/discussions)
- **Security issues:** Email security@alix.com (don't post publicly)

---

**Next Steps:**
- **[Configuration Guide](./Configuration.md)** — Customize every aspect of Moltz
- **[Features](./Features.md)** — Discover what else Moltz can do
- **[Keyboard Shortcuts Cheatsheet](#keyboard-shortcuts)** — Become a power user
