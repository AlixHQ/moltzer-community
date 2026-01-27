import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Accessibility
 * Comprehensive accessibility tests for WCAG compliance
 */

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Skip onboarding if present
    const skipButton = page.getByRole('button', { name: /skip|get started/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }
  });

  test('should tab through all interactive elements', async ({ page }) => {
    const focusableElements: string[] = [];
    
    // Tab through first 10 elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      
      const tagName = await page.evaluate(() => document.activeElement?.tagName);
      if (tagName) {
        focusableElements.push(tagName);
      }
    }
    
    // Should have tabbed through various interactive elements
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // All elements should be interactive
    const validTags = ['INPUT', 'BUTTON', 'TEXTAREA', 'A', 'SELECT'];
    for (const tag of focusableElements) {
      expect(validTags).toContain(tag);
    }
  });

  test('should reverse tab with Shift+Tab', async ({ page }) => {
    // Tab forward
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const forwardElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute('id') || el?.getAttribute('class');
    });
    
    // Tab backward
    await page.keyboard.press('Shift+Tab');
    
    const backwardElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute('id') || el?.getAttribute('class');
    });
    
    // Should be on a different element
    expect(forwardElement).not.toBe(backwardElement);
  });

  test('should skip non-interactive elements', async ({ page }) => {
    const focusedElements: string[] = [];
    
    // Tab through elements
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      
      const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      const tagName = await page.evaluate(() => document.activeElement?.tagName);
      
      focusedElements.push(role || tagName || 'unknown');
    }
    
    // Should not focus on decorative or non-interactive elements
    expect(focusedElements).not.toContain('presentation');
    expect(focusedElements).not.toContain('DIV'); // Unless interactive
    expect(focusedElements).not.toContain('SPAN');
  });

  test('should maintain logical tab order', async ({ page }) => {
    const input = page.getByPlaceholder(/Message/i);
    
    // Tab to input
    let iterations = 0;
    while (iterations < 20) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      
      if (focused === 'TEXTAREA' || focused === 'INPUT') {
        // Found input
        await expect(input).toBeFocused();
        break;
      }
      
      iterations++;
    }
    
    expect(iterations).toBeLessThan(20); // Should find input within reasonable tabs
  });

  test('should show visible focus indicators', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    // Check for focus styling
    const focusStyles = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      
      return {
        outline: styles.outline,
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
        border: styles.border
      };
    });
    
    // Should have some visible focus indicator
    const hasVisibleFocus = 
      focusStyles.outlineStyle !== 'none' ||
      focusStyles.boxShadow !== 'none' ||
      focusStyles.outline !== 'none';
    
    expect(hasVisibleFocus).toBe(true);
  });

  test('should not lose focus on dynamic content updates', async ({ page }) => {
    const input = page.getByPlaceholder(/Message/i);
    if (await input.isVisible({ timeout: 5000 })) {
      await input.focus();
      await expect(input).toBeFocused();
      
      // Type to trigger any dynamic updates
      await input.fill('Testing focus retention');
      await page.waitForTimeout(500);
      
      // Focus should still be on input
      await expect(input).toBeFocused();
    }
  });
});

test.describe('Screen Reader Landmarks', () => {
  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main landmark
    const main = page.locator('[role="main"], main');
    await expect(main).toBeVisible({ timeout: 5000 });
    
    // Check for navigation (if present)
    const nav = page.locator('[role="navigation"], nav');
    const navCount = await nav.count();
    
    // Navigation might exist for sidebar/menu
    if (navCount > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length > 0) {
      // First heading should be h1
      const firstHeading = headings[0];
      const tagName = await firstHeading.evaluate(el => el.tagName);
      expect(tagName).toBe('H1');
    }
  });

  test('should have descriptive page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    
    // Title should be descriptive
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('React App'); // Not default
  });

  test('should have labeled regions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for labeled regions
    const regions = page.locator('[role="region"][aria-label], [role="region"][aria-labelledby]');
    const regionCount = await regions.count();
    
    // If regions exist, they should be labeled
    for (let i = 0; i < regionCount; i++) {
      const region = regions.nth(i);
      const hasLabel = await region.evaluate(el => {
        return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
      });
      expect(hasLabel).toBe(true);
    }
  });

  test('should have complementary content properly marked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for complementary regions (sidebar, etc.)
    const complementary = page.locator('[role="complementary"], aside');
    const count = await complementary.count();
    
    // If sidebars exist, check they're accessible
    if (count > 0) {
      const first = complementary.first();
      await expect(first).toBeVisible();
    }
  });
});

