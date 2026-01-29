# Accessibility Features - Moltz

**Status:** ✅ WCAG 2.1 Level AA Compliant  
**Last Updated:** January 29, 2026

---

## Overview

Moltz is designed to be fully accessible to users with disabilities, including those who use screen readers, keyboard-only navigation, or have visual, motor, or cognitive impairments.

---

## ✅ Implemented Features

### 1. Keyboard Navigation

**All functionality is accessible via keyboard:**

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between interactive elements |
| `Shift + Tab` | Navigate backwards |
| `Enter` | Activate buttons and submit forms |
| `Space` | Toggle switches and checkboxes |
| `Escape` | Close dialogs, sidebars, and cancel actions |
| `⌘/Ctrl + N` | Create new conversation |
| `⌘/Ctrl + K` | Open search dialog |
| `⌘/Ctrl + \` | Toggle sidebar |
| `⌘/Ctrl + ,` | Open settings |
| `↑` `↓` | Navigate search results |
| `Shift + Enter` | New line in message (instead of submit) |

**No keyboard traps:** Users can always navigate away from any element using keyboard.

**Skip-to-content link:** Pressing `Tab` on page load shows a "Skip to main content" link for faster navigation.

---

### 2. Screen Reader Support

**Semantic HTML Structure:**
- `<main>` for primary content
- `<aside role="complementary">` for sidebar
- `<nav>` for navigation sections
- `<article>` for individual messages
- `<h1>` through `<h6>` for proper heading hierarchy
- `role="search"` for filter/search sections

**ARIA Attributes:**
- `aria-label` on icon-only buttons
- `aria-describedby` for input hints and help text
- `aria-live="polite"` for status updates
- `aria-live="assertive"` for errors and critical alerts
- `aria-atomic="true"` for complete announcements
- `aria-expanded` for collapsible sections
- `aria-modal="true"` on dialogs
- `aria-hidden="true"` on decorative icons
- `role="alert"` for error messages
- `role="status"` for non-critical updates

**Context for Screen Readers:**
- Message timestamps: "Message from You sent 5 minutes ago"
- Connection status announced: "Online" / "Offline"
- Loading states announced: "Loading conversations, please wait"
- Streaming status announced: "Assistant is typing" / "Response complete"
- Error and success messages announced automatically

---

### 3. Focus Management

**Visible Focus Indicators:**
- 2px outline with 2px offset on all interactive elements
- Focus rings inherit border radius for visual consistency
- Enhanced 3px outline in high contrast mode
- Destructive actions have red focus color for safety

**Focus Trap in Modals:**
- Focus automatically moves to modal when opened
- Tab key stays within modal
- Focus returns to trigger element when modal closes
- Escape key always closes modal

**Auto-Focus:**
- Message input auto-focuses when conversation loads
- Search input auto-focuses when search dialog opens
- Settings form auto-focuses first field

---

### 4. Color & Contrast

**WCAG AA Compliance:**
- All text meets 4.5:1 contrast ratio
- Large text meets 3:1 contrast ratio
- Interactive elements have sufficient contrast
- Error states use both color AND icons/text

**High Contrast Mode Support:**
- Borders become more visible (2px → 3px)
- Focus indicators strengthen (2px → 3px)
- Color-blind friendly error/success states

**Dark Mode:**
- Automatically follows system preference
- Manual override available in settings
- All contrast ratios maintained in dark mode

---

### 5. Reduced Motion Support

**Respects `prefers-reduced-motion`:**
- Animations reduce to 0.01ms (essentially instant)
- Transitions become instant
- Hover effects remain but without motion
- Scroll behavior changes to `auto` (no smooth scroll)

**Motion-Free Alternatives:**
- Status changes use static indicators when motion reduced
- Loading spinners still visible but don't animate
- Streaming cursor becomes static when motion reduced

---

### 6. Form Accessibility

**All Forms Include:**
- Visible `<label>` elements with `htmlFor` matching `id`
- Help text linked via `aria-describedby`
- Error messages with `role="alert"` for immediate announcement
- Validation states clearly indicated
- Required fields marked and announced

**Example:**
```tsx
<label htmlFor="gateway-url">
  Gateway URL <span className="text-destructive">*</span>
</label>
<input
  id="gateway-url"
  required
  aria-describedby="gateway-url-hint"
  aria-invalid={hasError}
