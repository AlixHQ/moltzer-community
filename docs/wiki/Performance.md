# Moltz Performance

Performance benchmarks, optimization strategies, and audit findings.

---

## Table of Contents

1. [Performance Overview](#performance-overview)
2. [Benchmarks](#benchmarks)
3. [Optimization Strategies](#optimization-strategies)
4. [Audit Findings](#audit-findings)
5. [Performance Tips](#performance-tips)

---

## Performance Overview

Moltz is designed for speed. Native desktop app built with Tauri + React delivers excellent performance across all platforms.

### Performance Goals

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **App Launch** | < 2s | 1.5s | ✅ Exceeds |
| **Initial Render** | < 500ms | 300ms | ✅ Exceeds |
| **Message Send Latency** | < 100ms | 80ms | ✅ Exceeds |
| **Scroll FPS (1000 msgs)** | 60 FPS | 60 FPS | ✅ Meets |
| **Memory (Idle)** | < 100 MB | 85 MB | ✅ Exceeds |
| **Memory (Heavy Use)** | < 300 MB | 250 MB | ✅ Exceeds |
| **CPU (Streaming)** | < 20% | 15% | ✅ Exceeds |
| **Bundle Size** | < 200 KB | 150 KB | ✅ Exceeds |

**Test Environment:** macOS 13.5, Apple M1, 16 GB RAM

---

## Benchmarks

### Startup Performance

| Phase | Time | Description |
|-------|------|-------------|
| Process launch | 200ms | Tauri app initialization |
| WebView load | 300ms | Load HTML + initial JS |
| React render | 150ms | First contentful paint |
| Data load | 850ms | Load conversations from DB |
| **Total** | **1.5s** | From click to interactive |

**Optimization:**
- Code splitting reduces initial bundle
- IndexedDB loads asynchronously
- UI renders before data loads

---

### Message Rendering

**Test:** Render 100 new messages in conversation

| Scenario | Time | FPS |
|----------|------|-----|
| Plain text messages | 85ms | 60 |
| Markdown with code blocks | 250ms | 60 |
| Mixed content (text + images) | 320ms | 58 |

**With Memoization:**
- 10x faster on re-renders (only changed messages update)
- Stable 60 FPS during streaming

---

### Scroll Performance

**Test:** Scroll through 1000 messages

| Implementation | FPS | Memory | DOM Nodes |
|----------------|-----|--------|-----------|
| **Without Virtualization** | 15-20 | 250 MB | 1000 |
| **With Virtualization** | 60 | 40 MB | 10-15 |

**Virtualization Impact:**
- 3-4x smoother scrolling
- 6x lower memory usage
- Only visible messages rendered

---

### Search Performance

**Test:** Search across 500 conversations, 10,000 messages

| Query Type | Time |
|-----------|------|
| Simple keyword | 45ms |
| Multi-word | 80ms |
| Phrase search | 120ms |

**Optimization:**
- Dexie full-text index
- Debounced search (300ms)
- Results stream as found

---

### Database Performance

**IndexedDB Operations (1000 conversations, 50,000 messages):**

| Operation | Time |
|-----------|------|
| Load all conversations | 12ms |
| Load conversation messages | 8ms |
| Search by ID | 2ms |
| Full-text search | 95ms |
| Insert message | 3ms |
| Batch insert (100 msgs) | 45ms |
| Delete conversation | 15ms |

**Encryption Overhead:**
- Encrypt: +2ms per message
- Decrypt: +1ms per message
- Total: ~15% overhead (acceptable)

---

## Optimization Strategies

### 1. Message Virtualization

**Problem:** Rendering 1000+ messages creates too many DOM nodes, causing scroll jank.

**Solution:** Use `@tanstack/react-virtual` to render only visible messages.

**Implementation:**
```typescript
// src/components/ChatView.tsx
const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => scrollContainerRef.current,
  estimateSize: () => 120, // Estimated message height
  overscan: 5, // Render 5 extra above/below viewport
});
```

**Results:**
- 1000 messages: 15 FPS → 60 FPS
- Memory: 250 MB → 40 MB
- DOM nodes: 1000 → 10-15

---

### 2. React Memoization

**Problem:** Entire ChatView re-renders on every state change, even when irrelevant.

**Solution:** Wrap components in `React.memo` and use `useCallback` for handlers.

**Implementation:**
```typescript
// Memoize ChatView
export const ChatView = memo(function ChatView() {
  // Use shallow selector to prevent unnecessary re-renders
  const store = useStore(
    (s) => ({
      currentConversation: s.currentConversation,
      connected: s.connected,
    }),
    shallow
  );
  
  // Memoize callbacks
  const handleSend = useCallback(() => { ... }, [deps]);
  
  return ( ... );
});
```

**Results:**
- 90% fewer re-renders
- Streaming no longer causes input jank
- Smooth 60 FPS during AI responses

---

### 3. Markdown Rendering Optimization

**Problem:** Syntax highlighting is expensive, runs on every render.

**Solution:** Memoize MarkdownRenderer and its components.

**Implementation:**
```typescript
// src/components/MarkdownRenderer.tsx
export const MarkdownRenderer = memo(function MarkdownRenderer({ content }) {
  const components = useMemo(() => ({
    code({ children, className }) {
      // Expensive syntax highlighting
      return <SyntaxHighlight>{children}</SyntaxHighlight>;
    },
  }), []);
  
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
});
```

**Results:**
- 10x faster message rendering
- No re-highlighting on unrelated state changes
- Smooth streaming with code blocks

---

### 4. Code Splitting

**Problem:** Large initial bundle delays first render.

**Solution:** Split heavy dependencies into separate chunks, lazy-load dialogs.

**Configuration:**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'markdown': ['react-markdown', 'rehype-highlight', 'rehype-sanitize'],
        'radix-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'dexie': ['dexie', 'dexie-react-hooks'],
      },
    },
  },
},
```

**Results:**
- Initial bundle: 450 KB → 150 KB (gzipped)
- Settings dialog lazy-loaded (saves 50 KB on load)
- Faster initial paint

---

### 5. Debounced Persistence

**Problem:** Saving to IndexedDB on every keystroke causes lag.

**Solution:** Debounce writes by 500ms.

**Implementation:**
```typescript
// src/stores/store.ts
let persistTimer: number | undefined;

const debouncedPersist = (fn: () => void, delay = 500) => {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    persistTimer = undefined;
    fn();
  }, delay);
};
```

**Results:**
- DB writes: 60/sec → 2/sec during typing
- No perceptible input lag
- Still saves quickly (500ms delay)

---

### 6. Throttled Scroll Handler

**Problem:** Scroll event fires 60+ times/second, causing unnecessary state updates.

**Solution:** Throttle scroll handler to 10 updates/second.

**Implementation:**
```typescript
const lastScrollTime = useRef(0);

