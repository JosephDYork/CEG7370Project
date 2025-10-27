export interface WhiteboardProps {
  width?: string;
  height?: string;
}

export class WhiteboardStroke {
  id: string;
  color: string;
  points: Array<Array<number>>;

  constructor(
    strokeId: string,
    strokeColor: string,
    xOrigin: number,
    yOrigin: number
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.points = [[xOrigin, yOrigin]];
  }

  addPoint(pointX: number, pointY: number): void {
    this.points.push([pointX, pointY]);
  }
}

export class WhiteboardState {
  version: number;
  strokes: Array<WhiteboardStroke>;

  constructor(
    version: number,
    strokes: Array<WhiteboardStroke>
  ) {
    this.version = version;
    this.strokes = strokes;
  }
}