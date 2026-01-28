# Moltz Roadmap

Product roadmap and feature timeline for Moltz.

---

## Vision

**Make AI chat as natural and accessible as any desktop app.**

Imagine an AI assistant that:
- **Appears instantly** when you need it (global hotkey)
- **Remembers context** across all your conversations
- **Works offline** when your internet cuts out
- **Respects your privacy** (encrypted, local-first storage)
- **Never costs you** per-message (just Gateway costs)
- **Integrates seamlessly** with your workflow

That's where we're going. We're building the AI chat app we wish existed.

**Moltz principles:**
- **Speed matters** — Native performance, not web wrappers
- **Privacy first** — Your data stays on your device
- **Open always** — Open-source, transparent, community-driven
- **User control** — You choose the model, the Gateway, the data
- **Desktop-native** — Built for keyboard shortcuts and power users

---

## Current Version: 1.0.0

**Status:** ✅ Released (January 2025)

### Core Features
- ✅ Native desktop app (Tauri + React)
- ✅ WebSocket connection to Gateway
- ✅ Real-time streaming responses
- ✅ Local encrypted storage (AES-256)
- ✅ Full-text conversation search
- ✅ Markdown rendering with syntax highlighting
- ✅ File attachments (images, PDFs, code)
- ✅ Global hotkey (Quick Ask)
- ✅ Auto-updates
- ✅ Dark/Light themes

**See:** [Features.md](./Features.md) for complete list

---

## Q1 2025 (Current Quarter)

**Focus:** Polish, Stability, Performance

### Planned Features

#### Activity Progress Indicators 🚧
**Status:** In Progress  
**Priority:** High  
**Impact:** Better UX transparency

Show real-time progress during AI operations:
- Tool execution (web search, file read)
- Extended thinking steps
- Sub-agent activity

**Design:** Implementation details being finalized.

---

#### Model Selection per Conversation
**Status:** Planned  
**Priority:** High  
**Impact:** Flexibility

Allow users to choose AI model:
- Claude Sonnet, Opus, Haiku
- GPT-4, GPT-4o, GPT-3.5
- Gemini Pro, Flash
- Local models (via Gateway)

**UI:** Dropdown in conversation header

---

#### System Prompts
**Status:** Planned  
**Priority:** Medium  
**Impact:** Customization

Set custom instructions per conversation:
- "You are a Python expert..."
- "Always respond in French"
- "Use bullet points for lists"

**UI:** Settings icon → System Prompt

---

#### Conversation Templates
**Status:** Planned  
**Priority:** Low  
**Impact:** Productivity

Save frequently-used prompts:
- Code review checklist
- Meeting summary format
- Debug session template

---

#### Gateway Auto-Discovery
**Status:** Planned  
**Priority:** Low  
**Impact:** Ease of setup

Automatically detect local Gateway:
- Scan common ports (18789, 8080)
- Check for mDNS broadcasts
- One-click connect

---

### Bug Fixes

- [ ] macOS window freeze on Ventura+ (in progress)
- [ ] Tailscale connection timeout (documented workaround)
- [ ] Memory leak in reconnection logic (fix planned)
- [ ] Search performance with 100K+ messages (optimization planned)

---

## Q2 2025 (April - June)

**Focus:** Team Features, Cloud Sync, Mobile

### Major Features

#### Team/Enterprise Mode 📋
**Status:** Design Phase  
**Priority:** High  
**Impact:** Enterprise adoption

Multi-user collaboration:
- Organization workspaces
- Shared conversation rooms
- Role-based access control (RBAC)
- Audit logging
- Usage analytics

**Architecture:** Moltz Backend (separate service)

