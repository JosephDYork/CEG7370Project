import { FreeBrushStroke } from "./free-brush.ts";
import { TextBrushStroke } from "./text-brush.ts";
import { LineBrushStroke } from "./line-brush.ts";
import type { EditorState } from "./editor-state.ts";

export type WhiteboardProps = {
  editorState: EditorState;
  whiteboardState: WhiteboardState;
  mouseMoveCallback: (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => void;
  mouseDownCallback: (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => void;
  mouseUpCallback: () => void;
  mouseLeaveCallback: () => void;
  undoCallback: () => void;
  redoCallback: () => void;
};

export class WhiteboardState {
  version: number;
  strokes: Array<FreeBrushStroke | TextBrushStroke | LineBrushStroke>;

  constructor(
    version: number,
    strokes: Array<FreeBrushStroke | TextBrushStroke | LineBrushStroke>
  ) {
    this.version = version;
    this.strokes = strokes;
  }
}
