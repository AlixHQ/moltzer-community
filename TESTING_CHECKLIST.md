# Connection Resilience - Testing Checklist

**Priority:** P0  
**Tester:** ___________  
**Date:** ___________  
**Build:** ___________

---

## Pre-Test Setup

### Gateway Control Commands
```bash
# Check Gateway status
clawdbot gateway status

# Start Gateway
clawdbot gateway start

# Stop Gateway
clawdbot gateway stop

# Restart Gateway
clawdbot gateway restart
```

### Network Control (Windows)
```powershell
# Disable WiFi
netsh interface set interface "Wi-Fi" disabled

# Enable WiFi
netsh interface set interface "Wi-Fi" enabled
```

---

## Test Suite

### 🧪 Test 1: Basic Message Queue
**Goal:** Verify messages queue when disconnected

**Steps:**
1. ✅ Start app, ensure connected (green dot)
2. ✅ Send test message "Test 1" → should work normally
3. ✅ Stop Gateway: `clawdbot gateway stop`
4. ✅ Send message "This should queue"
5. ✅ Verify:
   - [ ] Message shows ⚠️ **Queued** status (amber)
   - [ ] Status bar shows "Offline Mode — 1 message queued"
   - [ ] No error toast shown
6. ✅ Start Gateway: `clawdbot gateway start`
7. ✅ Verify:
   - [ ] Message auto-sends within 10 seconds
   - [ ] Status changes to ✅ **Sent**
   - [ ] Assistant response appears
   - [ ] Queue count disappears from status bar

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 2: Multiple Queued Messages
**Goal:** Verify multiple messages queue and send in order

**Steps:**
1. ✅ Disconnect from Gateway
2. ✅ Send 3 messages:
   - "Message 1"
   - "Message 2"
   - "Message 3"
3. ✅ Verify:
   - [ ] All 3 show ⚠️ **Queued**
   - [ ] Status bar shows "3 messages queued"
4. ✅ Reconnect to Gateway
5. ✅ Verify:
   - [ ] All 3 send in order (1 → 2 → 3)
   - [ ] Each gets assistant response
   - [ ] No duplicates
   - [ ] Queue count decrements: 3 → 2 → 1 → 0

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 3: Auth Error Detection
**Goal:** Verify auth errors auto-open Settings

**Setup:**
```bash
# Edit Gateway config to use wrong token
# Or set invalid token in Moltz settings
```

**Steps:**
1. ✅ Configure invalid token
2. ✅ Restart app or trigger reconnect
3. ✅ Verify error overlay:
   - [ ] Shows 🔒 lock icon (not ⚠️ warning)
   - [ ] Title: "Authentication failed"
   - [ ] Message mentions token
   - [ ] "Open Settings" button visible
4. ✅ Wait 1.5 seconds
5. ✅ Verify:
   - [ ] Settings dialog auto-opens
   - [ ] Token field exists and visible
6. ✅ Enter correct token and save
7. ✅ Verify:
   - [ ] Connects successfully
   - [ ] Green "Connected" status

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 4: Dismissible Error Overlay
**Goal:** Verify errors don't block UI indefinitely

**Steps:**
1. ✅ Stop Gateway
2. ✅ Start app (connection will fail)
3. ✅ Verify error overlay appears
4. ✅ Click ❌ close button (top-right)
5. ✅ Verify:
   - [ ] Overlay disappears
   - [ ] Can browse conversation list
   - [ ] Can view past messages
   - [ ] Status bar shows "Offline Mode"
6. ✅ Click "Retry" in status bar
7. ✅ Verify:
   - [ ] If still fails, overlay re-appears
   - [ ] Can dismiss again

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 5: Network Disconnect Mid-Conversation
**Goal:** Verify resilience to network loss

**Steps:**
1. ✅ Start conversation, send message, get response
2. ✅ Disable network (WiFi off or unplug ethernet)
3. ✅ Send message "Network is down"
4. ✅ Verify:
   - [ ] Message queued (not failed)
   - [ ] Status bar shows "Offline Mode"
   - [ ] Reconnection attempts visible (countdown)
5. ✅ Re-enable network
6. ✅ Verify:
   - [ ] Auto-reconnects (< 60s)
   - [ ] Queued message sends
   - [ ] Gets response

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 6: Gateway Restart (Crash Simulation)
**Goal:** Verify recovery from Gateway crash

**Steps:**
1. ✅ Active conversation with Gateway connected
2. ✅ Restart Gateway: `clawdbot gateway restart`
3. ✅ Verify:
   - [ ] "Connection lost" banner appears
   - [ ] Countdown starts (5s → 10s → 30s)
   - [ ] Auto-reconnects within 60s
   - [ ] "Reconnected" success toast
4. ✅ Send message after reconnect
5. ✅ Verify:
   - [ ] Works normally
   - [ ] Gets response

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 7: Max Retry Limit
**Goal:** Verify messages don't retry forever

**Setup:** Requires editing code or simulating persistent failure

**Steps:**
1. ✅ Queue a message (Gateway off)
2. ✅ Attempt reconnect 4 times (manually or wait)
3. ✅ Verify:
   - [ ] After 3 retries, message marked ❌ **Failed**
   - [ ] Error message shown
   - [ ] Can manually retry with button

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 8: Send During Reconnection
**Goal:** Verify messages queue during active reconnection

