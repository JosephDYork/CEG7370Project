import React from "react";
import {
  checkPointNearLine,
  checkPointNearRectangle,
  checkPointNearCircle,
  checkPointNearEllipse,
} from "../geometry";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useCursorStore } from "../stores/cursor-store";
import { FreeStroke, TextStroke, LineStroke, ShapeStroke } from "../strokes";
import { useWebSocket } from "./web-sockets";

export const useMouseEvents = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const { addStroke, strokes } = useBoardStore();
  const {
    brushTool,
    brushSize,
    brushColor,
    currentStroke,
    setCurrentStroke,
    setFocusedStroke,
  } = useEditorStore();
  const { isDown, updateCursor, setCursorPosition, setCursorDown } =
    useCursorStore();
  const { sendBoardUpdate } = useWebSocket();

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

    const strokeId = `${brushTool}-${Date.now()}-${Math.random().toString(8)}`;

    switch (brushTool) {
      case "pen":
        setCurrentStroke(new FreeStroke(strokeId, brushColor, brushSize, [[x, y]]));
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
      case "square":
      case "ellipse":
      case "circle":
        setCurrentStroke(
          new ShapeStroke(
            strokeId,
            brushTool,
            brushColor,
            brushSize,
            [x, y],
            [x, y]
          )
        );
        break;
      case "select":
        const hitStroke = strokes.find((stroke) => {
          if (stroke instanceof FreeStroke) {
            return stroke.points.some(
              (point, i, points) =>
                i < points.length - 1 &&
                checkPointNearLine(
                  point as [number, number],
                  points[i + 1] as [number, number],
                  [x, y],
                  10
                )
            );
          } else if (stroke instanceof TextStroke) {
            const [x1, y1, x2, y2] = stroke.getBoundingBox(
              canvasRef.current?.getContext("2d") as CanvasRenderingContext2D
            );
            return x >= x1 && x <= x2 && y >= y1 && y <= y2;
          } else if (stroke instanceof LineStroke) {
            return checkPointNearLine(
              stroke.startPoint,
              stroke.endPoint,
              [x, y],
              10
            );
          } else if (stroke instanceof ShapeStroke) {
            const tolerance = 10;
            switch (stroke.type) {
              case "square":
                return checkPointNearRectangle(
                  [x, y],
                  stroke.origin,
                  stroke.termination,
                  tolerance
                );
              case "circle":
                return checkPointNearCircle(
                  [x, y],
                  stroke.origin,
                  stroke.termination,
                  tolerance
                );
              case "ellipse":
                return checkPointNearEllipse(
                  [x, y],
                  stroke.origin,
                  stroke.termination,
                  tolerance
                );
              default:
                return false;
            }
          } else {
            return false;
          }
        });
        setFocusedStroke(hitStroke || null);
        break;
    }
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
    } else if (currentStroke instanceof ShapeStroke) {
      currentStroke.updateTermination(x, y);
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