/>
<p id="gateway-url-hint">Enter your Gateway WebSocket URL</p>
{error && (
  <div role="alert" aria-live="assertive">
    {error}
  </div>
)}
```

---

### 7. Touch Targets

**Minimum 44x44px Touch Targets:**
- All buttons meet iOS and Android guidelines
- Icon buttons have adequate padding
- Mobile-optimized touch areas
- Dismiss buttons on toasts enlarged for easier tapping

**Hover States:**
- All interactive elements have hover feedback
- Color changes, shadows, or background shifts
- Touch-friendly spacing between elements

---

### 8. Loading & Error States

**Loading States:**
- Visual spinner + loading text
- Screen reader announcement: "Loading, please wait"
- Cancel button for long operations
- Progress indication when available

**Error States:**
- Clear error message with title and description
- Suggested actions provided
- Dismissible or auto-hide after timeout
- Retry/recover options available
- Offline mode clearly indicated

**Connection Status:**
- Always visible in header
- "Online" (green) / "Offline" (amber) indicator
- Announced to screen readers on change
- Queued message count shown when offline

---

### 9. Responsive Design

**Mobile Optimizations:**
- Sidebar becomes overlay with backdrop blur
- Tap outside or Escape to close
- Touch-friendly button sizes (minimum 44x44px)
- Scrollable content areas
- Pinch-to-zoom enabled

**Desktop Optimizations:**
- Sidebar can be resized or hidden
- Keyboard shortcuts for power users
- Hover states for all interactive elements
- Multi-column layouts on wide screens

---

### 10. Content Readability

**Typography:**
- System font stack for familiarity
- Minimum 14px font size for body text
- Line height 1.5 for readability
- Adequate letter spacing
- Left-aligned text (not justified)

**Content Structure:**
- Short paragraphs
- Clear headings
- Bulleted lists for scannability
- Code blocks with syntax highlighting
- Tables with proper headers

---

## 🧪 Testing

### Screen Readers Tested
- ✅ **NVDA** (Windows) - Latest version
- ✅ **VoiceOver** (macOS) - Built-in
- ✅ **TalkBack** (Android) - Mobile testing

### Keyboard Navigation
- ✅ All features accessible without mouse
- ✅ Tab order logical and predictable
- ✅ Focus always visible
- ✅ No keyboard traps

### Tools Used
- ✅ axe DevTools - Automated scanning
- ✅ WAVE - Visual accessibility evaluation
- ✅ Lighthouse - Accessibility audit (target 100)
- ✅ Color contrast checker - WCAG AA verification

---

## 🎯 Accessibility Checklist

Use this checklist when adding new features:

### Every Interactive Element
- [ ] Keyboard accessible (Tab, Enter, Space)
- [ ] Has visible focus indicator
- [ ] Has descriptive `aria-label` (if icon-only)
- [ ] Touch target ≥ 44x44px

### Every Form Field
- [ ] Has associated `<label>` with `htmlFor`
- [ ] Help text uses `aria-describedby`
- [ ] Error states use `role="alert"`
- [ ] Validation states clearly indicated

### Every Dynamic Content Change
- [ ] Uses `aria-live` regions appropriately
- [ ] Announces status changes to screen readers
- [ ] Provides visual feedback as well
- [ ] Respects reduced motion settings

### Every Modal/Dialog
- [ ] Uses `role="dialog"` and `aria-modal="true"`
- [ ] Has `aria-labelledby` pointing to title
- [ ] Traps focus within modal
- [ ] Returns focus on close
- [ ] Closes with Escape key

### Every Color-Coded Feature
- [ ] Doesn't rely solely on color
- [ ] Includes icon or text indicator
- [ ] Meets WCAG contrast ratios
- [ ] Works in high contrast mode

---

## 📊 WCAG 2.1 Compliance Matrix

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 1.1.1 Non-text Content | A | ✅ | All images have alt text |
| 1.3.1 Info and Relationships | A | ✅ | Semantic HTML + ARIA |
| 1.4.3 Contrast (Minimum) | AA | ✅ | 4.5:1 for text, 3:1 for large |
| 1.4.11 Non-text Contrast | AA | ✅ | UI components meet 3:1 |
| 2.1.1 Keyboard | A | ✅ | All functionality keyboard accessible |
| 2.1.2 No Keyboard Trap | A | ✅ | No traps present |
| 2.4.3 Focus Order | A | ✅ | Logical tab order |
| 2.4.7 Focus Visible | AA | ✅ | 2px outline + offset |
| 3.2.1 On Focus | A | ✅ | No unexpected context changes |
| 3.3.1 Error Identification | A | ✅ | Errors clearly identified |
| 3.3.2 Labels or Instructions | A | ✅ | All inputs labeled |
| 4.1.2 Name, Role, Value | A | ✅ | Proper ARIA implementation |
| 4.1.3 Status Messages | AA | ✅ | Live regions for status |

**Overall Compliance: WCAG 2.1 Level AA ✅**

---

## 🚀 Future Enhancements

### Planned (Low Priority)
- [ ] Keyboard shortcuts help dialog (⌘?)
- [ ] Focus-trap library integration
- [ ] Enhanced live region strategy
- [ ] Voice control optimization
- [ ] Cognitive accessibility testing

### Experimental
- [ ] Haptic feedback on mobile (if supported)
- [ ] Audio feedback option (e.g., sounds for sent messages)
- [ ] Text-to-speech for messages (using browser TTS)
- [ ] Customizable color schemes for visual comfort

---

## 📞 Reporting Accessibility Issues

If you encounter any accessibility issues:

1. **Check** [ACCESSIBILITY_TESTING.md](./ACCESSIBILITY_TESTING.md) for testing guidance
2. **Report** on GitHub with details:
   - What you were trying to do
   - What happened vs. what you expected
   - Your assistive technology (screen reader, keyboard, etc.)
   - Steps to reproduce
3. **Priority:** We treat accessibility bugs as P0 (highest priority)

**Example Report:**
```
Title: Settings button not announced by VoiceOver

Steps:
1. Enable VoiceOver on macOS
2. Navigate to sidebar footer
3. Focus on settings button

Expected: Hears "Settings, button"
Actual: No announcement

Environment: macOS 14, VoiceOver, Safari
```

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)
- [Inclusive Components](https://inclusive-components.design/)
- [The A11Y Project](https://www.a11yproject.com/)

---

## ✨ Acknowledgments

Accessibility is a core value of Moltz. We're committed to ensuring everyone can use our application effectively, regardless of ability.

**Tested by:**
- Keyboard-only users
- Screen reader users (NVDA, VoiceOver)
- Users with reduced motion preferences
- Users with visual impairments

**Special thanks to:**
- WebAIM for accessibility guidelines
- Radix UI for accessible primitives
- The a11y community for best practices

---

**Questions?** Check [ACCESSIBILITY_TESTING.md](./ACCESSIBILITY_TESTING.md) for detailed testing procedures.

**Found an issue?** Please report it immediately – accessibility bugs are P0 priority.
