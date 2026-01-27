# Contributing to Molt

Thank you for your interest in contributing to Molt! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in Molt a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers at conduct@molt.dev. All complaints will be reviewed and investigated promptly and fairly.

---

## Development Setup

### Prerequisites

**Required:**
- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- [Rust](https://rustup.rs/) (latest stable)
- [Git](https://git-scm.com/)

**Platform-specific:**

**macOS:**
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

**Windows:**
```powershell
# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Or download from:
# https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Linux (Fedora):**
```bash
sudo dnf install \
  webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/dokterdok/molt-client.git
cd molt-client

# Install dependencies
npm install

# Install Rust dependencies (happens automatically on first build)
# But you can verify Rust is set up:
rustc --version
cargo --version
```

### Running in Development

```bash
# Start development server with hot reload
npm run tauri dev

# This will:
# 1. Start Vite dev server (React frontend)
# 2. Compile Rust backend
# 3. Launch Molt in development mode
# 4. Auto-reload on file changes
```

**First run takes 2-5 minutes** (Rust compilation). Subsequent runs are ~10 seconds.

### Development Mode Features

- **Hot reload** — Frontend changes reload instantly
- **Rust recompile** — Backend changes trigger rebuild (slower)
- **DevTools** — Open with **⌘⌥I** (Mac) or **Ctrl+Shift+I** (Windows/Linux)
- **Detailed logging** — Console shows all Gateway messages and state changes

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Molt Client                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │            React Frontend (TypeScript)            │  │
│  │                                                   │  │
│  │  ┌─────────────┐  ┌──────────────┐              │  │
│  │  │  Components │  │    Stores    │              │  │
│  │  │   (UI)      │  │   (Zustand)  │              │  │
│  │  └──────┬──────┘  └──────┬───────┘              │  │
│  │         │                 │                       │  │
│  │         └────────┬────────┘                       │  │
│  │                  │                                │  │
│  │        ┌─────────▼──────────┐                    │  │
│  │        │  Persistence Layer  │                    │  │
│  │        │  (IndexedDB + AES)  │                    │  │
│  │        └─────────────────────┘                    │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │ Tauri IPC                        │
│  ┌──────────────────▼───────────────────────────────┐  │
│  │           Rust Backend (Tauri)                    │  │
│  │                                                   │  │
│  │  ┌──────────────┐  ┌───────────────┐            │  │
│  │  │   Gateway    │  │   Keychain    │            │  │
│  │  │  (WebSocket) │  │  (OS Storage) │            │  │
│  │  └──────────────┘  └───────────────┘            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ WebSocket
                     │
           ┌─────────▼──────────┐
           │ Clawdbot Gateway  │
           │  (External)       │
           └────────────────────┘
```

### Frontend Structure

```
src/
├── components/           # React components
│   ├── ChatView.tsx     # Main chat interface
│   ├── Sidebar.tsx      # Conversation list + search
│   ├── MessageBubble.tsx # Individual message display
│   ├── ChatInput.tsx    # Message input with attachments
│   ├── SettingsDialog.tsx # Settings UI
│   ├── SearchDialog.tsx  # Global search
│   ├── WelcomeView.tsx  # Empty state
│   ├── onboarding/      # First-run setup
│   │   └── OnboardingFlow.tsx
│   └── ui/              # Reusable UI primitives
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── switch.tsx
│       ├── tooltip.tsx
│       ├── toast.tsx
│       └── spinner.tsx
├── stores/              # State management
│   └── store.ts         # Zustand store (single source of truth)
├── lib/                 # Core utilities
│   ├── db.ts           # IndexedDB (Dexie)
│   ├── encryption.ts   # AES-GCM encryption
│   ├── persistence.ts  # Sync layer (store ↔ DB)
│   └── utils.ts        # Helpers (cn, formatters, etc.)
├── hooks/              # Custom React hooks
│   └── useToast.ts
├── App.tsx             # Root component
├── main.tsx            # React entry point
└── index.css           # Global styles (Tailwind)
```

### Backend Structure

```
src-tauri/
├── src/
│   ├── lib.rs          # Tauri app setup + command registration
│   ├── gateway.rs      # WebSocket client for Gateway
│   │                   # - Connection management
│   │                   # - Message handling
│   │                   # - Streaming support
│   └── keychain.rs     # OS keychain integration
│                       # - macOS Keychain
│                       # - Windows Credential Manager
│                       # - Linux Secret Service
├── Cargo.toml          # Rust dependencies
├── tauri.conf.json     # Tauri configuration
│                       # - Window settings
│                       # - Bundle config
│                       # - Permissions
└── icons/              # App icons (multiple sizes)
```

### Data Flow

**Sending a message:**
```
User types → ChatInput
  → store.addMessage() 
    → persistence.persistMessage() (encrypt + save to IndexedDB)
    → gateway.send_message() (Tauri command)
      → WebSocket to Gateway
        → AI response streams back
          → gateway:stream events
            → store.appendToCurrentMessage()
              → persistence.persistMessage() (debounced)
                → ChatView updates (React re-render)
```

**Loading conversations:**
```
App mounts
  → loadPersistedData() (from IndexedDB)
    → decrypt all conversations/messages
      → store.setState() (populate Zustand)
        → Sidebar + ChatView render
```

### Key Technologies

| Technology | Purpose | Why? |
|-----------|---------|------|
| **Tauri v2** | App framework | Rust backend + webview = tiny binaries, native speed |
| **React 18** | UI framework | Battle-tested, huge ecosystem, concurrent rendering |
| **TypeScript** | Type safety | Catch bugs at compile time, better DX |
| **Zustand** | State management | Simple, no boilerplate, performant |
| **Dexie** | IndexedDB wrapper | Easy async DB, full-text search, typed |
| **Tailwind CSS** | Styling | Utility-first, consistent design, fast iteration |
| **tokio-tungstenite** | WebSocket (Rust) | Async, production-ready, widely used |
| **keyring-rs** | Keychain (Rust) | Cross-platform credential storage |
| **Web Crypto API** | Encryption | Browser-native AES-GCM, no external deps |

---

## Code Style

### TypeScript/React

**Follow these conventions:**

```typescript
// Use functional components with hooks
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  const [state, setState] = useState(initialValue);
  
  // Event handlers prefixed with "handle"
  const handleClick = () => {
    setState(newValue);
  };
  
  return (
    <div className="container">
      {/* JSX here */}
    </div>
  );
}

// Props interface above component
interface MyComponentProps {
  prop1: string;
  prop2: number;
  onAction?: () => void; // Optional props use ?
}
```

**File naming:**
- Components: `PascalCase.tsx` (e.g., `ChatView.tsx`)
- Utilities: `camelCase.ts` (e.g., `encryption.ts`)
- Hooks: `use*.ts` (e.g., `useToast.ts`)

**Import order:**
```typescript
// 1. React
import { useState, useEffect } from "react";

// 2. External libraries
import { invoke } from "@tauri-apps/api/core";

// 3. Internal components
import { Button } from "./ui/button";

// 4. Internal utilities
import { cn } from "../lib/utils";

// 5. Types
import type { Message } from "../stores/store";
```

**Formatting:**
```bash
# Format all files
npm run format

# Lint and fix
npm run lint -- --fix
```

**Config files:**
- `.eslintrc.json` — ESLint rules
- `.prettierrc` — Prettier rules

### Rust

**Follow Rust conventions:**

```rust
// Use snake_case for functions and variables
pub async fn send_message(
    state: State<'_, GatewayState>,
    params: ChatParams,
) -> Result<String, String> {
    // Function body
}

// Use PascalCase for types
pub struct GatewayState {
    connected: RwLock<bool>,
    sender: Mutex<Option<mpsc::Sender<String>>>,
}

// Document public APIs
/// Send a chat message to the Gateway.
///
/// # Arguments
/// * `state` - The Gateway state
/// * `params` - Message parameters
///
/// # Returns
/// Request ID on success, error message on failure
pub async fn send_message(...) -> Result<String, String> {
    // ...
}
```

**Formatting:**
```bash
# Format Rust code
cargo fmt

# Lint
cargo clippy
```

### CSS/Tailwind

**Prefer Tailwind utilities:**
```tsx
// ✅ Good
<div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">

// ❌ Avoid custom CSS unless necessary
<div className="my-custom-button">
```

**Use `cn()` helper for conditional classes:**
```tsx
import { cn } from "@/lib/utils";

<button
  className={cn(
    "px-4 py-2 rounded-lg transition-colors",
    isActive && "bg-primary text-primary-foreground",
    disabled && "opacity-50 cursor-not-allowed"
  )}
/>
```

**Design tokens (in `index.css`):**
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

### Commit Messages

**Format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style (formatting, missing semicolons)
- `refactor:` — Code restructuring (no behavior change)
- `perf:` — Performance improvement
- `test:` — Adding/fixing tests
- `chore:` — Build process, dependencies, etc.

**Examples:**
```
feat(chat): add voice input support

Implements voice recording using Web Audio API.
Adds microphone permission request.

Closes #42

---

fix(gateway): handle reconnection race condition

Prevents multiple simultaneous reconnection attempts.

---

docs(readme): update installation instructions
```

---

## Making Changes

### Workflow

1. **Create a branch:**
   ```bash
   git checkout -b feature/my-awesome-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes:**
   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

3. **Test locally:**
   ```bash
   npm run tauri dev
   # Test your changes thoroughly
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push:**
   ```bash
   git push origin feature/my-awesome-feature
   ```

6. **Open Pull Request** (see [PR Process](#pull-request-process))

### Adding a New Feature

**Example: Adding a new UI component**

1. **Create component file:**
   ```typescript
   // src/components/MyFeature.tsx
   import { useState } from "react";
   import { cn } from "../lib/utils";
   
   export function MyFeature() {
     const [state, setState] = useState(false);
     
     return (
       <div className="my-feature">
         {/* Implementation */}
       </div>
     );
   }
   ```

2. **Add to parent component:**
   ```typescript
   // src/App.tsx
   import { MyFeature } from "./components/MyFeature";
   
   // Use it
   <MyFeature />
   ```

3. **Add styles if needed:**
   ```css
   /* src/index.css */
   .my-feature {
     /* Custom styles */
   }
   ```

4. **Update documentation:**
   ```markdown
   <!-- FEATURES.md -->
   ## My Feature
   
   Description of the feature...
   ```

### Adding a Backend Feature

**Example: Adding a new Tauri command**

1. **Define in Rust:**
   ```rust
   // src-tauri/src/lib.rs
   #[tauri::command]
   async fn my_new_command(param: String) -> Result<String, String> {
       // Implementation
       Ok("Success".to_string())
   }
   
   // Register in setup
   tauri::Builder::default()
       .invoke_handler(tauri::generate_handler![
           // ... existing commands
           my_new_command
       ])
   ```

2. **Call from frontend:**
   ```typescript
   // src/lib/myFeature.ts
   import { invoke } from "@tauri-apps/api/core";
   
   export async function callMyCommand(param: string): Promise<string> {
     return await invoke<string>("my_new_command", { param });
   }
   ```

3. **Add tests:**
   ```rust
   // src-tauri/src/lib.rs
   #[cfg(test)]
   mod tests {
       use super::*;
       
       #[tokio::test]
       async fn test_my_new_command() {
           let result = my_new_command("test".to_string()).await;
           assert!(result.is_ok());
       }
   }
   ```

---

## Testing

### Frontend Testing

**Run tests:**
```bash
npm test           # Run all tests
npm test -- --ui   # Run with UI
npm test -- --watch # Watch mode
```

**Write tests:**
```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
  
  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    screen.getByRole("button").click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

**Testing utilities:**
- `@testing-library/react` — Component testing
- `vitest` — Test runner (Jest-compatible)
- `jsdom` — DOM environment

### Backend Testing

**Run Rust tests:**
```bash
cd src-tauri
cargo test           # Run all tests
cargo test -- --nocapture  # Show println! output
```

**Example test:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_gateway_connection() {
        let state = GatewayState::default();
        // Test implementation
    }
}
```

### Manual Testing

**Before submitting PR:**

1. **Test on your platform:**
   - Run `npm run tauri dev`
   - Test all affected features
   - Check console for errors

2. **Test edge cases:**
   - Empty states
   - Error conditions
   - Long inputs
   - Network failures

3. **Test persistence:**
   - Restart app
   - Verify data persists
   - Check encryption/decryption

4. **Test UI:**
   - Dark/light themes
   - Different window sizes
   - Accessibility (keyboard navigation)

---

## Pull Request Process

### Before Opening PR

1. **Ensure tests pass:**
   ```bash
   npm test
   npm run lint
   ```

2. **Build successfully:**
   ```bash
   npm run build
   npm run tauri build
   ```

3. **Update documentation:**
   - README.md (if feature is user-facing)
   - FEATURES.md (for new features)
   - Code comments (for complex logic)

4. **Rebase on main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### Opening the PR

1. **Go to GitHub** and open a Pull Request

2. **Fill out the template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How have you tested these changes?
   
   ## Screenshots
   (if applicable)
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   ```

3. **Request review:**
   - Add reviewers (maintainers will be auto-assigned)
   - Link related issues (`Closes #123`)

### Review Process

**What happens:**
1. Automated checks run (lint, test, build)
2. Maintainer reviews code
3. You address feedback
4. Maintainer approves and merges

**Addressing feedback:**
```bash
# Make changes
git add .
git commit -m "Address review feedback"
git push origin feature/my-awesome-feature
```

**Merge requirements:**
- ✅ All checks pass
- ✅ At least 1 approval from maintainer
- ✅ No merge conflicts
- ✅ Up-to-date with main

---

## Release Process

### Version Numbering

Molt follows [Semantic Versioning](https://semver.org/):

- **Major (1.0.0):** Breaking changes
- **Minor (1.1.0):** New features (backward compatible)
- **Patch (1.0.1):** Bug fixes

### Creating a Release

**For maintainers:**

1. **Update version:**
   ```bash
   # Update package.json
   npm version minor # or major, patch
   
   # Update Cargo.toml manually
   # Update src-tauri/tauri.conf.json manually
   ```

2. **Update CHANGELOG.md:**
   ```markdown
   ## [1.1.0] - 2024-01-15
   
   ### Added
   - Voice input support
   - Export to PDF
   
   ### Fixed
   - Connection retry logic
   - Search highlighting
   ```

3. **Commit and tag:**
   ```bash
   git add .
   git commit -m "chore: release v1.1.0"
   git tag v1.1.0
   git push origin main --tags
   ```

4. **Build release artifacts:**
   ```bash
   npm run tauri build
   # Outputs to src-tauri/target/release/bundle/
   ```

5. **Create GitHub Release:**
   - Go to Releases → Draft a new release
   - Tag: `v1.1.0`
   - Title: `Molt v1.1.0`
   - Description: Copy from CHANGELOG.md
   - Attach binaries (.dmg, .msi, .AppImage, etc.)

6. **Publish:**
   - Click "Publish release"
   - Announcement on Discord, Twitter, etc.

---

## Development Tips

### Debugging

**Frontend debugging:**
```typescript
// src/stores/store.ts
console.log("State updated:", get());

// Or use Zustand devtools
import { devtools } from "zustand/middleware";
export const useStore = create(devtools((...) => ({ ... })));
```

**Backend debugging:**
```rust
// src-tauri/src/gateway.rs
eprintln!("Debug: {:#?}", my_variable);
```

**WebSocket debugging:**
- Open DevTools → Network → WS
- See all WebSocket frames
- Copy messages for testing

### Hot Reload

**Frontend hot reload:**
- Save file → instant reload
- No app restart needed

**Backend hot reload:**
- Requires app restart
- `npm run tauri dev` automatically restarts

**Workaround for faster iteration:**
- Use `#[cfg(debug_assertions)]` for dev-only code
- Mock Tauri commands in frontend during dev

### Common Errors

**"cargo not found":**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**"webkit2gtk not found" (Linux):**
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

**"command not found: tauri":**
```bash
# Tauri CLI is installed locally, use npm scripts
npm run tauri dev  # Not: tauri dev
```

**TypeScript errors after update:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Questions?

- **General questions:** [GitHub Discussions](https://github.com/dokterdok/molt-client/discussions)
- **Bug reports:** [GitHub Issues](https://github.com/dokterdok/molt-client/issues)
- **Security issues:** Email security@molt.dev (do not open public issue)
- **Chat:** [Discord](https://discord.gg/molt) *(if available)*

---

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

Thank you for making Molt better! 🦞