**Steps:**
1. ✅ Disconnect Gateway
2. ✅ Wait for reconnection countdown to start
3. ✅ While countdown active, send message
4. ✅ Verify:
   - [ ] Message queues immediately
   - [ ] Doesn't fail
   - [ ] Sends when reconnection completes

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 9: Gateway URL Typo
**Goal:** Verify helpful error for wrong URL

**Steps:**
1. ✅ Settings → Gateway URL → `ws://localhost:99999` (wrong port)
2. ✅ Save and connect
3. ✅ Verify error:
   - [ ] Clear message about connection failure
   - [ ] Suggests checking URL
   - [ ] Can dismiss and fix in Settings

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

### 🧪 Test 10: Protocol Fallback (ws/wss)
**Goal:** Verify automatic ws:// ↔ wss:// switching

**Steps:**
1. ✅ Settings → Use `wss://localhost:18789`
2. ✅ Save (should fail, then try `ws://`)
3. ✅ Verify:
   - [ ] Auto-switches to `ws://localhost:18789`
   - [ ] Connects successfully
   - [ ] URL updated in settings
   - [ ] Notice shown about protocol switch

**Result:** ☐ PASS  ☐ FAIL  
**Notes:** ___________________________________________

---

## Visual Verification

### Message Status Indicators
- [ ] **Sending:** Blue dot, "Sending..."
- [ ] **Sent:** No indicator (clean)
- [ ] **Queued:** Amber dot, "Queued"
- [ ] **Failed:** Red dot, "Failed"

### Status Bar States
- [ ] **Connected:** Green dot, "Connected"
- [ ] **Connecting:** Spinner, "Connecting..."
- [ ] **Reconnecting:** Orange dot, "Reconnecting (2)..."
- [ ] **Offline:** Amber dot, "Offline Mode"
- [ ] **Offline + Queued:** "Offline Mode — 3 messages queued"

### Error Overlay
- [ ] Has ❌ close button (top-right)
- [ ] Auth errors show 🔒 lock icon
- [ ] Network errors show ⚠️ warning icon
- [ ] "Continue Offline" button works
- [ ] "Retry Now" button appears when appropriate

---

## Performance Checks

### Memory Leak Test
**Steps:**
1. ✅ Open DevTools → Performance → Memory
2. ✅ Queue 20 messages
3. ✅ Reconnect and send all
4. ✅ Check memory growth
5. ✅ Verify:
   - [ ] Memory stabilizes after send
   - [ ] No continuous growth
   - [ ] < 50MB increase total

### CPU Usage
- [ ] No continuous high CPU during reconnection
- [ ] No UI lag when queueing messages
- [ ] Smooth scrolling during retry

---

## Edge Cases

### Rapid Disconnect/Reconnect
1. ✅ Toggle Gateway on/off 5 times rapidly
2. ✅ Verify:
   - [ ] No crashes
   - [ ] Eventually reconnects
   - [ ] State stays consistent

### Send While Saving Settings
1. ✅ Open Settings dialog
2. ✅ Change token (don't save)
3. ✅ Send message in background
4. ✅ Save settings
5. ✅ Verify:
   - [ ] Message queued or sent correctly
   - [ ] Settings saved
   - [ ] No race condition errors

### Browser Refresh
1. ✅ Queue messages
2. ✅ Refresh page (F5)
3. ✅ Verify:
   - [ ] Queued status persists
   - [ ] Auto-retries on reconnect
   - [ ] No duplicate sends

---

## Regression Testing

### Basic Chat Functionality
- [ ] Send message → get response (normal flow)
- [ ] Edit message → regenerates
- [ ] Delete message → works
- [ ] New conversation → works
- [ ] Switch conversations → works
- [ ] Attachments → upload and send

### Settings
- [ ] Change model → saves
- [ ] Change theme → applies
- [ ] Change token → reconnects
- [ ] Toggle thinking → works

### Keyboard Shortcuts
- [ ] Cmd/Ctrl + N → New chat
- [ ] Cmd/Ctrl + K → Search
- [ ] Cmd/Ctrl + , → Settings
- [ ] Cmd/Ctrl + \ → Toggle sidebar

---

## Browser Compatibility

### Chrome/Edge
- [ ] All tests pass
- [ ] No console errors

### Firefox
- [ ] All tests pass
- [ ] No console errors

### Safari (macOS)
- [ ] All tests pass
- [ ] No console errors

---

## Sign-Off

### Developer
- [ ] All code changes committed
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Documentation updated

**Signature:** ____________  **Date:** ______

### QA
- [ ] All critical tests pass (1-6)
- [ ] All edge cases tested (7-10)
- [ ] No regressions found
- [ ] Performance acceptable

**Signature:** ____________  **Date:** ______

### Product
- [ ] UX improvements verified
- [ ] Error messages helpful
- [ ] Ready for production

**Signature:** ____________  **Date:** ______

---

## Issues Found

| # | Test | Issue | Severity | Status |
|---|------|-------|----------|--------|
| 1 |      |       |          |        |
| 2 |      |       |          |        |
| 3 |      |       |          |        |

---

## Summary

**Tests Passed:** ____ / 10  
**Regressions:** ____ / 10  
**Critical Issues:** ____  
**Recommendation:** ☐ Ship  ☐ Fix & Retest  ☐ Block

**Notes:** 
_________________________________________________
_________________________________________________
_________________________________________________
