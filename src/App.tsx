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
    completeCurrentMessage 
  } = useStore();

  // Connect to Gateway on mount
  useEffect(() => {
    const connectToGateway = async () => {
      try {
        // TODO: Load from settings
        const url = "ws://localhost:18789";
        const token = "";
        await invoke("connect", { url, token });
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
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <Sidebar onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-12 border-b border-border flex items-center px-4 gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-md"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <svg
              className="w-5 h-5"
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
          <h1 className="font-semibold">
            {currentConversation?.title || "Molt"}
          </h1>
        </header>

        {/* Chat or Welcome */}
        {currentConversation ? <ChatView /> : <WelcomeView />}
      </div>
    </div>
  );
}
