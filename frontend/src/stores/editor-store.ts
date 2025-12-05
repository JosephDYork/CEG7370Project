import { create } from "zustand";
import type { Stroke } from "../models/strokes";

interface EditorState {
  loggedIn: boolean;
  brushTool: string;
  brushSize: number;
  brushColor: string;
  brushFillColor: string;
  currentTopStrokeNumber: number;
  currentStroke: Stroke | null;
  eraseStack: Set<Stroke>;
  focusedStrokes: Set<Stroke>;
  undoStack: Stroke[];
  isSocketConnected: boolean;
  webSocket: WebSocket | null;
  currentLanguage: string;
  username: string;
  roomId: string;
}

interface EditorActions {
  getIsLoggedIn: () => boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setBrushTool: (brushTool: string) => void;
  setBrushSize: (brushSize: number) => void;
  setBrushColor: (brushColor: string) => void;
  setBrushFillColor: (brushFillColor: string) => void;
  setCurrentTopStrokeNumber: (number: number) => void;
  setCurrentStroke: (stroke: Stroke | null) => void;
  addFocusedStroke: (stroke: Stroke) => void;
  clearFocusedStrokes: () => void;
  addToEraseStack: (stroke: Stroke) => void;
  clearEraseStack: () => void;
  addToUndoStack: (stroke: Stroke) => void;
  clearUndoStack: () => void;
  removeFromUndoStack: () => void;
  setWebSocket: (socket: WebSocket | null) => void;
  getWebSocket: () => WebSocket | null;
  setIsSocketConnected: (isConnected: boolean) => void;
  getIsSocketConnected: () => boolean;
  setCurrentLanguage: (language: string) => void;
  getCurrentLanguage: () => string;
  setUsername: (username: string) => void;
  setRoomId: (roomId: string) => void;
}

export const useEditorStore = create<EditorState & EditorActions>(
  (set, get) => ({
    loggedIn: false,
    brushTool: "pen",
    brushSize: 2,
    brushColor: "#000000",
    brushFillColor: "#FFFFFF",
    currentTopStrokeNumber: 0,
    currentStroke: null,
    eraseStack: new Set(),
    focusedStrokes: new Set(),
    undoStack: [],
    isSocketConnected: false,
    webSocket: null,
    currentLanguage: "en",
    username: "",
    roomId: "",

    getIsLoggedIn: () => {
      return get().loggedIn;
    },

    setIsLoggedIn: (isLoggedIn) =>
      set((state) => ({
        ...state,
        loggedIn: isLoggedIn,
      })),

    setBrushTool: (brushTool) =>
      set((state) => ({
        ...state,
        brushTool,
      })),

    setBrushSize: (brushSize) =>
      set((state) => ({
        ...state,
        brushSize,
      })),

    setBrushColor: (brushColor) =>
      set((state) => ({
        ...state,
        brushColor,
      })),

    setBrushFillColor: (brushFillColor) =>
      set((state) => ({
        ...state,
        brushFillColor,
      })),

    setCurrentTopStrokeNumber: (number) =>
      set((state) => ({
        ...state,
        currentTopStrokeNumber: number,
      })),

    setCurrentStroke: (stroke) =>
      set((state) => ({
        ...state,
        currentStroke: stroke,
      })),

    addFocusedStroke: (stroke) =>
      set((state) => ({
        ...state,
        focusedStrokes: new Set([...state.focusedStrokes, stroke]),
      })),

    clearFocusedStrokes: () =>
      set((state) => ({
        ...state,
        focusedStrokes: new Set(),
      })),

    addToEraseStack: (stroke) =>
      set((state) => ({
        ...state,
        eraseStack: new Set([...state.eraseStack, stroke]),
      })),

    clearEraseStack: () =>
      set((state) => ({
        ...state,
        eraseStack: new Set(),
      })),

    addToUndoStack: (stroke) =>
      set((state) => ({
        ...state,
        undoStack: [...state.undoStack, stroke],
      })),

    clearUndoStack: () =>
      set((state) => ({
        ...state,
        undoStack: [],
      })),

    removeFromUndoStack: () =>
      set((state) => ({
        ...state,
        undoStack: state.undoStack.slice(0, -1),
      })),

    setWebSocket: (socket) =>
      set((state) => ({
        ...state,
        webSocket: socket,
      })),

    getWebSocket: () => {
      return get().webSocket;
    },

    setIsSocketConnected: (isConnected) =>
      set((state) => ({
        ...state,
        isSocketConnected: isConnected,
      })),

    getIsSocketConnected: () => {
      return get().isSocketConnected;
    },
    setCurrentLanguage: (language) =>
      set((state) => ({
        ...state,
        currentLanguage: language,
      })),

    getCurrentLanguage: () => {
      return get().currentLanguage;
    },

    setUsername: (username) =>
      set((state) => ({
        ...state,
        username,
      })),

    setRoomId: (roomId) =>
      set((state) => ({
        ...state,
        roomId,
      })),
    }));
