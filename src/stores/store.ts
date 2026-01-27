import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: Attachment[];
  sources?: Source[];
  thinkingContent?: string;
  modelUsed?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  data?: string; // base64
  url?: string;
}

export interface Source {
  title: string;
  url?: string;
  snippet?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model?: string;
  thinkingEnabled: boolean;
  isPinned: boolean;
}

export interface Settings {
  gatewayUrl: string;
  gatewayToken: string;
  defaultModel: string;
  thinkingDefault: boolean;
  theme: "light" | "dark" | "system";
}

interface Store {
  // Connection
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  
  createConversation: () => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  pinConversation: (id: string) => void;

  // Messages
  addMessage: (conversationId: string, message: Omit<Message, "id" | "timestamp">) => Message;
  appendToCurrentMessage: (content: string) => void;
  completeCurrentMessage: () => void;
  currentStreamingMessageId: string | null;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

const generateId = () => crypto.randomUUID();

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Connection
      connected: false,
      setConnected: (connected) => set({ connected }),

      // Conversations
      conversations: [],
      currentConversationId: null,
      currentStreamingMessageId: null,

      get currentConversation() {
        const state = get();
        return state.conversations.find((c) => c.id === state.currentConversationId) || null;
      },

      createConversation: () => {
        const conversation: Conversation = {
          id: generateId(),
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          thinkingEnabled: get().settings.thinkingDefault,
          isPinned: false,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: conversation.id,
        }));

        return conversation;
      },

      selectConversation: (id) => {
        set({ currentConversationId: id });
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
        }));
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
        }));
      },

      pinConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          ),
        }));
      },

      // Messages
      addMessage: (conversationId, messageData) => {
        const message: Message = {
          ...messageData,
          id: generateId(),
          timestamp: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: new Date(),
                  // Auto-generate title from first user message
                  title:
                    c.messages.length === 0 && messageData.role === "user"
                      ? messageData.content.slice(0, 40) + (messageData.content.length > 40 ? "..." : "")
                      : c.title,
                }
              : c
          ),
          currentStreamingMessageId: message.isStreaming ? message.id : null,
        }));

        return message;
      },

      appendToCurrentMessage: (content) => {
        const { currentConversationId, currentStreamingMessageId } = get();
        if (!currentConversationId || !currentStreamingMessageId) return;

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === currentConversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === currentStreamingMessageId
                      ? { ...m, content: m.content + content }
                      : m
                  ),
                }
              : c
          ),
        }));
      },

      completeCurrentMessage: () => {
        const { currentConversationId, currentStreamingMessageId } = get();
        if (!currentConversationId || !currentStreamingMessageId) return;

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === currentConversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === currentStreamingMessageId
                      ? { ...m, isStreaming: false }
                      : m
                  ),
                }
              : c
          ),
          currentStreamingMessageId: null,
        }));
      },

      // Settings
      settings: {
        gatewayUrl: "ws://localhost:18789",
        gatewayToken: "",
        defaultModel: "anthropic/claude-sonnet-4-5",
        thinkingDefault: false,
        theme: "system",
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },
    }),
    {
      name: "molt-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        settings: state.settings,
      }),
    }
  )
);
