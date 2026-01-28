# Accessibility Testing Guide

Quick guide for testing the accessibility improvements in Moltz.

---

## 🔍 Quick Tests

### 1. Keyboard Navigation Test (5 minutes)

**Goal:** Ensure all functionality works without a mouse.

1. **Unplug your mouse** or don't touch it
2. Open Moltz
3. Press **Tab** repeatedly:
   - ✅ Skip-to-content link should appear
   - ✅ Focus visible on all buttons/inputs
   - ✅ Sidebar buttons accessible
   - ✅ Message input reachable
4. Press **Cmd/Ctrl + \\** to toggle sidebar
5. Press **Cmd/Ctrl + K** to open search
6. Use **Arrow keys** in search results
7. Press **Escape** to close dialogs

**Pass Criteria:**
- All elements reachable via keyboard
- Focus always visible (2px outline)
- No keyboard traps
- Shortcuts work

---

### 2. Screen Reader Test (10 minutes)

**Windows:** NVDA (free)  
**macOS:** VoiceOver (built-in, Cmd+F5)

1. **Start screen reader**
2. Navigate to Moltz
3. Press **Tab** through the interface:
   - Listen for button/input announcements
   - Verify labels make sense
   - Check error messages are read
4. Type a message:
   - Verify input is announced
   - Check hint is read
5. Send message:
   - Verify success/error announced

**Pass Criteria:**
- All inputs have labels
- Buttons describe their action
- Errors are announced
- Dynamic content announced (toasts)

---

### 3. Visual Accessibility Test (5 minutes)

**Goal:** Check contrast and focus visibility.

1. **Enable high contrast mode** (Windows Settings)
2. Open Moltz:
   - ✅ All borders visible
   - ✅ Focus indicators prominent (3px)
3. **Disable high contrast**
4. Tab through elements:
   - ✅ Focus rings visible on all elements
   - ✅ 2px outline with offset
5. Check text contrast:
   - ✅ All text readable
   - ✅ Muted text still has sufficient contrast

**Pass Criteria:**
- Focus always visible
- Text meets 4.5:1 contrast
- High contrast mode works

---

### 4. Motion Sensitivity Test (3 minutes)

**Goal:** Ensure app works with reduced motion.

1. **Enable "Reduce motion"**:
   - **macOS:** System Settings → Accessibility → Display → Reduce motion
   - **Windows:** Settings → Accessibility → Visual effects → Animation effects OFF
2. Open Moltz
3. Navigate through interface:
   - ✅ Animations instant/minimal
   - ✅ No jarring motion
   - ✅ App still functional
4. Open/close sidebar:
   - ✅ No slow animations
5. Send message:
   - ✅ No distracting motion

**Pass Criteria:**
- All animations respect preference
- No essential info lost
- App remains usable

---

### 5. Mobile Responsiveness Test (5 minutes)

**Goal:** Ensure mobile usability.

1. **Resize browser** to 375px width (mobile)
2. Test sidebar:
   - ✅ Opens with overlay
   - ✅ Closes on tap outside
   - ✅ Escape key works
3. Test dialogs (Settings):
   - ✅ Fits on screen
   - ✅ Content scrollable
   - ✅ Footer visible
4. Test message input:
   - ✅ Adapts to width
   - ✅ Touch targets adequate (44x44px)
5. Test empty states:
   - ✅ Centered and readable

**Pass Criteria:**
- No horizontal scroll
- All content accessible
- Touch targets adequate
- Readable text sizes

---

## 🎯 Critical Paths to Test

### Path 1: First-time User
1. Launch app
2. Skip-to-content appears on Tab
3. Create new conversation (Cmd+N or button)
4. Type and send message
5. Read response
6. Navigate with keyboard only

### Path 2: Settings Configuration
1. Open Settings (Cmd+,)
2. Tab through all inputs
3. Verify all labels present
4. Change theme
5. Test connection
6. Save with keyboard (Enter)

### Path 3: Search Functionality
1. Open search (Cmd+K)
2. Type query
3. Use arrows to navigate results
4. Select with Enter
5. Close with Escape

### Path 4: Message Interaction
1. Hover over message
2. Tab to action buttons
3. Edit message (keyboard only)
4. Save with Enter
5. Verify update announced

---

## 🔧 Tools

### Browser Extensions
- **axe DevTools** - Automated accessibility scanning
- **WAVE** - Visual accessibility evaluation
- **Lighthouse** - Chrome DevTools built-in

### Screen Readers
- **NVDA** (Windows, free) - https://www.nvaccess.org/
- **VoiceOver** (macOS, built-in) - Cmd+F5
- **JAWS** (Windows, paid)

### Keyboard Testing
- **No tools needed** - Just unplug your mouse!

### Contrast Checkers
- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Browser DevTools** - Built-in contrast ratio display

---

## ✅ Expected Results

### All Tests Should Pass:
- ✅ No keyboard traps
- ✅ All focus states visible
- ✅ All inputs labeled
- ✅ Errors announced
- ✅ Reduced motion respected
- ✅ Mobile responsive
- ✅ High contrast works
- ✅ Screen reader friendly

### WCAG 2.1 Compliance:
- ✅ **Level A** - Full compliance
- ✅ **Level AA** - Full compliance
- ⚠️ **Level AAA** - Partial (reduced motion, enhanced focus)

---

## 🐛 Common Issues to Watch For

1. **Focus not visible** → Check focus ring exists
2. **Input without label** → Add `<label htmlFor="...">`
3. **Keyboard trap** → Ensure Tab/Escape work
4. **Unlabeled button** → Add `aria-label`
5. **No error announcement** → Add `role="alert"`
6. **Motion not reduced** → Check media query
7. **Mobile overflow** → Add `overflow-hidden` to parent

---

## 📞 Reporting Issues

If you find any accessibility issues:

1. **What:** Describe the issue
2. **Where:** Which component/page
3. **How:** Steps to reproduce
4. **Tool:** Screen reader, keyboard, etc.
5. **Expected:** What should happen
6. **Actual:** What actually happens

**Example:**
```
What: Settings button not announced
Where: Sidebar footer
How: Tab to button, listen with NVDA
Tool: NVDA screen reader
Expected: "Settings, button"
Actual: No announcement
```

---

## 🎓 Learning Resources

- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [WebAIM: Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [MDN: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Happy Testing! 🎉**

If all tests pass, you can be confident that Moltz is accessible to users with disabilities.
