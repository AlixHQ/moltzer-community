# E2E Test Suite - Moltz Desktop App

Comprehensive end-to-end testing suite for the Moltz desktop application using Playwright.

## 📋 Test Coverage

This test suite provides complete coverage of all priority user flows:

### ✅ Priority Flows Covered

1. **First Launch / Onboarding** (`onboarding.spec.ts`, `user-journeys.spec.ts`)
   - Welcome screen display
   - Gateway detection
   - Manual setup
   - URL validation
   - Onboarding completion

2. **Create New Conversation** (`conversation-flows.spec.ts`, `user-journeys.spec.ts`)
   - New conversation creation
   - Keyboard shortcut (⌘N)
   - Multiple conversations

3. **Send Message & Receive Response** (`messaging.spec.ts`, `mock-api-flows.spec.ts`, `user-journeys.spec.ts`)
   - Message sending
   - Streaming responses
   - Mocked API responses
   - Multiple messages

4. **Switch Between Conversations** (`conversation-flows.spec.ts`, `user-journeys.spec.ts`)
   - Conversation switching
   - Content preservation
   - Navigation

5. **Delete Conversation** (`conversation-flows.spec.ts`, `user-journeys.spec.ts`)
   - Deletion with confirmation
   - Keyboard shortcuts
   - Context menu

6. **Settings** (`settings.spec.ts`, `settings-flows.spec.ts`, `user-journeys.spec.ts`)
   - Theme changing
   - Setting toggles
   - Gateway URL configuration
   - Preferences persistence

7. **Search Conversations** (`conversation-flows.spec.ts`, `keyboard-shortcuts.spec.ts`, `user-journeys.spec.ts`)
   - Search dialog (⌘K)
   - Search results
   - Keyboard navigation
   - Result highlighting

8. **Export Conversation** (`settings-flows.spec.ts`, `user-journeys.spec.ts`)
   - Export as Markdown
   - Export as JSON
   - Download handling

9. **Keyboard Shortcuts** (`keyboard-shortcuts.spec.ts`, `user-journeys.spec.ts`)
   - ⌘N - New chat
   - ⌘K - Search
   - ⌘, - Settings
   - Shift+Enter - Multiline
   - All editing shortcuts

10. **Global Hotkey** (Tested where possible)
    - Platform limitations apply
    - Manual testing recommended

## 📁 Test Files

### Core Test Suites

- **`user-journeys.spec.ts`** - 🆕 NEW! Comprehensive integration tests covering complete user workflows
- **`mock-api-flows.spec.ts`** - 🆕 NEW! Tests with mocked Gateway API responses
- **`test-helpers.ts`** - 🆕 NEW! Reusable test utilities and helpers

### Existing Test Suites

- **`onboarding.spec.ts`** - First launch and setup flows
- **`conversation-flows.spec.ts`** - Conversation management
- **`messaging.spec.ts`** - Message sending and display
- **`keyboard-shortcuts.spec.ts`** - All keyboard interactions
- **`settings.spec.ts`** - Settings dialog basics
- **`settings-flows.spec.ts`** - Advanced settings workflows
- **`accessibility.spec.ts`** - WCAG compliance and a11y
- **`error-handling.spec.ts`** - Error states and recovery
- **`performance.spec.ts`** - Performance benchmarks
- **`visual-flows.spec.ts`** - Visual regression testing
- **`basic.spec.ts`** - Smoke tests

## 🚀 Running Tests

### All Tests

```bash
npm run test:e2e
```

### Specific Test File

```bash
npm run test:e2e -- user-journeys.spec.ts
```

### With UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

### With Debug Mode

```bash
npm run test:e2e:debug
```

### Visual Tests Only

```bash
npm run test:e2e:visual
```

### Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Specific Test

```bash
npx playwright test -g "should send message"
```

### Watch Mode

```bash
npx playwright test --watch
```

## 🎯 New Test Features (test/e2e-coverage)

### Mock API Testing

The new `mock-api-flows.spec.ts` provides tests that work **without a live Gateway connection** by mocking WebSocket responses:

```typescript
// Tests work offline with mocked responses
- Streaming response simulation
- Multiple message handling
- Custom response types (code blocks, markdown)
- Error handling scenarios
- Performance testing
```

### Complete User Journeys

The new `user-journeys.spec.ts` provides end-to-end workflows that test complete user scenarios:

```typescript
// Complete flows from start to finish
- First-time user onboarding through first message
- Create multiple conversations and manage them
- Settings customization and export
- Keyboard shortcut workflows
- Edge cases and error handling
```

### Test Helpers

