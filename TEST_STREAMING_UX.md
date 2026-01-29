# 🧪 Streaming UX Testing Guide

## Pre-Test Setup

1. **Start Dev Server:**
   ```bash
   npm run tauri dev
   ```

2. **Connect to Gateway:**
   - Ensure Gateway is running
   - Connect in app settings

3. **Open DevTools:**
   - Press `Cmd/Ctrl + Shift + I`
   - Monitor console for errors

---

## 🎯 Test Suite

### Test 1: Cursor Blink ✨
**Expected:** Smooth, crisp blinking cursor during streaming

**Steps:**
1. Send message: "Count to 100"
2. Watch the cursor at end of streaming text
3. Verify it blinks cleanly (on/off, no fade)
4. Check timing (0.8s cycle)

**Pass Criteria:**
- ✅ Cursor is 2px wide, full opacity
- ✅ Clean on/off blink (no fade)
- ✅ Blinks at ~1.25 Hz (0.8s cycle)
- ✅ No jitter or stutter

---

### Test 2: Token Streaming Performance 🚀
**Expected:** Buttery smooth streaming with no jank

**Steps:**
1. Send message: "Write a 1000 word essay on React performance"
2. Watch tokens appear in real-time
3. Monitor scroll behavior
4. Check CPU usage in DevTools Performance tab

**Pass Criteria:**
- ✅ Tokens appear smoothly
- ✅ No visual stuttering
- ✅ Auto-scroll is instant (no lag)
- ✅ CPU usage stays reasonable (<30% spike)

---

### Test 3: Auto-Scroll Behavior 📜
**Expected:** Smart auto-scroll - only when near bottom

**Steps:**
1. Start long response: "Explain quantum physics in detail"
2. Let it stream for 3 seconds
3. Scroll up mid-stream
4. Watch - should NOT auto-scroll
5. Scroll back to bottom
6. Should resume auto-scrolling

**Pass Criteria:**
- ✅ Auto-scroll when near bottom (<100px from bottom)
- ✅ No auto-scroll when scrolled up
- ✅ Resumes auto-scroll when return to bottom
- ✅ Smooth scroll for new messages
- ✅ Instant scroll during streaming

---

### Test 4: Stop Button Responsiveness ⏹️
**Expected:** Instant feedback, zero lag

**Steps:**
1. Start long response
2. Click "Stop generating" after 2 seconds
3. Measure perceived latency

**Pass Criteria:**
- ✅ Button responds instantly (<16ms)
- ✅ Cursor disappears immediately
- ✅ Message completes cleanly
- ✅ No error messages
- ✅ Can send new message right away

---

### Test 5: Very Long Response 📚
**Expected:** No performance degradation

**Steps:**
1. Send: "Write 10,000 words about the history of computing"
2. Let it complete fully
3. Monitor memory and CPU
4. Scroll through result

**Pass Criteria:**
- ✅ Streaming stays smooth throughout
- ✅ No memory leaks (check DevTools Memory)
- ✅ Scrolling remains fluid after completion
- ✅ No browser freezing

---

### Test 6: Error Recovery 🔧
**Expected:** Graceful handling of stream failures

**Steps:**
1. Disconnect Gateway mid-stream (kill Gateway process)
2. Observe error handling
3. Reconnect Gateway
4. Send new message

**Pass Criteria:**
- ✅ Error message appears in UI
- ✅ Message completes with error notice
- ✅ No frozen UI
- ✅ Can retry immediately after reconnect

---

### Test 7: Multiple Rapid Messages 💬
**Expected:** Smooth handling of quick succession

**Steps:**
1. Send message: "Hello"
2. Immediately after streaming starts, stop it
3. Send another: "How are you?"
4. Repeat 3 times

**Pass Criteria:**
- ✅ Each message animates in smoothly
- ✅ No overlap or glitches
- ✅ Stop button works every time
- ✅ Message history is correct

---

### Test 8: Typing Indicator 💭
**Expected:** Smooth appearance and animation

