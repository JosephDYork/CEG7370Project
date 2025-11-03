import type { FreeBrushStroke } from "./free-brush";
import type { LineBrushStroke } from "./line-brush";
import type { TextBrushStroke } from "./text-brush";

export class CursorState {
  x: number;
  y: number;
  isDown: boolean;

  constructor(x: number, y: number, isDown: boolean) {
    this.x = x;
    this.y = y;
    this.isDown = isDown;
  }
}

export class EditorState {
  brushTool: string;
  brushSize: number;
  brushColor: string;

  currentStroke: FreeBrushStroke | TextBrushStroke | LineBrushStroke | null;
  focusedStroke: FreeBrushStroke | TextBrushStroke | LineBrushStroke | null;
  undoStack: Array<FreeBrushStroke | TextBrushStroke | LineBrushStroke>;

  setCurrentStroke(
    stroke: FreeBrushStroke | TextBrushStroke | LineBrushStroke | null
  ): EditorState {
    return new EditorState(
      this.brushTool,
      this.brushSize,
      this.brushColor,
      stroke,
      this.focusedStroke,
      this.undoStack
    );
  }

  setFocusedStroke(
    stroke: FreeBrushStroke | TextBrushStroke | LineBrushStroke | null
  ): EditorState {
    return new EditorState(
      this.brushTool,
      this.brushSize,
      this.brushColor,
      this.currentStroke,
      stroke,
      this.undoStack
    );
  }

  setBrushTool(brushTool: string): EditorState {
    return new EditorState(
      brushTool,
      this.brushSize,
      this.brushColor,
      this.currentStroke,
      this.focusedStroke,
      this.undoStack
    );
  }

  setBrushSize(brushSize: number): EditorState {
    return new EditorState(
      this.brushTool,
      brushSize,
      this.brushColor,
      this.currentStroke,
      this.focusedStroke,
      this.undoStack
    );
  }

  setBrushColor(brushColor: string): EditorState {
    return new EditorState(
      this.brushTool,
      this.brushSize,
      brushColor,
      this.currentStroke,
      this.focusedStroke,
      this.undoStack
    );
  }

  setUndoStack(
    undoStack: Array<FreeBrushStroke | TextBrushStroke | LineBrushStroke>
  ): EditorState {
    return new EditorState(
      this.brushTool,
      this.brushSize,
      this.brushColor,
      this.currentStroke,
      this.focusedStroke,
      undoStack
    );
  }

  constructor(
    brushTool: string,
    brushSize: number,
    brushColor: string,
    currentStroke: FreeBrushStroke | TextBrushStroke | LineBrushStroke | null,
    focusedStroke: FreeBrushStroke | TextBrushStroke | LineBrushStroke | null,
    undoStack: Array<FreeBrushStroke | TextBrushStroke | LineBrushStroke>
  ) {
    this.brushTool = brushTool;
    this.brushSize = brushSize;
    this.brushColor = brushColor;
    this.currentStroke = currentStroke;
    this.focusedStroke = focusedStroke;
    this.undoStack = undoStack;
  }
}