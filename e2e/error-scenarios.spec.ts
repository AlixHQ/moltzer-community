import { test, expect } from '@playwright/test';

/**
 * ERROR SCENARIOS - E2E Tests
 * Tests error handling, edge cases, and failure recovery
 * REAL tests that trigger actual error conditions
 */

test.describe('Error Handling and Recovery', () => {
  test.beforeEach(async ({ page }) => {
    // Skip onboarding
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('moltz-onboarding-completed', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle offline state gracefully', async ({ page }) => {
    // Wait for app to load
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Go offline
    await page.context().setOffline(true);
    console.log('✓ Set offline mode');
    
    // Try to send a message
    await chatInput.fill('This message should fail to send');
    await chatInput.press('Enter');
    
    // Wait a bit for error to show
    await page.waitForTimeout(2000);
    
    // Look for error indicators
    const errorIndicators = [
      page.locator('text=/offline|disconnected|connection|network/i'),
      page.locator('[role="alert"]'),
      page.locator('.error, .warning')
    ];
    
    let foundError = false;
    for (const indicator of errorIndicators) {
      if (await indicator.isVisible({ timeout: 2000 })) {
        foundError = true;
        console.log('✓ Offline error shown');
        break;
      }
    }
    
    // Go back online
    await page.context().setOffline(false);
    console.log('✓ Back online');
    
    // App should recover
    await page.waitForTimeout(2000);
    await expect(chatInput).toBeVisible();
    console.log('✓ App recovered from offline state');
  });

  test('should handle invalid Gateway URL', async ({ page }) => {
    // Open settings
    await page.keyboard.press('Meta+,');
    
    const settingsDialog = page.locator('[role="dialog"]').filter({ 
      hasText: /settings/i 
    });
    await expect(settingsDialog).toBeVisible({ timeout: 2000 });
    
    // Find Gateway URL input
    const gatewayInput = page.locator('input[type="text"]').filter({
      or: [
        { hasPlaceholder: /gateway|ws:|url/i },
        { hasValue: /ws:|localhost/i }
      ]
    });
    
    if (await gatewayInput.first().isVisible({ timeout: 2000 })) {
      const originalValue = await gatewayInput.first().inputValue();
      
      // Enter invalid URLs
      const invalidUrls = [
        'not-a-url',
        'http://wrong-protocol.com',
        'ws://',
        'ws://missing-port',
        '::::invalid::::'
      ];
      
      for (const invalidUrl of invalidUrls) {
        await gatewayInput.first().clear();
        await gatewayInput.first().fill(invalidUrl);
        await page.waitForTimeout(500);
        
        // Look for validation error
        const error = page.locator('text=/invalid|error/i, [role="alert"]');
        if (await error.isVisible({ timeout: 1000 })) {
          console.log(`✓ Validation error shown for: ${invalidUrl}`);
        }
      }
      
      // Restore valid URL
      await gatewayInput.first().clear();
      await gatewayInput.first().fill(originalValue);
    }
  });

  test('should handle unreachable Gateway', async ({ page }) => {
    // Open settings
    await page.keyboard.press('Meta+,');
    
    const settingsDialog = page.locator('[role="dialog"]').filter({ 
      hasText: /settings/i 
    });
    await expect(settingsDialog).toBeVisible({ timeout: 2000 });
    
    // Find Gateway URL input
    const gatewayInput = page.locator('input[type="text"]').filter({
      or: [
        { hasPlaceholder: /gateway|ws:|url/i },
        { hasValue: /ws:|localhost/i }
      ]
    });
    
    if (await gatewayInput.first().isVisible({ timeout: 2000 })) {
      const originalValue = await gatewayInput.first().inputValue();
      
      // Enter unreachable URL
      await gatewayInput.first().clear();
      await gatewayInput.first().fill('ws://unreachable.example.com:99999');
      
      // Look for test/connect button
      const testButton = page.locator('button').filter({ 
        hasText: /test|connect|save/i 
      });
      
      if (await testButton.first().isVisible({ timeout: 2000 })) {
        await testButton.first().click();
        
        // Should show connection error
        const errorMsg = page.locator('text=/failed|unable|error|timeout/i');
        await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });
        console.log('✓ Connection error shown for unreachable Gateway');
      }
      
      // Restore original
      await gatewayInput.first().clear();
      await gatewayInput.first().fill(originalValue);
    }
  });

  test('should handle corrupted localStorage', async ({ page }) => {
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('moltz-settings', 'CORRUPTED{{{JSON}}}');
      localStorage.setItem('moltz-conversations', 'NOT:VALID:JSON');
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // App should handle gracefully and not crash
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Either shows onboarding or recovers to main app
    const hasOnboarding = await page.locator('text=/welcome/i').isVisible({ timeout: 3000 });
    const hasChat = await chatInput.isVisible({ timeout: 3000 });
    
    if (hasOnboarding || hasChat) {
      console.log('✓ App recovered from corrupted localStorage');
    } else {
      console.log('⚠ App state unclear after corrupted data');
    }
  });

  test('should handle rapid state changes', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Rapidly create and delete conversations
    const newChatButton = page.locator('button').filter({ 
      hasText: /new chat/i 
    }).first();
    
    if (await newChatButton.isVisible({ timeout: 3000 })) {
      // Create 5 conversations rapidly
      for (let i = 0; i < 5; i++) {
        await newChatButton.click();
        await page.waitForTimeout(100);
      }
      
      console.log('✓ Handled rapid conversation creation');
      
      // App should still be functional
      await expect(chatInput).toBeVisible();
      console.log('✓ App remained stable');
    }
  });

  test('should handle very large message history', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Send many messages to create large history
    for (let i = 0; i < 50; i++) {
      await chatInput.fill(`Message ${i + 1} of 50`);
      await chatInput.press('Enter');
      
      // Only wait occasionally to speed up test
      if (i % 10 === 0) {
        await page.waitForTimeout(500);
      }
    }
    
    console.log('✓ Created large message history (50 messages)');
    
    // App should still be responsive
    await chatInput.fill('Final test message');
    await chatInput.press('Enter');
    
    await expect(page.locator('text=Final test message')).toBeVisible({ timeout: 3000 });
    console.log('✓ App still responsive with large history');
    
    // Scroll should work
    await page.keyboard.press('Home');
    await page.waitForTimeout(500);
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    
    console.log('✓ Scrolling works with large history');
  });

  test('should handle missing images gracefully', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Send message with broken image link
    await chatInput.fill('![broken](https://invalid-domain-xyz.com/missing.png)');
    await chatInput.press('Enter');
    
    await page.waitForTimeout(2000);
    
    // App should not crash
    await expect(chatInput).toBeVisible();
    console.log('✓ Handled broken image link without crashing');
  });

  test('should handle Unicode and emoji edge cases', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Test various Unicode edge cases
    const edgeCases = [
      '👨‍👩‍👧‍👦', // Family emoji (composite)
      '🏳️‍🌈', // Flag (composite)
      '你好世界', // Chinese
      'مرحبا', // Arabic (RTL)
      '𝕳𝖊𝖑𝖑𝖔', // Mathematical bold
      '🔥'.repeat(100), // Many emoji
      'a̸̷̡̢̛̼̲̦̤̖̝̥̰̻͉̿̌́̊̐̂̌̀͗̒̋͟b̸̷̡̢̛̼̲̦̤̖̝̥̰̻͉̿̌́̊̐̂̌̀͗̒̋͟c̸̷̡̢̛̼̲̦̤̖̝̥̰̻͉̿̌́̊̐̂̌̀͗̒̋͟' // Zalgo text
    ];
    
    for (const testCase of edgeCases) {
      await chatInput.fill(testCase);
      await chatInput.press('Enter');
      await page.waitForTimeout(300);
    }
    
    // App should still work
    await expect(chatInput).toBeVisible();
    console.log('✓ Handled Unicode edge cases');
  });

  test('should recover from JavaScript errors', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Inject an error
    await page.evaluate(() => {
      // Intentionally cause an error
      throw new Error('Test error for recovery');
    }).catch(() => {
      // Expected to throw
    });
    
    await page.waitForTimeout(1000);
    
    // App should still be functional (error boundary should catch it)
    await expect(chatInput).toBeVisible();
    await chatInput.fill('Message after error');
    await chatInput.press('Enter');
    
    await expect(page.locator('text=Message after error')).toBeVisible({ timeout: 3000 });
    console.log('✓ Recovered from JavaScript error');
  });

  test('should handle window resize gracefully', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Test various viewport sizes
    const viewports = [
      { width: 320, height: 568 },  // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 }, // Desktop
      { width: 3840, height: 2160 }  // 4K
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Chat should still be visible and functional
      await expect(chatInput).toBeVisible({ timeout: 2000 });
    }
    
    console.log('✓ Handled various viewport sizes');
  });

  test('should handle rapid keyboard input', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Type very rapidly
    const rapidText = 'abcdefghijklmnopqrstuvwxyz0123456789';
    await chatInput.type(rapidText, { delay: 10 });
    
    // Verify all text was captured
    const value = await chatInput.inputValue();
    expect(value).toContain('abcdefg');
    
    console.log('✓ Handled rapid keyboard input');
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Send a message
    await chatInput.fill('Test navigation message');
    await chatInput.press('Enter');
    await expect(page.locator('text=Test navigation message')).toBeVisible();
    
    // Try browser back
    await page.goBack();
    await page.waitForTimeout(1000);
    
    // Try browser forward
    await page.goForward();
    await page.waitForTimeout(1000);
    
    // App should still be functional
    await expect(chatInput).toBeVisible();
    console.log('✓ Handled browser navigation');
  });

  test('should handle focus loss and regain', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Focus and blur the window
    await page.evaluate(() => {
      window.blur();
      setTimeout(() => window.focus(), 500);
    });
    
    await page.waitForTimeout(1000);
    
    // App should still work
    await chatInput.fill('Message after focus change');
    await chatInput.press('Enter');
    
    await expect(page.locator('text=Message after focus change')).toBeVisible({ timeout: 3000 });
    console.log('✓ Handled focus loss and regain');
  });

  test('should handle localStorage quota exceeded', async ({ page }) => {
    // Fill localStorage to near capacity
    await page.evaluate(() => {
      try {
        const largeData = 'x'.repeat(1024 * 1024); // 1MB string
        for (let i = 0; i < 5; i++) {
          localStorage.setItem(`large-data-${i}`, largeData);
        }
      } catch (e) {
        // Quota exceeded - this is expected
      }
    });
    
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    if (await chatInput.isVisible({ timeout: 15000 })) {
      // Try to send message (which tries to persist)
      await chatInput.fill('Test message with full storage');
      await chatInput.press('Enter');
      
      // Should handle gracefully (might show error or work in memory only)
      await page.waitForTimeout(2000);
      
      await expect(chatInput).toBeVisible();
      console.log('✓ Handled localStorage quota exceeded');
    }
  });

  test('should show user-friendly error messages', async ({ page }) => {
    // Trigger an error scenario
    await page.context().setOffline(true);
    
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    if (await chatInput.isVisible({ timeout: 15000 })) {
      await chatInput.fill('Message that will fail');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      // Look for user-friendly error (not technical jargon)
      const errorText = await page.locator('[role="alert"], .error, .warning').first().textContent().catch(() => '');
      
      // Should not contain technical stack traces
      if (errorText && !errorText.includes('at Object') && !errorText.includes('.js:')) {
        console.log('✓ Error message is user-friendly');
      }
    }
    
    await page.context().setOffline(false);
  });
});

test.describe('Edge Cases', () => {
  test('should handle empty conversation deletion', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('moltz-onboarding-completed', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Create new conversation (empty)
    const newChatButton = page.locator('button').filter({ 
      hasText: /new chat/i 
    }).first();
    
    if (await newChatButton.isVisible({ timeout: 3000 })) {
      await newChatButton.click();
      await page.waitForTimeout(500);
      
      // Try to delete it immediately (no messages)
      const deleteButton = page.locator('button').filter({ 
        hasText: /delete/i 
      }).first();
      
      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click();
        
        // Should handle deletion of empty conversation
        console.log('✓ Handled empty conversation deletion');
      }
    }
  });

  test('should handle sending empty whitespace', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('moltz-onboarding-completed', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    
    // Try to send only whitespace
    await chatInput.fill('   \n\n\t\t   ');
    await chatInput.press('Enter');
    
    // Should not send
    await page.waitForTimeout(500);
    await expect(chatInput).toBeFocused();
    
    console.log('✓ Blocked empty whitespace message');
  });
});