**Steps:**
1. Send message
2. Watch typing indicator appear
3. Verify bounce animation
4. Check timing of dots

**Pass Criteria:**
- ✅ Fades in smoothly (200ms)
- ✅ Dots bounce with stagger (200ms delay)
- ✅ Disappears when first token arrives
- ✅ No jank in transition

---

### Test 9: Window Resize During Stream 📐
**Expected:** No layout issues or jank

**Steps:**
1. Start long response
2. Resize window while streaming
3. Maximize/minimize
4. Change width dramatically

**Pass Criteria:**
- ✅ Layout adapts smoothly
- ✅ Streaming continues uninterrupted
- ✅ Auto-scroll still works
- ✅ No visual glitches

---

### Test 10: Reduced Motion 🧘
**Expected:** All animations respect user preference

**Steps:**
1. Enable reduced motion in OS settings:
   - macOS: System Preferences > Accessibility > Display > Reduce motion
   - Windows: Settings > Accessibility > Visual effects > Animation effects OFF
2. Send message
3. Verify animations

**Pass Criteria:**
- ✅ Cursor doesn't blink (stays solid)
- ✅ Streaming border doesn't pulse
- ✅ All transitions instant
- ✅ Typing indicator appears instantly

---

## 🔬 Performance Benchmarks

### Metrics to Monitor

**Chrome DevTools > Performance:**
1. Record during long streaming response
2. Check for:
   - Frame rate (should stay 60fps)
   - Long tasks (should be none >50ms)
   - Layout thrashing (should be minimal)

**Chrome DevTools > Memory:**
1. Take heap snapshot before test
2. Stream long response
3. Take heap snapshot after
4. Verify no significant growth (allow 2-3MB for content)

**Expected Results:**
- FPS: 60fps sustained
- Long tasks: 0
- Memory growth: <5MB for 10k tokens
- JS Heap: Stable after GC

---

## 🐛 Known Issues to Watch For

1. **RAF cleanup leak:** Monitor DevTools for "cancelled RAF" warnings
2. **Persistence lag:** Check IndexedDB write times in Network tab
3. **Scroll jank:** Watch for layout shifts during streaming
4. **Cursor flicker:** Verify no double-blink or stutter

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: ___________

Test 1 (Cursor): ☐ Pass ☐ Fail
  Notes: _______________________

Test 2 (Performance): ☐ Pass ☐ Fail
  Notes: _______________________

Test 3 (Auto-scroll): ☐ Pass ☐ Fail
  Notes: _______________________

Test 4 (Stop Button): ☐ Pass ☐ Fail
  Notes: _______________________

Test 5 (Long Response): ☐ Pass ☐ Fail
  Notes: _______________________

Test 6 (Error Recovery): ☐ Pass ☐ Fail
  Notes: _______________________

Test 7 (Rapid Messages): ☐ Pass ☐ Fail
  Notes: _______________________

Test 8 (Typing Indicator): ☐ Pass ☐ Fail
  Notes: _______________________

Test 9 (Window Resize): ☐ Pass ☐ Fail
  Notes: _______________________

Test 10 (Reduced Motion): ☐ Pass ☐ Fail
  Notes: _______________________

Overall: ☐ Pass ☐ Fail
```

---

## 🚀 Next Steps After Testing

1. **If all tests pass:**
   - Document final results
   - Create demo video
   - Update changelog
   - Ready for production

2. **If issues found:**
   - Log specific issues with screenshots
   - Check browser console for errors
   - Profile with DevTools
   - Iterate on fixes

---

## 🎬 Demo Video Checklist

Record these scenarios for showcase:
- [ ] Smooth streaming with cursor blink
- [ ] Instant stop button
- [ ] Long response handling
- [ ] Auto-scroll behavior
- [ ] Error recovery
- [ ] Multiple rapid messages

**Recording Settings:**
- 60fps minimum
- Show DevTools Performance panel
- Overlay keyboard/mouse input
- Duration: 2-3 minutes max
