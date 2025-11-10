import { useRef, useEffect, useState } from "react";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useUndoRedo } from "../../hooks/undo-redo";
import { FreeStroke, TextStroke, LineStroke, ShapeStroke } from "../../strokes";
import { useMouseEvents } from "../../hooks/mouse-events";
import {
  renderFreeStroke,
  renderTextStroke,
  renderLineStroke,
  renderShapeStroke,
  renderSelectionBox,
} from "../../rendering";
import "./whiteboard.css";

const GRID_SIZE = 20;
const GRID_COLOR = "rgba(0, 0, 0, 0.1)";
const CURSOR_BLINK_SPEED = 500; // milliseconds

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCursor, setShowCursor] = useState(true);
  const boardState = useBoardStore((state) => state);
  const editorState = useEditorStore((state) => state);
  const { handleUndo, handleRedo } = useUndoRedo();
  const { handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave } =
    useMouseEvents(canvasRef);

  const setCanvasSize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = canvasRef.current.clientHeight;
    }
  };

  // Most important function. This mulls through all the strokes and draws them to the
  // canvas in order. Make sure not to mess up this data structure or you'll break everything.
  const drawCanvas = () => {
    const allStrokes: (FreeStroke | TextStroke | LineStroke | ShapeStroke)[] =
      [];

    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Whiteboard canvas does not exist");

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    const currentStroke = editorState.currentStroke;
    if (currentStroke) {
      allStrokes.push(...boardState.strokes, currentStroke);
    } else {
      allStrokes.push(...boardState.strokes);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    drawTextCursor();

    if (
      currentStroke instanceof ShapeStroke &&
      currentStroke.id === "selectbox"
    ) {
      renderSelectionBox(ctx, currentStroke);
    }

    for (const stroke of allStrokes) {
      switch (stroke.constructor) {
        case TextStroke:
          renderTextStroke(
            ctx,
            stroke as TextStroke,
            editorState.focusedStrokes
          );
          break;
        case FreeStroke:
          renderFreeStroke(
            ctx,
            stroke as FreeStroke,
            editorState.focusedStrokes
          );
          break;
        case LineStroke:
          renderLineStroke(
            ctx,
            stroke as LineStroke,
            editorState.focusedStrokes
          );
          break;
        case ShapeStroke:
          renderShapeStroke(
            ctx,
            stroke as ShapeStroke,
            editorState.focusedStrokes
          );
          break;
      }
    }
  };

  const drawTextCursor = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    if (
      editorState.currentStroke &&
      editorState.currentStroke instanceof TextStroke &&
      showCursor
    ) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(
        editorState.currentStroke.position[0] +
          ctx.measureText(editorState.currentStroke.text).width +
          2,
        editorState.currentStroke.position[1] + 2
      );
      ctx.lineTo(
        editorState.currentStroke.position[0] +
          ctx.measureText(editorState.currentStroke.text).width +
          2,
        editorState.currentStroke.position[1] -
          editorState.currentStroke.size +
          3
      );
      ctx.stroke();
    }
  };

  // Allows us to get the grid effect on the whiteboard. Mess with grid size to change spacing.
  // Will probably need to adjust if we add a zoom feature.
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    for (let x = 0; x <= width; x += GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  };

  useEffect(() => {
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);
    window.addEventListener("resize", drawCanvas);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("resize", drawCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    drawCanvas();
  }, [boardState, editorState, showCursor]);

  useEffect(() => {
    if (
      editorState.currentStroke &&
      editorState.currentStroke instanceof TextStroke
    ) {
      const intervalId = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, CURSOR_BLINK_SPEED);

      return () => clearInterval(intervalId);
    } else {
      setShowCursor(true);
    }
  }, [editorState]);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <button className="whiteboard-button" onClick={handleUndo}>
          ↶ Undo
        </button>
        <button className="whiteboard-button" onClick={handleRedo}>
          ↷ Redo
        </button>
        <button className="whiteboard-button">🔍−</button>
        <button className="whiteboard-button">🔍+</button>
      </div>
      <canvas
        ref={canvasRef}
        id="whiteboard-canvas"
        className="whiteboard-canvas"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export default Whiteboard;
