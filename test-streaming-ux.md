# Streaming UX Test Plan

## Manual Testing Checklist

### 1. Cursor Animation
- [ ] Start a message
- [ ] Watch the blinking cursor at the end
- [ ] Should blink smoothly (0.9s cycle)
- [ ] Should be visible (full primary color, not faded)
- [ ] No stutter or jank

### 2. Border Pulse
- [ ] Watch the border during streaming
- [ ] Should pulse smoothly between light and darker
- [ ] 0.8s cycle feels responsive
- [ ] No stuttering

### 3. Scroll Performance
**Test 1: Manual scroll during streaming**
- [ ] Start a long message streaming
- [ ] Manually scroll up and down
- [ ] Scrolling feels smooth (60 FPS)
- [ ] No lag or stuttering

**Test 2: Auto-scroll during streaming**
- [ ] Start message while at bottom
- [ ] Should stay pinned to bottom
- [ ] No visible scrolling animation (instant)
- [ ] No jank or jumping

**Test 3: Auto-scroll after manual scroll**
- [ ] Start message
- [ ] Scroll up manually
- [ ] Scroll back to near bottom
- [ ] Resume auto-scrolling smoothly

### 4. Stop Generation Button
**Appearance:**
- [ ] Appears smoothly when streaming starts
- [ ] Positioned above input (bottom-24)
- [ ] Clear shadow and styling

**Interaction:**
- [ ] Hover: scales up smoothly (1.05)
- [ ] Click: scales down (0.95) with tactile feedback
- [ ] Click: stops streaming immediately
- [ ] No lag between click and stop

**Keyboard shortcut:**
- [ ] Press Esc during streaming
- [ ] Streaming stops immediately
- [ ] Button disappears

### 5. Typing Indicator
- [ ] Before first character arrives
- [ ] Three dots bouncing
- [ ] Smooth wave motion (0.12s stagger)
- [ ] Fast enough to feel energetic (0.5s duration)
- [ ] No stuttering

### 6. Message Fade-In
- [ ] New message appears
- [ ] Fades in with slight slide up
- [ ] 200ms feels snappy
- [ ] Spring curve makes it feel lively
- [ ] No delay or stutter

### 7. Markdown Rendering
**Short messages:**
- [ ] Text appears immediately
- [ ] No flicker or reflow
- [ ] Inline code renders cleanly

**Code blocks:**
- [ ] Syntax highlighting applies smoothly
- [ ] No layout shift when code block appears
- [ ] Copy button appears on hover

**Long messages with mixed content:**
- [ ] Headers render without flicker
- [ ] Lists appear cleanly
- [ ] Tables don't cause layout jumps
- [ ] Images load without breaking flow

### 8. Layout Stability
- [ ] During streaming, page doesn't jump
- [ ] Code blocks don't cause reflows
- [ ] Message bubble stays stable
- [ ] No horizontal overflow

### 9. Performance Under Load
**Test 1: Fast streaming (high tokens/sec)**
- [ ] Send complex coding question
- [ ] Watch for dropped frames
- [ ] Cursor still blinking smoothly
- [ ] Border still pulsing
- [ ] Scroll staying pinned

**Test 2: Very long message**
- [ ] Generate essay-length response
- [ ] No slowdown as message grows
- [ ] Scroll performance consistent
- [ ] No memory issues

**Test 3: Multiple rapid messages**
- [ ] Send several messages quickly
- [ ] Each renders smoothly
- [ ] No cumulative lag

### 10. Edge Cases
**Empty/whitespace:**
- [ ] Streaming just spaces
- [ ] Cursor still visible and blinking

**Special characters:**
- [ ] Emoji, unicode
- [ ] No rendering glitches

**Interruption:**
- [ ] Stop mid-message
- [ ] Cursor disappears immediately
- [ ] Border pulse stops
- [ ] Message marked complete

**Network issues:**
- [ ] Simulate slow connection
- [ ] Chunked updates still smooth
- [ ] No visual glitches

---

## Browser DevTools Performance Profiling

### Steps:
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Send a message and let it stream completely
5. Stop recording
6. Analyze results

### Metrics to Check:
- **FPS:** Should be 60 (or close) during streaming
- **Frames:** Green bars (no red dropped frames)
- **Scripting:** No long tasks blocking main thread
- **Rendering:** Paint and composite times reasonable
- **Memory:** No growing heap during streaming

### Look For:
- ❌ Red frames (dropped)
- ❌ Long tasks (>50ms)
- ❌ Excessive style recalculations
- ❌ Forced reflows
- ✅ Consistent 16ms frame timing
- ✅ Minimal layout thrashing
- ✅ Efficient paint operations

---

## A/B Comparison (if possible)

If you have git access to the previous version:

### Before Optimizations:
1. Checkout previous commit
2. Note cursor animation style
3. Note scroll behavior during streaming
4. Note overall "feel"

### After Optimizations:
1. Checkout current commit
2. Compare side-by-side
3. Should feel noticeably smoother

---

## Accessibility Testing

### Screen Reader:
- [ ] Streaming message announces updates
- [ ] Stop button announces correctly
- [ ] Keyboard navigation works

### Reduced Motion:
- [ ] Enable prefers-reduced-motion
- [ ] All animations disabled or minimized
- [ ] Still functional

### High Contrast:
- [ ] Windows High Contrast Mode
- [ ] All elements visible
- [ ] Borders and focus indicators clear

---

## Cross-Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)

Each browser may handle animations slightly differently.

---

## Mobile/Touch Testing (if applicable)

- [ ] Touch targets ≥44px
- [ ] Stop button easy to tap
- [ ] Scroll behavior smooth on touch
- [ ] No lag on lower-power devices

---

## Sign-Off

**Date:** _____________

**Tester:** _____________

**Overall Smoothness Rating (1-10):** ___

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
