# Moltz Features

Complete list of Moltz features with implementation status.

---

## Legend

- ✅ **Implemented** — Available in current release
- 🚧 **In Progress** — Actively being developed
- 📋 **Planned** — On the roadmap
- 💡 **Proposed** — Under consideration

---

## Core Features

### Conversations

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Create conversations | ✅ | Start new AI conversations | 1.0.0 |
| Delete conversations | ✅ | Remove conversations permanently | 1.0.0 |
| Rename conversations | ✅ | Custom titles | 1.0.0 |
| Auto-title generation | ✅ | AI-generated titles from first message | 1.0.0 |
| Pin conversations | ✅ | Keep important conversations at top | 1.0.0 |
| Conversation search | ✅ | Full-text search across all messages | 1.0.0 |
| Export as Markdown | ✅ | Save conversations to .md files | 1.0.0 |
| Conversation folders | 📋 | Organize conversations | TBD |
| Conversation tags | 📋 | Tag for categorization | TBD |
| Shared conversations | 📋 | Team collaboration (Team Mode) | Q2 2025 |

---

### Messaging

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Text messages | ✅ | Standard chat messages | 1.0.0 |
| Streaming responses | ✅ | Real-time AI response streaming | 1.0.0 |
| Markdown rendering | ✅ | Full markdown support | 1.0.0 |
| Code syntax highlighting | ✅ | 100+ languages supported | 1.0.0 |
| Copy code blocks | ✅ | One-click copy button | 1.0.0 |
| Edit messages | ✅ | Edit your own messages | 1.0.0 |
| Regenerate responses | ✅ | Get different AI response | 1.0.0 |
| Cancel streaming | ✅ | Stop mid-response | 1.0.0 |
| Multi-line input | ✅ | Shift+Enter for new lines | 1.0.0 |
| File attachments | ✅ | Images, PDFs, code files (10 MB limit) | 1.0.0 |
| Image preview | ✅ | Inline image display | 1.0.0 |
| Message reactions | 📋 | React to messages with emoji | TBD |
| Voice input | 📋 | Speech-to-text | Q2 2025 |
| Voice output | 📋 | Text-to-speech for responses | Q2 2025 |
| Image attachments in responses | 📋 | AI-generated images | TBD |

---

### User Interface

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Light/Dark themes | ✅ | System-aware themes | 1.0.0 |
| Sidebar navigation | ✅ | Conversation list sidebar | 1.0.0 |
| Collapsible sidebar | ✅ | Toggle with Cmd+\ | 1.0.0 |
| Message virtualization | ✅ | Smooth scroll with 1000+ messages | 1.0.0 |
| Global search dialog | ✅ | Cmd+K quick search | 1.0.0 |
| Settings dialog | ✅ | Comprehensive settings UI | 1.0.0 |
| Onboarding flow | ✅ | First-run setup wizard | 1.0.0 |
| Tooltips | ✅ | Helpful UI hints | 1.0.0 |
| Accessibility support | ✅ | ARIA labels, keyboard navigation | 1.0.0 |
| Reduced motion support | ✅ | Respects prefers-reduced-motion | 1.0.0 |
| High contrast mode | ✅ | Respects prefers-contrast | 1.0.0 |
| Custom themes | 📋 | User-defined color schemes | TBD |
| Compact mode | 📋 | Denser UI for power users | TBD |
| Multi-window support | 💡 | Multiple conversation windows | TBD |

---

### Performance

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Fast app launch | ✅ | < 2 second startup | 1.0.0 |
| Smooth scrolling | ✅ | 60 FPS with 1000+ messages | 1.0.0 |
| Code splitting | ✅ | Lazy-load heavy components | 1.0.0 |
| Markdown memoization | ✅ | Cached rendering | 1.0.0 |
| Debounced persistence | ✅ | Efficient database writes | 1.0.0 |
| Memory optimization | ✅ | < 300 MB typical usage | 1.0.0 |
| Low battery mode | 📋 | Reduce CPU usage on battery | TBD |

---

