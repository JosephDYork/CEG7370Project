export type WhiteboardProps = {
  currentStroke?: WhiteboardBrushStroke | WhiteboardTextStroke | null;
  brushState: BrushDetails;
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
  mouseLeaveCallback: () => void;
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

export class WhiteboardBrushStroke {
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

export class WhiteboardTextStroke {
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
};

export class WhiteboardState {
  version: number;
  strokes: Array<WhiteboardBrushStroke | WhiteboardTextStroke>;

  constructor(version: number, strokes: Array<WhiteboardBrushStroke | WhiteboardTextStroke>) {
    this.version = version;
    this.strokes = strokes;
  }
};
