import { create } from "zustand";
import type { StrokeType } from "../models/strokes";

interface boardState {
  version: number;
  strokes: StrokeType[];
}

interface boardActions {
  updateAllStrokes: (strokes: Array<StrokeType>) => void;
  addStroke: (stroke: StrokeType) => void;
  removeLastStroke: () => StrokeType | null;
  clearStrokes: () => void;
  forceUpdate: () => void;
}

export const useBoardStore = create<boardState & boardActions>((set, get) => ({
  version: 1.0,
  strokes: [],

  updateAllStrokes: (strokes: Array<StrokeType>) =>
    set((state) => ({
      ...state,
      strokes: [...strokes],
    })),

  addStroke: (stroke) =>
    set((state) => ({
      ...state,
      strokes: [...state.strokes, stroke],
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

  forceUpdate: () =>
    set((state) => ({
      ...state,
      strokes: [...state.strokes],
    })),
}));
