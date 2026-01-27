import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/Sidebar";
import { ChatView } from "./components/ChatView";
import { WelcomeView } from "./components/WelcomeView";
import { useStore } from "./stores/store";
import { cn } from "./lib/utils";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { 
    currentConversation, 
    setConnected,
    appendToCurrentMessage,
    completeCurrentMessage,
    settings 
  } = useStore();

  // Apply theme on mount and when settings change
  useEffect(() => {
    const applyTheme = () => {
      const isDark = 
        settings.theme === "dark" || 
        (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (settings.theme === "system") applyTheme();
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.theme]);

  // Connect to Gateway on mount
  useEffect(() => {
    const connectToGateway = async () => {
      try {
        await invoke("connect", { 
          url: settings.gatewayUrl, 
          token: settings.gatewayToken 
        });
      } catch (err) {
        console.error("Failed to connect:", err);
      }
    };

    connectToGateway();
  }, []);

  // Listen for Gateway events
  useEffect(() => {
    const unlisten = Promise.all([
      listen("gateway:connected", () => {
        setConnected(true);
      }),
      listen("gateway:disconnected", () => {
        setConnected(false);
      }),
      listen<string>("gateway:stream", (event) => {
        appendToCurrentMessage(event.payload);
      }),
      listen("gateway:complete", () => {
        completeCurrentMessage();
      }),
    ]);

    return () => {
      unlisten.then((listeners) => {
        listeners.forEach((fn) => fn());
      });
    };
  }, [setConnected, appendToCurrentMessage, completeCurrentMessage]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r border-border transition-all duration-300 ease-in-out flex-shrink-0",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        <div className={cn(
          "w-64 h-full transition-opacity duration-200",
          sidebarOpen ? "opacity-100" : "opacity-0"
        )}>
          <Sidebar onToggle={() => setSidebarOpen(!sidebarOpen)} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              title={sidebarOpen ? "Hide sidebar (⌘\\)" : "Show sidebar (⌘\\)"}
            >
              <svg
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  !sidebarOpen && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="font-semibold truncate">
              {currentConversation?.title || "Molt"}
            </h1>
          </div>
        </header>

        {/* Chat or Welcome */}
        <div className="flex-1 min-h-0">
          {currentConversation ? <ChatView /> : <WelcomeView />}
        </div>
      </div>
    </div>
  );
}
