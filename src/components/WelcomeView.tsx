import { useStore } from "../stores/store";

export function WelcomeView() {
  const { createConversation } = useStore();

  const suggestions = [
    "Explain quantum computing in simple terms",
    "Help me write a professional email",
    "What are the best practices for React?",
    "Create a meal plan for the week",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg mb-4">
            <span className="text-4xl">🦞</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Molt
          </h1>
          <p className="text-muted-foreground mt-2">
            Your AI assistant powered by Moltbot
          </p>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => {
                const conv = createConversation();
                // TODO: Auto-send the suggestion
              }}
              className="p-4 text-left text-sm rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* New chat button */}
        <button
          onClick={() => createConversation()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start New Chat
        </button>
      </div>
    </div>
  );
}
