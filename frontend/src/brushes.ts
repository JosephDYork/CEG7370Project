export class FreeStroke {
  id: string;
  color: string;
  size: number;
  points: Array<Array<number>>;

  constructor(
    strokeId: string,
    strokeColor: string,
    size: number,
    xOrigin: number,
    yOrigin: number
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = size;
    this.points = [[xOrigin, yOrigin]];
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
  fontSize: number;
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
    this.fontSize = fontSize;
    this.position = position;
    this.text = text;
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
}
