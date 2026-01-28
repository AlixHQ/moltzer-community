# Changelog

All notable changes to Moltz will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-28

**Initial Release** 🎉

### Added

#### Core Features
- Native desktop app built with Tauri + React
- WebSocket connection to Clawdbot Gateway
- Real-time streaming AI responses
- Conversation management (create, delete, rename, pin)
- Full-text search across all conversations
- Message editing and regeneration
- Local encrypted storage (AES-256-GCM)
- File attachments (images, PDFs, code files up to 10 MB)

#### User Interface
- Dark/Light themes with system preference detection
- Sidebar with conversation list
- Message virtualization for smooth scrolling (1000+ messages)
- Markdown rendering with syntax highlighting (100+ languages)
- Global hotkey (Quick Ask: Cmd+Shift+Space)
- Settings dialog with comprehensive options
- Onboarding flow for first-time users

#### System Integration
- Auto-update system
- System tray/menu bar icon
- Native menus (macOS, Windows, Linux)
- System keychain integration for token storage
- Notifications support

#### Performance
- Code splitting for fast initial load
- React component memoization
- Debounced database writes
- Optimized markdown rendering
- Message virtualization (60 FPS with 1000+ messages)

#### Security
- AES-256-GCM encryption for messages at rest
- TLS required for remote connections
- Content sanitization (XSS protection)
- Token stored in OS keychain
- Code signing (macOS, Windows)

#### Accessibility
- Full keyboard navigation
- ARIA labels for screen readers
- Focus indicators
- Reduced motion support
- High contrast mode support

#### Platforms
- macOS 11+ (Apple Silicon and Intel)
- Windows 10/11 (64-bit)
- Linux (Debian, Ubuntu, Fedora, AppImage)

### Known Issues
- macOS + Tailscale: First connection may take 2-3 minutes (documented workaround)
- macOS Ventura: Occasional window freeze (fix in progress)
- Search performance degrades with > 100K messages (optimization planned)

---

## [Unreleased]

### Planned for 1.1.0

- Activity progress indicators (tool execution visibility)
- Model selection per conversation
- System prompts (custom instructions)
- Gateway auto-discovery
- Performance improvements for large databases

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| [1.0.0](#100---2026-01-28) | 2026-01-28 | Initial release |

---

## Migration Guides

### From Pre-1.0 Versions

**No migration needed** — This is the first public release.

---

## Breaking Changes

### 1.0.0

No breaking changes (initial release).

---

## Upgrade Instructions

### Automatic Updates (Recommended)

Moltz automatically checks for updates every 24 hours:
1. Update notification appears
2. Download happens in background
3. Install on next app restart

### Manual Updates

1. Download latest version from [GitHub Releases](https://github.com/AlixHQ/moltz/releases)
2. Install over existing version
3. Data is preserved (conversations, settings)

---

## Detailed Changelogs

### [1.0.0] - 2026-01-28

#### Frontend (React)

**Components:**
- Added `ChatView` component for conversation display
- Added `Sidebar` component with virtualized list
- Added `MessageBubble` component with memoization
- Added `MarkdownRenderer` with syntax highlighting
- Added `SearchDialog` with full-text search
- Added `SettingsDialog` with comprehensive options
- Added `OnboardingFlow` for first-time setup

**State Management:**
- Implemented Zustand store with slices
- Added persistence middleware for settings
- Optimized with shallow comparison for performance

**Database:**
- Implemented Dexie (IndexedDB) for local storage
- Added encryption layer (AES-256-GCM)
- Created indexes for fast queries
- Implemented search functionality

**Utilities:**
- Added encryption utilities (AES-256)
- Added WebSocket connection manager
- Added file attachment handling
- Added markdown sanitization

#### Backend (Rust)

**Gateway Integration:**
- Implemented WebSocket client (tokio-tungstenite)
- Added connection state machine
- Implemented reconnection logic with exponential backoff
- Added request/response routing
- Implemented streaming message handling

**Tauri Commands:**
- `connect()` — Establish Gateway connection
- `disconnect()` — Close connection
- `send_message()` — Send message to Gateway
- `test_connection()` — Verify Gateway reachability
- `get_connection_status()` — Get current state

**System Integration:**
- Global shortcut registration
- System tray/menu bar implementation
- Native notifications
- Auto-update configuration
- Keychain integration for token storage

#### Infrastructure

**Build System:**
- Vite configuration with code splitting
- Tauri configuration for all platforms
- GitHub Actions CI/CD pipeline
- Code signing setup (macOS, Windows)

**Testing:**
- Unit tests with Vitest
- E2E tests with Playwright
- Visual regression tests
- Coverage reporting

**Documentation:**
- Comprehensive wiki documentation
- Architecture diagrams (Mermaid)
- API reference
- User guide
- Developer guide
- Security documentation
- Performance benchmarks

#### Dependencies

**Frontend:**
- React 18.3.1
- Zustand 5.0.3
- Dexie 4.0.10
- TanStack Virtual 3.13.18
- Radix UI components
- Tailwind CSS 3.4.17

**Backend:**
- Tauri 2.2.0
- tokio 1.40+
- tokio-tungstenite 0.20+
- rustls (TLS support)
- serde (JSON serialization)

---

## Deprecation Notices

### None

No deprecations in this release.

---

## Security Updates

### 1.0.0

- Implemented AES-256-GCM encryption
- Added TLS enforcement for remote connections
- Integrated with OS keychains
- Content sanitization for XSS protection
- Code signing for trusted distribution

**Security Audit:** Completed January 2026 (see [Security.md](./Security.md))

---

## Performance Improvements

### 1.0.0

- Message virtualization: 15 FPS → 60 FPS (1000 messages)
- Component memoization: 90% fewer re-renders
- Code splitting: 450 KB → 150 KB initial bundle
- Markdown caching: 10x faster rendering
- Debounced writes: 60/sec → 2/sec

**See:** [Performance.md](./Performance.md) for benchmarks

---

## Accessibility Improvements

### 1.0.0

- Full keyboard navigation
- ARIA labels for all interactive elements
- Focus indicators
- Screen reader support
- Reduced motion support
- High contrast mode support

**WCAG 2.1 Level AA compliant**

---

## Bug Fixes

### 1.0.0

No bug fixes (initial release).

---

## Contributors

Special thanks to all contributors to this release:

- **Core Team:**
  - [David D.] — Project lead
  - [Documentation Agent] — Comprehensive documentation

- **Community Contributors:**
  - (Your name here! See [Contributing.md](./Contributing.md))

---

## Release Notes Format

Each release includes:

### Added
New features that have been added.

### Changed
Changes to existing functionality.

### Deprecated
Features that will be removed in future releases.

### Removed
Features that have been removed.

### Fixed
Bug fixes.

### Security
Security-related changes.

---

## How to Read This Changelog

- **[Version]** — Release version number
- **Date** — Release date (YYYY-MM-DD)
- **Section headers** — Type of change (Added, Fixed, etc.)
- **Breaking changes** — Marked with ⚠️ **BREAKING**

---

## Subscribe to Updates

Stay informed about new releases:

- **Watch** the [GitHub repository](https://github.com/AlixHQ/moltz)
- **Star** for updates in your GitHub feed
- **Follow** [@MoltzApp](https://twitter.com/MoltzApp) on Twitter
- **Join** our Discord (coming soon)

---

## Related Documentation

- **[Roadmap](./Roadmap.md)** — Planned features
- **[Features](./Features.md)** — Current feature status
- **[Migration Guides](./Migration-Guide.md)** — Upgrade instructions (coming soon)

---

**Last updated:** January 28, 2026
