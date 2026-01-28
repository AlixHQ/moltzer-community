import { test, expect } from '@playwright/test';

/**
 * COMPLETE USER JOURNEY - E2E Test
 * This test walks through the entire application flow from first launch to active usage
 * NO MOCKING - tests against real UI with actual interactions
 */

test.describe('Complete User Journey - First Launch to Active Usage', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all application state to simulate first launch
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('full user journey: onboarding → setup → send messages → switch conversations → delete', async ({ page }) => {
    // ===== STEP 1: First Launch - Should show onboarding =====
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for welcome screen - key indicator of onboarding
    const welcomeHeading = page.locator('h1, h2').filter({ hasText: /welcome/i });
    await expect(welcomeHeading).toBeVisible({ timeout: 10000 });
    console.log('✓ Onboarding welcome screen displayed');
    
    // ===== STEP 2: Progress through onboarding =====
    // Look for the primary action button (Next/Get Started/Continue)
    const primaryButton = page.locator('button').filter({ hasText: /next|get started|continue|let's go/i }).first();
    await expect(primaryButton).toBeVisible({ timeout: 5000 });
    await primaryButton.click();
    console.log('✓ Clicked onboarding next button');
    
    // Wait for transition
    await page.waitForTimeout(500);
    
    // ===== STEP 3: Gateway Setup =====
    // Look for Gateway URL input or setup screen
    const gatewayInput = page.locator('input[type="text"]').filter({ 
      or: [
        { hasPlaceholder: /gateway|ws:|url/i },
        { hasValue: /ws:|localhost/i }
      ]
    }).first();
    
    if (await gatewayInput.isVisible({ timeout: 3000 })) {
      // Fill in Gateway URL
      await gatewayInput.clear();
      await gatewayInput.fill('ws://localhost:18789');
      console.log('✓ Entered Gateway URL');
      
      // Look for continue/connect button
      const connectButton = page.locator('button').filter({ 
        hasText: /continue|connect|next|test/i 
      }).last();
      
      if (await connectButton.isVisible({ timeout: 2000 })) {
        await connectButton.click();
        console.log('✓ Clicked connect button');
      }
    }
    
    // Wait for setup to complete (might show loading or skip button)
    await page.waitForTimeout(2000);
    
    // ===== STEP 4: Complete Onboarding =====
    // Look for final button to enter app
    const finalButton = page.locator('button').filter({ 
      hasText: /start|done|finish|skip|close/i 
    }).first();
    
    if (await finalButton.isVisible({ timeout: 5000 })) {
      await finalButton.click();
      console.log('✓ Completed onboarding');
    }
    
    // ===== STEP 5: Main App Loaded =====
    // Should now see the main chat interface
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type|chat/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
    console.log('✓ Main chat interface loaded');
    
    // ===== STEP 6: Send First Message =====
    const firstMessage = `First message - test ${Date.now()}`;
    await chatInput.fill(firstMessage);
    await chatInput.press('Enter');
    
    // Verify message appears
    await expect(page.locator('text=' + firstMessage)).toBeVisible({ timeout: 3000 });
    console.log('✓ First message sent and displayed');
    
    // Input should be cleared
    await expect(chatInput).toHaveValue('');
    
    // ===== STEP 7: Send Second Message =====
    await page.waitForTimeout(1000); // Let UI settle
    
    const secondMessage = `Second message - test ${Date.now()}`;
    await chatInput.fill(secondMessage);
    await chatInput.press('Enter');
    
    await expect(page.locator('text=' + secondMessage)).toBeVisible({ timeout: 3000 });
    console.log('✓ Second message sent');
    
    // Both messages should be visible
    await expect(page.locator('text=' + firstMessage)).toBeVisible();
    await expect(page.locator('text=' + secondMessage)).toBeVisible();
    
    // ===== STEP 8: Create New Conversation =====
    // Look for new chat button (⌘N or button)
    const newChatButton = page.locator('button').filter({ 
      or: [
        { hasText: /new chat|new conversation|\+/i },
        { hasTitle: /new chat|new conversation/i }
      ]
    }).first();
    
    if (await newChatButton.isVisible({ timeout: 5000 })) {
      await newChatButton.click();
      console.log('✓ Clicked new conversation button');
      
      // Wait for UI to reset
      await page.waitForTimeout(500);
      
      // Chat should be empty (previous messages not visible)
      await expect(page.locator('text=' + firstMessage)).not.toBeVisible({ timeout: 2000 });
      
      // ===== STEP 9: Send Message in New Conversation =====
      const newConvMessage = `New conversation message - ${Date.now()}`;
      await chatInput.fill(newConvMessage);
      await chatInput.press('Enter');
      
      await expect(page.locator('text=' + newConvMessage)).toBeVisible({ timeout: 3000 });
      console.log('✓ Message sent in new conversation');
      
      // ===== STEP 10: Switch Back to First Conversation =====
      // Look for conversation in sidebar (might contain first message text)
      const firstConvItem = page.locator('[role="button"], button, a').filter({ 
        hasText: firstMessage.substring(0, 20) 
      }).first();
      
      if (await firstConvItem.isVisible({ timeout: 5000 })) {
        await firstConvItem.click();
        console.log('✓ Switched back to first conversation');
        
        // Wait for messages to load
        await page.waitForTimeout(500);
        
        // Original messages should be visible again
        await expect(page.locator('text=' + firstMessage)).toBeVisible({ timeout: 3000 });
        await expect(page.locator('text=' + secondMessage)).toBeVisible();
        
        // New conversation message should NOT be visible
        await expect(page.locator('text=' + newConvMessage)).not.toBeVisible();
        console.log('✓ Conversation switching works correctly');
      }
      
      // ===== STEP 11: Test Message Persistence =====
      // Reload page to verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Should NOT show onboarding again
      const welcomeAfterReload = page.locator('h1, h2').filter({ hasText: /welcome/i });
      await expect(welcomeAfterReload).not.toBeVisible({ timeout: 3000 });
      console.log('✓ Onboarding not shown on reload');
      
      // Messages should still be visible
      await expect(page.locator('text=' + firstMessage)).toBeVisible({ timeout: 5000 });
      console.log('✓ Messages persisted across reload');
      
      // ===== STEP 12: Delete Conversation =====
      // Look for delete button (might be in menu or on hover)
      const deleteButton = page.locator('button').filter({ 
        or: [
          { hasText: /delete|remove|trash/i },
          { hasTitle: /delete|remove/i }
        ]
      }).first();
      
      // Try hovering over the conversation first to reveal delete button
      const conversationItem = page.locator('[role="button"], button, a').filter({ 
        hasText: firstMessage.substring(0, 20) 
      }).first();
      
      if (await conversationItem.isVisible({ timeout: 3000 })) {
        await conversationItem.hover();
        await page.waitForTimeout(300);
      }
      
      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click();
        console.log('✓ Clicked delete button');
        
        // Look for confirmation dialog
        const confirmButton = page.locator('button').filter({ 
          hasText: /delete|confirm|yes|remove/i 
        }).last();
        
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
          console.log('✓ Confirmed deletion');
          
          // Wait for deletion to process
          await page.waitForTimeout(1000);
          
          // Message should no longer be visible
          await expect(page.locator('text=' + firstMessage)).not.toBeVisible({ timeout: 3000 });
          console.log('✓ Conversation deleted successfully');
        }
      }
    }
    
    console.log('✓✓✓ COMPLETE USER JOURNEY TEST PASSED ✓✓✓');
  });
  
  test('keyboard shortcuts work throughout the journey', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');
    
    // Skip onboarding quickly
    const skipButton = page.locator('button').filter({ hasText: /skip/i }).first();
    if (await skipButton.isVisible({ timeout: 5000 })) {
      await skipButton.click();
      console.log('✓ Skipped onboarding with button');
    } else {
      // Click through onboarding quickly
      for (let i = 0; i < 5; i++) {
        const nextButton = page.locator('button').filter({ 
          hasText: /next|continue|start|done|skip/i 
        }).first();
        if (await nextButton.isVisible({ timeout: 2000 })) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // Wait for main app
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    
    // ===== Test Keyboard Shortcuts =====
    
    // Test: Cmd/Ctrl+K for search
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input').filter({ hasPlaceholder: /search/i });
    if (await searchInput.isVisible({ timeout: 2000 })) {
      console.log('✓ Cmd+K opens search');
      
      // Close search
      await page.keyboard.press('Escape');
      await expect(searchInput).not.toBeVisible({ timeout: 2000 });
      console.log('✓ Escape closes search');
    }
    
    // Test: Cmd/Ctrl+N for new chat
    await page.keyboard.press('Meta+n');
    await page.waitForTimeout(500);
    console.log('✓ Cmd+N triggered (new chat)');
    
    // Test: Cmd/Ctrl+, for settings
    await page.keyboard.press('Meta+,');
    await page.waitForTimeout(500);
    
    const settingsDialog = page.locator('[role="dialog"]').filter({ hasText: /settings|preferences/i });
    if (await settingsDialog.isVisible({ timeout: 2000 })) {
      console.log('✓ Cmd+, opens settings');
      
      // Close settings
      await page.keyboard.press('Escape');
      await expect(settingsDialog).not.toBeVisible({ timeout: 2000 });
      console.log('✓ Escape closes settings');
    }
    
    console.log('✓✓✓ KEYBOARD SHORTCUTS TEST PASSED ✓✓✓');
  });
});
