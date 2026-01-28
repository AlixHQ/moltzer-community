# Testing Guide: macOS + Tailscale Fix

## Pre-requisites

- macOS 13.0 or later
- Tailscale installed and connected
- Gateway running on Tailscale network
- Node.js and npm installed

## Quick Test (Development Mode)

### 1. Build and run the app:

```bash
cd clawd-client
npm install
npm run tauri dev
```

### 2. Check console logs:

Look for these messages on startup:

```
[Gateway Protocol Error] Connection Strategy: Using manual TCP (macOS/Tailscale workaround)
[Gateway Protocol Error] Manual TCP: Connecting to wss://your-gateway.ts.net:18789
[Gateway Protocol Error] Manual TCP: Resolving your-gateway.ts.net (IPv4 only)...
[Gateway Protocol Error] Manual TCP: Resolved to 1 IPv4 addr(s): [100.x.x.x:18789]
[Gateway Protocol Error] Manual TCP: Connecting to 100.x.x.x:18789 (IPv4)...
[Gateway Protocol Error] Manual TCP: TCP connection established
[Gateway Protocol Error] Manual TCP: Converted to tokio stream
[Gateway Protocol Error] Manual TCP: Performing TLS handshake...
[Gateway Protocol Error] Manual TCP: TLS handshake complete, upgrading to WebSocket...
[Gateway Protocol Error] Manual TCP: WebSocket connection established (TLS)
```

### 3. Verify functionality:

- [ ] Connection status shows "Connected" (green dot)
- [ ] Can send a test message
- [ ] Response comes back within reasonable time (<10s)
- [ ] No timeout errors

## Production Build Test

### 1. Build release version:

```bash
npm run tauri build
```

### 2. Install and test:

- macOS: Open `src-tauri/target/release/bundle/dmg/Moltz_1.0.0_aarch64.dmg` (or x64)
- Install the app
- Launch and verify connection

## Test Cases

### ✅ Test Case 1: Fresh Connection

**Setup**: App not running, Tailscale connected

**Steps**:
1. Launch app
2. Observe connection process

**Expected**: 
- Connection establishes within 5-10 seconds
- No timeout errors
- Console shows "Manual TCP" strategy

---

### ✅ Test Case 2: Reconnection After Network Change

**Setup**: App running, connected

**Steps**:
1. Disconnect Tailscale
2. Wait 5 seconds
3. Reconnect Tailscale
4. Observe reconnection

**Expected**:
- App detects disconnect (yellow indicator)
- Auto-reconnects within 10-30 seconds
- Returns to "Connected" state

---

### ✅ Test Case 3: Protocol Fallback

**Setup**: Gateway only supports ws:// (not wss://)

**Steps**:
1. Configure Gateway URL as `wss://gateway.ts.net:18789`
2. Launch app

**Expected**:
- First attempt with wss:// fails
- Second attempt with ws:// succeeds
- Settings automatically update to ws://

---

### ✅ Test Case 4: DNS Resolution Failure

**Setup**: Invalid Tailscale hostname

**Steps**:
1. Configure Gateway URL as `wss://invalid-host.ts.net:18789`
2. Launch app

**Expected**:
- Clear error message: "DNS resolution failed"
- Retry countdown starts
- Can manually retry

---

### ✅ Test Case 5: Connection Timeout

**Setup**: Gateway not responding

**Steps**:
1. Configure valid URL but Gateway is down
2. Launch app

**Expected**:
- Connection times out after 30 seconds
- Error message shown
- Auto-retry with backoff (5s → 10s → 30s → 60s)

---

## Performance Benchmarks

### Connection Latency

Measure time from "Connecting..." to "Connected":

- **Target**: <10 seconds
- **Acceptable**: <15 seconds
- **Issue if**: >30 seconds

### Message Round-trip

Send a simple message and measure response time:

- **Target**: <2 seconds
- **Acceptable**: <5 seconds
- **Issue if**: >10 seconds

## Debug Mode

Enable verbose logging:

1. Open Developer Tools (Cmd+Option+I)
2. Go to Console tab
3. Filter for "Gateway Protocol Error"

You should see detailed connection flow.

## Common Issues & Solutions

### Issue: "DNS resolution failed"

**Solution**: 
- Verify Tailscale is connected
- Check hostname is correct
- Try using direct IP instead: `wss://100.x.x.x:18789`

### Issue: "TLS handshake failed"

**Solution**:
- Try switching to ws:// instead of wss://
- Verify Gateway supports TLS
- Check firewall settings

### Issue: "Connection timeout"

**Solution**:
- Verify Gateway is running
- Check Gateway port is correct (default: 18789)
- Test connectivity: `tailscale ping gateway-hostname`

## Rollback Instructions

If the fix causes issues:

```bash
cd clawd-client
git revert de4847f
npm run tauri dev
```

This will restore the previous connection logic.

## Reporting Issues

If you encounter problems, include:

1. **Console logs** (full output from Developer Tools)
2. **macOS version**: `sw_vers`
3. **Tailscale version**: `tailscale version`
4. **Gateway URL** (redact if sensitive)
5. **Error message** (exact text)
6. **Steps to reproduce**

---

## Success Criteria

✅ Connection establishes within 10 seconds  
✅ No manual intervention required  
✅ Works with both ws:// and wss://  
✅ Handles network changes gracefully  
✅ Clear error messages on failure  

---

**Questions?** Contact: Moltz-pm or Moltz-engineer

**Last Updated**: 2025-01-23
