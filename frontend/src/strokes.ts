export type Point = [number, number];
export type BoundingBox = [number, number, number, number]; // [minX, minY, maxX, maxY]

/**
 * A unified interface for all stroke types on the canvas.
 * This allows for polymorphic handling of different shapes.
 */
export interface IStroke {
  id: string;
  color: string;
  size: number; // Represents line width, font size, etc.

  /**
   * Calculates the bounding box of the stroke.
   * @param {CanvasRenderingContext2D} [ctx] - The canvas rendering context. Required for strokes like TextStroke
   * that need to measure text dimensions.
   * @returns {BoundingBox} The coordinates [minX, minY, maxX, maxY] of the bounding box.
   */
  getBoundingBox(ctx?: CanvasRenderingContext2D): BoundingBox;

  /**
   * Calculates the geometric centroid of the stroke.
   * @param {CanvasRenderingContext2D} [ctx] - May be required if the centroid calculation
   * depends on the bounding box of a context-dependent stroke (e.g., TextStroke).
   * @returns {Point} The [x, y] coordinates of the centroid.
   */
  getCentroid(ctx?: CanvasRenderingContext2D): Point;
}

export class FreeStroke implements IStroke {
  id: string;
  color: string;
  size: number;
  points: Point[];

  constructor(
    strokeId: string,
    strokeColor: string,
    size: number,
    points: Point[]
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = size;
    this.points = points;
  }

  addPoint(pointX: number, pointY: number): void {
    this.points.push([pointX, pointY]);
  }

  getBoundingBox(): BoundingBox {
    if (this.points.length === 0) {
      return [0, 0, 0, 0];
    }

    let minX = this.points[0][0];
    let maxX = this.points[0][0];
    let minY = this.points[0][1];
    let maxY = this.points[0][1];

    for (const point of this.points) {
      minX = Math.min(minX, point[0]);
      maxX = Math.max(maxX, point[0]);
      minY = Math.min(minY, point[1]);
      maxY = Math.max(maxY, point[1]);
    }

    return [minX, minY, maxX, maxY];
  }

  getCentroid(): Point {
    if (this.points.length === 0) {
      return [0, 0];
    }

    let sumX = 0;
    let sumY = 0;
    for (const point of this.points) {
      sumX += point[0];
      sumY += point[1];
    }
    return [sumX / this.points.length, sumY / this.points.length];
  }
}

export class TextStroke implements IStroke {
  id: string;
  color: string;
  size: number; // Represents font size
  position: Point;
  text: string;

  constructor(
    strokeId: string,
    strokeColor: string,
    fontSize: number,
    position: Point,
    text: string
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = fontSize;
    this.position = position;
    this.text = text;
  }

  getBoundingBox(ctx?: CanvasRenderingContext2D): BoundingBox {
    if (!ctx) {
      throw new Error("CanvasRenderingContext2D is required to calculate TextStroke bounding box.");
    }
    ctx.font = `${this.size}px Arial`;
    const textWidth = ctx.measureText(this.text).width;

    // Assuming position is the bottom-left baseline of the text.
    return [
      this.position[0], // minX
      this.position[1] - this.size, // minY (approximate top of text)
      this.position[0] + textWidth, // maxX
      this.position[1], // maxY (baseline)
    ];
  }

  getCentroid(ctx?: CanvasRenderingContext2D): Point {
    const [minX, minY, maxX, maxY] = this.getBoundingBox(ctx);
    return [(minX + maxX) / 2, (minY + maxY) / 2];
  }
}

export class LineStroke implements IStroke {
  id: string;
  color: string;
  size: number;
  startPoint: Point;
  endPoint: Point;

  constructor(
    strokeId: string,
    strokeColor: string,
    strokeSize: number,
    startPoint: Point,
    endPoint: Point
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = strokeSize;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
  }

  updateEndPoint(newEndX: number, newEndY: number): void {
    this.endPoint = [newEndX, newEndY];
  }

  getBoundingBox(): BoundingBox {
    const minX = Math.min(this.startPoint[0], this.endPoint[0]);
    const maxX = Math.max(this.startPoint[0], this.endPoint[0]);
    const minY = Math.min(this.startPoint[1], this.endPoint[1]);
    const maxY = Math.max(this.startPoint[1], this.endPoint[1]);

    return [minX, minY, maxX, maxY];
  }

  getCentroid(): Point {
    return [
      (this.startPoint[0] + this.endPoint[0]) / 2,
      (this.startPoint[1] + this.endPoint[1]) / 2,
    ];
  }
}

export class ShapeStroke implements IStroke {
  id: string;
  type: string;
  color: string;
  size: number; // Renamed from lineSize for interface consistency
  origin: Point;
  termination: Point;

  constructor(
    strokeId: string,
    shapeType: string,
    strokeColor: string,
    strokeSize: number, // Renamed from lineSize for consistency
    origin: Point,
    termination: Point
  ) {
    this.id = strokeId;
    this.type = shapeType;
    this.color = strokeColor;
    this.size = strokeSize;
    this.origin = origin;
    this.termination = termination;
  }

  updateTermination(newEndX: number, newEndY: number): void {
    this.termination = [newEndX, newEndY];
  }

  getBoundingBox(): BoundingBox {
    const minX = Math.min(this.origin[0], this.termination[0]);
    const maxX = Math.max(this.origin[0], this.termination[0]);
    const minY = Math.min(this.origin[1], this.termination[1]);
    const maxY = Math.max(this.origin[1], this.termination[1]);

    return [minX, minY, maxX, maxY];
  }

  getCentroid(): Point {
    return [
      (this.origin[0] + this.termination[0]) / 2,
      (this.origin[1] + this.termination[1]) / 2,
    ];
  }
}