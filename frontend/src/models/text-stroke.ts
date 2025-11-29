import type { Stroke, Point, BoundingBox } from "./strokes";

export interface ITextStroke extends Stroke {
  size: number;
  position: Point;
  text: string;
}

export class TextStroke implements ITextStroke {
  type = "text";
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

  getBoundingBox(): BoundingBox {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    ctx!.font = `${this.size}px Arial`;
    const textWidth = ctx!.measureText(this.text).width;

    return [
      this.position[0],
      this.position[1] - this.size,
      this.position[0] + textWidth,
      this.position[1],
    ];
  }

  isPointNear(
    point: Point,
    tolerance: number = 10,
  ): boolean {
    const [x, y] = point;
    const [x1, y1, x2, y2] = this.getBoundingBox();
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }

  withUpdates(updates: { color?: string; size?: number }): TextStroke {
    return new TextStroke(
      this.id,
      updates.color ?? this.color,
      updates.size ?? this.size,
      this.position,
      this.text
    );
  }
}