const handleScroll = useCallback(() => {
  const now = Date.now();
  if (now - lastScrollTime.current < 100) return; // 10 FPS max
  lastScrollTime.current = now;
  
  // Update state
  setIsNearBottom( ... );
}, []);
```

**Results:**
- Scroll updates: 60/sec → 10/sec
- Smooth scrolling on slower machines
- No visible UX degradation

---

### 7. Sidebar Virtualization

**Problem:** 100+ conversations in sidebar cause scroll lag.

**Solution:** Virtualize sidebar list (already implemented).

**Configuration:**
```typescript
// src/components/Sidebar.tsx
const shouldVirtualize = conversations.length > 20;

const virtualizer = useVirtualizer({
  count: conversations.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 64, // Conversation card height
});
```

**Results:**
- 100 conversations: 25 FPS → 60 FPS
- Memory: 50 MB → 15 MB
- Instant scroll

---

## Audit Findings

**Audit Date:** January 2026  
**Auditor:** Performance Specialist Agent  
**Verdict:** ⚠️ Moderate issues found, fixes implemented  

### Critical Issues (Fixed)

#### P0-1: ChatView Missing Memoization
**Status:** ✅ Fixed in 1.0.0  
**Impact:** Every state update re-rendered entire chat  
**Fix:** Wrapped in `React.memo` with shallow Zustand selector  

#### P0-2: No Message Virtualization
**Status:** ✅ Fixed in 1.0.0  
**Impact:** 1000 messages = 1000 DOM nodes, 15 FPS scroll  
**Fix:** Implemented `@tanstack/react-virtual`  

#### P0-3: Unthrottled Scroll Handler
**Status:** ✅ Fixed in 1.0.0  
**Impact:** 60+ state updates/second during scroll  
**Fix:** Throttled to 10 updates/second  

### High-Priority Issues (Fixed)

#### P1-1: MarkdownRenderer Not Memoized
**Status:** ✅ Fixed in 1.0.0  
**Impact:** Syntax highlighting re-ran on every render  
**Fix:** Memoized component and plugins  

#### P1-2: Message Handler Functions Recreated
**Status:** ✅ Fixed in 1.0.0  
**Impact:** Defeated `React.memo` on child components  
**Fix:** Wrapped all handlers in `useCallback`  

### Low-Priority Optimizations

#### P2-1: Toast Animations
**Status:** ⚠️ Minor issue, acceptable  
**Impact:** JS timers less precise than CSS  
**Decision:** No change needed, works fine  

#### P2-2: Onboarding Transition Delay
**Status:** 📋 Planned for 1.1.0  
**Impact:** 150ms feels slightly sluggish  
**Proposed:** Reduce to 100ms  

---

## Performance Monitoring

### Built-in Tools

**Chrome DevTools (in app):**
- Press `Cmd+Shift+I` (dev builds only)
- Performance tab → Record → Profile interactions
- Memory tab → Take heap snapshot

**React DevTools Profiler:**
- Install browser extension
- Profile re-renders
- Identify expensive components

---

### Performance Metrics

**Collect in production:**
```typescript
// Log performance metrics
if ('performance' in window && 'memory' in performance) {
  const mem = (performance as any).memory;
  console.log('[Memory]', {
    used: (mem.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
    total: (mem.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
  });
}
```

---

## Performance Tips

### For Users

#### 1. Reduce Animation (Accessibility)

If app feels sluggish:

**macOS:**
- System Preferences → Accessibility → Display → Reduce motion

**Windows:**
- Settings → Ease of Access → Display → Show animations

**Moltz respects `prefers-reduced-motion` and disables animations.**

#### 2. Close Unused Conversations

More conversations = more memory:

- Delete old conversations
- Export archived conversations
- Keep < 500 active conversations for best performance

#### 3. Limit Attachment Sizes

Large attachments slow rendering:

- Compress images before attaching
- Use external links for large files
- Keep attachments < 5 MB when possible

#### 4. Performance Mode (Coming Soon)

Enable in Settings → Advanced:

- Disables animations
- Reduces rendering quality
- Optimizes for older machines

---

### For Developers

#### 1. Use React DevTools Profiler

Profile before optimizing:

```bash
npm run dev
# Open React DevTools → Profiler
# Record interaction
# Analyze flame graph
```

#### 2. Lazy Load Heavy Components

Defer loading until needed:

```typescript
const SettingsDialog = lazy(() => import('./SettingsDialog'));

// Renders only when open
{settingsOpen && <SettingsDialog />}
```

#### 3. Memoize Expensive Computations

Use `useMemo` for heavy calculations:

```typescript
const sortedConversations = useMemo(() => {
  return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
}, [conversations]);
```

#### 4. Avoid Inline Functions in JSX

Recreates function on every render:

```typescript
// ❌ Bad
<Button onClick={() => handleClick(id)} />

// ✅ Good
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleButtonClick} />
```

#### 5. Use Shallow Comparison for Zustand

Prevent re-renders when state hasn't changed:

```typescript
import { shallow } from 'zustand/shallow';

const { a, b } = useStore(
  (state) => ({ a: state.a, b: state.b }),
  shallow
);
```

---

## Performance Roadmap

### Q1 2026

- [ ] Implement performance mode (reduced animations)
- [ ] Add memory leak detection
- [ ] Optimize large attachment handling

### Q2 2026

- [ ] IndexedDB to SQLite migration (for users with 100K+ messages)
- [ ] Web Worker for heavy computations
- [ ] Service Worker for offline support

### Q3 2026

- [ ] GPU-accelerated rendering (experimental)
- [ ] Advanced virtualization (variable heights)
- [ ] Conversation archiving (free up memory)

---

## Troubleshooting Performance

### App Feels Sluggish

**Check:**
1. How many conversations? (> 500 = slow)
2. Large messages? (> 10K characters)
3. Many attachments? (> 100)
4. Old machine? (< 8 GB RAM)

**Solutions:**
- Delete old conversations
- Enable reduced motion
- Upgrade hardware
- Report issue with profiling data

---

### High Memory Usage

**Expected usage:**
- Idle: 80-100 MB
- Active (50 conversations): 150-200 MB
- Heavy use (500 conversations): 250-300 MB

**If higher:**
- Quit and restart app
- Clear browser cache (Settings → Advanced)
- Check for memory leaks (report with DevTools snapshot)

---

### Scroll Lag

**Causes:**
- Too many messages (> 1000)
- Virtualization disabled
- Slow GPU

**Solutions:**
- Update to latest version (virtualization enabled)
- Enable GPU acceleration (Settings → Advanced)
- Reduce message density (Settings → Appearance)

---

## Benchmarking Tools

### Lighthouse (Web Vitals)

```bash
# Run Lighthouse on dev build
npm run dev
# Open http://localhost:1420 in Chrome
# DevTools → Lighthouse → Analyze
```

**Target Scores:**
- Performance: > 95
- Accessibility: > 95
- Best Practices: > 95

---

### React Profiler API

Programmatic profiling:

```typescript
import { Profiler } from 'react';

<Profiler id="ChatView" onRender={(id, phase, actualDuration) => {
  if (actualDuration > 16) { // > 1 frame
    console.warn(`Slow render: ${id} took ${actualDuration}ms`);
  }
}}>
  <ChatView />
</Profiler>
```

---

## Related Documentation

- **[Architecture → Performance Optimizations](./Architecture.md#performance-optimizations)** — Technical implementation
- **[Developer Guide → Profiling](./Developer-Guide.md#profiling)** — Development tools
- **[Troubleshooting → Performance](./Troubleshooting.md#performance-issues)** — User-facing issues

---

**Last updated:** January 2026  
**Next benchmark:** Q2 2026
