import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "../lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { settings, updateSettings, connected, setConnected } = useStore();
  const [formData, setFormData] = useState(settings);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings, open]);

  const handleSave = async () => {
    updateSettings(formData);
    
    // Try to reconnect with new settings
    if (formData.gatewayUrl !== settings.gatewayUrl) {
      setConnectionStatus("connecting");
      setError(null);
      try {
        await invoke("disconnect");
        await invoke("connect", {
          url: formData.gatewayUrl,
          token: formData.gatewayToken,
        });
        setConnectionStatus("idle");
      } catch (err: any) {
        setConnectionStatus("error");
        setError(err.toString());
        setConnected(false);
      }
    }
    
    onClose();
  };

  const handleTestConnection = async () => {
    setConnectionStatus("connecting");
    setError(null);
    try {
      await invoke("disconnect");
      await invoke("connect", {
        url: formData.gatewayUrl,
        token: formData.gatewayToken,
      });
      setConnectionStatus("idle");
    } catch (err: any) {
      setConnectionStatus("error");
      setError(err.toString());
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-background rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Connection Section */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Gateway Connection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Gateway URL</label>
                <input
                  type="text"
                  value={formData.gatewayUrl}
                  onChange={(e) => setFormData({ ...formData, gatewayUrl: e.target.value })}
                  placeholder="ws://localhost:18789"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Authentication Token</label>
                <input
                  type="password"
                  value={formData.gatewayToken}
                  onChange={(e) => setFormData({ ...formData, gatewayToken: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={connectionStatus === "connecting"}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    "border border-border hover:bg-muted",
                    connectionStatus === "connecting" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {connectionStatus === "connecting" ? "Testing..." : "Test Connection"}
                </button>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      connected ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    {connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </section>

          {/* Chat Section */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Chat Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Default Model</label>
                <select
                  value={formData.defaultModel}
                  onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <optgroup label="Anthropic">
                    <option value="anthropic/claude-opus-4-5">Claude Opus 4.5</option>
                    <option value="anthropic/claude-sonnet-4-5">Claude Sonnet 4.5</option>
                    <option value="anthropic/claude-haiku-4">Claude Haiku 4</option>
                  </optgroup>
                  <optgroup label="OpenAI">
                    <option value="openai/gpt-4o">GPT-4o</option>
                    <option value="openai/gpt-4o-mini">GPT-4o mini</option>
                    <option value="openai/o1">o1</option>
                    <option value="openai/o3-mini">o3-mini</option>
                  </optgroup>
                  <optgroup label="Google">
                    <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  </optgroup>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Enable Thinking by Default</label>
                  <p className="text-xs text-muted-foreground">Extended reasoning for complex tasks</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, thinkingDefault: !formData.thinkingDefault })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    formData.thinkingDefault ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      formData.thinkingDefault ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Appearance
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Theme</label>
              <div className="flex gap-2">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      setFormData({ ...formData, theme });
                      // Apply theme immediately
                      if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                        document.documentElement.classList.add("dark");
                      } else if (theme === "light") {
                        document.documentElement.classList.remove("dark");
                      }
                    }}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      formData.theme === theme
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-muted"
                    )}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
