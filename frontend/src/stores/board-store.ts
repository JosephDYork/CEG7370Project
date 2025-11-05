import { create } from "zustand";
import { FreeStroke, TextStroke, LineStroke, ShapeStroke } from "../strokes";

type StrokeType = FreeStroke | TextStroke | LineStroke | ShapeStroke;

interface boardState {
  version: number;
  strokes: StrokeType[];
}

interface boardActions {
  updateAllStrokes: (strokes: Array<StrokeType>) => void;
  addStroke: (stroke: StrokeType) => void;
  removeStroke: (strokeId: string) => void;
  removeLastStroke: () => StrokeType | null;
  getStrokeById: (id: string) => StrokeType | undefined;
  clearStrokes: () => void;
}

export const useBoardStore = create<boardState & boardActions>((set, get) => ({
  version: 1.0,
  strokes: [],

  updateAllStrokes: (strokes: Array<StrokeType>) =>
    set((state) => ({
      ...state,
      strokes: [...strokes]
    })),

  addStroke: (stroke) =>
    set((state) => ({
      ...state,
      strokes: [...state.strokes, stroke],
    })),

  removeStroke: (strokeId) =>
    set((state) => ({
      ...state,
      strokes: state.strokes.filter((s) => s.id !== strokeId),
    })),

  removeLastStroke: () => {
    const state = get();
    if (state.strokes.length === 0) return null;

    const lastStroke = state.strokes[state.strokes.length - 1];
    set((state) => ({
      ...state,
      strokes: state.strokes.slice(0, -1),
    }));

    return lastStroke;
  },

  clearStrokes: () =>
    set((state) => ({
      ...state,
      strokes: [],
    })),

  getStrokeById: (id) => {
    const state = get();
    return state.strokes.find((s) => s.id === id);
  },
}));