**See:** [Architecture → Team Mode](./Architecture.md#team-architecture)

---

#### Cloud Sync (Optional) 📋
**Status:** Design Phase  
**Priority:** Medium  
**Impact:** Multi-device support

Sync conversations across devices:
- **End-to-end encrypted** (zero-knowledge)
- Optional (local-only still default)
- Choose sync provider (self-hosted, cloud)

**Privacy:** Moltz never sees unencrypted data

---

#### Voice Input/Output 📋
**Status:** Design Phase  
**Priority:** Medium  
**Impact:** Accessibility, UX

Voice features:
- Speech-to-text (Whisper API)
- Text-to-speech (ElevenLabs, Google TTS)
- Voice commands
- Hands-free mode

---

#### iOS/Android Apps (Beta) 💡
**Status:** Research Phase  
**Priority:** Medium  
**Impact:** Mobile access

Companion mobile apps:
- React Native or Flutter
- Read-only initially
- Full feature parity later
- Sync with desktop (via cloud sync)

---

### Performance

- [ ] IndexedDB → SQLite migration (for 100K+ messages)
- [ ] Web Worker for heavy computations
- [ ] Service Worker for offline support
- [ ] Advanced virtualization (variable heights)

---

## Q3 2025 (July - September)

**Focus:** Enterprise, Security, Integrations

### Major Features

#### SOC 2 Type II Certification 📋
**Status:** Planned  
**Priority:** High (Enterprise)  
**Impact:** Enterprise trust

Security certification for team deployments:
- Formal security audit
- Compliance documentation
- Annual renewal

---

#### Single Sign-On (SSO) 📋
**Status:** Planned  
**Priority:** High (Enterprise)  
**Impact:** Enterprise integration

Enterprise authentication:
- SAML 2.0
- OAuth 2.0 / OpenID Connect
- Azure AD, Okta, Google Workspace

---

#### Third-Party Integrations 💡
**Status:** Proposed  
**Priority:** Medium  
**Impact:** Workflow integration

Connect with other tools:
- Slack (send to channels)
- Notion (export conversations)
- GitHub (create issues/PRs)
- Google Drive (save exports)
- Zapier (5000+ apps)

---

#### Custom Branding (Enterprise) 📋
**Status:** Planned  
**Priority:** Low  
**Impact:** White-label options

Customize for organizations:
- Custom logo
- Custom colors
- Custom name
- Custom icon

---

## Q4 2025 (October - December)

**Focus:** Advanced Features, AI Capabilities

### Major Features

#### Conversation Branching 💡
**Status:** Proposed  
**Priority:** Medium  
**Impact:** Exploration

Explore alternative conversation paths:
- Branch from any message
- Compare responses from different models
- Merge insights back

---

#### Multi-Modal Support 💡
**Status:** Proposed  
**Priority:** Medium  
**Impact:** Richer interactions

Support more input/output types:
- AI-generated images (DALL-E, Midjourney)
- Video summaries
- Audio analysis
- PDF generation

---

#### Advanced Memory 💡
**Status:** Proposed  
**Priority:** Low  
**Impact:** Long-term context

Remember user preferences:
- Writing style
- Common topics
- Preferred formats
- Personalized responses

---

## Future (2027+)

### Long-Term Vision

#### Plugins System 💡
Allow community extensions:
- Custom tools
- Custom AI models
- Custom UI themes
- Custom integrations

---

#### Offline AI Models 💡
Run AI locally:
- Llama 3, Mistral
- GPU acceleration
- No internet required
- Full privacy

---

#### Collaborative Editing 💡
Real-time co-editing of conversations:
- Multiple users typing
- Live cursors
- Conflict resolution

---

## Legend

- ✅ **Completed** — Available now
- 🚧 **In Progress** — Actively being built
- 📋 **Planned** — Scheduled for development
- 💡 **Proposed** — Under consideration
- ⏸️ **On Hold** — Deferred

---

## Feature Requests

Want a feature not on this roadmap?

1. Check [existing requests](https://github.com/AlixHQ/moltz/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. [Open a feature request](https://github.com/AlixHQ/moltz/issues/new?template=feature_request.md)
3. Vote 👍 on issues you want

Popular requests get prioritized!

---

## Release Cadence

### Minor Releases (1.x)
- **Frequency:** Every 4-6 weeks
- **Content:** New features, improvements
- **Breaking changes:** No

### Patch Releases (1.x.y)
- **Frequency:** As needed (weekly if bugs found)
- **Content:** Bug fixes, small improvements
- **Breaking changes:** No

### Major Releases (x.0)
- **Frequency:** Once per year
- **Content:** Major features, architectural changes
- **Breaking changes:** Possible (with migration guide)

---

## Versioning

Moltz follows [Semantic Versioning](https://semver.org/):
- **1.0.0** — Initial release
- **1.1.0** — New features (backward compatible)
- **1.1.1** — Bug fixes (backward compatible)
- **2.0.0** — Breaking changes

---

## Priorities

### Always High Priority
- Security vulnerabilities
- Critical bugs (crashes, data loss)
- Performance degradation
- Accessibility issues

### Influences Priority
- User feedback and requests
- Enterprise needs (if pursuing Team Mode)
- Competition (feature parity with ChatGPT/Claude desktop)
- Technical debt (refactoring for maintainability)

---

## How We Decide

### Feature Selection Criteria

1. **Aligns with vision?** — Does it make Moltz better at its core mission?
2. **User demand?** — How many users want this?
3. **Feasibility?** — Can we build it well?
4. **Maintenance burden?** — Will it create technical debt?
5. **Competitive advantage?** — Does it differentiate us?

### Community Input

We consider:
- GitHub issue upvotes (👍)
- Discussion engagement
- User interviews
- Support ticket patterns

**Your voice matters!** Share feedback in [GitHub Discussions](https://github.com/AlixHQ/moltz/discussions).

---

## Roadmap Updates

This roadmap is updated quarterly and reflects our best estimates. Plans may change based on:
- User feedback
- Technical challenges
- Resource availability
- Market conditions

**Last updated:** January 2025  
**Next update:** April 2025

---

## Related Documentation

- **[Features](./Features.md)** — Current feature status
- **[Changelog](./Changelog.md)** — Version history
- **[Contributing](./Contributing.md)** — Help build features

---

**Questions about the roadmap?** Ask in [Discussions](https://github.com/AlixHQ/moltz/discussions)!

