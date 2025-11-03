import { create } from "zustand";
import { FreeStroke, TextStroke, LineStroke } from "../brushes";

type StrokeType = FreeStroke | TextStroke | LineStroke;

interface EditorState {
  brushTool: string;
  brushSize: number;
  brushColor: string;
  strokeCount: number;
  currentStroke: StrokeType | null;
  focusedStroke: StrokeType | null;
  undoStack: StrokeType[];
}

interface EditorActions {
  setBrushTool: (brushTool: string) => void;
  setBrushSize: (brushSize: number) => void;
  setBrushColor: (brushColor: string) => void;
  incrementStrokeCount: () => void;
  setCurrentStroke: (stroke: StrokeType | null) => void;
  setFocusedStroke: (stroke: StrokeType | null) => void;
  addToUndoStack: (stroke: StrokeType) => void;
  clearUndoStack: () => void;
  removeFromUndoStack: () => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  brushTool: "pen",
  brushSize: 2,
  brushColor: "#000000",
  strokeCount: 0,
  currentStroke: null,
  focusedStroke: null,
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

  incrementStrokeCount: () =>
    set((state) => ({
      ...state,
      strokeCount: state.strokeCount + 1,
    })),

  setCurrentStroke: (stroke) =>
    set((state) => ({
      ...state,
      currentStroke: stroke,
    })),

  setFocusedStroke: (stroke) =>
    set((state) => ({
      ...state,
      focusedStroke: stroke,
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
