import { create } from "zustand";

interface CursorState {
  x: number;
  y: number;
  isDown: boolean;
}

interface CursorActions {
  setCursorPosition: (x: number, y: number) => void;
  setCursorDown: (isDown: boolean) => void;
  updateCursor: (x: number, y: number, isDown: boolean) => void;
}

export const useCursorStore = create<CursorState & CursorActions>((set) => ({
  x: 0,
  y: 0,
  isDown: false,
  isActive: false,

  setCursorPosition: (x, y) =>
    set((state) => ({
      ...state,
      x,
      y,
    })),

  setCursorDown: (isDown: boolean) =>
    set((state) => ({
      ...state,
      isDown,
    })),

  updateCursor: (x, y, isDown) =>
    set((state) => ({
      ...state,
      x,
      y,
      isDown,
    })),
}));
