import type { Stroke, Point, BoundingBox } from "./strokes";

export interface IFreeStroke extends Stroke {
  type: "free";
  size: number;
  points: Point[];
}

export class FreeStroke implements IFreeStroke {
  type = "free" as const;
  id: string;
  color: string;
  size: number;
  points: Point[];

  constructor(
    strokeId: string,
    strokeColor: string,
    size: number,
    points: Point[] = []
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = size;
    this.points = points;
  }

  addPoint(x: number, y: number): FreeStroke {
    return new FreeStroke(this.id, this.color, this.size, [
      ...this.points,
      [x, y],
    ]);
  }

  getCentroid(): Point {
    let sumX = 0;
    let sumY = 0;
    const numPoints = this.points.length;

    for (const [x, y] of this.points) {
      sumX += x;
      sumY += y;
    }

    return [sumX / numPoints, sumY / numPoints];
  }

  getBoundingBox(): BoundingBox {
    let minX = this.points[0][0];
    let maxX = this.points[0][0];
    let minY = this.points[0][1];
    let maxY = this.points[0][1];

    for (const [x, y] of this.points) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    const padding = this.size / 2;
    return [minX - padding, minY - padding, maxX + padding, maxY + padding];
  }

  isPointNear(point: Point, tolerance: number = 10): boolean {
    const [cx, cy] = point;

    return this.points.some((strokePoint, i, points) => {
      if (i >= points.length - 1) return false;

      const [x1, y1] = strokePoint;
      const [x2, y2] = points[i + 1];

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
    });
  }

  withUpdates(updates: { color?: string; size?: number }): FreeStroke {
    return new FreeStroke(
      this.id,
      updates.color ?? this.color,
      updates.size ?? this.size,
      this.points
    );
  }
}
