import { create } from "zustand";
import type { Point } from "../models/strokes";

interface ViewportState {
  // Camera position in world space (offset from origin)
  offsetX: number;
  offsetY: number;

  // Zoom level (1.0 = 100%, 0.5 = 50%, 2.0 = 200%)
  zoom: number;

  // Viewport dimensions (canvas size in pixels)
  width: number;
  height: number;

  // Pan mode flag
  isPanning: boolean;
}

interface ViewportActions {
  // Set absolute offset
  setOffset: (x: number, y: number) => void;

  // Relative pan (move camera by dx, dy in screen space)
  pan: (dx: number, dy: number) => void;

  // Set zoom level (clamped between min and max)
  setZoom: (zoom: number) => void;

  // Zoom centered at a specific point
  zoomAt: (screenPoint: Point, delta: number) => void;

  // Set viewport dimensions
  setDimensions: (width: number, height: number) => void;

  // Set panning state
  setIsPanning: (isPanning: boolean) => void;

  // Reset viewport to default state
  resetViewport: () => void;

  // Center viewport on a world-space point
  centerOn: (worldPoint: Point) => void;

  // Coordinate transformations
  screenToWorld: (screenPoint: Point) => Point;
  worldToScreen: (worldPoint: Point) => Point;

  // Get visible bounds in world space
  getVisibleBounds: () => { minX: number; minY: number; maxX: number; maxY: number };
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5.0;
const DEFAULT_ZOOM = 1.0;

export const useViewportStore = create<ViewportState & ViewportActions>(
  (set, get) => ({
    // Initial state - centered at origin
    offsetX: 0,
    offsetY: 0,
    zoom: DEFAULT_ZOOM,
    width: 800,
    height: 600,
    isPanning: false,

    setOffset: (x: number, y: number) =>
      set((state) => ({
        ...state,
        offsetX: x,
        offsetY: y,
      })),

    pan: (dx: number, dy: number) =>
      set((state) => ({
        ...state,
        offsetX: state.offsetX - dx / state.zoom,
        offsetY: state.offsetY - dy / state.zoom,
      })),

    setZoom: (zoom: number) =>
      set((state) => ({
        ...state,
        zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)),
      })),

    zoomAt: (screenPoint: Point, delta: number) => {
      const state = get();
      const oldZoom = state.zoom;
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, oldZoom * (1 + delta))
      );

      if (oldZoom === newZoom) return;

      // Convert screen point to world space with old zoom
      const worldPoint = state.screenToWorld(screenPoint);

      // After zoom, adjust offset so worldPoint stays under screenPoint
      const newOffsetX = worldPoint[0] - screenPoint[0] / newZoom;
      const newOffsetY = worldPoint[1] - screenPoint[1] / newZoom;

      set((state) => ({
        ...state,
        zoom: newZoom,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      }));
    },

    setDimensions: (width: number, height: number) =>
      set((state) => ({
        ...state,
        width,
        height,
      })),

    setIsPanning: (isPanning: boolean) =>
      set((state) => ({
        ...state,
        isPanning,
      })),

    resetViewport: () =>
      set((state) => ({
        ...state,
        offsetX: 0,
        offsetY: 0,
        zoom: DEFAULT_ZOOM,
      })),

    centerOn: (worldPoint: Point) =>
      set((state) => ({
        ...state,
        offsetX: worldPoint[0] - state.width / 2 / state.zoom,
        offsetY: worldPoint[1] - state.height / 2 / state.zoom,
      })),

    screenToWorld: (screenPoint: Point): Point => {
      const state = get();
      return [
        screenPoint[0] / state.zoom + state.offsetX,
        screenPoint[1] / state.zoom + state.offsetY,
      ];
    },

    worldToScreen: (worldPoint: Point): Point => {
      const state = get();
      return [
        (worldPoint[0] - state.offsetX) * state.zoom,
        (worldPoint[1] - state.offsetY) * state.zoom,
      ];
    },

    getVisibleBounds: () => {
      const state = get();
      return {
        minX: state.offsetX,
        minY: state.offsetY,
        maxX: state.offsetX + state.width / state.zoom,
        maxY: state.offsetY + state.height / state.zoom,
      };
    },
  })
);
