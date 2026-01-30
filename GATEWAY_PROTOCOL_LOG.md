# Moltz Gateway Protocol Debug Log

**Started:** 2026-01-30
**Purpose:** Track all gateway protocol changes to avoid running in circles

---

## Current State (2026-01-30)

### Known Issues
1. **Connection handshake failing** - Client sends CONNECT, gateway responds with both ERROR and SUCCESS, then disconnects
2. **Update check failing** - "Could not fetch a valid release JSON from the remote" (no GitHub releases exist)

### Protocol Configuration (Current)
```rust
// From gateway.rs - ConnectParams sent to gateway
client: ClientInfo {
    id: "openclaw-control-ui",  // Changed from "clawdbot-control-ui"
    version: env!("CARGO_PKG_VERSION"),
    platform: get_platform(),
    mode: "ui",  // Changed from "cli" - must be "webchat"|"cli"|"ui"|"backend"|"probe"|"test"
},
role: "operator",
scopes: ["operator.read", "operator.write"],
auth: { token: "<user_token>" },
```

---

## Change History

### 2026-01-30 - Session 1 (Before sub-agent)

#### Change 1: Fixed client.id
- **File:** `src-tauri/src/gateway.rs`
- **Old:** `id: "clawdbot-control-ui"`
- **New:** `id: "openclaw-control-ui"`
- **Reason:** Clawdbot was rebranded to OpenClaw, gateway expects new client ID
- **Commit:** `5ed625e chore: rebrand clawdbot/moltbot references to openclaw`

#### Change 2: Fixed client.mode  
- **File:** `src-tauri/src/gateway.rs`
- **Old:** `mode: "cli"`
- **New:** `mode: "ui"`
- **Reason:** Gateway schema only allows: "webchat", "cli", "ui", "backend", "probe", "test"
- **Status:** Uncommitted (needs verification)

#### Change 3: Connection mutex & session ID (Earlier hackathon)
- **File:** `src-tauri/src/gateway.rs`
- **Added:** `connection_mutex`, `connection_session_id` fields
- **Reason:** Prevent race conditions with multiple connection attempts
- **Commit:** `c01ef8b feat(code): Premium code blocks...` (bundled with other changes)

#### Change 4: Thinking param fix
- **File:** `src-tauri/src/gateway.rs`
- **Change:** Only send `thinking` field if it has a value
- **Reason:** Gateway rejects null values for thinking parameter
- **Commit:** `733eec9 fix: only send thinking param when present`

---

## Gateway Protocol Requirements (from OpenClaw docs)

### Connect Request Schema
```json
{
  "type": "req",
  "id": "<uuid>",
  "method": "connect",
  "params": {
    "minProtocol": 3,
    "maxProtocol": 3,
    "client": {
      "id": "string",      // Client identifier
      "version": "string", // Client version
      "platform": "string",// "windows"|"macos"|"linux"
      "mode": "string"     // "webchat"|"cli"|"ui"|"backend"|"probe"|"test"
    },
    "role": "operator",
    "scopes": ["operator.read", "operator.write"],
    "caps": [],
    "auth": { "token": "string" },
    "locale": "en-US",
    "userAgent": "string"
  }
}
```

### Expected Response Flow
1. Server sends: `{"type":"evt","event":"connect.challenge",...}`
2. Client sends: Connect request (above)
3. Server sends: `{"type":"res","id":"...","ok":true,"payload":{"type":"hello-ok",...}}`

### Current Problem
- We see BOTH error and success responses, suggesting:
  - Possible duplicate connection attempts
  - Or gateway sending error for one reason, then closing

---

## Debug Output Analysis

### Logs from failed connection attempt:
```
[Gateway Protocol Error] CONNECT CALLED: URL received: ws://beelink-ser9-pro:18789
[Gateway Protocol Error] CONNECT CALLED: Token status: present (64 chars)
[Gateway Protocol Error] CONNECT: Acquired connection mutex
[Gateway Protocol Error] CONNECT: New session ID: 1
[Gateway Protocol Error] Manual TCP: Connecting to ws://beelink-ser9-pro:18789
[Gateway Protocol Error] MSG_HANDLER: Started for session 1
[Gateway Protocol Error] Sending CONNECT request: client.id=openclaw-control-ui, role=operator, token_len=64
[Gateway Protocol Error] INCOMING MSG: len=... (ERROR response)
[Gateway Protocol Error] INCOMING MSG: len=... (SUCCESS response)  
[Gateway Protocol Error] WebSocket closed: session=1 reason=...
```

**Observation:** Connection mutex is working, but we're getting both ERROR and SUCCESS responses.

---

## Next Steps to Investigate

1. [ ] Capture FULL error response from gateway to see exact rejection reason
2. [ ] Compare our ConnectParams JSON with OpenClaw protocol schema
3. [ ] Check if gateway has stricter validation than documented
4. [ ] Verify token format matches what gateway expects
5. [ ] Test with minimal connect params (remove optional fields)

---

## Files Modified (Summary)

| File | Changes | Status |
|------|---------|--------|
| `src-tauri/src/gateway.rs` | client.id, client.mode, mutex, session_id | Partially committed |
| `src-tauri/tauri.conf.json` | App identifier updated | Committed |
| `src/components/onboarding/steps/GatewaySetupStep.tsx` | Default URL handling | Committed |
| `docs/GATEWAY-PROTOCOL.md` | Rebranding updates | Committed |

---

## Lessons Learned

1. **Always log full JSON** of connect request for debugging
2. **Check gateway logs** not just client logs
3. **Avoid bundling protocol changes** with unrelated commits
4. **Test protocol changes in isolation** before feature work
