import { useState, useEffect } from "react";
import { useStore, ModelInfo } from "../stores/store";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "../lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

// Fallback models when Gateway doesn't provide a list
const FALLBACK_MODELS: ModelInfo[] = [
  { id: "anthropic/claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "anthropic" },
  { id: "anthropic/claude-opus-4-5", name: "Claude Opus 4.5", provider: "anthropic" },
  { id: "anthropic/claude-haiku-4", name: "Claude Haiku 4", provider: "anthropic" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini", provider: "openai" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google" },
];

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { settings, updateSettings, connected, setConnected, availableModels, setAvailableModels, modelsLoading, setModelsLoading } = useStore();
  const [formData, setFormData] = useState(settings);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings, open]);

  // Fetch models when dialog opens and connected
  useEffect(() => {
    if (open && connected) {
      fetchModels();
    }
  }, [open, connected]);

  const fetchModels = async () => {
    setModelsLoading(true);
    try {
      const models = await invoke<ModelInfo[]>("get_models");
      if (models && models.length > 0) {
        setAvailableModels(models);
      }
    } catch (err) {
      console.log("Could not fetch models from Gateway, using fallbacks");
    } finally {
      setModelsLoading(false);
    }
  };

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
      // Try to fetch models after successful connection
      fetchModels();
    } catch (err: any) {
      setConnectionStatus("error");
      setError(err.toString());
    }
  };

  // Use available models from Gateway, or fall back to defaults
  const models = availableModels.length > 0 ? availableModels : FALLBACK_MODELS;
  
  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    const provider = model.provider || "other";
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, ModelInfo[]>);

  const providerNames: Record<string, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    google: "Google",
    other: "Other",
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
                  {connectionStatus === "connecting" ? "Connecting..." : "Test Connection"}
                </button>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium">Default Model</label>
                  {modelsLoading && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Loading models...
                    </span>
                  )}
                  {!modelsLoading && availableModels.length === 0 && connected && (
                    <span className="text-xs text-muted-foreground">
                      Using common models
                    </span>
                  )}
                </div>
                <select
                  value={formData.defaultModel}
                  onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                  disabled={modelsLoading}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    modelsLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
                    <optgroup key={provider} label={providerNames[provider] || provider}>
                      {providerModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {!connected && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Connect to Gateway to see available models
                  </p>
                )}
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
