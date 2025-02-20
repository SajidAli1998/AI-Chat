import { create } from "zustand";

interface Message {
  id?: number;
  userId: number;
  message: string;
  sender: string;
  createdAt?: string;
  updatedAt?: string;
  starred?: boolean;
}

interface LLMStore {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessages: (updatedMessages: Message[]) => void;
}

export const useLLMStore = create<LLMStore>((set) => ({
  selectedModel: "",
  setSelectedModel: (model) => set({ selectedModel: model }),
  userId: "1",
  setUserId: (id) => set({ userId: id }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessages: (updatedMessages) =>
    set((state) => ({
      messages: state.messages.map(
        (message) =>
          updatedMessages.find(
            (updatedMessage) => updatedMessage.id === message.id
          ) || message
      ),
    })),
}));
