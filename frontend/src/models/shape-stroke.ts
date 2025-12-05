import type { Stroke, Point, BoundingBox } from "./strokes";

export type ShapeType = "square" | "ellipse";

export interface IShapeStroke extends Stroke {
  shapeType: ShapeType;
  size: number;
  origin: Point;
  termination: Point;
}

export class ShapeStroke implements IShapeStroke {
  type = "shape";
  id: string;
  shapeType: ShapeType;
  color: string;
  fillColor: string;
  size: number;
  origin: Point;
  termination: Point;
  strokeOrder: number;

  constructor(
    strokeId: string,
    strokeColor: string,
    strokeSize: number,
    shapeType: ShapeType,
    fillColor: string,
    origin: Point,
    termination: Point,
    strokeOrder: number
  ) {
    this.id = strokeId;
    this.shapeType = shapeType;
    this.color = strokeColor;
    this.fillColor = fillColor;
    this.size = strokeSize;
    this.origin = origin;
    this.termination = termination;
    this.strokeOrder = strokeOrder;
  }

  withUpdates(updates: { color?: string; fillColor?: string; size?: number; strokeOrder?: number }): ShapeStroke {
    return new ShapeStroke(
      this.id,
      updates.color ?? this.color,
      updates.size ?? this.size,
      this.shapeType,
      updates.fillColor ?? this.fillColor,
      this.origin,
      this.termination,
      updates.strokeOrder ?? this.strokeOrder
    );
  }

  updateTermination(x: number, y: number): ShapeStroke {
    return new ShapeStroke(
      this.id,
      this.color,
      this.size,
      this.shapeType,
      this.fillColor,
      this.origin,
      [x, y],
      this.strokeOrder
    );
  }

  getCentroid(): Point {
    const centerX = (this.origin[0] + this.termination[0]) / 2;
    const centerY = (this.origin[1] + this.termination[1]) / 2;
    return [centerX, centerY];
  }

  getBoundingBox(): BoundingBox {
    const minX = Math.min(this.origin[0], this.termination[0]);
    const maxX = Math.max(this.origin[0], this.termination[0]);
    const minY = Math.min(this.origin[1], this.termination[1]);
    const maxY = Math.max(this.origin[1], this.termination[1]);
    const padding = this.size / 2;
    return [minX - padding, minY - padding, maxX + padding, maxY + padding];
  }

  getDimensions(): { width: number; height: number } {
    return {
      width: Math.abs(this.termination[0] - this.origin[0]),
      height: Math.abs(this.termination[1] - this.origin[1]),
    };
  }

  isPointNear(point: Point, tolerance: number = 10): boolean {
    switch (this.shapeType) {
      case "square":
        return this.checkPointNearRectangle(point, tolerance);
      case "ellipse":
        return this.checkPointNearEllipse(point, tolerance);
      default:
        return false;
    }
  }

  isRectangleInsideRectangle(otherBoundingBox: BoundingBox): boolean {
    const thisBBox = this.getBoundingBox();
    const [thisMinX, thisMinY, thisMaxX, thisMaxY] = thisBBox;
    const [otherMinX, otherMinY, otherMaxX, otherMaxY] = otherBoundingBox;

    return (
      otherMinX >= thisMinX &&
      otherMaxX <= thisMaxX &&
      otherMinY >= thisMinY &&
      otherMaxY <= thisMaxY
    );
  }

  private checkPointNearRectangle(point: Point, tolerance: number): boolean {
    const [x1, y1] = this.origin;
    const [x2, y2] = this.termination;

    return (
      this.checkPointNearLine(point, [x1, y1], [x2, y1], tolerance) ||
      this.checkPointNearLine(point, [x2, y1], [x2, y2], tolerance) ||
      this.checkPointNearLine(point, [x2, y2], [x1, y2], tolerance) ||
      this.checkPointNearLine(point, [x1, y2], [x1, y1], tolerance)
    );
  }

  private checkPointNearEllipse(point: Point, tolerance: number): boolean {
    const [x, y] = point;
    const [x1, y1] = this.origin;
    const [x2, y2] = this.termination;

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;

    const normalizedX = (x - centerX) / radiusX;
    const normalizedY = (y - centerY) / radiusY;
    const ellipseDistance = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);

    return (
      Math.abs(ellipseDistance - 1) <= tolerance / Math.min(radiusX, radiusY)
    );
  }

  private checkPointNearLine(
    point: Point,
    lineStart: Point,
    lineEnd: Point,
    tolerance: number
  ): boolean {
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
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
