import { useRef, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../stores/store";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

export function ChatView() {
  const { currentConversation, addMessage, connected, settings } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll to bottom on new messages (only if already near bottom)
  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation?.messages, isNearBottom]);

  // Track scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(distanceFromBottom < 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string, attachments: File[]) => {
    if (!currentConversation || isSending) return;
    setError(null);
    setIsSending(true);

    try {
      // Add user message
      addMessage(currentConversation.id, {
        role: "user",
        content,
        attachments: attachments.map((f) => ({
          id: crypto.randomUUID(),
          filename: f.name,
          mimeType: f.type,
        })),
      });

      // Add placeholder for assistant response
      addMessage(currentConversation.id, {
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      // Send to gateway
      await invoke("send_message", {
        params: {
          message: content,
          session_key: currentConversation.id,
          model: currentConversation.model || settings.defaultModel,
          thinking: currentConversation.thinkingEnabled ? "low" : null,
        },
      });
    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorMsg = err.toString().replace("Error: ", "");
      setError(errorMsg);
      
      // Auto-dismiss error after 10 seconds
      setTimeout(() => setError(null), 10000);
    } finally {
      setIsSending(false);
    }
  };

  if (!currentConversation) {
    return null;
  }

  const hasMessages = currentConversation.messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          {!hasMessages ? (
            <EmptyConversation />
          ) : (
            <div className="space-y-6">
              {currentConversation.messages.map((message, index) => (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                >
                  <MessageBubble message={message} />
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && hasMessages && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={scrollToBottom}
            className="px-4 py-2 bg-background border border-border rounded-full shadow-lg hover:bg-muted transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-sm">Jump to bottom</span>
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-destructive">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Connection warning */}
      {!connected && (
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-3xl mx-auto flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Not connected to Gateway. Messages won't be sent.</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={!connected || isSending}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400/10 to-red-500/10 mb-6">
        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">Start your conversation</h2>
      <p className="text-muted-foreground max-w-md">
        Type a message below to begin chatting. I can help with coding, writing, analysis, and much more.
      </p>
      
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {["Write code", "Explain concept", "Brainstorm ideas", "Debug error"].map((action) => (
          <span
            key={action}
            className="px-3 py-1.5 text-sm bg-muted rounded-full text-muted-foreground"
          >
            {action}
          </span>
        ))}
      </div>
    </div>
  );
}
