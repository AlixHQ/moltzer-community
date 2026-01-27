# CI/CD Setup - Next Steps

This document outlines the steps needed to complete the CI/CD setup for Moltzer client.

## ✅ What's Already Done

- ✅ Enhanced CI workflow with linting, testing, and security audits
- ✅ Release workflow for building signed binaries on all platforms
- ✅ Dependabot configuration for automated dependency updates
- ✅ Tauri updater infrastructure added to project
- ✅ Comprehensive documentation created

## 🔧 What You Need to Configure

### 1. Tauri Updater Keys (Required for Auto-Updates)

**Priority: HIGH**

```bash
# Generate updater signing keys
npm run tauri signer generate

# This will output:
# - Public key (add to tauri.conf.json)
# - Private key (add to GitHub Secrets)
```

**Steps:**

1. Run the command above
2. Copy the **public key** 
3. Open `src-tauri/tauri.conf.json`
4. Replace `YOUR_PUBLIC_KEY_HERE` with the actual public key
5. Go to GitHub: **Settings** → **Secrets and variables** → **Actions**
6. Add secret: `TAURI_SIGNING_PRIVATE_KEY` with the private key
7. Commit the updated `tauri.conf.json`:

```bash
git add src-tauri/tauri.conf.json
git commit -m "ci: add Tauri updater public key"
git push
```

**Result**: Users will be able to auto-update the app seamlessly.

---

### 2. Code Signing Certificates (Optional but Recommended)

**Priority: MEDIUM** (can do unsigned releases initially)

Code signing removes OS warnings and enables Gatekeeper/SmartScreen bypass.

#### macOS Code Signing

**Cost**: $99/year (Apple Developer Program)

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/)
2. Create a "Developer ID Application" certificate
3. Export certificate as `.p12` file
4. Convert to base64: `base64 -i certificate.p12 -o cert.txt`
5. Add GitHub Secrets:
   - `APPLE_CERTIFICATE` (base64 content)
   - `APPLE_CERTIFICATE_PASSWORD`
   - `APPLE_SIGNING_IDENTITY` (from Keychain)
   - `APPLE_ID` (your Apple ID)
   - `APPLE_PASSWORD` (app-specific password)
   - `APPLE_TEAM_ID` (from developer account)

**See**: [CODE_SIGNING.md](./CODE_SIGNING.md) for detailed instructions.

#### Windows Code Signing

**Cost**: $100-$400/year

1. Purchase code signing certificate from:
   - DigiCert
   - Sectigo
   - GlobalSign
2. Export as `.pfx` file
3. Convert to base64: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("cert.pfx")) > cert.txt`
4. Add GitHub Secrets:
   - `WINDOWS_CERTIFICATE` (base64 content)
   - `WINDOWS_CERTIFICATE_PASSWORD`

**See**: [CODE_SIGNING.md](./CODE_SIGNING.md) for detailed instructions.

**Without code signing**: 
- Windows: Users see SmartScreen warning
- macOS: Users need to right-click → Open to bypass Gatekeeper
- App still works, just extra steps for users

---

### 3. Optional Integrations

#### Codecov (Code Coverage Reports)

**Cost**: Free for open source

1. Sign up at [codecov.io](https://codecov.io)
2. Enable repository
3. Get upload token
4. Add GitHub Secret: `CODECOV_TOKEN`

**Result**: PR comments with test coverage changes.

---

## 🚀 Testing Your Setup

### Test CI Workflow

```bash
# Make any change and push
git commit --allow-empty -m "test: trigger CI"
git push

# Go to GitHub → Actions tab
# Watch the CI workflow run
```

**Expected**: All jobs should pass (lint, test, build).

### Test Release Workflow

```bash
# Update version (example)
npm version patch  # or minor, major

# Create and push tag
git tag v0.1.0
git push origin v0.1.0

# Go to GitHub → Actions → Release workflow
# Go to GitHub → Releases (draft release will be created)
```

**Expected**: 
- Builds complete for all platforms
- Draft release created with installers
- Update files (`.sig`, `latest.json`) uploaded

### Test Auto-Updates

1. Publish the draft release (click "Publish release")
2. Download and install the app
3. Create a new version (bump version, tag, release)
4. Open the installed app
5. Should see update prompt

---

## 📋 Quick Checklist

### Minimum Setup (Unsigned Releases)

- [ ] Generate Tauri updater keys
- [ ] Update `tauri.conf.json` with public key
- [ ] Add `TAURI_SIGNING_PRIVATE_KEY` to GitHub Secrets
- [ ] Test release workflow
- [ ] Publish first release

### Full Production Setup

- [ ] All minimum setup steps
- [ ] Purchase Apple Developer account ($99/year)
- [ ] Create macOS signing certificate
- [ ] Add macOS secrets to GitHub
- [ ] Purchase Windows code signing cert ($100-400/year)
- [ ] Add Windows secrets to GitHub
- [ ] Enable Codecov (optional)
- [ ] Test signed builds on all platforms
- [ ] Verify auto-update flow

---

## 🐛 Troubleshooting

### CI Fails Immediately

**Problem**: Missing dependencies or configuration issue

**Solution**:
- Check Actions logs for specific error
- Ensure all required files are committed
- Run locally: `npm ci && npm run build`

### Release Workflow Fails on "Import macOS certificate"

**Problem**: Certificate secrets not configured

**Expected**: This is normal if you haven't added certificates yet. Builds will continue as unsigned.

**Solution**: Either add certificates or ignore if you want unsigned builds initially.

### App Won't Update

**Problem**: Updater not working

**Check**:
1. Is `TAURI_SIGNING_PRIVATE_KEY` in GitHub Secrets?
2. Does public key in `tauri.conf.json` match private key?
3. Was `latest.json` uploaded to release?
4. Open browser dev tools (if app is built with devtools) to see errors

---

## 📚 Documentation Reference

- **[CICD.md](./CICD.md)** - Complete CI/CD pipeline documentation
- **[CODE_SIGNING.md](./CODE_SIGNING.md)** - Detailed code signing setup
- **Workflows**:
  - `.github/workflows/ci.yml` - Continuous integration
  - `.github/workflows/release.yml` - Release automation
- **Dependencies**: `.github/dependabot.yml` - Dependency management

---

## 💡 Tips

### For Development

```bash
# Test build locally
npm run build
npm run tauri build

# Check formatting before committing
npm run format
npm run lint

# Run tests
npm test
```

### For Releases

1. **Use semantic versioning**: `v1.0.0`, `v1.1.0`, `v1.1.1`
2. **Test before releasing**: Use workflow_dispatch for test releases
3. **Keep releases as drafts** until you've verified downloads
4. **Update release notes** before publishing
5. **Tag format matters**: Must be `v*.*.*` to trigger workflow

### Managing Dependabot

- Review PRs weekly (they come in on Mondays)
- Most can be auto-merged if CI passes
- Major updates require manual review
- Can disable specific updates in `dependabot.yml`

---

## ❓ Questions?

- Check the [CICD.md](./CICD.md) troubleshooting section
- Review [Tauri documentation](https://tauri.app/)
- Search [GitHub Discussions](https://github.com/tauri-apps/tauri/discussions)

---

## Summary

**Minimum viable setup** (30 minutes):
1. Generate and configure updater keys
2. Test a release
3. You're done! Can do unsigned releases

**Full production setup** (1-2 days + waiting for certificates):
1. Purchase certificates ($200-500/year)
2. Configure code signing
3. Test signed builds
4. Configure Codecov (optional)

Start with the minimum setup and add code signing when ready for production.
