import type { Stroke, Point, BoundingBox } from "./strokes";

export interface ILineStroke extends Stroke {
  size: number;
  startPoint: Point;
  endPoint: Point;
}

export class LineStroke implements ILineStroke {
  type = "line";
  id: string;
  color: string;
  size: number;
  startPoint: Point;
  endPoint: Point;
  strokeOrder: number;

  constructor(
    strokeId: string,
    strokeColor: string,
    strokeSize: number,
    startPoint: Point,
    endPoint: Point,
    strokeOrder: number,
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = strokeSize;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.strokeOrder = strokeOrder;
  }

  withUpdates(updates: { color?: string; size?: number, strokeOrder?: number }): LineStroke {
    return new LineStroke(
      this.id,
      updates.color ?? this.color,
      updates.size ?? this.size,
      this.startPoint,
      this.endPoint,
      updates.strokeOrder ?? this.strokeOrder
    );
  }

  updateEndPoint(x: number, y: number): LineStroke {
    return new LineStroke(this.id, this.color, this.size, this.startPoint, 
      [ x, y, ], this.strokeOrder
    );
  }

  getCentroid(): Point {
    const centerX = (this.startPoint[0] + this.endPoint[0]) / 2;
    const centerY = (this.startPoint[1] + this.endPoint[1]) / 2;
    return [centerX, centerY];
  }

  getBoundingBox(): BoundingBox {
    const minX = Math.min(this.startPoint[0], this.endPoint[0]);
    const maxX = Math.max(this.startPoint[0], this.endPoint[0]);
    const minY = Math.min(this.startPoint[1], this.endPoint[1]);
    const maxY = Math.max(this.startPoint[1], this.endPoint[1]);
    const padding = this.size / 2;
    return [minX - padding, minY - padding, maxX + padding, maxY + padding];
  }

  isPointNear(point: Point, tolerance: number = 10): boolean {
    const [x1, y1] = this.startPoint;
    const [x2, y2] = this.endPoint;
    const [cx, cy] = point;

    const A = x2 - x1;
    const B = y2 - y1;
    const C = x1 - cx;
    const D = y1 - cy;

    const a = A * A + B * B;
    const b = 2 * (A * C + B * D);
    const c = C * C + D * D - tolerance * tolerance;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDiscriminant) / (2 * a);
    const t2 = (-b + sqrtDiscriminant) / (2 * a);

    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  }
}
