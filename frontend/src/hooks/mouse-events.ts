import React, { useState } from "react";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useCursorStore } from "../stores/cursor-store";
import { FreeStroke, TextStroke, LineStroke, ShapeStroke } from "../strokes";
import { useWebSocket } from "./web-sockets";
import { useTranslation } from "./translation";
import { useSelection } from "./selection";
import { isPointOnStroke } from "../collisions";

export const useMouseEvents = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const [hoveringTranslatable, setHoveringTranslatable] = useState(false);

  const { addStroke } = useBoardStore();
  const { brushTool, brushSize, brushColor, currentStroke, focusedStrokes, setCurrentStroke, clearFocusedStrokes } = useEditorStore();
  const { isDown, updateCursor, setCursorPosition, setCursorDown } = useCursorStore();
  const { sendBoardUpdate } = useWebSocket();

  const translation = useTranslation();
  const selection = useSelection();

  const getCanvasPosition = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): [number, number] => {
    if (!canvasRef.current) return [0, 0];
    const rect = canvasRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const finishStroke = (
    stroke: FreeStroke | LineStroke | TextStroke | ShapeStroke
  ) => {
    addStroke(stroke);
    sendBoardUpdate();
    if (!(stroke instanceof TextStroke)) {
      setCurrentStroke(null);
    }
  };

  const createStroke = (coords: [number, number], strokeId: string) => {
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
      case "circle":
        return new ShapeStroke(strokeId, brushTool, brushColor, brushSize, [x, y], [x, y]);
      case "select":
        return selection.startSelectBox([x, y]);
      default:
        return null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasPosition(e);
    updateCursor(coords[0], coords[1], true);

    if (brushTool === "select" && focusedStrokes.length > 0) {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && focusedStrokes.some(stroke => isPointOnStroke(coords, stroke, 10, ctx))) {
        translation.startTranslation(coords);
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

    if (brushTool === "select" && focusedStrokes.length > 0 && !translation.isTranslating && !isDown) {
      const strokeHovered = focusedStrokes.some(stroke => isPointOnStroke(coords, stroke, 10, ctx));
      if (strokeHovered !== hoveringTranslatable) {
        setHoveringTranslatable(strokeHovered);
        canvasRef.current.style.cursor = strokeHovered ? "move" : "crosshair";
      }
    } else if (hoveringTranslatable) {
      setHoveringTranslatable(false);
      canvasRef.current.style.cursor = "default";
    }

    if (translation.isTranslating && isDown && focusedStrokes.length > 0) {
      translation.translateStrokes(coords, focusedStrokes);
      return;
    }

    if (!isDown || !currentStroke) return;

    if (currentStroke instanceof FreeStroke) {
      currentStroke.addPoint(coords[0], coords[1]);
      setCurrentStroke(currentStroke);
    } else if (currentStroke instanceof LineStroke) {
      currentStroke.updateEndPoint(coords[0], coords[1]);
      setCurrentStroke(currentStroke);
    } else if (currentStroke instanceof ShapeStroke) {
      if (selection.selectBoxExists) {
        selection.updateSelectBox(currentStroke, coords, ctx);
      } else {
        currentStroke.updateTermination(coords[0], coords[1]);
        setCurrentStroke(currentStroke);
      }
    }
  };

  const handleMouseUp = () => {
    setCursorDown(false);

    if (currentStroke && !(currentStroke instanceof TextStroke) && !selection.selectBoxExists) {
      finishStroke(currentStroke);
    }

    if (selection.selectBoxExists) {
      selection.endSelectBox();
    }

    if (translation.isTranslating) {
      translation.endTranslation();
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

    if (currentStroke && (currentStroke instanceof FreeStroke || currentStroke instanceof LineStroke)) {
      finishStroke(currentStroke);
    } else if (currentStroke && selection.selectBoxExists) {
      selection.endSelectBox();
    }

    if (translation.isTranslating) {
      translation.endTranslation();
    }
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
