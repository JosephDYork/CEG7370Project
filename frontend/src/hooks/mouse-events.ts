import React, { useState } from "react";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useCursorStore } from "../stores/cursor-store";
import { FreeStroke } from "../models/free-stroke";
import { TextStroke } from "../models/text-stroke";
import { LineStroke } from "../models/line-stroke";
import { ShapeStroke } from "../models/shape-stroke";
import type { Point, StrokeType } from "../models/strokes";
import { useWebSocket } from "./web-sockets";
import { useSelectionTool } from "./selection";

export const useMouseEvents = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const selection = useSelectionTool();
  const { addStroke } = useBoardStore();
  const { sendBoardUpdate } = useWebSocket();
  const [hoveringTranslatable, setHoveringTranslatable] = useState(false);
  const {
    brushTool,
    brushSize,
    brushColor,
    currentStroke,
    focusedStrokes,
    setCurrentStroke,
    clearFocusedStrokes,
  } = useEditorStore();
  const { isDown, updateCursor, setCursorPosition, setCursorDown } =
    useCursorStore();

  const getCanvasPosition = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): Point => {
    if (!canvasRef.current) return [0, 0];
    const rect = canvasRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const finishStroke = (stroke: StrokeType) => {
    addStroke(stroke);
    sendBoardUpdate();
    if (stroke.type !== "text") {
      setCurrentStroke(null);
    }
  };

  const createStroke = (coords: Point, strokeId: string) => {
    const [x, y] = coords;

    switch (brushTool) {
      case "pen":
        return new FreeStroke(strokeId, brushColor, brushSize, [[x, y]]);
      case "text":
        return new TextStroke(strokeId, brushColor, brushSize * 10, [x, y], "");
      case "line":
        return new LineStroke(strokeId, brushColor, brushSize, [x, y], [x, y]);
      case "square":
      case "ellipse":
        return new ShapeStroke(
          strokeId,
          brushTool,
          brushColor,
          brushSize,
          [x, y],
          [x, y]
        );
      case "select":
        return selection.startSelectBox([x, y]);
      default:
        return null;
    }
  };

  const updateCurrentStroke = (coords: Point, ctx: CanvasRenderingContext2D) => {
    if (!currentStroke) return;

    switch (currentStroke.type) {
      case "free":
        const freeStroke = currentStroke as FreeStroke;
        const updatedFreeStroke = freeStroke.addPoint(coords[0], coords[1]);
        setCurrentStroke(updatedFreeStroke);
        break;
      case "line":
        const lineStroke = currentStroke as LineStroke;
        const updatedLineStroke = lineStroke.updateEndPoint(coords[0], coords[1]);
        setCurrentStroke(updatedLineStroke);
        break;
      case "shape":
        const shapeStroke = currentStroke as ShapeStroke;
        if (selection.selectBoxExists) {
          selection.updateSelectBox(shapeStroke, coords, ctx);
        } else {
          const updatedShapeStroke = shapeStroke.updateTermination(coords[0], coords[1]);
          setCurrentStroke(updatedShapeStroke);
        }
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasPosition(e);
    updateCursor(coords[0], coords[1], true);

    if (brushTool === "select" && focusedStrokes.length > 0) {
      const ctx = canvasRef.current?.getContext("2d");
      if (
        ctx &&
        focusedStrokes.some((stroke) => stroke.isPointNear(coords, 10, ctx))
      ) {
        selection.startTranslation(coords);
        return;
      } else {
        clearFocusedStrokes();
      }
    }

    const strokeId = `${brushTool}-${Date.now()}-${Math.random().toString(8)}`;
    const newStroke = createStroke(coords, strokeId);
    if (newStroke) {
      setCurrentStroke(newStroke);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasPosition(e);
    setCursorPosition(coords[0], coords[1]);

    if (
      brushTool === "select" &&
      focusedStrokes.length > 0 &&
      !selection.isTranslating &&
      !isDown
    ) {
      const strokeHovered = focusedStrokes.some((stroke) =>
        stroke.isPointNear(coords, 10, ctx)
      );
      if (strokeHovered !== hoveringTranslatable) {
        setHoveringTranslatable(strokeHovered);
        canvasRef.current.style.cursor = strokeHovered ? "move" : "crosshair";
      }
    } else if (hoveringTranslatable) {
      setHoveringTranslatable(false);
      canvasRef.current.style.cursor = "default";
    }

    if (selection.isTranslating && isDown && focusedStrokes.length > 0) {
      selection.translateStrokes(coords, focusedStrokes);
      return;
    }

    if (!isDown || !currentStroke) return;

    updateCurrentStroke(coords, ctx);
  };

  const handleMouseUp = () => {
    setCursorDown(false);

    if (currentStroke && !(currentStroke instanceof TextStroke) && !selection.selectBoxExists) {
      finishStroke(currentStroke);
    }

    if (selection.selectBoxExists) {
      selection.endSelectBox();
    }

    if (selection.isTranslating) {
      selection.endTranslation();
      if (canvasRef.current) {
        canvasRef.current.style.cursor = "default";
      }
    }
  };

  const handleMouseLeave = () => {
    setCursorDown(false);

    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
    setHoveringTranslatable(false);

    if (currentStroke) {
      switch (currentStroke.type) {
        case "free":
        case "line":
          finishStroke(currentStroke);
          break;
        case "shape":
          if (selection.selectBoxExists) {
            selection.endSelectBox();
          }
          break;
        default:
          break;
      }
    }

    if (selection.isTranslating) {
      selection.endTranslation();
    }
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
