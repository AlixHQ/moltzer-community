/**
 * QuickInput - Spotlight-style floating input for quick AI queries
 *
 * Triggered by global hotkey (Cmd+Shift+Space on Mac, Ctrl+Shift+Space on Windows)
 * Opens main window with the typed message - instant "ask anywhere" functionality.
 */

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { cn } from "../lib/utils";
import { X, Sparkles, ArrowRight } from "lucide-react";

export function QuickInput() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentWindow = getCurrentWindow();

  // Focus input on mount and when window becomes visible
  useEffect(() => {
    inputRef.current?.focus();

    const unlisten = currentWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        inputRef.current?.focus();
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [currentWindow]);

  const handleClose = async () => {
    setInput("");
    await currentWindow.hide();
  };

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWindow]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const message = input.trim();

    // Emit event to main window with the message
    await emit("quickinput:submit", { message });

    // Show and focus main window
    const mainWindow = new Window("main");
    await mainWindow.show();
    await mainWindow.setFocus();

    // Close quickinput
    await handleClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="h-screen w-screen bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      data-tauri-drag-region
    >
      {/* Header - draggable */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2" data-tauri-drag-region>
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Quick Ask</span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Input area */}
      <div className="flex-1 p-4 flex items-center">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... (Enter to send, Esc to close)"
          className={cn(
            "w-full min-h-[60px] max-h-[120px] resize-none",
            "bg-transparent text-foreground placeholder:text-muted-foreground",
            "border-0 focus:ring-0 focus:outline-none",
            "text-base leading-relaxed",
          )}
          autoFocus
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/50 bg-muted/30 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {navigator.platform.includes("Mac") ? "⌘⇧Space" : "Ctrl+Shift+Space"}{" "}
          to toggle
        </span>
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            input.trim()
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          <ArrowRight className="w-4 h-4" />
          Open in Moltzer
        </button>
      </div>
    </div>
  );
}