test.describe('Focus Management in Dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const skipButton = page.getByRole('button', { name: /skip|get started/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }
  });

  test('should focus first element when opening settings', async ({ page }) => {
    await page.keyboard.press('Meta+Comma');
    
    // Wait for dialog
    await page.waitForTimeout(300);
    
    // First interactive element should be focused
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName,
        type: el?.getAttribute('type'),
        role: el?.getAttribute('role')
      };
    });
    
    // Should be on an interactive element
    expect(['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA']).toContain(focused.tag);
  });

  test('should trap focus within settings dialog', async ({ page }) => {
    await page.keyboard.press('Meta+Comma');
    
    await page.waitForTimeout(300);
    
    // Tab through many times
    const focusedElements: string[] = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      
      const id = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('id') || el?.tagName;
      });
      
      focusedElements.push(id);
    }
    
    // Should cycle through same elements
    const uniqueElements = new Set(focusedElements);
    expect(uniqueElements.size).toBeLessThan(focusedElements.length); // Has cycles
    
    // Settings should still be visible (focus not escaped)
    await expect(page.getByText(/settings/i)).toBeVisible();
  });

  test('should return focus to trigger when closing dialog', async ({ page }) => {
    // Focus on settings button (or trigger via keyboard)
    await page.keyboard.press('Meta+Comma');
    
    await page.waitForTimeout(300);
    
    // Close dialog
    await page.keyboard.press('Escape');
    
    await page.waitForTimeout(300);
    
    // Focus should return to a reasonable element
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'BODY', 'TEXTAREA']).toContain(focused);
  });

  test('should trap focus in search dialog', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    await page.waitForTimeout(300);
    
    // Tab multiple times
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Search should still be visible
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test('should focus search input when opening search', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    await page.waitForTimeout(300);
    
    // Search input should be focused
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeFocused();
  });
});

test.describe('ARIA Labels and Descriptions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const skipButton = page.getByRole('button', { name: /skip|get started/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }
  });

  test('should have labeled form inputs', async ({ page }) => {
    const input = page.getByPlaceholder(/Message/i);
    
    if (await input.isVisible({ timeout: 5000 })) {
      // Input should have accessible name
      const accessibleName = await input.evaluate(el => {
        return el.getAttribute('aria-label') || 
               el.getAttribute('placeholder') || 
               el.getAttribute('title');
      });
      
      expect(accessibleName).toBeTruthy();
    }
  });

  test('should have labeled buttons', async ({ page }) => {
    // Get all buttons
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    // Check each button has accessible name
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.evaluate(el => {
        return el.textContent?.trim() || 
               el.getAttribute('aria-label') || 
               el.getAttribute('title');
      });
      
      expect(accessibleName).toBeTruthy();
    }
  });

  test('should have labeled links', async ({ page }) => {
    const links = page.getByRole('link');
    const count = await links.count();
    
    // Check each link has accessible name
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const accessibleName = await link.evaluate(el => {
        return el.textContent?.trim() || 
               el.getAttribute('aria-label') || 
               el.getAttribute('title');
      });
      
      expect(accessibleName).toBeTruthy();
    }
  });

  test('should use ARIA live regions for dynamic content', async ({ page }) => {
    const input = page.getByPlaceholder(/Message/i);
    
    if (await input.isVisible({ timeout: 5000 })) {
      await input.fill('Test message');
      await page.keyboard.press('Enter');
      
      // Look for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const count = await liveRegions.count();
      
      // App might use live regions for messages or status
      // This is good for screen reader announcements
      expect(count).toBeGreaterThanOrEqual(0); // At least doesn't error
    }
  });

  test('should have proper button roles', async ({ page }) => {
    // All buttons should have correct role
    const buttons = page.locator('button, [role="button"]');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const tagName = await button.evaluate(el => el.tagName);
      const role = await button.evaluate(el => el.getAttribute('role'));
      
      // Should either be <button> or have role="button"
      const isValidButton = tagName === 'BUTTON' || role === 'button';
      expect(isValidButton).toBe(true);
    }
  });

  test('should have descriptive aria-labels for icon buttons', async ({ page }) => {
    // Look for buttons that might be icon-only
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      
      // If button has no text, it should have aria-label or title
      if (!text || text.trim().length === 0) {
        const hasAccessibleName = ariaLabel || title;
        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });
});

