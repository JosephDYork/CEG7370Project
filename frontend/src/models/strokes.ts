export type Point = [number, number];
export type BoundingBox = [number, number, number, number];

export interface Stroke {
  id: string;
  color: string;
  size: number;
  type: string;
  strokeOrder: number;
  getCentroid(): Point;
  getBoundingBox(): BoundingBox;
  isPointNear(
    point: Point,
    tolerance?: number,
    ctx?: CanvasRenderingContext2D
  ): boolean;
  withUpdates(updates: { color?: string; fillColor?: string; strokeOrder?: number; size?: number }): Stroke;
}
