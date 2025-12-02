import { create } from "zustand";
import type { Stroke } from "../models/strokes";

interface boardState {
  version: number;
  strokes: Stroke[];
}

interface boardActions {
  addStrokes: (strokes: Stroke[], fromServer?: boolean) => void;
  removeStrokes: (strokes: Stroke[], fromServer?: boolean) => void;
  updateStrokes: (updatedStrokes: Stroke[], fromServer?: boolean) => void;
  getAllStrokes: () => Stroke[];
  setAllStrokes: (strokes: Stroke[]) => void;
}

export const useBoardStore = create<boardState & boardActions>((set, get) => ({
  version: 1.0,
  strokes: [],

  addStrokes: (strokes) => {
    set((state) => ({
      ...state,
      strokes: [...state.strokes, ...strokes],
    }));
  },

  removeStrokes: (strokes) => {
    set((state) => ({
      ...state,
      strokes: state.strokes.filter(
        (s) => !strokes.some((stroke) => stroke.id === s.id)
      ),
    }));
  },

  updateStrokes: (updatedStrokes) => {
    set((state) => ({
      ...state,
      strokes: state.strokes.map((s) => {
        const updatedStroke = updatedStrokes.find((us) => us.id === s.id);
        return updatedStroke ? updatedStroke : s;
      }),
    }));
  },

  getAllStrokes: () => {
    return get().strokes;
  },

  setAllStrokes: (strokes) => {
    set((state) => ({
      ...state,
      strokes: strokes,
    }));
  },
}));
