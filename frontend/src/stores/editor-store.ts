import { create } from "zustand";
import type { StrokeType } from "../models/strokes";

interface EditorState {
  brushTool: string;
  brushSize: number;
  brushColor: string;
  currentStroke: StrokeType | null;
  eraseStack: StrokeType[];
  focusedStrokes: StrokeType[];
  undoStack: StrokeType[];
}

interface EditorActions {
  setBrushTool: (brushTool: string) => void;
  setBrushSize: (brushSize: number) => void;
  setBrushColor: (brushColor: string) => void;
  setCurrentStroke: (stroke: StrokeType | null) => void;
  addFocusedStroke: (stroke: StrokeType) => void;
  clearFocusedStrokes: () => void;
  addToEraseStack: (stroke: StrokeType) => void;
  clearEraseStack: () => void;
  addToUndoStack: (stroke: StrokeType) => void;
  clearUndoStack: () => void;
  removeFromUndoStack: () => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  brushTool: "pen",
  brushSize: 2,
  brushColor: "#000000",
  currentStroke: null,
  eraseStack: [],
  focusedStrokes: [],
  undoStack: [],

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

  setCurrentStroke: (stroke) =>
    set((state) => ({
      ...state,
      currentStroke: stroke,
    })),

  addFocusedStroke: (stroke) =>
    set((state) => ({
      ...state,
      focusedStrokes: [...state.focusedStrokes, stroke],
    })),

  clearFocusedStrokes: () =>
    set((state) => ({
      ...state,
      focusedStrokes: [],
    })),

  addToEraseStack: (stroke) =>
    set((state) => ({
      ...state,
      eraseStack: [...(state as any).eraseStack, stroke],
    })),

  clearEraseStack: () =>
    set((state) => ({
      ...state,
      eraseStack: [],
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
}));
