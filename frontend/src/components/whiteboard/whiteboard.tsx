import React, { useRef, useEffect, useState } from "react";
import type { WhiteboardProps } from "../../whiteboardState";
import { WhiteboardBrushStroke, WhiteboardTextStroke } from "../../whiteboardState";
import "./whiteboard.css";

const GRID_SIZE = 20;
const GRID_COLOR = "rgba(0, 0, 0, 0.1)";
const CURSOR_BLINK_SPEED = 500; // milliseconds

const Whiteboard = ({
  currentStroke,
  brushState,
  whiteboardState,
  mouseMoveCallback,
  mouseDownCallback,
  mouseUpCallback,
  mouseLeaveCallback,
  undoCallback,
  redoCallback
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
    const allStrokes: (WhiteboardBrushStroke | WhiteboardTextStroke)[] = [];

    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Whiteboard canvas does not exist");

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

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
      if (stroke instanceof WhiteboardTextStroke) {
        ctx.fillStyle = stroke.color;
        ctx.font = `${stroke.fontSize}px Arial`;
        ctx.fillText(stroke.text, stroke.position[0], stroke.position[1]);
      } else if (stroke instanceof WhiteboardBrushStroke) {
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
      }
    }
  };

  const drawTextCursor = () => {
    if (currentStroke && currentStroke instanceof WhiteboardTextStroke && showCursor) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(
        currentStroke.position[0] + ctx.measureText(currentStroke.text).width + 5,
        currentStroke.position[1] + 2,
      );
      ctx.lineTo(
        currentStroke.position[0] + ctx.measureText(currentStroke.text).width + 5,
        currentStroke.position[1] - currentStroke.fontSize,
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
  }, [whiteboardState, currentStroke, showCursor]);

  useEffect(() => {
    if (currentStroke && currentStroke instanceof WhiteboardTextStroke) {
      const intervalId = setInterval(() => {
        setShowCursor(prev => !prev);
      }, CURSOR_BLINK_SPEED);

      return () => clearInterval(intervalId);
    } else {
      setShowCursor(true);
    }
  }, [currentStroke, brushState]);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <button className="whiteboard-button" onClick={undoCallback}>↶ Undo</button>
        <button className="whiteboard-button" onClick={redoCallback}>↷ Redo</button>
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