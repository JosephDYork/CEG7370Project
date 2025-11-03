import { WhiteboardState } from "./board-state";
import { CursorState, EditorState } from "./editor-state";
import { FreeBrushStroke } from "./free-brush";
import { checkLineIntersectsCircle } from "./geometry";
import { LineBrushStroke } from "./line-brush";
import { TextBrushStroke } from "./text-brush";

export const mouseLeaveEvent = (
  editorState: EditorState,
  cursorState: React.RefObject<CursorState>,
  setWhiteboardState: React.Dispatch<React.SetStateAction<WhiteboardState>>,
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>
) => {
  cursorState.current.isDown = false;
  if (!editorState.currentStroke) return;

  switch (editorState.currentStroke.constructor) {
    case FreeBrushStroke:
    case LineBrushStroke:
      setWhiteboardState((prev: WhiteboardState) => {
        const newStrokes = [...prev.strokes, editorState.currentStroke!];
        return new WhiteboardState(prev.version, newStrokes);
      });
      setEditorState((prev) => {
        return prev.setCurrentStroke(null);
      });
      break;
    case TextBrushStroke:
      setEditorState((prev) => {
        return prev.setCurrentStroke(null);
      });
      break;
    }
};

export const mouseDownEvent = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  strokeCount: number,
  cursorState: React.RefObject<CursorState>,
  editorState: EditorState,
  whiteboardState: WhiteboardState,
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>,
  setStrokeCount: React.Dispatch<React.SetStateAction<number>>,
) => {
  if (!canvasRef.current) return;
  const canvas = canvasRef.current;

  const rect = canvas.getBoundingClientRect();

  // All this is chores that always need to be done to get the mouse position
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  cursorState.current.isDown = true;

  switch (editorState.brushTool) {
    case "pen":
      setEditorState((prev) => prev.setCurrentStroke(
        new FreeBrushStroke(
          `brushstroke-${strokeCount}`,
          prev.brushColor,
          prev.brushSize,
          x,
          y
        )
      ));
      break;
    case "text":
      setEditorState((prev) => prev.setCurrentStroke(
        new TextBrushStroke(
          `textstroke-${strokeCount}`,
          prev.brushColor,
          prev.brushSize * 10,
          [x, y],
          ""
        )
      ));
      break;
    case "line":
      setEditorState((prev) => prev.setCurrentStroke(
        new LineBrushStroke(
          `linestroke-${strokeCount}`,
          prev.brushColor,
          prev.brushSize,
          [x, y],
          [x, y]
        )
      ));
      break;
    case "select":
      for (const stroke of whiteboardState.strokes) {
        if (stroke instanceof FreeBrushStroke) {
          const points = stroke.points;
          for (let i = 0; i < points.length - 1; i++) {
            const pointA = points[i];
            const pointB = points[i + 1];
            if (checkLineIntersectsCircle(pointA, pointB, [x, y], 10)) {
              setEditorState((prev) => {
                return prev.setFocusedStroke(stroke);
              });
              return;
            }
          }

          setEditorState((prev) => {
            return prev.setFocusedStroke(null);
          });
        }
      }
      break;
  }

  setStrokeCount((prev) => prev + 1);
};

export const mouseMoveEvent = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cursorState: React.RefObject<CursorState>,
  editorState: EditorState,
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>
) => {
  const canvas = canvasRef?.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  cursorState.current.x = x;
  cursorState.current.y = y;

  if (!cursorState.current.isDown || !editorState.currentStroke) return;

  switch (editorState.currentStroke.constructor) {
    case FreeBrushStroke:
      (editorState.currentStroke as FreeBrushStroke).addPoint(x, y);
      setEditorState((prev) => {
        return prev.setCurrentStroke(editorState.currentStroke);
      });
      break;
    case LineBrushStroke:
      (editorState.currentStroke as LineBrushStroke).updateEndPoint(x, y);
      setEditorState((prev) => {
        return prev.setCurrentStroke(editorState.currentStroke);
      });
      break;
  }
};

export const mouseUpEvent = (
  CursorState: React.RefObject<CursorState>,
  EditorState: EditorState,
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>,
  setBoardState: React.Dispatch<React.SetStateAction<WhiteboardState>>
) => {
  CursorState.current.isDown = false;
  if (!EditorState.currentStroke) return;

  switch (EditorState.currentStroke.constructor) {
    case FreeBrushStroke:
    case LineBrushStroke:
      setBoardState((prev) => {
        return new WhiteboardState(prev.version, [...prev.strokes, EditorState.currentStroke!]);
      });
      setEditorState((prev) => prev.setCurrentStroke(null));
      break;
    }
};
