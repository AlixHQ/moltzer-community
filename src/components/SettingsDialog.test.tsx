import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsDialog } from "./SettingsDialog";
import { useStore } from "../stores/store";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const { invoke } = await import("@tauri-apps/api/core");

describe("SettingsDialog", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store
    const store = useStore.getState();
    store.conversations.forEach((c) => store.deleteConversation(c.id));
    store.setConnected(false);
    store.updateSettings({
      gatewayUrl: "ws://localhost:18789",
      gatewayToken: "",
      defaultModel: "anthropic/claude-sonnet-4-5",
      thinkingDefault: false,
      theme: "system",
    });
  });

  describe("rendering", () => {
    it("should render when open", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(<SettingsDialog open={false} onClose={mockOnClose} />);

      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("should render all sections", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByText("Connection")).toBeInTheDocument();
      expect(screen.getByText("Chat Settings")).toBeInTheDocument();
      expect(screen.getByText("Appearance")).toBeInTheDocument();
    });
  });

  describe("Gateway URL field", () => {
    it("should display current gateway URL", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const input = screen.getByDisplayValue("ws://localhost:18789");
      expect(input).toBeInTheDocument();
    });

    it("should update gateway URL when typing", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const input = screen.getByDisplayValue("ws://localhost:18789");
      await user.clear(input);
      await user.type(input, "ws://custom:8080");

      expect(input).toHaveValue("ws://custom:8080");
    });

    it("should validate URL format", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const input = screen.getByDisplayValue("ws://localhost:18789");
      await user.clear(input);
      await user.type(input, "invalid-url");

      await waitFor(() => {
        expect(
          screen.getByText(/URL must start with ws:\/\/ or wss:\/\//),
        ).toBeInTheDocument();
      });
    });

    it("should show warning for insecure remote URLs", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const input = screen.getByDisplayValue("ws://localhost:18789");
      await user.clear(input);
      await user.type(input, "ws://example.com:18789");

      // Warning should appear as protocol notice, not error
      await waitFor(() => {
        const notice = screen.queryByText(/Consider using wss:\/\//);
        expect(notice).toBeInTheDocument();
      });
    });

    it("should accept secure WebSocket URLs", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const input = screen.getByDisplayValue("ws://localhost:18789");
      await user.clear(input);
      await user.type(input, "wss://gateway.example.com");

      expect(input).toHaveValue("wss://gateway.example.com");
      expect(screen.queryByText(/Invalid URL format/)).not.toBeInTheDocument();
    });
  });

  describe("Authentication Token field", () => {
    it("should display token as password by default", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/Leave blank/);
      expect(input).toHaveAttribute("type", "password");
    });

    it("should toggle token visibility", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/Leave blank/);
      const toggleButton = screen.getByLabelText("Show token");

      expect(input).toHaveAttribute("type", "password");

      await user.click(toggleButton);
      expect(input).toHaveAttribute("type", "text");
      expect(screen.getByLabelText("Hide token")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Hide token"));
      expect(input).toHaveAttribute("type", "password");
    });

    it("should update token when typing", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/Leave blank/);
      await user.type(input, "test-token-123");

      expect(input).toHaveValue("test-token-123");
    });
  });

  describe("Connection Status", () => {
    it("should show disconnected status by default", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByText("Disconnected")).toBeInTheDocument();
    });

    it("should show connected status when connected", () => {
      const store = useStore.getState();
      store.setConnected(true);

      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByText("Connected")).toBeInTheDocument();
    });

    it("should test connection when button clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(invoke).mockImplementation((cmd) => {
        if (cmd === "disconnect") return Promise.resolve();
        if (cmd === "connect")
          return Promise.resolve({
            success: true,
            used_url: "ws://localhost:18789",
            protocol_switched: false,
          });
        return Promise.reject(new Error("Unknown command"));
      });

      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const testButton = screen.getByText("Test Connection");
      await user.click(testButton);

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith("disconnect");
        expect(invoke).toHaveBeenCalledWith("connect", {
          url: "ws://localhost:18789",
          token: "",
        });
      });
    });

    it("should show error on connection failure", async () => {
      const user = userEvent.setup();
      vi.mocked(invoke).mockImplementation((cmd) => {
        if (cmd === "disconnect") return Promise.resolve();
        if (cmd === "connect")
          return Promise.reject(new Error("Connection refused"));
        return Promise.reject(new Error("Unknown command"));
      });

      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const testButton = screen.getByText("Test Connection");
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/Connection refused/)).toBeInTheDocument();
      });
    });
  });

  describe("Default Model selection", () => {
    it("should display current default model", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const select = screen.getByDisplayValue(/Claude Sonnet 4.5/);
      expect(select).toBeInTheDocument();
    });

    it("should change default model when selected", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const select = screen.getByLabelText("Default Model");
      await user.selectOptions(select, "openai/gpt-4o");

      expect(select).toHaveValue("openai/gpt-4o");
    });

    it("should group models by provider", () => {
      const { container } = render(
        <SettingsDialog open={true} onClose={mockOnClose} />,
      );

      const optgroups = container.querySelectorAll("optgroup");
      expect(optgroups.length).toBeGreaterThan(0);

      const anthropicGroup = Array.from(optgroups).find(
        (g) => g.label === "Anthropic",
      );
      expect(anthropicGroup).toBeInTheDocument();
    });
  });

  describe("Thinking toggle", () => {
    it("should display current thinking default state", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(
        screen.getByText("Enable Thinking by Default"),
      ).toBeInTheDocument();
    });

    it("should toggle thinking default", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const thinkingSwitch = screen.getByRole("switch");
      expect(thinkingSwitch).not.toBeChecked();

      await user.click(thinkingSwitch);
      expect(thinkingSwitch).toBeChecked();
    });
  });

  describe("Theme selection", () => {
    it("should display theme buttons", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByText("Light")).toBeInTheDocument();
      expect(screen.getByText("Dark")).toBeInTheDocument();
      expect(screen.getByText("System")).toBeInTheDocument();
    });

    it("should select theme when clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const darkButton = screen.getByText("Dark");
      await user.click(darkButton);

      expect(darkButton).toHaveClass("bg-primary");
    });

    it("should apply dark theme immediately", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const darkButton = screen.getByText("Dark");
      await user.click(darkButton);

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("should remove dark class when light theme selected", async () => {
      const user = userEvent.setup();
      document.documentElement.classList.add("dark");

      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const lightButton = screen.getByText("Light");
      await user.click(lightButton);

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("Save functionality", () => {
    it("should save settings when Save button clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Change some settings
      const select = screen.getByLabelText("Default Model");
      await user.selectOptions(select, "openai/gpt-4o");

      const saveButton = screen.getByText("Save Changes");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      const settings = useStore.getState().settings;
      expect(settings.defaultModel).toBe("openai/gpt-4o");
    });

    it("should not save when URL validation fails", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const urlInput = screen.getByDisplayValue("ws://localhost:18789");
      await user.clear(urlInput);
      await user.type(urlInput, "invalid");

      const saveButton = screen.getByText("Save Changes");
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/URL must start with ws:\/\/ or wss:\/\//),
        ).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Close functionality", () => {
    it("should close when Cancel button clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should close when backdrop clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const backdrop = document.querySelector(".backdrop-blur-sm");
      expect(backdrop).toBeInTheDocument();

      await user.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should close when Escape key pressed", async () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      fireEvent.keyDown(window, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should close when X button clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SettingsDialog open={true} onClose={mockOnClose} />,
      );

      const closeButton = container
        .querySelector("button svg")
        ?.closest("button");
      expect(closeButton).toBeInTheDocument();

      await user.click(closeButton!);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have proper labels for inputs", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Find inputs by their id (which is connected to labels via htmlFor)
      expect(document.getElementById("gateway-url")).toBeInTheDocument();
      expect(document.getElementById("gateway-token")).toBeInTheDocument();
      expect(document.getElementById("default-model")).toBeInTheDocument();
    });

    it("should have accessible toggle buttons", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText("Show token")).toBeInTheDocument();
    });
  });
});
