# 👀 Quick Visual Inspection Guide

## 30-Second Smoke Test

**Goal:** Verify streaming UX improvements work

### 1. Start the App
```bash
npm run tauri dev
```

### 2. Send Test Message
```
"Count from 1 to 100 slowly"
```

### 3. Watch For These

#### ✅ GOOD Signs:
- [ ] Cursor blinks cleanly (on/off, no fade)
- [ ] Text streams smoothly
- [ ] Page auto-scrolls instantly (no lag)
- [ ] Typing indicator appears with fade-in

#### ❌ BAD Signs:
- [ ] Cursor fades in/out (should be on/off)
- [ ] Jank when tokens arrive
- [ ] Scroll lag or stutter
- [ ] Typing dots don't stagger

### 4. Test Stop Button
- Click "Stop generating" mid-stream
- Should feel instant (<16ms)
- Cursor disappears immediately

### 5. Test Error Handling
- Disconnect Gateway mid-stream
- Error message should appear
- Message completes with error notice

---

## Visual Checklist

### Streaming Cursor
```
BEFORE: ▌ (fades in/out, thick)
AFTER:  | (blinks on/off, thin)
```

### Scroll Behavior
```
BEFORE: Smooth but laggy
AFTER:  Instant, no lag
```

### Stop Button
```
BEFORE: ~100ms delay
AFTER:  <16ms instant
```

---

## If Something Looks Wrong

1. **Check Console** - Any errors?
2. **Check Network** - Gateway connected?
3. **Check Browser** - Try hard refresh (Cmd/Ctrl + Shift + R)
4. **Check Build** - Run `npm run build` to verify no errors

---

## Expected Behavior Summary

| Element | Behavior |
|---------|----------|
| Cursor | Blinks on/off, 0.8s cycle |
| Tokens | Appear smoothly, no jank |
| Scroll | Instant during stream |
| Stop | <16ms response |
| Errors | Graceful with message |

---

## One-Liner Test

Send this and watch:
```
"Write a 500 word essay on React performance"
```

Should see:
1. Typing dots appear (fade-in)
2. First token arrives (dots disappear)
3. Cursor blinks at end of text
4. Auto-scroll is instant
5. Stop button is responsive

If all 5 work = **SUCCESS** ✅
