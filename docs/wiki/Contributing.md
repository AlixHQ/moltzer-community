# Contributing to Moltz

Thank you for your interest in contributing to Moltz! This guide will help you get started.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Getting Started](#getting-started)
4. [Pull Request Process](#pull-request-process)
5. [Coding Guidelines](#coding-guidelines)
6. [Reporting Issues](#reporting-issues)
7. [Community](#community)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in Moltz a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project team at conduct@alix.com. All complaints will be reviewed and investigated.

---

## How Can I Contribute?

### 1. Reporting Bugs

Found a bug? Help us improve Moltz!

**Before submitting:**
- Check [existing issues](https://github.com/AlixHQ/moltz/issues)
- Make sure you're using the latest version
- Collect relevant information (see [Reporting Issues](#reporting-issues))

**Submit a bug report:**
1. Go to [GitHub Issues](https://github.com/AlixHQ/moltz/issues/new)
2. Choose "Bug Report" template
3. Fill in all sections
4. Submit

---

### 2. Suggesting Features

Have an idea for a new feature?

**Before suggesting:**
- Check [existing feature requests](https://github.com/AlixHQ/moltz/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- Consider if it fits Moltz's goals
- Think about implementation complexity

**Submit a feature request:**
1. Go to [GitHub Issues](https://github.com/AlixHQ/moltz/issues/new)
2. Choose "Feature Request" template
3. Describe:
   - **Problem:** What problem does this solve?
   - **Solution:** What should the feature do?
   - **Alternatives:** What alternatives did you consider?
4. Submit

---

### 3. Contributing Code

Ready to write code? Great!

**Types of contributions we welcome:**
- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- Test coverage improvements
- Accessibility improvements

**See:** [Developer Guide](./Developer-Guide.md) for setup instructions

---

### 4. Improving Documentation

Documentation is crucial!

**Ways to help:**
- Fix typos and grammar
- Add missing information
- Improve clarity
- Add examples
- Create tutorials
- Translate to other languages

**Documentation locations:**
- **Wiki:** `docs/wiki/`
- **README:** `README.md`
- **Code comments:** Inline documentation

---

### 5. Translations

Help make Moltz accessible to more people!

**Languages we need:**
- French
- German
- Spanish
- Japanese
- Chinese (Simplified)
- Portuguese
- Russian

**Translation process:**
1. Create `locales/<lang>.json`
2. Translate all strings from `locales/en.json`
3. Test in app
4. Submit PR

**See:** [Translation Guide](./Translation-Guide.md) (coming soon)

---

## Getting Started

### 1. Fork the Repository

Click "Fork" button on [GitHub](https://github.com/AlixHQ/moltz)

---

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/moltz.git
cd moltz
```

---

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/AlixHQ/moltz.git
```

---

### 4. Create Feature Branch

```bash
git checkout -b feature/my-awesome-feature
```

**Branch naming:**
- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation
- `refactor/description` — Code refactoring
- `test/description` — Tests

---

### 5. Make Changes

Write code, tests, and documentation.

**See:** [Developer Guide](./Developer-Guide.md) for development workflow

---

### 6. Test Your Changes

```bash
# Run all tests
npm test
npm run test:e2e

# Run linter
npm run lint

# Format code
npm run format
```

---

### 7. Commit Your Changes

```bash
git add .
git commit -m "feat: add awesome feature"
```

**Commit message format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Code style (formatting, semicolons)
- `refactor:` — Code refactoring (no behavior change)
- `perf:` — Performance improvement
- `test:` — Adding/fixing tests
- `chore:` — Maintenance tasks

**Examples:**
```
feat(chat): add message edit functionality
fix(gateway): handle reconnection timeout
docs(readme): update installation instructions
```

---

### 8. Push to Your Fork

```bash
git push origin feature/my-awesome-feature
```

---

### 9. Open Pull Request

1. Go to [Moltz repository](https://github.com/AlixHQ/moltz)
2. Click "Pull requests" → "New pull request"
3. Click "compare across forks"
4. Select your fork and branch
5. Fill in PR template
6. Submit

---

## Pull Request Process

### PR Template

```markdown
## Description
Briefly describe your changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manually tested on macOS
- [ ] Manually tested on Windows
- [ ] Manually tested on Linux

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

---

### Review Process

1. **Automated Checks**
   - CI/CD runs tests
   - Linting checks pass
   - Build succeeds

2. **Code Review**
   - Maintainer reviews code
   - May request changes
   - Discussion and iteration

3. **Approval**
   - At least one maintainer approves
   - All checks pass
   - Ready to merge

4. **Merge**
   - Maintainer merges PR
   - Your contribution is live!

---

### Review Timeline

- **Simple fixes:** 1-2 days
- **Features:** 3-7 days
- **Large changes:** 1-2 weeks

**Note:** We're a volunteer project. Please be patient!

---

## Coding Guidelines

### TypeScript

```typescript
// ✅ Good: Clear, typed, memoized
interface MessageProps {
  message: Message;
  onEdit: (id: string, content: string) => void;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  onEdit,
}: MessageProps) {
  const handleEdit = useCallback(() => {
    onEdit(message.id, message.content);
  }, [message.id, message.content, onEdit]);
  
  return (
    <div className="message">
      <p>{message.content}</p>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
});

// ❌ Bad: No types, inline functions
export function MessageBubble(props: any) {
  return (
    <div className="message">
      <p>{props.message.content}</p>
      <button onClick={() => props.onEdit()}>Edit</button>
    </div>
  );
}
```

---

### Rust

```rust
// ✅ Good: Documented, typed, error handling
/// Sends a message to the Gateway.
///
/// # Arguments
/// * `state` - Gateway connection state
/// * `content` - Message content
///
/// # Errors
/// Returns `Err` if not connected to Gateway.
#[tauri::command]
pub async fn send_message(
    state: State<'_, GatewayState>,
    content: String,
) -> Result<String, String> {
    let sender = state.sender.lock().await;
    let sender = sender.as_ref()
        .ok_or("Not connected to Gateway")?;
    
    // Implementation...
    Ok(request_id)
}

// ❌ Bad: No docs, panics
#[tauri::command]
pub async fn send_message(state: State<'_, GatewayState>, content: String) -> String {
    let sender = state.sender.lock().await.clone().unwrap();
    // ...
}
```

---

### Accessibility

**Always consider:**
- Keyboard navigation
- Screen readers (ARIA labels)
- Color contrast
- Focus indicators
- Reduced motion

**Example:**
```tsx
<button
  onClick={handleClick}
  aria-label="Send message"
  className="focus:ring-2 focus:ring-blue-500"
>
  <SendIcon aria-hidden="true" />
</button>
```

---

### Performance

**Rules:**
- Use `React.memo` for expensive components
- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Avoid inline functions in JSX
- Virtualize long lists

---

## Reporting Issues

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 13.5]
- Moltz Version: [e.g., 1.0.0]
- Gateway Version: [e.g., 2026.1.28]

**Additional context**
Any other context about the problem.

**Logs**
Paste relevant logs from Settings → Advanced → View Logs
```

---

### Security Vulnerabilities

**Do NOT create public issues for security vulnerabilities!**

**Instead:**
- Email security@alix.com
- Include detailed reproduction steps
- Allow 90 days for fix before public disclosure

We appreciate responsible disclosure and may offer recognition or bounties.

---

## Community

### Communication Channels

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions, ideas, showcase
- **Discord:** (coming soon) Real-time chat
- **Twitter:** [@MoltzApp](https://twitter.com/MoltzApp) — Updates

---

### Recognition

Contributors are recognized in:
- **CONTRIBUTORS.md** — All contributors listed
- **Release Notes** — Major contributions highlighted
- **About Dialog** — Core contributors shown

---

### Contributor Levels

#### Contributor
- Submitted at least one merged PR
- Listed in CONTRIBUTORS.md

#### Regular Contributor
- 5+ merged PRs
- Active in discussions
- Mentioned in release notes

#### Core Contributor
- 20+ merged PRs
- Deep knowledge of codebase
- Helps review PRs
- Listed in About dialog

#### Maintainer
- Commit access to repository
- Reviews and merges PRs
- Makes architectural decisions
- Represents project publicly

---

## Development Discussions

### Where to Discuss

**For proposals/RFCs:**
1. Create GitHub Discussion in "Ideas" category
2. Describe problem and proposed solution
3. Community discusses
4. If accepted, create tracking issue
5. Implementation can begin

**For questions:**
- GitHub Discussions → "Q&A" category
- Ask in Discord (when available)

---

## First-Time Contributors

### Good First Issues

Look for issues labeled `good first issue`:
- Well-defined scope
- Clear requirements
- Mentorship available

**Examples:**
- Add missing TypeScript types
- Fix typos in documentation
- Add unit tests
- Improve error messages

**See:** [Good First Issues](https://github.com/AlixHQ/moltz/labels/good%20first%20issue)

---

### Getting Help

**Stuck on something?**
1. Check [Developer Guide](./Developer-Guide.md)
2. Search [GitHub Discussions](https://github.com/AlixHQ/moltz/discussions)
3. Ask a question in Discussions
4. Tag maintainers in your PR

**We're here to help!** Don't be afraid to ask questions.

---

## License

By contributing to Moltz, you agree that your contributions will be licensed under the [Apache 2.0 License](https://github.com/AlixHQ/moltz/blob/main/LICENSE).

---

## Attribution

This Contributing Guide is adapted from:
- [Contributor Covenant](https://www.contributor-covenant.org/)
- [Open Source Guides](https://opensource.guide/)

---

## Thank You! 🎉

Your contributions make Moltz better for everyone. We appreciate your time and effort!

**Happy coding!** 🚀

---

**Last updated:** January 2026
