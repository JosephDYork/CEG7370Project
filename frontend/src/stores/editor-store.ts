import { create } from "zustand";
import { FreeStroke, TextStroke, LineStroke, ShapeStroke } from "../strokes";

type StrokeType = FreeStroke | TextStroke | LineStroke | ShapeStroke;

interface EditorState {
  brushTool: string;
  brushSize: number;
  brushColor: string;
  currentStroke: StrokeType | null;
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
  addToUndoStack: (stroke: StrokeType) => void;
  clearUndoStack: () => void;
  removeFromUndoStack: () => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  brushTool: "pen",
  brushSize: 2,
  brushColor: "#000000",
  currentStroke: null,
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
