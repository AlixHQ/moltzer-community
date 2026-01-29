# Keyboard Navigation Test Script

Manual testing checklist for keyboard navigation. Test with keyboard only (no mouse).

## Prerequisites
- Close any open tabs/windows
- Start Moltz fresh
- Have a keyboard ready
- Optional: Screen reader (VoiceOver on Mac, NVDA on Windows)

---

## Test 1: Initial Load & Focus

**Steps:**
1. Launch Moltz
2. Press Tab immediately

**Expected:**
- ✅ Focus moves to "Skip to main content" link (visible on focus)
- ✅ Focus indicator is clearly visible (blue ring)

---

## Test 2: Onboarding Flow

**Steps:**
1. Tab through welcome screen
2. Press Enter on "Get Started"
3. Navigate through onboarding steps using Tab
4. Use Enter/Space to activate buttons

**Expected:**
- ✅ Tab order is logical (top to bottom, left to right)
- ✅ Primary button auto-focuses on each step
- ✅ All buttons respond to Enter/Space
- ✅ No focus traps (can Tab through everything)

---

## Test 3: Sidebar Navigation

**Steps:**
1. Complete onboarding or skip
2. Press `Cmd/Ctrl + N` to create conversations (create 5+)
3. Press Tab until sidebar conversation list is focused
4. Use Arrow Up/Down to navigate conversations
5. Press Enter to select a conversation
6. Press Delete on a conversation

**Expected:**
- ✅ `Cmd/Ctrl + N` creates new conversation
- ✅ Arrow keys move focus between conversations
- ✅ Enter selects conversation
- ✅ Delete opens confirmation dialog
- ✅ Focus indicator shows current conversation
- ✅ Pinned and unpinned sections both navigate correctly

---

## Test 4: Dialog Focus Trapping

### Search Dialog
**Steps:**
1. Press `Cmd/Ctrl + K`
2. Type search query
3. Press Arrow Down/Up to navigate results
4. Press Tab repeatedly
5. Press Escape

**Expected:**
- ✅ Dialog opens, focus moves to search input
- ✅ Arrow keys navigate results
- ✅ Tab cycles through dialog elements only (trapped)
- ✅ Cannot Tab to background content
- ✅ Escape closes dialog
- ✅ Focus returns to previous element

### Settings Dialog
**Steps:**
1. Press `Cmd/Ctrl + ,`
2. Tab through all fields
3. Try to Tab past last button
4. Press Escape

**Expected:**
- ✅ Dialog opens, focus moves to first input
- ✅ Tab cycles through all form controls
- ✅ Tab from last element returns to first (trapped)
- ✅ Escape closes dialog
- ✅ All inputs are keyboard accessible

### Confirm Dialog
**Steps:**
1. Try to delete a conversation (Delete key on sidebar item)
2. Press Tab through dialog
3. Press Enter
4. Try again, press Escape

**Expected:**
- ✅ Dialog opens, focus on first button
- ✅ Tab cycles between Cancel/Confirm
- ✅ Enter confirms action
- ✅ Escape cancels action

---

## Test 5: Chat Input Focus

**Steps:**
1. Open any conversation
2. Press `Cmd/Ctrl + /`
3. Type a message
4. Press `Cmd/Ctrl + Enter` to send
5. Press `Shift + Enter` for new line

**Expected:**
- ✅ `Cmd/Ctrl + /` focuses chat input
- ✅ `Cmd/Ctrl + Enter` sends message
- ✅ `Shift + Enter` creates new line
- ✅ Input stays focused after sending

---

## Test 6: Streaming Response

**Steps:**
1. Send a message
2. While streaming, press Escape

**Expected:**
- ✅ Escape stops generation
- ✅ Stop button is keyboard accessible
- ✅ Visual feedback when streaming stops

---

## Test 7: Global Shortcuts

**Test each:**
- `Cmd/Ctrl + N` → New conversation
- `Cmd/Ctrl + K` → Search dialog
- `Cmd/Ctrl + ,` → Settings dialog
- `Cmd/Ctrl + \` → Toggle sidebar
- `Cmd/Ctrl + /` → Focus chat input
- `Escape` → Close any open dialog

**Expected:**
- ✅ All shortcuts work from any screen
- ✅ No conflicts between shortcuts
- ✅ Shortcuts work consistently

---

## Test 8: Tab Order (Main View)

**Steps:**
1. From main view, press Tab repeatedly through entire app
2. Note the order: Sidebar toggle → Conversations → Settings → Chat input → Message actions

**Expected:**
- ✅ Logical tab order (left to right, top to bottom)
- ✅ No tab traps in main content
- ✅ Focus indicator always visible
- ✅ Can reach all interactive elements

---

## Test 9: Screen Reader (Optional)

**Steps:**
1. Enable VoiceOver (Cmd+F5 on Mac) or NVDA (Ctrl+Alt+N on Windows)
2. Navigate through app with screen reader
3. Activate buttons and inputs
4. Listen to announcements

**Expected:**
- ✅ All images have alt text or aria-labels
- ✅ All buttons have descriptive labels
- ✅ Form inputs have labels
- ✅ Dialogs announce properly
- ✅ Live regions announce updates (errors, success)

---

## Test 10: Edge Cases

### Mobile/Small Screen
**Steps:**
1. Resize window to mobile size
2. Press `Cmd/Ctrl + \` to toggle sidebar
3. Press Escape to close sidebar

**Expected:**
- ✅ Sidebar toggles properly
- ✅ Escape closes mobile sidebar
- ✅ All keyboard shortcuts still work

### High Contrast Mode (Windows)
**Steps:**
1. Enable Windows High Contrast Mode
2. Navigate through app

**Expected:**
- ✅ Focus indicators visible in high contrast
- ✅ All borders/outlines visible
- ✅ Text remains readable

### Reduced Motion
**Steps:**
1. Enable reduced motion (System Preferences on Mac)
2. Navigate through app
3. Watch for animations

**Expected:**
- ✅ Animations are minimal/instant
- ✅ Dialogs appear without animation
- ✅ No jarring motion

---

## Bug Report Template

If you find issues, report with:

```markdown
**Issue:** [Brief description]
**Steps to reproduce:**
1. ...
2. ...

**Expected:** ...
**Actual:** ...
**Browser/OS:** ...
**Screenshot:** [if applicable]
```

---

## Success Criteria

All tests pass = ✅ Excellent keyboard navigation
1-2 minor issues = ⚠️ Good, needs polish
3+ issues = ❌ Needs work

---

## Notes for Testers

- Test in both light and dark mode
- Test with different zoom levels
- Test with browser zoom (Cmd/Ctrl + +/-)
- Try to "break" the navigation (unusual key combinations)
- Report anything that feels awkward or unintuitive

---

## Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical
- [ ] Focus indicators are clearly visible
- [ ] Dialogs trap focus properly
- [ ] Escape closes dialogs
- [ ] Enter/Space activate buttons
- [ ] Arrow keys navigate lists
- [ ] Screen reader friendly
- [ ] Reduced motion respected
- [ ] High contrast support

---

**Last Updated:** 2026-01-29
**Tested By:** [Your Name]
**Result:** [ ] Pass / [ ] Fail
