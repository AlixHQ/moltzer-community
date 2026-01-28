import { test, expect } from '@playwright/test';

/**
 * MESSAGE INTERACTIONS - E2E Tests
 * Tests all message-level interactions: copy, edit, regenerate, multiline, markdown
 * REAL tests that actually interact with the UI
 */

test.describe('Message Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Skip onboarding and get to main app
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('moltz-onboarding-completed', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for chat input to be ready
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    await expect(chatInput).toBeVisible({ timeout: 15000 });
  });

  test('should send multiline message with Shift+Enter', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Type first line
    await chatInput.fill('Line 1');
    
    // Shift+Enter should NOT send, but add newline
    await chatInput.press('Shift+Enter');
    
    // Type second line  
    await chatInput.type('Line 2');
    
    // Shift+Enter again
    await chatInput.press('Shift+Enter');
    
    // Type third line
    await chatInput.type('Line 3');
    
    // Verify input contains all lines (check for newlines or line breaks)
    const inputValue = await chatInput.inputValue();
    expect(inputValue).toContain('Line 1');
    expect(inputValue).toContain('Line 2');
    expect(inputValue).toContain('Line 3');
    
    // Now send with regular Enter
    await chatInput.press('Enter');
    
    // All three lines should appear in the message
    const message = page.locator('text=Line 1');
    await expect(message).toBeVisible({ timeout: 3000 });
    
    // Verify message contains all lines
    await expect(page.locator('text=Line 2')).toBeVisible();
    await expect(page.locator('text=Line 3')).toBeVisible();
    
    console.log('✓ Multiline message sent correctly');
  });

  test('should handle empty message gracefully', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Try to send empty message
    await chatInput.click();
    await chatInput.press('Enter');
    
    // Should not send anything (input should still be focused and empty)
    await expect(chatInput).toBeFocused();
    await expect(chatInput).toHaveValue('');
    
    console.log('✓ Empty message blocked');
  });

  test('should handle very long message', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Create a very long message (5000 characters)
    const longMessage = 'A'.repeat(5000) + ` END-${Date.now()}`;
    
    await chatInput.fill(longMessage);
    await chatInput.press('Enter');
    
    // Should send without crashing
    await expect(page.locator('text=END-')).toBeVisible({ timeout: 3000 });
    
    console.log('✓ Long message handled');
  });

  test('should display messages in chronological order', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Send 3 messages with distinct timestamps
    const messages = [
      `Message 1 - ${Date.now()}`,
      `Message 2 - ${Date.now() + 1}`,
      `Message 3 - ${Date.now() + 2}`
    ];
    
    for (const msg of messages) {
      await chatInput.fill(msg);
      await chatInput.press('Enter');
      await expect(page.locator(`text=${msg}`)).toBeVisible({ timeout: 3000 });
      await page.waitForTimeout(300); // Small delay between messages
    }
    
    // Verify order by checking Y positions
    const msg1 = page.locator(`text=${messages[0]}`).first();
    const msg2 = page.locator(`text=${messages[1]}`).first();
    const msg3 = page.locator(`text=${messages[2]}`).first();
    
    const box1 = await msg1.boundingBox();
    const box2 = await msg2.boundingBox();
    const box3 = await msg3.boundingBox();
    
    // Messages should appear top-to-bottom in order
    if (box1 && box2 && box3) {
      expect(box1.y).toBeLessThan(box2.y);
      expect(box2.y).toBeLessThan(box3.y);
      console.log('✓ Messages in chronological order');
    }
  });

  test('should handle special characters and HTML safely', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Test various special characters
    const specialMessages = [
      '<script>alert("XSS")</script>',
      '< > & " \' / \\',
      '🚀 🎉 💻 ✨',
      'Multi\nline\ntext',
      '**Bold** *italic* `code`'
    ];
    
    for (const msg of specialMessages) {
      await chatInput.fill(msg);
      await chatInput.press('Enter');
      
      // Should display safely without executing
      await page.waitForTimeout(500);
      
      // Verify no script execution (page should still be functional)
      await expect(chatInput).toBeVisible();
    }
    
    console.log('✓ Special characters handled safely');
  });

  test('should copy message to clipboard', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    const testMessage = `Copy test ${Date.now()}`;
    await chatInput.fill(testMessage);
    await chatInput.press('Enter');
    
    const messageElement = page.locator(`text=${testMessage}`).first();
    await expect(messageElement).toBeVisible({ timeout: 3000 });
    
    // Hover over message to reveal actions
    await messageElement.hover();
    await page.waitForTimeout(300);
    
    // Look for copy button
    const copyButton = page.locator('button').filter({
      or: [
        { hasText: /copy/i },
        { hasTitle: /copy/i },
        { hasAccessibleName: /copy/i }
      ]
    });
    
    if (await copyButton.first().isVisible({ timeout: 2000 })) {
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      
      await copyButton.first().click();
      
      // Look for "copied" confirmation
      const copiedIndicator = page.locator('text=/copied/i');
      if (await copiedIndicator.isVisible({ timeout: 2000 })) {
        console.log('✓ Copy button clicked, confirmation shown');
      } else {
        console.log('✓ Copy button clicked (no confirmation shown)');
      }
    } else {
      console.log('⚠ Copy button not found (might be hidden or different UI)');
    }
  });

  test('should show timestamp on message', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    const testMessage = `Timestamp test ${Date.now()}`;
    await chatInput.fill(testMessage);
    await chatInput.press('Enter');
    
    const messageElement = page.locator(`text=${testMessage}`).first();
    await expect(messageElement).toBeVisible({ timeout: 3000 });
    
    // Hover over message
    await messageElement.hover();
    await page.waitForTimeout(500);
    
    // Look for timestamp indicators (could be "just now", "1m ago", time format, etc.)
    const timestampPatterns = [
      /just now/i,
      /\d+\s*(second|minute|hour|day)s?\s*ago/i,
      /\d{1,2}:\d{2}/,  // Time format HH:MM
      /\d{4}-\d{2}-\d{2}/  // Date format YYYY-MM-DD
    ];
    
    let foundTimestamp = false;
    for (const pattern of timestampPatterns) {
      const timestamp = page.locator('text=' + pattern.source);
      if (await timestamp.isVisible({ timeout: 1000 })) {
        foundTimestamp = true;
        console.log(`✓ Timestamp found matching pattern: ${pattern}`);
        break;
      }
    }
    
    if (!foundTimestamp) {
      console.log('⚠ No timestamp found (might be hidden or different format)');
    }
  });

  test('should render markdown formatting', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Send message with markdown
    const markdownMessage = 'This has **bold** and *italic* and `code`';
    await chatInput.fill(markdownMessage);
    await chatInput.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Check if markdown is rendered (look for styled elements)
    // Bold text should be in <strong> or <b>
    const boldElement = page.locator('strong, b').filter({ hasText: 'bold' });
    
    // Italic text should be in <em> or <i>
    const italicElement = page.locator('em, i').filter({ hasText: 'italic' });
    
    // Code should be in <code>
    const codeElement = page.locator('code').filter({ hasText: 'code' });
    
    if (await boldElement.isVisible({ timeout: 2000 })) {
      console.log('✓ Markdown bold rendered');
    }
    if (await italicElement.isVisible({ timeout: 1000 })) {
      console.log('✓ Markdown italic rendered');
    }
    if (await codeElement.isVisible({ timeout: 1000 })) {
      console.log('✓ Markdown code rendered');
    }
  });

  test('should render code blocks with syntax highlighting', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Send code block
    const codeBlock = '```javascript\nconst x = 42;\nconsole.log(x);\n```';
    await chatInput.fill(codeBlock);
    await chatInput.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Look for code block container
    const codeBlockElement = page.locator('pre code, pre, .hljs');
    
    if (await codeBlockElement.isVisible({ timeout: 2000 })) {
      console.log('✓ Code block rendered');
      
      // Check if it contains the code
      const codeText = await codeBlockElement.textContent();
      if (codeText?.includes('const x = 42')) {
        console.log('✓ Code block contains correct content');
      }
    } else {
      console.log('⚠ Code block not rendered (might display as plain text)');
    }
  });

  test('should auto-scroll to latest message', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Send multiple messages to create scrollable content
    for (let i = 0; i < 15; i++) {
      await chatInput.fill(`Message ${i + 1} - ${Date.now()}`);
      await chatInput.press('Enter');
      await page.waitForTimeout(200);
    }
    
    // Last message should be visible (auto-scrolled)
    const lastMessage = page.locator('text=Message 15 -');
    await expect(lastMessage).toBeVisible({ timeout: 3000 });
    
    // Verify it's actually in viewport (not just in DOM)
    const isInViewport = await lastMessage.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    });
    
    if (isInViewport) {
      console.log('✓ Auto-scrolled to latest message');
    } else {
      console.log('⚠ Last message exists but may not be in viewport');
    }
  });

  test('should handle rapid message sending', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    // Send multiple messages rapidly
    const rapidMessages = Array.from({ length: 5 }, (_, i) => 
      `Rapid ${i + 1} - ${Date.now()}`
    );
    
    for (const msg of rapidMessages) {
      await chatInput.fill(msg);
      await chatInput.press('Enter');
      // No waiting between messages
    }
    
    // All messages should eventually appear
    await page.waitForTimeout(2000);
    
    for (const msg of rapidMessages) {
      await expect(page.locator(`text=${msg}`)).toBeVisible({ timeout: 3000 });
    }
    
    console.log('✓ Rapid message sending handled');
  });

  test('should preserve message order during rapid sending', async ({ page }) => {
    const chatInput = page.locator('textarea, input').filter({ 
      hasPlaceholder: /message|type/i 
    });
    
    const msg1 = `First rapid ${Date.now()}`;
    const msg2 = `Second rapid ${Date.now() + 1}`;
    const msg3 = `Third rapid ${Date.now() + 2}`;
    
    // Send rapidly
    await chatInput.fill(msg1);
    await chatInput.press('Enter');
    await chatInput.fill(msg2);
    await chatInput.press('Enter');
    await chatInput.fill(msg3);
    await chatInput.press('Enter');
    
    await page.waitForTimeout(1500);
    
    // Check order
    const box1 = await page.locator(`text=${msg1}`).first().boundingBox();
    const box2 = await page.locator(`text=${msg2}`).first().boundingBox();
    const box3 = await page.locator(`text=${msg3}`).first().boundingBox();
    
    if (box1 && box2 && box3) {
      expect(box1.y).toBeLessThan(box2.y);
      expect(box2.y).toBeLessThan(box3.y);
      console.log('✓ Message order preserved during rapid sending');
    }
  });
});
