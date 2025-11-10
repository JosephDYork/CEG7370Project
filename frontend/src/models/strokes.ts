import type { IFreeStroke } from "./free-stroke";
import type { ITextStroke } from "./text-stroke";
import type { ILineStroke } from "./line-stroke";
import type { IShapeStroke } from "./shape-stroke";

export type Point = [number, number];
export type BoundingBox = [number, number, number, number];
export type StrokeTypeEnum = "free" | "text" | "line" | "shape";
export type StrokeType = IFreeStroke | ITextStroke | ILineStroke | IShapeStroke;

export interface Stroke {
  id: string;
  color: string;
  type: StrokeTypeEnum;
  getCentroid(): Point;
  getBoundingBox(ctx?: CanvasRenderingContext2D): BoundingBox;
  isPointNear(point: Point, tolerance?: number, ctx?: CanvasRenderingContext2D): boolean;
}