import { useStore } from "../stores/store";
import { cn } from "../lib/utils";

export function WelcomeView() {
  const { createConversation, connected, settings } = useStore();

  const suggestions = [
    {
      icon: "💡",
      title: "Explain quantum computing",
      description: "Break down complex concepts in simple terms",
    },
    {
      icon: "✍️",
      title: "Write a professional email",
      description: "Help with business communication",
    },
    {
      icon: "⚛️",
      title: "React best practices",
      description: "Modern web development tips",
    },
    {
      icon: "🍳",
      title: "Weekly meal plan",
      description: "Healthy recipes and shopping lists",
    },
  ];

  const handleSuggestionClick = async (_suggestion: typeof suggestions[0]) => {
    createConversation();
    // TODO: Auto-send the suggestion as first message
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 animate-in zoom-in-50 duration-500">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 shadow-xl shadow-orange-500/20 mb-6 transform hover:scale-105 transition-transform">
            <span className="text-5xl drop-shadow-lg">🦞</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-3">
            Molt
          </h1>
          <p className="text-lg text-muted-foreground">
            Your AI assistant powered by Claude
          </p>
        </div>

        {/* Connection status banner */}
        {!connected && (
          <div className="mb-8 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">Not connected to Gateway</span>
            </div>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
              Check your settings to configure the Gateway URL
            </p>
          </div>
        )}

        {/* Model info */}
        <div className="mb-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Using</span>
          <span className="px-2 py-1 bg-muted rounded-md font-medium">
            {settings.defaultModel.split('/').pop()}
          </span>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={!connected}
              className={cn(
                "group p-4 text-left rounded-xl border transition-all duration-200",
                "animate-in fade-in slide-in-from-bottom-2",
                connected
                  ? "border-border hover:border-primary/30 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  : "border-border/50 opacity-50 cursor-not-allowed"
              )}
              style={{ animationDelay: `${i * 100 + 200}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{suggestion.icon}</span>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {suggestion.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* New chat button */}
        <button
          onClick={() => createConversation()}
          disabled={!connected}
          className={cn(
            "inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200",
            "animate-in fade-in zoom-in-95 duration-500",
            connected
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          style={{ animationDelay: "400ms" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start New Chat
        </button>

        {/* Keyboard hint */}
        <p className="mt-4 text-xs text-muted-foreground animate-in fade-in duration-500" style={{ animationDelay: "500ms" }}>
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono mx-0.5">⌘N</kbd> to start a new chat
        </p>
      </div>
    </div>
  );
}