### System Integration

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Global hotkey | ✅ | Quick Ask from anywhere | 1.0.0 |
| System tray icon | ✅ | Background operation | 1.0.0 |
| Native menus | ✅ | Standard menu bar | 1.0.0 |
| Notifications | ✅ | System notifications | 1.0.0 |
| Auto-update | ✅ | Seamless background updates | 1.0.0 |
| macOS Keychain integration | ✅ | Secure token storage | 1.0.0 |
| Windows Credential Manager | ✅ | Secure token storage | 1.0.0 |
| Linux Secret Service | ✅ | Secure token storage | 1.0.0 |
| Deep linking | 📋 | moltz:// URL scheme | Q1 2025 |
| Share extension | 📋 | macOS/iOS share sheet | Q2 2025 |
| Spotlight/Windows Search | 📋 | Index conversations | TBD |

---

## Data & Security

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Local storage | ✅ | IndexedDB on device | 1.0.0 |
| AES-256 encryption | ✅ | Encrypted messages at rest | 1.0.0 |
| System keychain integration | ✅ | Secure key storage | 1.0.0 |
| TLS required for remote | ✅ | Enforced wss:// for remote Gateway | 1.0.0 |
| Export all data | ✅ | JSON export for backup | 1.0.0 |
| Import data | 📋 | Restore from backup | Q1 2025 |
| Cloud sync | 📋 | Sync across devices | Q2 2025 |
| End-to-end encryption (team) | 📋 | Zero-knowledge sync | Q3 2025 |
| GDPR compliance tools | 📋 | Data deletion, export | Q2 2025 |

---

## Gateway Connection

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| WebSocket connection | ✅ | Persistent bidirectional connection | 1.0.0 |
| Auto-reconnect | ✅ | Exponential backoff | 1.0.0 |
| Connection status indicator | ✅ | Visual connection state | 1.0.0 |
| Connection test | ✅ | Verify before saving | 1.0.0 |
| Version compatibility check | ✅ | Protocol version validation | 1.0.0 |
| Activity indicators | 🚧 | Show tool execution progress | Q1 2025 |
| Multiple Gateway profiles | 📋 | Switch between Gateways | Q2 2025 |
| Gateway discovery | 📋 | Auto-detect local Gateway | Q1 2025 |
| Tailscale optimization | ✅ | IPv4-only for Tailscale | 1.0.0 |

---

## AI Features

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Streaming responses | ✅ | Real-time text generation | 1.0.0 |
| Model selection | 📋 | Switch AI models | Q1 2025 |
| System prompts | 📋 | Custom per-conversation instructions | Q1 2025 |
| Temperature control | 📋 | Adjust response creativity | Q1 2025 |
| Max tokens control | 📋 | Limit response length | Q1 2025 |
| Stop sequences | 📋 | Custom stopping points | TBD |
| Function calling | 📋 | Tool execution display | Q1 2025 |
| Multi-turn context | ✅ | Full conversation history | 1.0.0 |
| Token usage tracking | 📋 | Cost estimation | Q2 2025 |
| Conversation branching | 📋 | Explore alternative paths | TBD |

---

## Developer Features

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Developer console | ✅ | Cmd+Shift+I for DevTools | 1.0.0 |
| Verbose logging | ✅ | Debug connection issues | 1.0.0 |
| Performance profiling | ✅ | React DevTools support | 1.0.0 |
| E2E testing | ✅ | Playwright test suite | 1.0.0 |
| Visual regression testing | ✅ | Screenshot comparisons | 1.0.0 |
| Unit testing | ✅ | Vitest coverage | 1.0.0 |
| Hot reload | ✅ | Fast development iteration | 1.0.0 |
| TypeScript strict mode | ✅ | Type safety | 1.0.0 |
| ESLint + Prettier | ✅ | Code quality | 1.0.0 |
| GitHub Actions CI/CD | ✅ | Automated builds | 1.0.0 |

---

## Platform Support

### Desktop

| Platform | Status | Notes |
|----------|--------|-------|
| macOS (Apple Silicon) | ✅ | macOS 11+ |
| macOS (Intel) | ✅ | macOS 11+ |
| Windows 10/11 (x64) | ✅ | 64-bit only |
| Linux (Debian/Ubuntu) | ✅ | .deb packages |
| Linux (Fedora/RHEL) | ✅ | .rpm packages |
| Linux (AppImage) | ✅ | Universal binary |

### Mobile (Future)

