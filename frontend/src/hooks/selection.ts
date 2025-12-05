import { useState } from "react";
import { FreeStroke } from "../models/free-stroke";
import { TextStroke } from "../models/text-stroke";
import { LineStroke } from "../models/line-stroke";
import { ShapeStroke } from "../models/shape-stroke";
import type { Stroke } from "../models/strokes";
import { useEditorStore } from "../stores/editor-store";
import { useBoardStore } from "../stores/board-store";
import { useWebSocket } from "./web-sockets";

export const useSelectionTool = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectBoxExists, setSelectBoxExists] = useState(false);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(
    null
  );

  const { strokes, updateStrokes } = useBoardStore();
  const { sendUpdateBoardMessage } = useWebSocket();
  const { addFocusedStroke, clearFocusedStrokes, setCurrentStroke } =
    useEditorStore();

  const startSelectBox = (coords: [number, number]) => {
    setSelectBoxExists(true);
    clearFocusedStrokes();
    const selectBox = new ShapeStroke(
      "selectbox",
      "#0000FF",
      2,
      "square",
      "#0000FF22",
      coords,
      coords,
      Number.MAX_SAFE_INTEGER
    );
    setCurrentStroke(selectBox);
    return selectBox;
  };

  const updateSelectBox = (
    selectBox: ShapeStroke,
    coords: [number, number],
  ) => {
    const updatedSelectBox = selectBox.updateTermination(coords[0], coords[1]);
    setCurrentStroke(updatedSelectBox);

    clearFocusedStrokes();
    strokes.forEach((stroke) => {
      const strokeBBox = stroke.getBoundingBox()

      if (updatedSelectBox.isRectangleInsideRectangle(strokeBBox)) {
        addFocusedStroke(stroke);
      }
    });
  };

  const endSelectBox = () => {
    setSelectBoxExists(false);
    setCurrentStroke(null);
  };

  const startTranslation = (coords: [number, number]) => {
    setIsTranslating(true);
    setOriginCoords(coords);
  };

  const translateStrokes = (
    currentCoords: [number, number],
    strokes: Stroke[]
  ) => {
    if (!originCoords) return;

    const [deltaX, deltaY] = [
      currentCoords[0] - originCoords[0],
      currentCoords[1] - originCoords[1],
    ];

    strokes.forEach((stroke) => {
      switch (stroke.type) {
        case "free":
          const freeStroke = stroke as FreeStroke;
          freeStroke.points.forEach((point) => {
            point[0] += deltaX;
            point[1] += deltaY;
          });
          break;
        case "text":
          const textStroke = stroke as TextStroke;
          textStroke.position[0] += deltaX;
          textStroke.position[1] += deltaY;
          break;
        case "line":
          const lineStroke = stroke as LineStroke;
          lineStroke.startPoint[0] += deltaX;
          lineStroke.startPoint[1] += deltaY;
          lineStroke.endPoint[0] += deltaX;
          lineStroke.endPoint[1] += deltaY;
          break;
        case "shape":
          const shapeStroke = stroke as ShapeStroke;
          shapeStroke.origin[0] += deltaX;
          shapeStroke.origin[1] += deltaY;
          shapeStroke.termination[0] += deltaX;
          shapeStroke.termination[1] += deltaY;
          break;
      }
    });

    updateStrokes(strokes);
    setOriginCoords(currentCoords);
  };

  const endTranslation = (strokes: Stroke[]) => {
    updateStrokes(strokes);
    sendUpdateBoardMessage(strokes);
    setIsTranslating(false);
    setOriginCoords(null);
  };

  return {
    selectBoxExists,
    isTranslating,
    startSelectBox,
    updateSelectBox,
    endSelectBox,
    startTranslation,
    translateStrokes,
    endTranslation,
  };
};
