import { useRef, useEffect, useState } from "react";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useViewportStore } from "../../stores/viewport-store";
import { FreeStroke } from "../../models/free-stroke";
import { TextStroke } from "../../models/text-stroke";
import { LineStroke } from "../../models/line-stroke";
import { ShapeStroke } from "../../models/shape-stroke";
import type { Stroke } from "../../models/strokes";
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
  const viewportState = useViewportStore((state) => state);
  const { handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave } =
    useMouseEvents(canvasRef);

  const setCanvasSize = () => {
    if (canvasRef.current) {
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      viewportState.setDimensions(width, height);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get mouse position relative to canvas
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Zoom in/out based on wheel direction
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    viewportState.zoomAt([screenX, screenY], delta);
  };

  // Most important function. This mulls through all the strokes and draws them to the
  // canvas in order. Make sure not to mess up this data structure or you'll break everything.
  const drawCanvas = () => {
    const allStrokes: Stroke[] = [];

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

    // Clear canvas
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply viewport transformation
    ctx.save();
    ctx.scale(viewportState.zoom, viewportState.zoom);
    ctx.translate(-viewportState.offsetX, -viewportState.offsetY);

    // Draw grid and content in world space
    drawGrid(ctx);
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
            [...editorState.focusedStrokes],
            [...editorState.eraseStack]
          );
          break;
        case "free":
          renderFreeStroke(
            ctx,
            stroke as FreeStroke,
            [...editorState.focusedStrokes],
            [...editorState.eraseStack]
          );
          break;
        case "line":
          renderLineStroke(
            ctx,
            stroke as LineStroke,
            [...editorState.focusedStrokes],
            [...editorState.eraseStack]
          );
          break;
        case "shape":
          renderShapeStroke(
            ctx,
            stroke as ShapeStroke,
            [...editorState.focusedStrokes],
            [...editorState.eraseStack]
          );
          break;
      }
    }

    ctx.restore();
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

  // Infinite grid that moves with the viewport
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const bounds = viewportState.getVisibleBounds();

    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5 / viewportState.zoom; // Keep grid lines thin at any zoom
    ctx.beginPath();

    // Calculate grid start positions aligned to GRID_SIZE
    const startX = Math.floor(bounds.minX / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(bounds.minY / GRID_SIZE) * GRID_SIZE;

    // Draw vertical lines
    for (let x = startX; x <= bounds.maxX; x += GRID_SIZE) {
      ctx.moveTo(x, bounds.minY);
      ctx.lineTo(x, bounds.maxY);
    }

    // Draw horizontal lines
    for (let y = startY; y <= bounds.maxY; y += GRID_SIZE) {
      ctx.moveTo(bounds.minX, y);
      ctx.lineTo(bounds.maxX, y);
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
  }, [boardState, editorState, showCursor, viewportState]);

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
        onWheel={handleWheel}
      />
    </div>
  );
};

export default Whiteboard;
