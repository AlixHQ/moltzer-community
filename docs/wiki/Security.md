# Moltz Security

Security architecture, audit findings, and best practices.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Threat Model](#threat-model)
3. [Data Encryption](#data-encryption)
4. [Transport Security](#transport-security)
5. [Token Security](#token-security)
6. [Content Security](#content-security)
7. [Audit Summary](#audit-summary)
8. [Best Practices](#best-practices)

---

## Security Overview

Moltz takes security seriously. This document outlines our security architecture and recent audit findings.

### Key Security Features

✅ **Encryption at Rest** — AES-256-GCM for all messages  
✅ **Secure Key Storage** — OS keychain integration  
✅ **TLS Required** — Enforced for remote connections  
✅ **Content Sanitization** — XSS protection in markdown  
✅ **Code Signing** — Verified application bundles  
✅ **Auto-Update Security** — Cryptographically signed updates  

---

## Threat Model

### What We Protect Against

✅ **Local data access** — Unauthorized users on shared machine  
✅ **Man-in-the-middle** — Network eavesdropping  
✅ **Token theft** — Exposed credentials  
✅ **Code injection** — XSS via message content  
✅ **Tampered updates** — Malicious auto-updates  

### Out of Scope

❌ **Physical compromise** — If attacker has your laptop, encryption keys are accessible  
❌ **Gateway compromise** — We trust Gateway to be secure  
❌ **AI provider vulnerabilities** — Outside our control  
❌ **Zero-day OS exploits** — Rely on OS security  

---

## Data Encryption

### Encryption at Rest

All conversation data is encrypted before storage in IndexedDB.

**Algorithm:** AES-256-GCM  
**Mode:** Galois/Counter Mode (authenticated encryption)  
**Key Size:** 256 bits  
**IV:** 96-bit random IV per message (never reused)  

### Key Derivation

Encryption key is derived from a passphrase stored in the system keychain:

```
Master Key = PBKDF2(
  password: system_keychain_secret,
  salt: device_id + app_id,
  iterations: 100,000,
  hash: SHA-256
)
```

**Key Storage:**
- **macOS:** Keychain Access (com.moltz.client.encryption_key)
- **Windows:** Credential Manager
- **Linux:** Secret Service API (GNOME Keyring, KWallet)

### What's Encrypted

| Data | Encrypted | Plain |
|------|-----------|-------|
| Message content | ✅ | |
| Attachments | ✅ | |
| Conversation titles | | ✅ |
| Timestamps | | ✅ |
| Message IDs | | ✅ |
| Settings | | ✅ |

**Rationale:** Conversation metadata (titles, timestamps) remain unencrypted for fast search and indexing. Sensitive content is fully encrypted.

### Encryption Implementation

**Location:** `src/lib/encryption.ts`

```typescript
async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Return: iv + ciphertext (base64)
  return base64Encode(concat(iv, new Uint8Array(ciphertext)));
}
```

---

## Transport Security

### TLS Enforcement

**Local connections** (`ws://localhost`):
- Plain WebSocket allowed (localhost is trusted)
- Traffic never leaves machine

**Remote connections** (`wss://...`):
- TLS 1.2+ required
- Certificate validation enforced
- No self-signed certificates (without explicit override)
- HSTS respected

### Certificate Validation

```rust
// src-tauri/src/gateway.rs
let tls_config = rustls::ClientConfig::builder()
    .with_safe_defaults()
    .with_native_roots()  // Use OS root certificates
    .with_no_client_auth();

// Reject invalid certificates
connector.set_tls_config(tls_config);
```

**Warnings shown for:**
- Expired certificates
- Self-signed certificates
- Hostname mismatch
- Untrusted CA

**User override:** Advanced users can bypass warnings (not recommended).

---

## Token Security

### Storage

Gateway authentication tokens are stored securely:

**Never stored in:**
- ❌ LocalStorage
- ❌ Plain text files
- ❌ Application logs
- ❌ Error messages

**Always stored in:**
- ✅ System keychain (OS-managed)
- ✅ Memory only during active session

### Token Best Practices

For users:

1. **Keep tokens secret** — Don't share with anyone
2. **Regenerate if exposed** — `OpenClaw token regenerate`
3. **Use different tokens per device** — Easier to revoke
4. **Revoke unused tokens** — Minimize attack surface
5. **Enable Gateway auth logs** — Monitor for suspicious activity

For developers:

1. **Never log tokens** — Sanitize all logs
2. **Use environment variables** — For development
3. **Rotate tokens regularly** — Best practice
4. **Scope tokens minimally** — Principle of least privilege (when Gateway supports scopes)

---

## Content Security

### XSS Protection

All user-generated content is sanitized before rendering.

**Markdown Rendering:**
- Uses `rehype-sanitize` to strip dangerous HTML
- Allows safe tags: `<p>`, `<a>`, `<code>`, `<pre>`, `<img>`
- Removes: `<script>`, `<iframe>`, `onclick`, `onerror`

**Link Safety:**
- External links open in browser (not in app WebView)
- `javascript:` URLs blocked
- `data:` URLs blocked (except for images)

**Image Handling:**
- Base64 images rendered inline
- External images loaded with CORS
- Size limits enforced (max 10 MB)

### Content Security Policy

Tauri app uses strict CSP:

```rust
// src-tauri/tauri.conf.json
"csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
```

**Effect:**
- No inline scripts
- No external scripts
- Styles from app only
- Images from app + data URLs + HTTPS

---

## Audit Summary

**Audit Date:** January 2026  
**Auditor:** Security Specialist Agent  
**Scope:** Full codebase security review  

### Findings Overview

**Total Issues:** 15  
**Critical:** 0  
**High:** 3  
**Medium:** 8  
**Low:** 4  

### High-Severity Issues (Fixed)

#### 1. Token Exposed in Connection Error Messages
**Status:** ✅ Fixed in 1.0.0  
**Issue:** Gateway token appeared in error logs when connection failed.  
**Fix:** Sanitize all error messages before logging.

#### 2. Unencrypted Backup Exports
**Status:** ✅ Fixed in 1.0.0  
**Issue:** Export feature saved conversations as plain JSON.  
**Fix:** Encrypt exports with user-provided password, or warn user about plain text.

#### 3. No Rate Limiting on Connection Attempts
**Status:** ✅ Fixed in 1.0.0  
**Issue:** Attacker could brute-force token by rapid connection attempts.  
**Fix:** Exponential backoff with max 10 attempts per hour.

### Medium-Severity Issues

#### 4. Local Storage Contains Metadata
**Status:** ⚠️ Accepted Risk  
**Issue:** Conversation titles stored unencrypted in IndexedDB.  
**Rationale:** Needed for fast search; full content is encrypted.  
**Mitigation:** Document in privacy policy.

#### 5. DevTools Accessible in Production
**Status:** ✅ Fixed in 1.0.0  
**Issue:** Cmd+Shift+I opened DevTools in production builds.  
**Fix:** Disabled in production; available only with `--dev` flag.

#### 6-12. Various Input Validation Issues
**Status:** ✅ Fixed in 1.0.0  
**Details:** See [Full Security Audit Report](../../moltz_security_audit.md)

### Low-Severity Issues

#### 13-15. Recommendations
- Add security.txt for disclosure
- Implement CSP violation reporting
- Add Subresource Integrity for CDN assets

**Status:** 📋 Planned for 1.1.0

---

## Security Checklist

### For Users

- [ ] Gateway connection uses TLS (wss://) for remote
- [ ] Token stored securely (not in notes/Slack)
- [ ] Auto-update enabled (get security patches)
- [ ] Conversations encrypted (check Settings → Privacy)
- [ ] Backups encrypted or stored securely

### For Developers

- [ ] No tokens in code
- [ ] No tokens in git history
- [ ] All user input sanitized
- [ ] Content Security Policy enforced
- [ ] Dependencies audited regularly
- [ ] Security issues reported privately

---

## Responsible Disclosure

Found a security vulnerability?

**DO:**
- Email security@alix.com
- Include steps to reproduce
- Give us 90 days to fix before public disclosure

**DON'T:**
- Post publicly before fix
- Exploit in production
- Disclose user data

We appreciate responsible disclosure and may offer bounties for significant findings.

---

## Compliance

### Data Protection

**GDPR-Ready:**
- ✅ Data stored locally (data controller is user)
- ✅ Export all data (portability)
- ✅ Delete all data (right to erasure)
- ✅ Transparent about data usage

**CCPA-Ready:**
- ✅ No sale of data (N/A, no data collection)
- ✅ User can delete data
- ✅ Privacy policy available

### Enterprise Requirements

For team/enterprise deployments:

- 📋 SOC 2 Type II (planned Q3 2026)
- 📋 HIPAA compliance (planned Q4 2026)
- 📋 Audit logging (Team Mode)
- 📋 Access control (Team Mode)

---

## Security Roadmap

### Q1 2026

- [ ] Security bug bounty program
- [ ] Penetration testing
- [ ] Automated dependency scanning

### Q2 2026

- [ ] Hardware security key support (YubiKey)
- [ ] Biometric authentication (macOS Touch ID, Windows Hello)
- [ ] Enhanced audit logging

### Q3 2026

- [ ] SOC 2 Type II certification
- [ ] Zero-knowledge cloud sync
- [ ] End-to-end encrypted team rooms

---

## Security Updates

Security updates are delivered via auto-update:

- **Check frequency:** Every 24 hours
- **Download:** Background, non-intrusive
- **Installation:** On app restart
- **Signature verification:** Required before install

**Manual check:** Settings → About → Check for Updates

---

## Best Practices

### For Users

1. **Keep app updated** — Auto-update enabled by default
2. **Use strong Gateway tokens** — Long, random tokens
3. **Enable disk encryption** — FileVault (macOS), BitLocker (Windows)
4. **Lock screen when away** — Prevent physical access
5. **Backup regularly** — Encrypted backups to external drive

### For Self-Hosters

1. **TLS required** — Always use wss:// for remote Gateway
2. **Firewall rules** — Restrict Gateway access
3. **Token rotation** — Regenerate tokens periodically
4. **Monitor logs** — Check for suspicious activity
5. **Keep Gateway updated** — Apply security patches

### For Developers

1. **Code review** — All PRs reviewed for security
2. **Dependency auditing** — `npm audit` on every commit
3. **Static analysis** — ESLint security rules
4. **Security training** — Stay informed on best practices

---

## Security Tools

### For Users

**Check if app is legitimate:**
```bash
# macOS: Verify code signature
codesign -vv /Applications/Moltz.app

# Windows: Check digital signature
signtool verify /pa Moltz.exe
```

### For Developers

**Audit dependencies:**
```bash
npm audit
npm audit fix
```

**Check for outdated packages:**
```bash
npm outdated
```

**Security linting:**
```bash
npm run lint:security
```

---

## FAQ

### Is my data sent to the cloud?

No. All conversations are stored locally on your device. The only data transmitted is to your configured OpenClaw Gateway.

### Can Moltz team read my messages?

No. We have no access to your data. Messages are encrypted on your device with a key only you have.

### What if I lose my encryption key?

If you lose access to your system keychain (e.g., reinstall OS without backup), encrypted messages cannot be recovered. **Always back up your system keychain.**

### Can I disable encryption?

No. Encryption is always enabled for your protection. You can export unencrypted backups if needed (with warning).

### Is Moltz open source?

Yes. The full source code is available on [GitHub](https://github.com/AlixHQ/moltz) for security audit by anyone.

---

## Related Documentation

- **[Architecture → Security Architecture](./Architecture.md#security-architecture)** — Technical details
- **[User Guide → Privacy](./User-Guide.md#privacy--security)** — User-facing privacy features
- **[Contributing → Security](./Contributing.md#security)** — Reporting vulnerabilities

---

**Last updated:** January 2026  
**Next audit:** Q2 2026
