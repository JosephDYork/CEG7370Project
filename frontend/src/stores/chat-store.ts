import { create } from "zustand";

export class ChatMessage {
  userName: string;
  languageCode: string;
  originalMessage: string;
  translatedMessage: string;

  constructor(
    userName: string,
    languageCode: string,
    originalMessage: string,
    translatedMessage: string
  ) {
    this.userName = userName;
    this.languageCode = languageCode;
    this.originalMessage = originalMessage;
    this.translatedMessage = translatedMessage;
  }
}

interface ChatState {
  roomId: string;
  messages: ChatMessage[];
}

interface ChatActions {
  setRoomId: (roomId: string) => void;
  overwriteState: (chatState: ChatState) => void;
  addMessages: (messages: ChatMessage[]) => void;
  removeMessages: (index: number[]) => void;
  getAllMessages: () => ChatMessage[];
  setAllMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  roomId: "",
  messages: [],

  overwriteState: (chatState) => {
    set(chatState);
  },

  setRoomId: (roomId) =>
    set((state) => ({
      ...state,
      roomId,
    })),

  addMessages: (messages) =>
    set((state) => ({
      ...state,
      messages: [...state.messages, ...messages],
    })),

  removeMessages: (indices) =>
    set((state) => ({
      ...state,
      messages: state.messages.filter((_, idx) => !indices.includes(idx)),
    })),

  setAllMessages: (messages) =>
    set((state) => ({
      ...state,
      messages: messages,
    })),

  getAllMessages: () => {
    return get().messages;
  },
}));