| Platform | Status | Notes |
|----------|--------|-------|
| iOS | 💡 | Proposed Q3 2025 |
| Android | 💡 | Proposed Q3 2025 |

---

## Keyboard Shortcuts

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Global Quick Ask | ✅ | Cmd+Shift+Space | 1.0.0 |
| New conversation | ✅ | Cmd/Ctrl+N | 1.0.0 |
| Search | ✅ | Cmd/Ctrl+K | 1.0.0 |
| Settings | ✅ | Cmd/Ctrl+, | 1.0.0 |
| Toggle sidebar | ✅ | Cmd/Ctrl+\ | 1.0.0 |
| Navigation shortcuts | ✅ | Cmd/Ctrl+[ and ] | 1.0.0 |
| Customizable shortcuts | 📋 | User-defined bindings | Q2 2025 |
| Vim mode | 💡 | Vim-style navigation | TBD |

---

## Accessibility

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| ARIA labels | ✅ | Screen reader support | 1.0.0 |
| Keyboard navigation | ✅ | Full keyboard access | 1.0.0 |
| Focus indicators | ✅ | Visible focus outlines | 1.0.0 |
| Reduced motion | ✅ | Respects OS preference | 1.0.0 |
| High contrast | ✅ | Improved visibility | 1.0.0 |
| Font size scaling | ✅ | 12-20px range | 1.0.0 |
| Screen reader optimization | 📋 | Enhanced announcements | Q2 2025 |
| Voice control support | 📋 | macOS Voice Control | TBD |

---

## Team/Enterprise Features (Future)

These features require **Moltz Backend** (Team Mode):

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Organization workspaces | 📋 | Multi-tenant support | Q2 2025 |
| Role-based access control | 📋 | Owner, Admin, Member, Guest | Q2 2025 |
| Shared conversation rooms | 📋 | Team collaboration | Q2 2025 |
| Audit logs | 📋 | Compliance tracking | Q2 2025 |
| Usage analytics | 📋 | Organization insights | Q2 2025 |
| Single Sign-On (SSO) | 📋 | SAML, OAuth | Q3 2025 |
| Custom branding | 📋 | White-label options | Q3 2025 |
| Dedicated deployment | 📋 | On-premise installations | Q3 2025 |

---

## Integrations (Future)

| Integration | Status | Description | Version |
|------------|--------|-------------|---------|
| Slack | 💡 | Send to Slack channels | TBD |
| Notion | 💡 | Export to Notion pages | TBD |
| GitHub | 💡 | Create issues, PRs | TBD |
| Google Drive | 💡 | Save exports | TBD |
| Zapier | 💡 | Connect to 5000+ apps | TBD |

---

## Internationalization

| Language | Status | Translator | Version |
|----------|--------|-----------|---------|
| English | ✅ | Native | 1.0.0 |
| French | 📋 | Needed | TBD |
| German | 📋 | Needed | TBD |
| Spanish | 📋 | Needed | TBD |
| Japanese | 📋 | Needed | TBD |
| Chinese (Simplified) | 📋 | Needed | TBD |

**Want to help translate?** See [Contributing Guide](./Contributing.md#translations)

---

## Analytics & Insights (Privacy-Friendly)

| Feature | Status | Description | Version |
|---------|--------|-------------|---------|
| Local usage stats | 📋 | Messages sent, tokens used | Q2 2025 |
| Conversation insights | 📋 | Topics, trends | Q2 2025 |
| Model comparison | 📋 | Compare model performance | Q2 2025 |
| Export statistics | 📋 | CSV export | Q2 2025 |

**Privacy:** All analytics are local-only. No data sent to external servers.

---

## Feature Requests

Have an idea? We'd love to hear it!

1. Check [GitHub Issues](https://github.com/AlixHQ/moltz/issues) for existing requests
2. If not found, [open a feature request](https://github.com/AlixHQ/moltz/issues/new?template=feature_request.md)
3. Vote with 👍 on issues you want

Popular requests get prioritized!

---

## Related Documentation

- **[Roadmap](./Roadmap.md)** — Detailed feature timeline
- **[Changelog](./Changelog.md)** — What's new in each version
- **[User Guide](./User-Guide.md)** — How to use existing features

---

**Last updated:** January 2025