The new `test-helpers.ts` provides reusable utilities:

```typescript
import { 
  skipOnboarding, 
  sendMessage, 
  openSettings,
  searchConversations,
  setupMockGateway 
} from './test-helpers';

// Use in any test
await skipOnboarding(page);
await sendMessage(page, 'Hello!');
await openSettings(page);
```

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Base URL**: `http://localhost:5173`
- **Timeout**: 60 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Workers**: 1 on CI, unlimited locally
- **Screenshot**: On failure
- **Video**: Retained on failure
- **Trace**: On first retry

### Projects

- **chromium** - Standard tests
- **visual** - Visual regression tests with video recording

## 📝 Writing New Tests

### Basic Structure

```typescript
import { test, expect } from '@playwright/test';
import { skipOnboarding, waitForChatReady } from './test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await skipOnboarding(page);
    await waitForChatReady(page);
  });

  test('should do something', async ({ page }) => {
    // Test code
  });
});
```

### Using Mock API

```typescript
import { setupMockGateway } from './test-helpers';

test.beforeEach(async ({ page }) => {
  await setupMockGateway(page);
  await page.goto('/');
});
```

### Best Practices

1. **Use semantic selectors**
   - Prefer `getByRole()`, `getByLabel()`, `getByPlaceholder()`
   - Avoid CSS selectors when possible

2. **Wait appropriately**
   - Use `expect().toBeVisible()` with timeout
   - Avoid arbitrary `waitForTimeout()` except for animations

3. **Test user behavior**
   - Test what users see and do
   - Don't test implementation details

4. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` to reset state

5. **Use helpers**
   - Reuse common actions from `test-helpers.ts`
   - Create new helpers for repeated patterns

## 🐛 Debugging Tests

### Visual Debugging

```bash
# See the browser while tests run
npm run test:e2e -- --headed

# Slow motion (helpful for debugging)
npm run test:e2e -- --headed --slow-mo=1000
```

### UI Mode

```bash
# Interactive test runner
npm run test:e2e:ui
```

### Debug Mode

```bash
# Playwright Inspector (step through)
npm run test:e2e:debug
```

### Screenshots on Failure

Screenshots are automatically saved to `test-results/` when tests fail.

### Trace Viewer

After a failed test run:

```bash
npx playwright show-trace test-results/.../trace.zip
```

## 📊 Test Reports

### HTML Report

After test run:

```bash
npx playwright show-report
```

### JSON Report

Results are saved to `playwright-report/results.json`

## 🔄 CI/CD Integration

Tests are configured for CI with:
- Retries on failure
- Single worker to avoid conflicts
- JSON and HTML reports
- Screenshots and videos on failure

### GitHub Actions Example

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🎨 Visual Testing

Visual tests capture screenshots and can be used for:
- Visual regression detection
- UI documentation
- Design review

Run with:

```bash
npm run test:e2e:visual
```

Screenshots are saved to `e2e/screenshots/`

## ✅ Coverage Checklist

Use this checklist to verify test coverage:

- [x] First launch onboarding
- [x] Gateway connection setup
- [x] Create new conversation
- [x] Send messages
- [x] Receive streaming responses
- [x] Multiple messages in conversation
- [x] Switch between conversations
- [x] Delete conversation
- [x] Search conversations (⌘K)
- [x] Export conversation (Markdown/JSON)
- [x] Settings dialog access
- [x] Change theme
- [x] Toggle settings
- [x] Gateway URL configuration
- [x] All keyboard shortcuts
- [x] Shift+Enter multiline
- [x] Message persistence
- [x] Error handling
- [x] Connection errors
- [x] Invalid input handling
- [x] Accessibility (WCAG)
- [x] Performance benchmarks
- [x] Mock API responses

## 🆘 Troubleshooting

### Tests timing out

- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify Gateway connection (or use mocks)

### "Element not found" errors

- Check if onboarding is properly skipped
- Add explicit waits with timeout
- Use `.or()` for multiple possible selectors

### Flaky tests

- Add proper waits instead of `waitForTimeout()`
- Use `expect().toBeVisible({ timeout })` 
- Check for race conditions
- Consider using mock API for consistency

### Mock API not working

- Verify `addInitScript()` is called before `goto()`
- Check browser console for WebSocket errors
- Ensure mock matches expected message format

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns
2. Use test helpers when possible
3. Add to this README if adding new features
4. Ensure tests pass locally before committing
5. Consider adding visual tests for UI changes

## 📈 Test Metrics

Current test count: **238 tests** across 13 files

Run `npm run test:e2e -- --list` to see all tests.
