import React, { useRef, useEffect } from "react";
import type { WhiteboardProps } from "../../whiteboardState";
import { WhiteboardStroke } from "../../whiteboardState";
import "./whiteboard.css";

const GRID_SIZE = 20;
const GRID_COLOR = "rgba(0, 0, 0, 0.1)";

const Whiteboard = ({
  currentStroke,
  whiteboardState,
  mouseMoveCallback,
  mouseDownCallback,
  mouseUpCallback,
  undoCallback,
  redoCallback
}: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const allStrokes: WhiteboardStroke[] = [];

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

    for (const stroke of allStrokes) {
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
  }, [whiteboardState, currentStroke]);

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
        onMouseLeave={mouseUpCallback}
      />
    </div>
  );
};

export default Whiteboard;