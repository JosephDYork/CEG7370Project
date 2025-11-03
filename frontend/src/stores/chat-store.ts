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
  addMessage: (message: ChatMessage) => void;
  removeMessage: (index: number) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  roomId: "",
  messages: [],

  setRoomId: (roomId) =>
    set((state) => ({
      ...state,
      roomId,
    })),

  addMessage: (message) =>
    set((state) => ({
      ...state,
      messages: [...state.messages, message],
    })),

  removeMessage: (index) =>
    set((state) => ({
      ...state,
      messages: state.messages.filter((_, i) => i !== index),
    })),

  clearMessages: () =>
    set((state) => ({
      ...state,
      messages: [],
    })),
}));
