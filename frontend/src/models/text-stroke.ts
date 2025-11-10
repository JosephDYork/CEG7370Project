import type { Stroke, Point, BoundingBox } from "./strokes";

export interface ITextStroke extends Stroke {
  type: "text";
  size: number;
  position: Point;
  text: string;
}

export class TextStroke implements ITextStroke {
  type = "text" as const;
  id: string;
  color: string;
  size: number;
  position: Point;
  text: string;

  constructor(
    strokeId: string,
    strokeColor: string,
    fontSize: number,
    position: Point,
    text: string = ""
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = fontSize;
    this.position = position;
    this.text = text;
  }

  getCentroid(): Point {
    return [this.position[0], this.position[1] - this.size / 2];
  }

  getBoundingBox(ctx?: CanvasRenderingContext2D): BoundingBox {
    if (!ctx || !this.text) {
      throw new Error(
        "Canvas context is required to measure text bounding box."
      );
    }

    ctx.font = `${this.size}px Arial`;
    const textWidth = ctx.measureText(this.text).width;

    return [
      this.position[0],
      this.position[1] - this.size,
      this.position[0] + textWidth,
      this.position[1],
    ];
  }

  isPointNear(point: Point, tolerance: number = 10, ctx?: CanvasRenderingContext2D): boolean {
    if (!ctx) return false;
    const [x, y] = point;
    const [x1, y1, x2, y2] = this.getBoundingBox(ctx);
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }
}