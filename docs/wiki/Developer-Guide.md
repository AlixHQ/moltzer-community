# Developer Guide

Guide for contributing to Moltz development.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Building from Source](#building-from-source)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Code Style](#code-style)
7. [Debugging](#debugging)
8. [Release Process](#release-process)

---

## Development Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **npm** | 9+ | Package manager |
| **Rust** | 1.70+ | Tauri backend |
| **Git** | 2.x | Version control |

**Optional:**
- **VS Code** — Recommended editor
- **Tauri CLI** — `npm install -g @tauri-apps/cli`

---

### Clone Repository

```bash
git clone https://github.com/AlixHQ/moltz.git
cd moltz
```

---

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Rust dependencies (automatic)
cd src-tauri
cargo fetch
cd ..
```

---

### Install OpenClaw Gateway

For local development, you need a Gateway instance:

```bash
npm install -g OpenClaw
OpenClaw setup
OpenClaw start
```

**Default Gateway URL:** `ws://localhost:18789`

---

## Project Structure

```
moltz/
├── src/                  # React frontend
│   ├── components/       # React components
│   │   ├── ChatView.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ...
│   ├── stores/           # Zustand stores
│   │   └── store.ts
│   ├── lib/              # Utilities
│   │   ├── db.ts         # Dexie database
│   │   ├── encryption.ts # AES encryption
│   │   └── ...
│   ├── App.tsx           # Root component
│   └── main.tsx          # React entry point
│
├── src-tauri/            # Rust backend
│   ├── src/
│   │   ├── main.rs       # Tauri app setup
│   │   ├── gateway.rs    # Gateway WebSocket handler
│   │   └── lib.rs        # Library exports
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
│
├── docs/                 # Documentation
│   └── wiki/             # This wiki
│
├── e2e/                  # End-to-end tests
│   └── *.spec.ts         # Playwright tests
│
├── scripts/              # Build scripts
│
├── package.json          # Node dependencies
├── vite.config.ts        # Vite configuration
└── README.md             # Project README
```

---

## Building from Source

### Development Build

Run with hot reload:

```bash
npm run dev
```

**Or using Tauri CLI:**
```bash
cargo tauri dev
```

**Opens:** App window with DevTools enabled

---

### Production Build

Build for your platform:

```bash
npm run tauri build
```

**Output:**
- macOS: `src-tauri/target/release/bundle/dmg/Moltz_1.0.0_aarch64.dmg`
- Windows: `src-tauri/target/release/bundle/msi/Moltz_1.0.0_x64_en-US.msi`
- Linux: `src-tauri/target/release/bundle/deb/moltz_1.0.0_amd64.deb`

---

### Build for All Platforms

**Using GitHub Actions:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

**Triggers:** CI/CD builds for macOS, Windows, Linux

**Artifacts:** Uploaded to GitHub Releases

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/my-new-feature
```

**Branch naming:**
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation
- `refactor/` — Code refactoring

---

### 2. Make Changes

**Frontend (React):**
- Components: `src/components/`
- Stores: `src/stores/`
- Styles: `src/index.css` (Tailwind)

**Backend (Rust):**
- Commands: `src-tauri/src/main.rs`
- Gateway: `src-tauri/src/gateway.rs`

---

### 3. Test Changes

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint

# Format code
npm run format
```

---

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit message format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Code style (formatting)
- `refactor:` — Code refactoring
- `test:` — Tests
- `chore:` — Maintenance

---

### 5. Push and Create PR

```bash
git push origin feature/my-new-feature
```

**GitHub:** Create Pull Request with description

---

## Testing

### Unit Tests (Vitest)

**Run tests:**
```bash
npm test
```

**Run with coverage:**
```bash
npm run test:coverage
```

**Test file location:**
- `src/**/*.test.ts` — Frontend tests
- `src-tauri/src/**/*.rs` — Rust tests (use `#[cfg(test)]`)

**Example test:**
```typescript
// src/lib/encryption.test.ts
import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './encryption';

describe('encryption', () => {
  it('should encrypt and decrypt', async () => {
    const plaintext = 'Hello, World!';
    const encrypted = await encrypt(plaintext);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });
});
```

---

### E2E Tests (Playwright)

**Run E2E tests:**
```bash
npm run test:e2e
```

**Run in headed mode:**
```bash
npm run test:e2e -- --headed
```

**Debug mode:**
```bash
npm run test:e2e -- --debug
```

**Test file location:** `e2e/*.spec.ts`

**Example E2E test:**
```typescript
// e2e/basic-flow.spec.ts
import { test, expect } from '@playwright/test';

test('send message', async ({ page }) => {
  await page.goto('http://localhost:1420');
  
  // Type message
  await page.fill('[data-testid="message-input"]', 'Hello!');
  await page.click('[data-testid="send-button"]');
  
  // Wait for response
  await expect(page.locator('.message-assistant')).toBeVisible();
});
```

---

### Visual Regression Tests

**Capture screenshots:**
```bash
npm run test:e2e:visual
```

**Compare with baseline:**
- Screenshots saved to `e2e/screenshots/`
- Diffs highlighted in test output

---

## Code Style

### TypeScript

**ESLint + Prettier:**
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

**Rules:**
- Use TypeScript strict mode
- Prefer `const` over `let`
- Use functional components (React)
- Use `useCallback` and `useMemo` for performance
- Avoid `any` type (use `unknown` or proper types)

**Example:**
```typescript
// ❌ Bad
const MyComponent = (props: any) => {
  const handleClick = () => { ... }
  return <button onClick={handleClick}>Click</button>;
};

// ✅ Good
interface MyComponentProps {
  onClick: () => void;
}

export const MyComponent = memo(function MyComponent({ onClick }: MyComponentProps) {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);
  
  return <button onClick={handleClick}>Click</button>;
});
```

---

### Rust

**Rustfmt + Clippy:**
```bash
cd src-tauri
cargo fmt          # Format code
cargo clippy       # Lint code
```

**Rules:**
- Follow Rust API guidelines
- Use `Result<T, E>` for errors
- Prefer iterators over loops
- Use `#[must_use]` on return values
- Document public APIs with `///`

**Example:**
```rust
/// Sends a message to the Gateway.
///
/// # Errors
/// Returns `Err` if connection is not established.
#[tauri::command]
pub async fn send_message(
    state: State<'_, GatewayState>,
    content: String,
) -> Result<String, String> {
    // Implementation
}
```

---

### CSS (Tailwind)

**Conventions:**
- Use Tailwind utility classes
- Avoid custom CSS when possible
- Group related utilities
- Use `@apply` for repeated patterns

**Example:**
```tsx
// ✅ Good
<div className="flex flex-col gap-4 p-6 rounded-lg bg-white dark:bg-gray-800">
  ...
</div>

// ❌ Avoid inline styles
<div style={{ display: 'flex', gap: '1rem' }}>
```

---

## Debugging

### Frontend Debugging

**Open DevTools:**
- Development: `Cmd+Shift+I` (macOS) / `Ctrl+Shift+I` (Windows/Linux)
- Production: Disabled (enable with `--dev` flag)

**React DevTools:**
- Install browser extension
- Use Profiler to identify slow components

**Console Logging:**
```typescript
console.log('[Debug]', variable);
console.warn('[Warning]', message);
console.error('[Error]', error);
```

**Zustand DevTools:**
```typescript
// src/stores/store.ts
import { devtools } from 'zustand/middleware';

export const useStore = create(devtools((set, get) => ({
  // ... store implementation
})));
```

---

### Backend Debugging

**Rust Logging:**
```rust
use log::{info, warn, error, debug};

info!("Connection established");
warn!("Reconnecting...");
error!("Connection failed: {}", err);
debug!("Received message: {:?}", msg);
```

**View logs:**
- Development: Console output
- Production: Log files in app data directory

**Rust Debugger:**
```bash
# VS Code with rust-analyzer extension
# Set breakpoints in .rs files
# Run: "Debug Tauri" configuration
```

---

### Network Debugging

**Inspect WebSocket traffic:**

**Chrome DevTools:**
1. Open DevTools
2. Network tab → WS filter
3. Click WebSocket connection
4. View Messages tab

**Wireshark:**
```bash
# Capture WebSocket traffic
wireshark -i lo0 -f "tcp port 18789"
```

---

## Release Process

### Version Bumping

**1. Update version in:**
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

**2. Update CHANGELOG.md:**
```markdown
## [1.1.0] - 2026-02-01

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix A
- Bug fix B

### Changed
- Improvement C
```

**3. Commit:**
```bash
git add .
git commit -m "chore: bump version to 1.1.0"
git tag v1.1.0
git push origin main --tags
```

---

### Building Release

**GitHub Actions automatically:**
1. Builds for all platforms
2. Creates GitHub Release
3. Uploads artifacts
4. Generates release notes

**Manual release:**
```bash
# Build locally
npm run tauri build

# Sign (macOS/Windows)
# See docs/SETUP_SIGNING.md

# Upload to GitHub Releases
gh release create v1.1.0 \
  src-tauri/target/release/bundle/dmg/*.dmg \
  src-tauri/target/release/bundle/msi/*.msi
```

---

### Auto-Update

**Tauri Updater:**
- Checks for updates every 24 hours
- Downloads in background
- Installs on app restart

**Update JSON format:**
```json
{
  "version": "1.1.0",
  "notes": "New features and bug fixes",
  "pub_date": "2026-02-01T00:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "...",
      "url": "https://github.com/.../Moltz_1.1.0_aarch64.dmg"
    }
  }
}
```

**See:** [docs/UPDATER.md](../../docs/UPDATER.md)

---

## Performance Profiling

### React Profiler

```tsx
import { Profiler } from 'react';

<Profiler id="ChatView" onRender={(id, phase, actualDuration) => {
  console.log(`${id} took ${actualDuration}ms`);
}}>
  <ChatView />
</Profiler>
```

---

### Lighthouse

```bash
npm run dev
# Open Chrome → http://localhost:1420
# DevTools → Lighthouse → Analyze
```

**Target scores:**
- Performance: > 95
- Accessibility: > 95
- Best Practices: > 95

---

### Rust Profiling

**Flamegraph:**
```bash
cargo install flamegraph
cargo flamegraph --bin moltz
```

---

## Common Issues

### "WebSocket connection failed"

**Cause:** Gateway not running.

**Solution:**
```bash
OpenClaw start
```

---

### "Rust compilation failed"

**Cause:** Missing system dependencies.

**macOS:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

---

### "npm install fails"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build frontend only |
| `npm run tauri dev` | Run Tauri app in dev mode |
| `npm run tauri build` | Build production app |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint` | Check code style |
| `npm run format` | Format code |
| `cargo check` | Check Rust code |
| `cargo build` | Build Rust code |
| `cargo test` | Run Rust tests |

---

## Resources

### Documentation
- [Tauri Docs](https://tauri.app/v2/)
- [React Docs](https://react.dev/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Tailwind Docs](https://tailwindcss.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Rust Analyzer](https://rust-analyzer.github.io/)
- [Tauri Studio](https://tauri.studio/)

---

## Related Documentation

- **[Contributing](./Contributing.md)** — Contribution guidelines
- **[Architecture](./Architecture.md)** — System architecture
- **[Testing Guide](../../TESTING_GUIDE.md)** — Detailed testing instructions

---

**Last updated:** January 2026
