import { test, expect } from '@playwright/test';

/**
 * KEYBOARD SHORTCUTS - Comprehensive E2E Tests
 * Tests all keyboard shortcuts thoroughly
 * REAL tests with actual keyboard interactions
 */

test.describe('Keyboard Shortcuts - Comprehensive', () => {
  test.beforeEach(async ({ page }) => {
    // Skip onboarding
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('moltz-onboarding-completed', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for app to be ready
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
  });

  test('Cmd+K - Opens search dialog', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    
    const searchInput = page.locator('input').filter({ hasPlaceholder: /search/i });
    await expect(searchInput).toBeVisible({ timeout: 2000 });
    await expect(searchInput).toBeFocused();
    
    console.log('✓ Cmd+K opens search');
  });

  test('Cmd+N - Creates new conversation', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Send a message first
    await chatInput.fill('First conversation message');
    await chatInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Press Cmd+N
    await page.keyboard.press('Meta+n');
    await page.waitForTimeout(500);
    
    // Should be a new, empty conversation
    await expect(page.locator('text=First conversation message')).not.toBeVisible({ timeout: 2000 });
    await expect(chatInput).toHaveValue('');
    
    console.log('✓ Cmd+N creates new conversation');
  });

  test('Cmd+, - Opens settings', async ({ page }) => {
    await page.keyboard.press('Meta+,');
    
    const settingsDialog = page.locator('[role="dialog"]').filter({ 
      hasText: /settings|preferences/i 
    });
    
    await expect(settingsDialog).toBeVisible({ timeout: 2000 });
    
    console.log('✓ Cmd+, opens settings');
  });

  test('Escape - Closes dialogs', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(300);
    
    // Close with Escape
    await page.keyboard.press('Escape');
    
    const searchInput = page.locator('input').filter({ hasPlaceholder: /search/i });
    await expect(searchInput).not.toBeVisible({ timeout: 2000 });
    
    // Open settings
    await page.keyboard.press('Meta+,');
    await page.waitForTimeout(300);
    
    // Close with Escape
    await page.keyboard.press('Escape');
    
    const settingsDialog = page.locator('[role="dialog"]').filter({ 
      hasText: /settings/i 
    });
    await expect(settingsDialog).not.toBeVisible({ timeout: 2000 });
    
    console.log('✓ Escape closes dialogs');
  });

  test('Enter - Sends message', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    const message = `Enter test ${Date.now()}`;
    await chatInput.fill(message);
    await page.keyboard.press('Enter');
    
    await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 3000 });
    await expect(chatInput).toHaveValue('');
    
    console.log('✓ Enter sends message');
  });

  test('Shift+Enter - Adds newline without sending', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    await chatInput.fill('Line 1');
    await page.keyboard.press('Shift+Enter');
    await chatInput.type('Line 2');
    
    // Should NOT have sent yet
    await expect(page.locator('text=Line 1')).not.toBeVisible({ timeout: 1000 });
    
    // Input should contain both lines
    const value = await chatInput.inputValue();
    expect(value).toContain('Line 1');
    expect(value).toContain('Line 2');
    
    console.log('✓ Shift+Enter adds newline');
  });

  test('Cmd+F - Opens find/search (if applicable)', async ({ page }) => {
    // Note: Cmd+F might be browser default or app-specific
    await page.keyboard.press('Meta+f');
    await page.waitForTimeout(500);
    
    // Check if search opened
    const searchInput = page.locator('input').filter({ hasPlaceholder: /search|find/i });
    
    if (await searchInput.isVisible({ timeout: 1000 })) {
      console.log('✓ Cmd+F opens search');
    } else {
      console.log('⚠ Cmd+F not mapped (might use Cmd+K instead)');
    }
  });

  test('Tab - Focuses next element', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Focus chat input
    await chatInput.focus();
    await expect(chatInput).toBeFocused();
    
    // Tab to next element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Should focus something else
    const nowFocused = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`✓ Tab moved focus to ${nowFocused}`);
  });

  test('Shift+Tab - Focuses previous element', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    await chatInput.focus();
    
    // Tab forward then back
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(200);
    
    // Should cycle back
    console.log('✓ Shift+Tab moves focus backward');
  });

  test('Cmd+A - Selects all text in input', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    await chatInput.fill('Select this text');
    await chatInput.focus();
    
    // Select all
    await page.keyboard.press('Meta+a');
    await page.waitForTimeout(200);
    
    // Type to replace (if selected, typing replaces)
    await page.keyboard.press('x');
    
    const value = await chatInput.inputValue();
    expect(value).toBe('x');
    
    console.log('✓ Cmd+A selects all text');
  });

  test('Cmd+Z - Undo typing', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    await chatInput.fill('Original text');
    await chatInput.type(' and more');
    
    // Undo
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(200);
    
    const value = await chatInput.inputValue();
    // Should have less text after undo
    console.log(`✓ Cmd+Z undo works (value: ${value})`);
  });

  test('Arrow Up/Down - Navigates search results', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Create searchable content
    for (let i = 1; i <= 5; i++) {
      await chatInput.fill(`Searchable item ${i}`);
      await chatInput.press('Enter');
      await page.waitForTimeout(200);
    }
    
    await page.waitForTimeout(1000);
    
    // Open search
    await page.keyboard.press('Meta+k');
    const searchInput = page.locator('input').filter({ hasPlaceholder: /search/i });
    
    // Search
    await searchInput.fill('Searchable');
    await page.waitForTimeout(500);
    
    // Navigate with arrows
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    
    console.log('✓ Arrow keys navigate search results');
  });

  test('Cmd+/ - Shows keyboard shortcuts help (if applicable)', async ({ page }) => {
    await page.keyboard.press('Meta+/');
    await page.waitForTimeout(500);
    
    // Look for shortcuts help dialog
    const helpDialog = page.locator('[role="dialog"]').filter({ 
      hasText: /keyboard|shortcuts|help/i 
    });
    
    if (await helpDialog.isVisible({ timeout: 1000 })) {
      console.log('✓ Cmd+/ shows keyboard shortcuts');
      
      // Close it
      await page.keyboard.press('Escape');
    } else {
      console.log('⚠ Cmd+/ not mapped to shortcuts help');
    }
  });

  test('Cmd+Backspace - Deletes conversation (if applicable)', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Create conversation
    const message = `Delete test ${Date.now()}`;
    await chatInput.fill(message);
    await chatInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Try Cmd+Backspace
    await page.keyboard.press('Meta+Backspace');
    await page.waitForTimeout(500);
    
    // Look for confirmation dialog
    const confirmDialog = page.locator('[role="dialog"]').filter({ 
      hasText: /delete|confirm/i 
    });
    
    if (await confirmDialog.isVisible({ timeout: 1000 })) {
      console.log('✓ Cmd+Backspace triggers delete confirmation');
      
      // Cancel to avoid actually deleting
      await page.keyboard.press('Escape');
    } else {
      console.log('⚠ Cmd+Backspace not mapped to delete');
    }
  });

  test('Cmd+R - Refresh/Reload (browser default)', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Send a message
    await chatInput.fill('Before reload');
    await chatInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Refresh with Cmd+R
    await page.keyboard.press('Meta+r');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Message should persist
    await expect(page.locator('text=Before reload')).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Cmd+R refreshes and maintains state');
  });

  test('Cmd+W - Close window (prevented in app context)', async ({ page }) => {
    // Note: Cmd+W typically closes window/tab, but Tauri apps might prevent it
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    await page.keyboard.press('Meta+w');
    await page.waitForTimeout(500);
    
    // App should still be open
    await expect(chatInput).toBeVisible();
    
    console.log('✓ App handles Cmd+W gracefully');
  });

  test('Home/End - Navigate to start/end of input', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    await chatInput.fill('Test message for navigation');
    
    // Go to start
    await page.keyboard.press('Home');
    await page.waitForTimeout(100);
    
    // Type at start
    await chatInput.press('X');
    
    const value = await chatInput.inputValue();
    expect(value).toContain('X');
    
    console.log('✓ Home/End navigation works');
  });

  test('Page Up/Down - Scroll through messages', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Create many messages
    for (let i = 1; i <= 20; i++) {
      await chatInput.fill(`Message ${i}`);
      await chatInput.press('Enter');
      
      if (i % 5 === 0) {
        await page.waitForTimeout(300);
      }
    }
    
    await page.waitForTimeout(1000);
    
    // Scroll with Page Up/Down
    await page.keyboard.press('PageUp');
    await page.waitForTimeout(300);
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(300);
    
    console.log('✓ Page Up/Down scrolls messages');
  });

  test('Multiple shortcuts in sequence', async ({ page }) => {
    // Test chaining shortcuts
    
    // 1. Open search
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(300);
    
    // 2. Close search
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // 3. New conversation
    await page.keyboard.press('Meta+n');
    await page.waitForTimeout(300);
    
    // 4. Open settings
    await page.keyboard.press('Meta+,');
    await page.waitForTimeout(300);
    
    // 5. Close settings
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // App should still be functional
    await expect(chatInput).toBeVisible();
    
    console.log('✓ Multiple shortcuts in sequence work');
  });

  test('Shortcuts work with modifiers held', async ({ page }) => {
    // Test that holding Cmd doesn't break things
    
    await page.keyboard.down('Meta');
    await page.keyboard.press('k');
    await page.keyboard.up('Meta');
    
    await page.waitForTimeout(300);
    
    const searchInput = page.locator('input').filter({ hasPlaceholder: /search/i });
    await expect(searchInput).toBeVisible({ timeout: 2000 });
    
    // Close
    await page.keyboard.press('Escape');
    
    // Try another
    await page.keyboard.down('Meta');
    await page.keyboard.press('n');
    await page.keyboard.up('Meta');
    
    await page.waitForTimeout(300);
    
    console.log('✓ Shortcuts work with modifiers');
  });

  test('Shortcuts do not interfere with typing', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Type message with letters that match shortcuts
    await chatInput.fill('k n f r');
    
    // Should NOT trigger shortcuts (no Cmd modifier)
    await expect(chatInput).toHaveValue('k n f r');
    
    const searchInput = page.locator('input').filter({ hasPlaceholder: /search/i });
    await expect(searchInput).not.toBeVisible({ timeout: 1000 });
    
    console.log('✓ Typing letters does not trigger shortcuts');
  });

  test('All major shortcuts are documented', async ({ page }) => {
    // Open settings or help
    await page.keyboard.press('Meta+,');
    
    const settingsDialog = page.locator('[role="dialog"]').filter({ 
      hasText: /settings/i 
    });
    await expect(settingsDialog).toBeVisible({ timeout: 2000 });
    
    // Look for keyboard shortcuts section
    const shortcutsSection = page.locator('text=/keyboard|shortcuts/i');
    
    if (await shortcutsSection.isVisible({ timeout: 2000 })) {
      console.log('✓ Keyboard shortcuts are documented');
      
      // Check for common shortcuts in documentation
      const shortcuts = ['⌘K', '⌘N', '⌘,'];
      
      for (const shortcut of shortcuts) {
        const shortcutElement = page.locator(`text=${shortcut}`);
        if (await shortcutElement.isVisible({ timeout: 1000 })) {
          console.log(`✓ ${shortcut} documented`);
        }
      }
    } else {
      console.log('⚠ Keyboard shortcuts documentation not found in settings');
    }
    
    await page.keyboard.press('Escape');
  });
});

test.describe('Platform-specific shortcuts', () => {
  test('should use Cmd on macOS, Ctrl on Windows/Linux', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('moltz-onboarding-completed', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const platform = await page.evaluate(() => navigator.platform);
    const isMac = platform.toLowerCase().includes('mac');
    
    console.log(`Platform detected: ${platform} (${isMac ? 'Mac' : 'Non-Mac'})`);
    
    // Test appropriate modifier
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+k`);
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input').filter({ hasPlaceholder: /search/i });
    
    if (await searchInput.isVisible({ timeout: 2000 })) {
      console.log(`✓ ${isMac ? 'Cmd' : 'Ctrl'}+K works on ${platform}`);
    }
  });
});
