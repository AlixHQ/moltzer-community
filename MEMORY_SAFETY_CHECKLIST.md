# Memory Safety Checklist - Quick Reference

**Use this checklist for all new React components to prevent memory leaks.**

---

## ✅ Timer Safety

### setTimeout / setInterval
```typescript
❌ BAD - No cleanup
useEffect(() => {
  setTimeout(() => setState(value), 1000);
}, []);

✅ GOOD - Tracked with ref
useEffect(() => {
  const timer = setTimeout(() => setState(value), 1000);
  return () => clearTimeout(timer);
}, []);

✅ BETTER - With mount guard
const mountedRef = useRef(true);
useEffect(() => {
  const timer = setTimeout(() => {
    if (mountedRef.current) {
      setState(value);
    }
  }, 1000);
  return () => {
    mountedRef.current = false;
    clearTimeout(timer);
  };
}, []);

✅ BEST - Use custom hook
const { error, setError } = useErrorTimeout(10000);
setError("Error message", 5000); // Auto-clears after 5s
```

---

## ✅ Event Listeners

```typescript
❌ BAD - No cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

✅ GOOD - Proper cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

✅ BETTER - With mount guard
useEffect(() => {
  let mounted = true;
  const handler = () => {
    if (mounted) handleResize();
  };
  window.addEventListener('resize', handler);
  return () => {
    mounted = false;
    window.removeEventListener('resize', handler);
  };
}, []);
```

---

## ✅ Observers

### ResizeObserver / IntersectionObserver / MutationObserver

```typescript
❌ BAD - No disconnect
useEffect(() => {
  const observer = new ResizeObserver(callback);
  observer.observe(element);
}, []);

✅ GOOD - Disconnect on cleanup
useEffect(() => {
  const observer = new ResizeObserver(callback);
  observer.observe(element);
  return () => observer.disconnect();
}, []);
```

---

## ✅ Async Operations

### Promises with delays

```typescript
❌ BAD - Untracked timeout
async function fetchData() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  setState(data); // May execute after unmount!
}

✅ GOOD - Check mounted state
const mountedRef = useRef(true);
async function fetchData() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (mountedRef.current) {
    setState(data);
  }
}
useEffect(() => {
  return () => { mountedRef.current = false; };
}, []);

✅ BETTER - Use AbortController
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then(response => response.json())
    .then(data => setState(data));
  return () => controller.abort();
}, []);
```

---

## ✅ Zustand Store

```typescript
❌ BAD - Manual subscription
useEffect(() => {
  const unsub = store.subscribe(callback);
  // Forgot to return cleanup!
}, []);

✅ GOOD - Use hook (auto-cleanup)
const value = useStore(state => state.value);

✅ ALSO GOOD - Manual with cleanup
useEffect(() => {
  const unsub = store.subscribe(callback);
  return unsub;
}, []);
```

---

## ✅ Data Persistence

### Debounced operations

```typescript
❌ BAD - No flush on unload
let timer;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => persist(), 500);
}

✅ GOOD - Flush on visibility change
let timer, pendingFn;
function save(fn) {
  clearTimeout(timer);
  pendingFn = fn;
  timer = setTimeout(() => {
    pendingFn = undefined;
    fn();
  }, 500);
}

function flush() {
  if (timer && pendingFn) {
    clearTimeout(timer);
    pendingFn();
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});
```

---

## 🚫 Common Pitfalls

### 1. Timer in event handler
```typescript
❌ BAD
const handleClick = () => {
  setTimeout(() => setState(value), 300);
  // Timer not tracked!
};

✅ GOOD
const timerRef = useRef();
const handleClick = () => {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => setState(value), 300);
};
useEffect(() => {
  return () => clearTimeout(timerRef.current);
}, []);
```

### 2. Multiple setState calls in timer
```typescript
❌ BAD
setTimeout(() => {
  setA(1);
  setB(2);
  setC(3); // 3 potential leaks!
}, 1000);

✅ GOOD
const timer = setTimeout(() => {
  if (mountedRef.current) {
    setA(1);
    setB(2);
    setC(3);
  }
}, 1000);
return () => clearTimeout(timer);
```

### 3. Async inside async
```typescript
❌ BAD
async function complex() {
  await promise1();
  await new Promise(r => setTimeout(r, 1000));
  setState(value); // May be unmounted!
}

✅ GOOD
async function complex() {
  if (!mountedRef.current) return;
  await promise1();
  if (!mountedRef.current) return;
  await new Promise(r => setTimeout(r, 1000));
  if (!mountedRef.current) return;
  setState(value);
}
```

---

## 🔍 Testing for Leaks

### Manual Testing
```bash
# 1. Open Chrome DevTools
# 2. Performance → Memory
# 3. Take heap snapshot
# 4. Interact with component
# 5. Unmount component
# 6. Take another snapshot
# 7. Compare - should see cleanup
```

### Automated Checks
```typescript
// Check for React warnings
const { unmount } = render(<Component />);
unmount();
// No "Can't perform a React state update" warnings

// Check timer cleanup
jest.useFakeTimers();
const { unmount } = render(<Component />);
unmount();
jest.runAllTimers();
// No errors thrown
```

---

## 📚 Custom Hooks Available

### useErrorTimeout
Auto-clearing error messages with proper cleanup
```typescript
const { error, setError, clearError } = useErrorTimeout(10000);
```

### useFocusTrap
Focus management for modals (built-in cleanup)
```typescript
const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);
```

---

## 🎯 Review Checklist

Before submitting PR, verify:

- [ ] All setTimeout/setInterval have cleanup
- [ ] All addEventListener have removeEventListener
- [ ] All Observers call disconnect()
- [ ] Async operations check mounted state
- [ ] Event handlers don't create uncleaned timers
- [ ] No React warnings in console
- [ ] Memory profiling shows proper cleanup
- [ ] Tests pass without memory warnings

---

## 📖 References

- [React useEffect cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
- [Memory leak patterns](./MEMORY_LEAK_AUDIT.md)
- [Fixed examples](./MEMORY_LEAK_FIX_COMPLETE.md)

---

**Last Updated:** 2025-01-28  
**Maintained by:** Development Team
