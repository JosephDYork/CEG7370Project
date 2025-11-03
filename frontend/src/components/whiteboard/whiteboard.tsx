import React, { useRef, useEffect, useState } from "react";
import { FreeBrushStroke } from "../../free-brush";
import { TextBrushStroke } from "../../text-brush";
import { LineBrushStroke } from "../../line-brush";
import type { WhiteboardProps } from "../../board-state";
import "./whiteboard.css";

const GRID_SIZE = 20;
const GRID_COLOR = "rgba(0, 0, 0, 0.1)";
const CURSOR_BLINK_SPEED = 500; // milliseconds

const Whiteboard = ({
  editorState,
  whiteboardState,
  mouseMoveCallback,
  mouseDownCallback,
  mouseUpCallback,
  mouseLeaveCallback,
  undoCallback,
  redoCallback,
}: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCursor, setShowCursor] = useState(true);

  const setCanvasSize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = canvasRef.current.clientHeight;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseMoveCallback(e, canvasRef);
    drawCanvas();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseDownCallback(e, canvasRef);
  };

  // Most important function. This mulls through all the strokes and draws them to the
  // canvas in order. Make sure not to mess up this data structure or you'll break everything.
  const drawCanvas = () => {
    const allStrokes: (FreeBrushStroke | TextBrushStroke | LineBrushStroke)[] =
      [];

    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Whiteboard canvas does not exist");

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    const currentStroke = editorState.currentStroke;
    if (currentStroke) {
      allStrokes.push(...whiteboardState.strokes, currentStroke);
    } else {
      allStrokes.push(...whiteboardState.strokes);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    drawTextCursor();

    for (const stroke of allStrokes) {
      if (stroke instanceof TextBrushStroke) {
        ctx.fillStyle = stroke.color;
        ctx.font = `${stroke.fontSize}px Arial`;
        ctx.fillText(stroke.text, stroke.position[0], stroke.position[1]);
      } else if (stroke instanceof FreeBrushStroke) {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        const points = stroke.points;
        if (points.length > 0) {
          ctx.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
          }
          ctx.stroke();
        }

        if (stroke.id === editorState.focusedStroke?.id) {
          const bbox = stroke.getBoundingBox();
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#9191ffff";
          ctx.strokeRect(
            bbox[0] - 5,
            bbox[1] - 5,
            bbox[2] - bbox[0] + 10,
            bbox[3] - bbox[1] + 10
          );
          ctx.setLineDash([]);
          ctx.stroke();
        }
      } else if (stroke instanceof LineBrushStroke) {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.moveTo(stroke.startPoint[0], stroke.startPoint[1]);
        ctx.lineTo(stroke.endPoint[0], stroke.endPoint[1]);
        ctx.stroke();
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
      editorState.currentStroke instanceof TextBrushStroke &&
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
          editorState.currentStroke.fontSize +
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

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    drawCanvas();
  }, [whiteboardState, editorState, showCursor]);

  useEffect(() => {
    if (editorState.currentStroke && editorState.currentStroke instanceof TextBrushStroke) {
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
        <button className="whiteboard-button" onClick={undoCallback}>
          ↶ Undo
        </button>
        <button className="whiteboard-button" onClick={redoCallback}>
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
        onMouseUp={mouseUpCallback}
        onMouseLeave={mouseLeaveCallback}
      />
    </div>
  );
};

export default Whiteboard;