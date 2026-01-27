# Component Testing Guide

## Test Templates

Component tests should be placed next to the component file:

```
src/
  components/
    Button.tsx
    Button.test.tsx
```

## Example Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  const mockProps = {
    // Define mock props here
  };
  
  beforeEach(() => {
    // Reset mocks if needed
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<YourComponent {...mockProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockHandler = vi.fn();
    render(<YourComponent onAction={mockHandler} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled();
    });
  });
});
```

## Testing Best Practices

1. **Test user behavior, not implementation**
   - Use `screen.getByRole()`, `getByLabelText()`, `getByText()` instead of CSS selectors
   - Test what users see and do

2. **Use meaningful test names**
   - Describe the behavior being tested
   - "should X when Y" format

3. **Keep tests focused**
   - One assertion per test when possible
   - Test one behavior at a time

4. **Mock external dependencies**
   - API calls
   - Tauri commands
   - Browser APIs

5. **Use the testing setup**
   - Tauri APIs are already mocked in `src/test/setup.ts`
   - Add new mocks there if needed

## Common Patterns

### Testing async behavior
```typescript
it('should load data', async () => {
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing forms
```typescript
it('should submit form', async () => {
  const onSubmit = vi.fn();
  render(<Form onSubmit={onSubmit} />);
  
  const input = screen.getByLabelText('Name');
  fireEvent.change(input, { target: { value: 'John' } });
  
  const button = screen.getByRole('button', { name: /submit/i });
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
  });
});
```

### Testing conditional rendering
```typescript
it('should show error state', () => {
  render(<Component error="Something went wrong" />);
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});

it('should show loading state', () => {
  render(<Component loading={true} />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:ui

# Run specific file
npm test Button.test.tsx

# Run with coverage
npm test -- --coverage
```

## Coverage Goals

Aim for:
- **High coverage of critical paths**: Authentication, data persistence, core features
- **Medium coverage of UI components**: Main user-facing components
- **Lower coverage of utilities**: Edge cases and formatting helpers

See `TESTING.md` for more information.
