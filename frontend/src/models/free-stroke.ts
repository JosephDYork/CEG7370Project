import type { Stroke, Point, BoundingBox } from "./strokes";

export interface IFreeStroke extends Stroke {
  size: number;
  points: Point[];
}

const MIN_POINTS_FOR_SIMPLIFICATION = 3;

/**
 * Perpendicular distance from point P to segment AB.
 */
function perpendicularDistance(point: Point, start: Point, end: Point): number {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;

  // Degenerate segment -> distance to start
  if (x1 === x2 && y1 === y2) {
    const dx = x - x1;
    const dy = y - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const dx = x2 - x1;
  const dy = y2 - y1;

  // Projection factor t of point onto line AB
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);

  let projX: number;
  let projY: number;

  if (t < 0) {
    projX = x1;
    projY = y1;
  } else if (t > 1) {
    projX = x2;
    projY = y2;
  } else {
    projX = x1 + t * dx;
    projY = y1 + t * dy;
  }

  const distX = x - projX;
  const distY = y - projY;
  return Math.sqrt(distX * distX + distY * distY);
}

/**
 * Recursive Ramer–Douglas–Peucker implementation.
 */
function rdpRecursive(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let index = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], start, end);
    if (d > maxDistance) {
      maxDistance = d;
      index = i;
    }
  }

  if (maxDistance > epsilon) {
    const left = rdpRecursive(points.slice(0, index + 1), epsilon);
    const right = rdpRecursive(points.slice(index), epsilon);

    // merge, removing duplicate point at the split
    return left.slice(0, -1).concat(right);
  } else {
    // just keep endpoints
    return [start, end];
  }
}

/**
 * Public RDP entry.
 */
function rdp(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;
  return rdpRecursive(points, epsilon);
}

// --- FreeStroke ---------------------------------------------------------

export class FreeStroke implements IFreeStroke {
  type = "free";
  id: string;
  color: string;
  size: number;
  points: Point[];
  strokeOrder: number;

  constructor(
    strokeId: string,
    strokeColor: string,
    size: number,
    points: Point[] = [],
    strokeOrder: number
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = size;
    this.points = points;
    this.strokeOrder = strokeOrder;
  }

  addPoint(x: number, y: number): FreeStroke {
    return new FreeStroke(this.id, this.color, this.size,
      [ ...this.points, [x, y], ], this.strokeOrder);
  }

  /**
   * Returns a new FreeStroke with simplified points using RDP.
   * Does not mutate the current instance.
   *
   * @param epsilon maximum allowed deviation from the original curve
   *                smaller = more detail, larger = fewer points.
   *                Defaults to a value derived from stroke size.
   */
  simplify(epsilon?: number): FreeStroke {
    if (this.points.length < MIN_POINTS_FOR_SIMPLIFICATION) {
      return this;
    }

    // Tie epsilon to stroke thickness for better visual fidelity
    const effectiveEpsilon =
      epsilon ?? Math.max(0.5, this.size * 0.6); // tweak factor as desired

    const simplifiedPoints = rdp(this.points, effectiveEpsilon);

    // If nothing changed, just return this instance
    if (simplifiedPoints.length === this.points.length) {
      return this;
    }

    return new FreeStroke(
      this.id,
      this.color,
      this.size,
      simplifiedPoints,
      this.strokeOrder
    );
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

  withUpdates(updates: { color?: string; size?: number; strokeOrder?: number }): FreeStroke {
    return new FreeStroke(
      this.id,
      updates.color ?? this.color,
      updates.size ?? this.size,
      this.points,
      updates.strokeOrder ?? this.strokeOrder
    );
  }
}