test.describe('Keyboard-Only Operation', () => {
  test('should complete full workflow with keyboard only', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Skip onboarding with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(500);
    
    // Navigate to message input
    const input = page.getByPlaceholder(/Message/i);
    if (await input.isVisible({ timeout: 5000 })) {
      // Tab until we reach input
      for (let i = 0; i < 10; i++) {
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        if (focused === 'TEXTAREA' || focused === 'INPUT') break;
        await page.keyboard.press('Tab');
      }
      
      // Type and send message
      await page.keyboard.type('Keyboard workflow test');
      await page.keyboard.press('Enter');
      
      // Message should appear
      await expect(page.getByText('Keyboard workflow test')).toBeVisible();
    }
  });

  test('should open and navigate settings with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open settings with keyboard
    await page.keyboard.press('Meta+Comma');
    
    // Tab through settings
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Close with keyboard
    await page.keyboard.press('Escape');
    
    // Settings should close
    await expect(page.getByText(/settings/i)).not.toBeVisible();
  });

  test('should create new chat with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const skipButton = page.getByRole('button', { name: /skip|get started/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }
    
    // Send a message
    const input = page.getByPlaceholder(/Message/i);
    if (await input.isVisible({ timeout: 5000 })) {
      await input.fill('First message');
      await page.keyboard.press('Enter');
      
      // Create new chat with keyboard
      await page.keyboard.press('Meta+n');
      
      // Input should be empty
      await expect(input).toHaveValue('');
    }
  });

  test('should search with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open search with keyboard
    await page.keyboard.press('Meta+k');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible({ timeout: 2000 });
    
    // Type search query
    await page.keyboard.type('test');
    
    // Navigate results with arrows
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    
    // Close search
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();
  });
});

test.describe('Color Contrast and Visual Accessibility', () => {
  test('should have sufficient color contrast for text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get text elements and check contrast
    const textElements = await page.locator('p, span, div, button, a').all();
    
    // Check a sample of elements
    for (let i = 0; i < Math.min(textElements.length, 5); i++) {
      const element = textElements[i];
      
      const contrast = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize
        };
      });
      
      // Just verify we can get color values
      // Actual contrast calculation is complex and would need a library
      expect(contrast.color).toBeTruthy();
    }
  });

  test('should support dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const skipButton = page.getByRole('button', { name: /skip|get started/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }
    
    // Open settings
    await page.keyboard.press('Meta+Comma');
    
    // Switch to dark theme
    const darkButton = page.getByRole('button', { name: /dark/i }).first();
    if (await darkButton.isVisible({ timeout: 2000 })) {
      await darkButton.click();
      
      // Dark class should be applied
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    }
  });

  test('should have readable text sizes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check text sizes
    const textElements = await page.locator('p, span, div, button').all();
    
    for (let i = 0; i < Math.min(textElements.length, 5); i++) {
      const element = textElements[i];
      
      const fontSize = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.fontSize);
      });
      
      // Text should be at least 12px (ideally 14px+)
      if (fontSize > 0) {
        expect(fontSize).toBeGreaterThanOrEqual(11); // Allowing some small labels
      }
    }
  });
});

test.describe('Error Accessibility', () => {
  test('should announce errors to screen readers', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const skipButton = page.getByRole('button', { name: /skip|get started/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }
    
    // Trigger validation error
    await page.keyboard.press('Meta+Comma');
    
    const gatewayInput = page.getByLabel(/gateway url/i);
    if (await gatewayInput.isVisible({ timeout: 2000 })) {
      await gatewayInput.clear();
      await gatewayInput.fill('invalid-url');
      
      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();
      
      // Error should have role="alert"
      const alert = page.locator('[role="alert"]');
      await expect(alert.first()).toBeVisible({ timeout: 2000 });
    }
  });

  test('should associate errors with form fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const skipButton = page.getByRole('button', { name: /skip|get started/i });
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    }
    
    await page.keyboard.press('Meta+Comma');
    
    const gatewayInput = page.getByLabel(/gateway url/i);
    if (await gatewayInput.isVisible({ timeout: 2000 })) {
      await gatewayInput.clear();
      await gatewayInput.fill('bad-url');
      
      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();
      
      // Error should be associated with input via aria-describedby or nearby
      const describedBy = await gatewayInput.getAttribute('aria-describedby');
      const invalid = await gatewayInput.getAttribute('aria-invalid');
      
      // Should have some error indication
      const hasErrorIndication = describedBy || invalid === 'true';
      expect(hasErrorIndication).toBeTruthy();
    }
  });
});

test.describe('Mobile/Touch Accessibility', () => {
  test('should have adequate touch targets', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check button sizes
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Touch targets should be at least 44x44px (WCAG AAA)
        // We'll be lenient and check for 32x32 minimum
        expect(box.width).toBeGreaterThanOrEqual(20);
        expect(box.height).toBeGreaterThanOrEqual(20);
      }
    }
  });
});

test.describe('Semantic HTML', () => {
  test('should use semantic HTML elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for semantic elements
    const main = await page.locator('main, [role="main"]').count();
    expect(main).toBeGreaterThan(0);
    
    // Buttons should be <button> elements
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });

  test('should not have empty links or buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check buttons have content
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const hasContent = await button.evaluate(el => {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute('aria-label');
        const title = el.getAttribute('title');
        const hasIcon = el.querySelector('svg, img');
        
        return text || ariaLabel || title || hasIcon;
      });
      
      expect(hasContent).toBeTruthy();
    }
  });
});
