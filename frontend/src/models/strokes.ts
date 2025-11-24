export type Point = [number, number];
export type BoundingBox = [number, number, number, number];

export interface Stroke {
  id: string;
  color: string;
  size: number;
  type: string;
  getCentroid(): Point;
  getBoundingBox(ctx?: CanvasRenderingContext2D): BoundingBox;
  isPointNear(
    point: Point,
    tolerance?: number,
    ctx?: CanvasRenderingContext2D
  ): boolean;
  withUpdates(updates: { color?: string; size?: number }): Stroke;
}
