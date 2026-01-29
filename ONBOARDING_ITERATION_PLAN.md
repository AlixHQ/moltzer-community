# Onboarding Experience - Iteration Plan

**Goal:** Make first-run experience magical, not just functional.

---

## Phase 1: Live Testing Checklist ✅ IN PROGRESS

### Animation Audit
- [ ] **Welcome screen entrance** - Staggered or too fast?
- [ ] **Step transitions** - 150ms opacity fade - is it smooth?
- [ ] **Confetti on success** - Does it feel celebratory or cheap?
- [ ] **Form animations** - Do error states jar the user?
- [ ] **Loading spinners** - Are they informative?

### Copy Audit (Non-Technical User Test)
- [ ] **"Connect to Gateway"** - Do users know what a Gateway is?
- [ ] **"Authentication Token (optional)"** - Is "optional" confusing?
- [ ] **Error messages** - Are they actionable or overwhelming?
- [ ] **Success message** - Is it motivating?
- [ ] **Feature tour** - Is it too much too soon?

### Error State Testing
- [ ] Invalid URL format
- [ ] Wrong port (not 18789)
- [ ] Invalid auth token
- [ ] Gateway not running
- [ ] Network timeout
- [ ] Firewall blocking connection
- [ ] Protocol mismatch (ws vs wss)

### Accessibility Audit
- [ ] **Keyboard navigation** - Can you complete onboarding without mouse?
- [ ] **Screen reader** - Run with NVDA/VoiceOver
- [ ] **Focus management** - Does focus move logically?
- [ ] **ARIA labels** - Are they descriptive?
- [ ] **Color contrast** - Meets WCAG AA?
- [ ] **Motion sensitivity** - prefers-reduced-motion respected?

### Loading States
- [ ] "Auto-detecting Gateway..." - What's it doing?
- [ ] "Testing connection..." - How long will it take?
- [ ] "Connected successfully!" - What happens next?
- [ ] Long wait times - Is there progress indication?

---

## Phase 2: Issues Found (TBD)

### Critical Issues 🔴
_To be filled after live testing_

### High Priority 🟠
_To be filled after live testing_

### Nice to Have 🟡
_To be filled after live testing_

---

## Phase 3: Iteration Priorities

### Animation Polish
- Ensure 60fps throughout
- Reduce motion for accessibility
- Timing curves - spring physics vs linear
- Micro-interactions on hover

### Copy Improvements
- Replace "Gateway" with simpler term?
- Add explainer tooltips inline
- Error messages - less technical jargon
- Progressive disclosure for complex info

### Error State Enhancements
- Smart error detection (suggest fixes)
- Retry with exponential backoff
- "Test Connection" button feedback
- Clear recovery paths

### Accessibility Fixes
- Full keyboard navigation
- Screen reader announcements
- Focus traps in modals
- Skip links
- Reduced motion alternatives

### Loading State Improvements
- Skeleton loaders vs spinners
- Progress percentages
- Estimated time remaining
- Cancel button for long operations

---

## Success Metrics

### Before
- Onboarding completion: ~20% (estimated)
- Time to first message: 5-10 min
- Confusion rate: 80%

### Target
- Onboarding completion: 85%+
- Time to first message: <2 min
- Confusion rate: <20%
- Accessibility score: 100/100 (Lighthouse)

---

## Testing Scenarios

### Happy Path
1. New user, Gateway running locally on default port
2. Auto-detection works
3. Skip tour, start chatting

### Common Issues
1. Gateway on non-standard port
2. Remote Gateway (Tailscale URL)
3. Invalid auth token
4. Gateway not running
5. User skips onboarding, comes back later

### Edge Cases
1. Very slow network (timeout testing)
2. Firewall blocks connection
3. Protocol auto-switch (ws → wss)
4. Multiple retry attempts
5. User cancels mid-connection

---

## Next Steps

1. **Run app locally** - `npm run tauri dev`
2. **Clear onboarding state** - Fresh start
3. **Go through each step** - Take notes
4. **Test error scenarios** - Intentionally break things
5. **Keyboard-only test** - Unplug mouse
6. **Screen reader test** - NVDA on Windows
7. **Document findings** - Update this doc
8. **Prioritize fixes** - Quick wins first
9. **Implement iterations** - Small commits
10. **Validate improvements** - Test again

---

**Status:** 🔄 PHASE 1 IN PROGRESS
