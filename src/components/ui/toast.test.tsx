import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastContainer, Toast } from "./toast";

describe("ToastContainer", () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render toasts", () => {
    const toasts: Toast[] = [
      { id: "1", message: "Toast 1", type: "info" },
      { id: "2", message: "Toast 2", type: "success" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    expect(screen.getByText("Toast 1")).toBeInTheDocument();
    expect(screen.getByText("Toast 2")).toBeInTheDocument();
  });

  it("should render empty container when no toasts", () => {
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={mockOnDismiss} />,
    );

    const toastContainer = container.firstChild as HTMLElement;
    expect(toastContainer.children.length).toBe(0);
  });

  it("should show info toast", () => {
    const toasts: Toast[] = [
      { id: "1", message: "Info message", type: "info" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    expect(screen.getByText("Info message")).toBeInTheDocument();
  });

  it("should show success toast", () => {
    const toasts: Toast[] = [
      { id: "1", message: "Success message", type: "success" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("should show warning toast", () => {
    const toasts: Toast[] = [
      { id: "1", message: "Warning message", type: "warning" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    expect(screen.getByText("Warning message")).toBeInTheDocument();
  });

  it("should show error toast", () => {
    const toasts: Toast[] = [
      { id: "1", message: "Error message", type: "error" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should have dismiss button", () => {
    const toasts: Toast[] = [{ id: "1", message: "Test toast" }];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByLabelText("Dismiss notification");
    expect(dismissButton).toBeInTheDocument();
  });

  it("should call onDismiss after auto-dismiss timer", () => {
    const toasts: Toast[] = [
      { id: "1", message: "Auto dismiss", duration: 3000 },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    // Fast-forward past the duration + exit animation
    vi.advanceTimersByTime(3300);

    expect(mockOnDismiss).toHaveBeenCalledWith("1");
  });

  it("should use default 5000ms duration when not specified", () => {
    const toasts: Toast[] = [{ id: "1", message: "Default duration" }];

    render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />);

    // Fast-forward past default duration (5000ms) + exit animation
    vi.advanceTimersByTime(5300);

    expect(mockOnDismiss).toHaveBeenCalledWith("1");
  });
});
