# User Guide

How to actually use Moltz day-to-day.

---

## Quick Reference

**Just installed?** Start with [Getting Started](./Getting-Started.md).

**Looking for a specific feature?** Use `Cmd+F` to search this page or check the [Features list](./Features.md).

**Something broken?** [Troubleshooting](./Troubleshooting.md) has fixes.

---

## Common Workflows

### "I want to ask a quick question without leaving my current app"

**Use the global hotkey:**

1. Press `Cmd+Shift+Space` (macOS) or `Ctrl+Shift+Space` (Windows/Linux)
2. Moltz pops up over your current window
3. Type your question
4. Get answer
5. Press `Esc` to dismiss

**Perfect for:**
- "What's the syntax for array.filter() in JavaScript?" while coding
- "Convert 1500 calories to kilojoules" while meal planning
- "What year did The Matrix come out?" during an argument

**Change the hotkey:** Settings → Keyboard Shortcuts → Quick Ask

---

### "I want to analyze a file"

**Attach it to your message:**

1. Click 📎 in the message input (or drag-and-drop)
2. Select file (up to 10 MB)
3. File preview appears
4. Type your question: "What's wrong with this code?"
5. Send

**Works with:**
- Images (screenshots, photos, diagrams)
- PDFs (research papers, contracts)
- Code files (.py, .js, .ts, .rs, etc.)
- Text files (.txt, .md, .json, .csv)

**Doesn't work with:**
- Videos (yet - coming soon)
- Audio files (yet - coming soon)
- Huge files (> 10 MB - compress first)

---

### "I want to save this conversation for later"

**Pin it:**

1. Right-click the conversation in sidebar
2. Select "Pin to top"
3. It stays at the top (with 📌 icon)

**Pins are perfect for:**
- Ongoing projects ("Website redesign notes")
- Reference material ("Git commands cheatsheet")
- Daily journals ("Today's journal")

**Unpin:** Right-click → "Unpin"

---

### "I want to find something I asked weeks ago"

**Search is your friend:**

Press `Cmd+K` (Ctrl+K on Windows/Linux) and type keywords.

**Search tips:**
- **Specific words:** `"exact phrase"` for exact matches
- **Exclude:** `-word` to exclude a term
- **Recent:** Sort by date to find recent conversations

**Example searches:**
- `python async` - Finds conversations about Python async
- `"import pandas"` - Finds exact code snippets
- `typescript -javascript` - TypeScript stuff, but not JavaScript

---

### "I want to copy code without extra formatting"

**Use the copy button:**

Every code block has a **Copy** button in the top-right corner.

Click it → code is copied → paste wherever you need it.

**No more:**
- Accidentally copying line numbers
- Dealing with weird formatting
- Triple-clicking and hoping for the best

---

### "The AI misunderstood me, I want to rephrase"

**Edit your last message:**

1. Press `↑` arrow (in empty input field)
2. Your last message appears in the input
3. Edit it
4. Press `Enter`

**What happens:**
- Your message updates
- All responses after it are deleted
- Conversation continues from your edited message

**Use when:**
- You made a typo
- You forgot to mention something important
- You want to try a different phrasing

---

### "I don't like this AI response, give me another"

**Regenerate:**

1. Hover over the AI's message
2. Click 🔄 Regenerate button
3. Get a new response

**Different each time:**
- Different wording
- Different examples
- Sometimes even different approaches

**Keep regenerating until you get what you want.**

---

### "I'm done with this conversation, start fresh"

**Create a new conversation:**

- Press `Cmd/Ctrl+N`
- Or click **+ New** in the sidebar

**Why start fresh instead of continuing?**
- Keeps conversations focused (easier to find later)
- Better AI performance (doesn't have to remember unrelated context)
- Cleaner organization

**Good rule of thumb:** New topic = new conversation.

---

## Keyboard Shortcuts That Actually Matter

Most keyboard shortcuts are obvious (`Cmd+N` = new conversation). Here are the ones that'll actually change how you use Moltz:

### `Cmd/Ctrl+Shift+Space` - Summon from Anywhere

This is THE killer feature. Press it once, you'll use it 20 times a day.

### `Cmd/Ctrl+K` - Search Everything

Fastest way to find old conversations. Forget the name? Just search keywords.

### `↑` Arrow - Edit Last Message

Don't retype. Just fix what you meant to say.

### `Shift+Enter` - New Line

Write multi-paragraph messages without accidentally sending.

### `Esc` - Stop Generation

AI going off on a tangent? Stop it mid-sentence.

**All shortcuts:** [Configuration → Keyboard Shortcuts](./Configuration.md#keyboard-shortcuts)

---

## Power User Tips

### Conversations as Scratchpads

Create permanent conversations for:
- **Daily journal** - One conversation, add to it every day
- **Code snippets** - Your personal snippet library
- **Meeting notes** - One per recurring meeting
- **Learning notes** - "Things I learned today"

### Multi-line Messages for Complex Requests

Instead of:
> "Make a function that takes a list and returns unique items"

Try:
> "I need a Python function that:
> 1. Takes a list as input
> 2. Returns only unique items
> 3. Preserves original order
> 4. Has type hints"

Use `Shift+Enter` for line breaks. More detail = better results.

### Attach Screenshots of Errors

Instead of copying error text, take a screenshot:
1. Screenshot the error
2. Attach to Moltz
3. Ask "What's causing this?"

The AI can see:
- Line numbers
- Syntax highlighting
- Context around the error
- Your IDE/terminal

---

## Settings Worth Tweaking

Most settings are fine at defaults. These are worth changing:

### Theme (if auto-switching annoys you)

Settings → General → Theme

- **System** (default) - Follows macOS/Windows theme
- **Dark** - Always dark
- **Light** - Always light

### Font Size (if you have good/bad eyesight)

Settings → General → Font Size

- **12-13px** - More messages on screen
- **14-16px** - Default, comfortable
- **17-20px** - Easier on the eyes

### Quick Ask Hotkey (if it conflicts)

Settings → Keyboard Shortcuts → Quick Ask

Some apps use `Cmd+Shift+Space`. Change it to something else like `Cmd+Opt+Space`.

---

## Things That Don't Work (Yet)

**Voice input/output** - Coming Q2 2026  
**Multiple model selection** - Coming Q1 2026  
**Conversation folders** - On the roadmap  
**Cloud sync** - Coming Q2 2026 (optional, still local-first)

See [Roadmap](./Roadmap.md) for what's coming.

---

## When Something Goes Wrong

**App is slow?** [Performance guide](./Troubleshooting.md#performance-problems)

**Can't connect?** [Connection guide](./Troubleshooting.md#connection-problems)

**Lost data?** [Data recovery guide](./Troubleshooting.md#data-problems)

**Something else?** [Open an issue](https://github.com/AlixHQ/moltz/issues) - we're here to help.

---

## Advanced Features

### Custom System Prompts (Coming Soon)

Tell the AI how to behave:
- "You're a senior Python developer. Be concise."
- "Explain like I'm 5 years old."
- "Always respond in French."

**Status:** Coming in v1.1

### Conversation Branching (Future)

Explore alternative responses without losing your current thread.

**Status:** On the roadmap

---

## More Help

- **Full feature list:** [Features](./Features.md)
- **Settings explained:** [Configuration](./Configuration.md)
- **Keyboard shortcuts:** [Configuration → Shortcuts](./Configuration.md#keyboard-shortcuts)
- **Troubleshooting:** [Troubleshooting](./Troubleshooting.md)
- **Ask questions:** [GitHub Discussions](https://github.com/AlixHQ/moltz/discussions)

---

**Last updated:** January 2026
