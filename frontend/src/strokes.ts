export class FreeStroke {
  id: string;
  color: string;
  size: number;
  points: Array<Array<number>>;

  constructor(
    strokeId: string,
    strokeColor: string,
    size: number,
    points: number[][]
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = size;
    this.points = points;
  }

  addPoint(pointX: number, pointY: number): void {
    this.points.push([pointX, pointY]);
  }

  getBoundingBox(): [number, number, number, number] {
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
}

export class TextStroke {
  id: string;
  color: string;
  size: number;
  position: [number, number];
  text: string;

  constructor(
    strokeId: string,
    strokeColor: string,
    fontSize: number,
    position: [number, number],
    text: string
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = fontSize;
    this.position = position;
    this.text = text;
  }

  getBoundingBox(ctx: CanvasRenderingContext2D): [number, number, number, number] {
    ctx.font = `${this.size}px Arial`;
    const textWidth = ctx.measureText(this.text).width;

    return [
      this.position[0],
      this.position[1] - this.size,
      this.position[0] + textWidth,
      this.position[1],
    ];
  }
}

export class LineStroke {
  id: string;
  color: string;
  size: number;
  startPoint: [number, number];
  endPoint: [number, number];

  constructor(
    strokeId: string,
    strokeColor: string,
    strokeSize: number,
    startPoint: [number, number],
    endPoint: [number, number]
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

  getBoundingBox(): [number, number, number, number] {
    const minX = Math.min(this.startPoint[0], this.endPoint[0]);
    const maxX = Math.max(this.startPoint[0], this.endPoint[0]);
    const minY = Math.min(this.startPoint[1], this.endPoint[1]);
    const maxY = Math.max(this.startPoint[1], this.endPoint[1]);

    return [minX, minY, maxX, maxY];
  }
}

export class ShapeStroke {
  id: string;
  type: string;
  color: string;
  lineSize: number;
  origin: [number, number];
  termination: [number, number];

  constructor(
    strokeId: string,
    shapeType: string,
    strokeColor: string,
    lineSize: number,
    origin: [number, number],
    termination: [number, number]
  ) {
    this.id = strokeId;
    this.type = shapeType;
    this.color = strokeColor;
    this.lineSize = lineSize;
    (this.origin = origin), (this.termination = termination);
  }

  updateTermination(newEndX: number, newEndY: number): void {
    this.termination = [newEndX, newEndY];
  }

  getBoundingBox(): [number, number, number, number] {
    const minX = Math.min(this.origin[0], this.termination[0]);
    const maxX = Math.max(this.origin[0], this.termination[0]);
    const minY = Math.min(this.origin[1], this.termination[1]);
    const maxY = Math.max(this.origin[1], this.termination[1]);

    return [minX, minY, maxX, maxY];
  }
}
