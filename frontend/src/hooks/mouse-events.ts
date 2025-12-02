import React, { useState } from "react";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useCursorStore } from "../stores/cursor-store";
import { useViewportStore } from "../stores/viewport-store";
import { FreeStroke } from "../models/free-stroke";
import { TextStroke } from "../models/text-stroke";
import { LineStroke } from "../models/line-stroke";
import { ShapeStroke } from "../models/shape-stroke";
import type { Point, Stroke } from "../models/strokes";
import { useSelectionTool } from "./selection";
import { usePanTool } from "./pan-tool";
import { useMagicBoxTool } from "./magic-box-tool";
import { useWebSocket } from "./web-sockets";

export const useMouseEvents = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const selection = useSelectionTool();
  const panTool = usePanTool();
  const magicBoxTool = useMagicBoxTool();
  const viewport = useViewportStore();
  const { strokes, addStrokes, removeStrokes } = useBoardStore();
  const { sendAddBoardMessage, sendRemoveBoardMessage } = useWebSocket()
  const [hoveringTranslatable, setHoveringTranslatable] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const {
    brushTool,
    brushSize,
    brushColor,
    currentStroke,
    focusedStrokes,
    eraseStack,
    addToEraseStack,
    setCurrentStroke,
    clearFocusedStrokes,
    clearEraseStack,
    getCurrentLanguage
  } = useEditorStore();
  const { isDown, updateCursor, setCursorPosition, setCursorDown } =
    useCursorStore();

  const getCanvasPosition = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): Point => {
    if (!canvasRef.current) return [0, 0];
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    // Convert screen coordinates to world coordinates
    return viewport.screenToWorld([screenX, screenY]);
  };


  const finishStroke = (stroke: Stroke) => {
    let finalStroke: Stroke = stroke;
    // If it's a FreeStroke, run RDP simplification
    if (stroke instanceof FreeStroke) {
      finalStroke = stroke.simplify(); // Optional: pass epsilon here
    }


    addStrokes([finalStroke]);
    sendAddBoardMessage([finalStroke]);

    if (finalStroke.type !== "text") {
      setCurrentStroke(null);
    }
  };

  const createStroke = (coords: Point, strokeId: string) => {
    const [x, y] = coords;

    switch (brushTool) {
      case "pen":
        return new FreeStroke(strokeId, brushColor, brushSize, [[x, y]]);
      case "text":
        return new TextStroke(
          strokeId, 
          brushColor, 
          brushSize * 10, 
          [x, y], 
          "",
          getCurrentLanguage(),
          {}
        );
      case "line":
        return new LineStroke(strokeId, brushColor, brushSize, [x, y], [x, y]);
      case "square":
      case "ellipse":
        return new ShapeStroke(
          strokeId,
          brushColor,
          brushSize,
          brushTool,
          [x, y],
          [x, y]
        );
      case "select":
        return selection.startSelectBox([x, y]);
      case "magicbox":
        return magicBoxTool.startMagicBox([x, y]);
      default:
        return null;
    }
  };

  const updateCurrentStroke = (coords: Point) => {
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
          selection.updateSelectBox(shapeStroke, coords);
        } else if (shapeStroke.id === "magicbox") {
          const updatedMagicBox = magicBoxTool.updateMagicBox(shapeStroke, coords);
          setCurrentStroke(updatedMagicBox);
        } else {
          const updatedShapeStroke = shapeStroke.updateTermination(coords[0], coords[1]);
          setCurrentStroke(updatedShapeStroke);
        }
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldCoords = getCanvasPosition(e);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenCoords: Point = [e.clientX - rect.left, e.clientY - rect.top];
    updateCursor(screenCoords[0], screenCoords[1], true);

    // Handle pan tool (uses screen coords)
    if (brushTool === "pan") {
      panTool.startPan(screenCoords[0], screenCoords[1]);
      return;
    }

    // Handle selection (uses world coords)
    if (brushTool === "select" && focusedStrokes.size > 0) {
      const ctx = canvasRef.current?.getContext("2d");
      if (
        ctx &&
        [...focusedStrokes].some((stroke) => stroke.isPointNear(worldCoords, 10, ctx))
      ) {
        selection.startTranslation(worldCoords);
        return;
      } else {
        clearFocusedStrokes();
      }
    }

    if (brushTool === "erase") {
      setIsErasing(true);

      for (const stroke of strokes) {
        if (stroke.isPointNear(worldCoords, brushSize)) {
          addToEraseStack(stroke);

          if ([...focusedStrokes].find((s) => s.id === stroke.id)) {
            clearFocusedStrokes();
          }
        }
      }

      // I know this is an ugly way to render a erase cirlce, but we are running out of
      // time on this project.
      setCurrentStroke(new ShapeStroke(
        `erase-box-${Date.now()}`,
        "#000000",
        1,
        "ellipse",
        [worldCoords[0] - 5, worldCoords[1] - 5],
        [worldCoords[0] + 5, worldCoords[1] + 5]
      ))
    }

    // Create new stroke (uses world coords)
    const strokeId = `${brushTool}-${Date.now()}-${Math.random().toString(8)}`;
    const newStroke = createStroke(worldCoords, strokeId);
    if (newStroke) {
      setCurrentStroke(newStroke);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const worldCoords = getCanvasPosition(e);
    const rect = canvasRef.current.getBoundingClientRect();
    const screenCoords: Point = [e.clientX - rect.left, e.clientY - rect.top];
    setCursorPosition(screenCoords[0], screenCoords[1]);

    // Update cursor style for pan tool (uses screen coords)
    if (brushTool === "pan") {
      canvasRef.current.style.cursor = panTool.isPanning ? "grabbing" : "grab";
      if (panTool.isPanning) {
        panTool.updatePan(screenCoords[0], screenCoords[1]);
      }
      return;
    }

    // Update cursor style for magic box tool
    if (brushTool === "magicbox") {
      canvasRef.current.style.cursor = "crosshair";
    }

    // Handle selection hover (uses world coords)
    if (
      brushTool === "select" &&
      focusedStrokes.size > 0 &&
      !selection.isTranslating &&
      !isDown
    ) {
      const strokeHovered = [...focusedStrokes].some((stroke) =>
        stroke.isPointNear(worldCoords, 10, ctx)
      );
      if (strokeHovered !== hoveringTranslatable) {
        setHoveringTranslatable(strokeHovered);
        canvasRef.current.style.cursor = strokeHovered ? "move" : "crosshair";
      }
    } else if (hoveringTranslatable) {
      setHoveringTranslatable(false);
      canvasRef.current.style.cursor = "default";
    }

    if (brushTool === "erase" && isErasing && isDown) {
      for (const stroke of strokes) {
        if (stroke.isPointNear(worldCoords, brushSize)) {
          addToEraseStack(stroke);

          if ([...focusedStrokes].find((s) => s.id === stroke.id)) {
            clearFocusedStrokes();
          }
        }
      }
 
      // Just keep manually redrawing the erase circle, since we are doing it this way.
      setCurrentStroke(new ShapeStroke(
        `erase-box-${Date.now()}`,
        "#000000",
        1,
        "ellipse",
        [worldCoords[0] - 5, worldCoords[1] - 5],
        [worldCoords[0] + 5, worldCoords[1] + 5]
      ))

      return;
    }

    // Handle selection translation (uses world coords)
    if (selection.isTranslating && isDown && focusedStrokes.size > 0) {
      selection.translateStrokes(worldCoords, [...focusedStrokes]);
      return;
    }

    if (!isDown || !currentStroke) return;

    // Update current stroke (uses world coords)
    updateCurrentStroke(worldCoords);
  };

  const handleMouseUp = async () => {
    setCursorDown(false);

    // End pan
    if (brushTool === "pan") {
      panTool.endPan();
      return;
    }

    // This needs to be done before the finish stroke call or we might accidentally
    // add an erase circle to the stroke stack.
    if (isErasing && brushTool === "erase") {
      setIsErasing(false);

      // It's a lot easier to just cast eraseStack (which is a Set, bad name I know) to a list.
      const eraseList = [...eraseStack];

      // Now bulk remove
      eraseList.forEach((stroke) =>  removeStrokes([stroke]));
      sendRemoveBoardMessage(eraseList)
      setCurrentStroke(null);
      clearEraseStack();
      return;
    }

    if (currentStroke && !(currentStroke instanceof TextStroke) && !selection.selectBoxExists) {
      // Handle magic box tool - trigger OCR on mouse up
      if (currentStroke.id === "magicbox") {
        await magicBoxTool.endMagicBox(currentStroke as ShapeStroke);
        setCurrentStroke(null);
        return;
      }
      
      finishStroke(currentStroke);
    }

    if (selection.selectBoxExists) {
      selection.endSelectBox();
    }

    if (selection.isTranslating) {
      selection.endTranslation([...focusedStrokes]);
    }
  };

  const handleMouseLeave = () => {
    setCursorDown(false);

    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
    setHoveringTranslatable(false);

    // End pan on leave
    if (brushTool === "pan") {
      panTool.endPan();
    }

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
      selection.endTranslation([...focusedStrokes]);
    }
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
