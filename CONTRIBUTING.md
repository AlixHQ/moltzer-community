# Contributing to Moltz 🦞

Thank you for your interest in contributing to Moltz! Whether you're fixing a bug, adding a feature, or improving documentation, we appreciate your help in making Moltz better for everyone.

This document provides guidelines and instructions for contributing. Don't worry if you're new to open source — we're here to help!

## 👋 First Time Contributing?

Welcome! Here are some good ways to start:

- **Fix typos or improve documentation** — Check out [README.md](README.md), [SETUP.md](SETUP.md), or [FEATURES.md](FEATURES.md)
- **Report bugs** — Use our [bug report template](https://github.com/AlixHQ/Moltz-community/issues/new?template=bug_report.yml)
- **Suggest features** — Use our [feature request template](https://github.com/AlixHQ/Moltz-community/issues/new?template=feature_request.yml)
- **Look for "good first issue" labels** — These are beginner-friendly tasks
- **Ask questions** — Use [GitHub Discussions](https://github.com/AlixHQ/Moltz-community/discussions) or open a [question issue](https://github.com/AlixHQ/Moltz-community/issues/new?template=question.yml)

Not sure where to start? That's totally normal! Open a discussion and we'll help you find something that fits your skills and interests.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Rust** (latest stable version)
- **npm** or **yarn**
- **Tauri CLI** (installed automatically via npm)

### Setting Up Development Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AlixHQ/Moltz-community.git
   cd Moltz-community
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run tauri dev
   ```

The app will open with hot-reload enabled. Changes to the frontend will automatically refresh, and Rust changes will trigger a rebuild.

## 🏗️ Project Structure

```
Moltz-community/
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── stores/               # Zustand state management
│   ├── lib/                  # Utilities & core logic
│   └── App.tsx               # Root component
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── lib.rs           # Tauri app setup
│   │   ├── gateway.rs       # WebSocket client
│   │   └── keychain.rs      # OS credential storage
│   └── Cargo.toml           # Rust dependencies
├── e2e/                      # Playwright E2E tests
└── docs/                     # Documentation
```

## 💻 Development Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add voice input support`
- `fix: resolve encryption key rotation issue`
- `docs: update installation guide`
- `refactor: simplify WebSocket connection logic`
- `test: add E2E tests for conversation deletion`
- `chore: update dependencies`

### Code Style

**TypeScript/React:**
- **Type safety:** Use TypeScript for all new code, avoid `any` types
- **Linting:** Follow ESLint rules (`npm run lint`) — PRs must pass with no errors
- **Formatting:** Run Prettier (`npm run format`) before committing
- **Components:** Prefer functional components with hooks over class components
- **State management:** Use Zustand for global state, React hooks for local state
- **Naming conventions:**
  - Components: PascalCase (`MessageBubble.tsx`)
  - Functions: camelCase (`sendMessage()`)
  - Constants: UPPER_SNAKE_CASE (`MAX_MESSAGE_LENGTH`)
  - Interfaces: PascalCase with `I` prefix optional (`Message` or `IMessage`)
- **File organization:**
  - One component per file
  - Group related utilities in `lib/`
  - Colocate tests with source files (`*.test.ts`)
- **Comments:** Add JSDoc comments for exported functions and complex logic
- **Imports:** Group and order: React → external libs → internal modules → styles

**Example:**
```typescript
/**
 * Send a message to the Gateway
 * @param content - Message text
 * @param conversationId - Target conversation
 * @returns Promise resolving when message is sent
 */
export async function sendMessage(
  content: string,
  conversationId: string
): Promise<void> {
  // Implementation
}
```

**Rust:**
- **Formatting:** Run `cargo fmt` before committing
- **Linting:** Run `cargo clippy` and fix all warnings
- **Documentation:** Add doc comments (`///`) for all public functions and structs
- **Error handling:** Use `Result<T, E>` and avoid panics in library code
- **Naming:** Follow Rust conventions (snake_case for functions, PascalCase for types)

**Example:**
```rust
/// Connect to the Moltz Gateway
///
/// # Arguments
/// * `url` - WebSocket URL (ws:// or wss://)
/// * `token` - Optional authentication token
///
/// # Returns
/// Connection handle or error
pub async fn connect_gateway(
    url: &str,
    token: Option<&str>
) -> Result<GatewayConnection, GatewayError> {
    // Implementation
}
```

### Testing

**All PRs must include tests.** Code without tests will not be merged unless there's a compelling reason.

**Run tests:**
```bash
# Unit tests (vitest)
npm run test

# Unit tests with UI
npm run test:ui

# E2E tests (Playwright)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npm run test -- db.test.ts
```

**Test requirements:**
- **Unit tests:** For all utility functions, hooks, and business logic
  - Test happy paths and edge cases
  - Mock external dependencies (Gateway, IndexedDB, etc.)
  - Aim for >80% code coverage
  
- **Integration tests:** For components that interact with stores or DB
  - Test user interactions (clicks, typing, etc.)
  - Verify state updates correctly
  - Use `@testing-library/react` for component tests
  
- **E2E tests:** For critical user flows
  - Onboarding and setup
  - Sending and receiving messages
  - Conversation management (create, delete, search)
  - Settings changes
  
**Writing good tests:**
```typescript
// ✅ Good: Descriptive test names
test('should encrypt message content before saving to DB', async () => {
  // Arrange
  const message = 'Hello, world!';
  const key = await generateEncryptionKey();
  
  // Act
  const encrypted = await encryptMessage(message, key);
  
  // Assert
  expect(encrypted).not.toBe(message);
  expect(await decryptMessage(encrypted, key)).toBe(message);
});

// ❌ Bad: Vague test name
test('encryption works', async () => {
  // ...
});
```

**Test file organization:**
- Colocate tests with source: `db.ts` → `db.test.ts`
- E2E tests go in `e2e/` folder
- Shared test utilities in `src/test/` and `e2e/helpers/`

**Coverage requirements:**
- New features: Must have >80% coverage
- Bug fixes: Must include regression test
- Refactoring: Maintain or improve existing coverage

### Building

**Development build:**
```bash
npm run tauri dev
```

**Production build:**
```bash
npm run tauri build
```

Builds will be output to `src-tauri/target/release/`.

## 📝 Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes:**
   - Write clean, maintainable code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test thoroughly:**
   - Run all tests (`npm run test`)
   - Test on your platform (Windows, macOS, or Linux)
   - Check for console errors or warnings

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/my-new-feature
   ```

6. **Open a Pull Request:**
   - Fill out the PR template
   - Link related issues
   - Add screenshots/GIFs for UI changes
   - Request review

### PR Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Commits follow conventional commits
- [ ] PR description is clear and complete

## 🐛 Reporting Bugs

Use the [Bug Report template](https://github.com/AlixHQ/Moltz-community/issues/new?template=bug_report.yml) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Platform and version information
- Logs (if available)

## 💡 Suggesting Features

Use the [Feature Request template](https://github.com/AlixHQ/Moltz-community/issues/new?template=feature_request.yml) and include:

- Problem you're trying to solve
- Proposed solution
- Alternative solutions considered
- Priority/importance

## 📚 Documentation

Help improve documentation by:

- Fixing typos or unclear sections
- Adding examples and tutorials
- Translating to other languages
- Creating video guides

## 🔒 Security

If you discover a security vulnerability, please **do not** open a public issue. Instead, email security@Moltz.dev (or create a private security advisory).

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

## 💬 Communication & Community

**We value:**
- **Kindness** — Be welcoming to newcomers and patient with questions
- **Clarity** — Clear communication helps everyone understand your ideas
- **Collaboration** — We're building this together, not competing
- **Growth** — Everyone is learning, including maintainers

**Preferred communication:**
- **Public discussions** for questions and ideas (helps others learn too!)
- **Issues** for bugs and feature requests
- **Pull requests** for code contributions
- **Email** (support@Moltz.dev) for security issues or private matters

## 🙏 Code of Conduct

**In short:** Be respectful, inclusive, and professional. We're all here to build something great together.

- ✅ Welcome newcomers and help them get started
- ✅ Give constructive feedback with kindness
- ✅ Respect different skill levels and perspectives
- ✅ Assume good intentions
- ❌ Don't be dismissive or condescending
- ❌ Don't harass, discriminate, or be abusive
- ❌ Don't spam or self-promote excessively

Violations may result in warnings, temporary bans, or permanent removal from the community.

## ❓ Questions?

- **Discussions:** [GitHub Discussions](https://github.com/AlixHQ/Moltz-community/discussions)
- **Questions:** [Ask a question](https://github.com/AlixHQ/Moltz-community/issues/new?template=question.yml)
- **Issues:** [GitHub Issues](https://github.com/AlixHQ/Moltz-community/issues)
- **Email:** support@Moltz.dev

---

Thank you for contributing to Moltz! Every contribution, big or small, makes a difference. 🦞
