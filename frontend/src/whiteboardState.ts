export type WhiteboardProps = {
  currentStroke?: WhiteboardStroke | null;
  whiteboardState: WhiteboardState;
  mouseMoveCallback: (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => void;
  mouseDownCallback: (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
  ) => void;
  mouseUpCallback: () => void;
  undoCallback: () => void;
  redoCallback: () => void;
};

export class BrushDetails {
  color: string;
  size: number;
  tool: string;

  constructor(color: string, size: number, tool: string) {
    this.color = color;
    this.size = size;
    this.tool = tool;
  }
}

export class WhiteboardStroke {
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
};

export class WhiteboardState {
  version: number;
  strokes: Array<WhiteboardStroke>;

  constructor(version: number, strokes: Array<WhiteboardStroke>) {
    this.version = version;
    this.strokes = strokes;
  }
};
