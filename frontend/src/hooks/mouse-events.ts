import React from "react";
import { checkLineIntersectsCircle } from "../geometry";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useCursorStore } from "../stores/cursor-store";
import { FreeStroke, TextStroke, LineStroke } from "../brushes";

export const useMouseEvents = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const { addStroke, strokes } = useBoardStore();
  const {
    brushTool,
    brushSize,
    brushColor,
    strokeCount,
    currentStroke,
    setCurrentStroke,
    setFocusedStroke,
    incrementStrokeCount,
  } = useEditorStore();
  const { isDown, updateCursor, setCursorPosition, setCursorDown } =
    useCursorStore();

  const getCanvasPosition = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): [number, number] => {
    if (!canvasRef.current) return [0, 0];
    const rect = canvasRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const finishStroke = (stroke: FreeStroke | LineStroke | TextStroke) => {
    addStroke(stroke);
    if (!(stroke instanceof TextStroke)) {
      setCurrentStroke(null);
    }
  };

  const handleMouseLeave = () => {
    setCursorDown(false);
    if (
      currentStroke &&
      (currentStroke instanceof FreeStroke ||
        currentStroke instanceof LineStroke)
    ) {
      finishStroke(currentStroke);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const [x, y] = getCanvasPosition(e);
    updateCursor(x, y, true);

    const strokeId = `${brushTool}stroke-${strokeCount}`;

    switch (brushTool) {
      case "pen":
        setCurrentStroke(
          new FreeStroke(strokeId, brushColor, brushSize, x, y)
        );
        break;
      case "text":
        setCurrentStroke(
          new TextStroke(strokeId, brushColor, brushSize * 10, [x, y], "")
        );
        break;
      case "line":
        setCurrentStroke(
          new LineStroke(strokeId, brushColor, brushSize, [x, y], [x, y])
        );
        break;
      case "select":
        const hitStroke = strokes.find((stroke) => {
          if (stroke instanceof FreeStroke) {
            return stroke.points.some(
              (point, i, points) =>
                i < points.length - 1 &&
                checkLineIntersectsCircle(point, points[i + 1], [x, y], 10)
            );
          }
          return false;
        });
        setFocusedStroke(hitStroke || null);
        break;
    }
    incrementStrokeCount();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const [x, y] = getCanvasPosition(e);
    setCursorPosition(x, y);

    if (!isDown || !currentStroke) return;

    if (currentStroke instanceof FreeStroke) {
      currentStroke.addPoint(x, y);
      setCurrentStroke(currentStroke);
    } else if (currentStroke instanceof LineStroke) {
      currentStroke.updateEndPoint(x, y);
      setCurrentStroke(currentStroke);
    }
  };

  const handleMouseUp = () => {
    setCursorDown(false);
    if (currentStroke && !(currentStroke instanceof TextStroke)) {
      finishStroke(currentStroke);
    }
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
