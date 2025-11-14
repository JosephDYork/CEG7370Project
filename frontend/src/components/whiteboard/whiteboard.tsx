import { useRef, useEffect, useState } from "react";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useUndoRedo } from "../../hooks/undo-redo";
import { FreeStroke } from "../../models/free-stroke";
import { TextStroke } from "../../models/text-stroke";
import { LineStroke } from "../../models/line-stroke";
import { ShapeStroke } from "../../models/shape-stroke";
import type { StrokeType } from "../../models/strokes";
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
  // const { handleUndo, handleRedo } = useUndoRedo();
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
    const allStrokes: StrokeType[] = [];

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
      currentStroke &&
      currentStroke.type === "shape" &&
      currentStroke.id === "selectbox"
    ) {
      renderSelectionBox(ctx, currentStroke as ShapeStroke);
    }

    for (const stroke of allStrokes) {
      switch (stroke.type) {
        case "text":
          renderTextStroke(
            ctx,
            stroke as TextStroke,
            editorState.focusedStrokes
          );
          break;
        case "free":
          renderFreeStroke(
            ctx,
            stroke as FreeStroke,
            editorState.focusedStrokes
          );
          break;
        case "line":
          renderLineStroke(
            ctx,
            stroke as LineStroke,
            editorState.focusedStrokes
          );
          break;
        case "shape":
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
      editorState.currentStroke.type === "text" &&
      showCursor
    ) {
      const textStroke = editorState.currentStroke as TextStroke;
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(
        textStroke.position[0] + ctx.measureText(textStroke.text).width + 2,
        textStroke.position[1] + 2
      );
      ctx.lineTo(
        textStroke.position[0] + ctx.measureText(textStroke.text).width + 2,
        textStroke.position[1] - textStroke.size + 3
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
      editorState.currentStroke.type === "text"
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
