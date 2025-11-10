import { useState } from "react";
import { FreeStroke, TextStroke, LineStroke, ShapeStroke } from "../strokes";
import { useBoardStore } from "../stores/board-store";
import { useWebSocket } from "./web-sockets";

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(
    null
  );
  const { forceUpdate } = useBoardStore();
  const { sendBoardUpdate } = useWebSocket();
  const startTranslation = (coords: [number, number]) => {
    setIsTranslating(true);
    setOriginCoords(coords);
  };

  const translateStrokes = (
    currentCoords: [number, number],
    strokes: (FreeStroke | TextStroke | LineStroke | ShapeStroke)[]
  ) => {
    if (!originCoords) return;

    const [deltaX, deltaY] = [
      currentCoords[0] - originCoords[0],
      currentCoords[1] - originCoords[1],
    ];

    strokes.forEach((stroke) => {
      if (stroke instanceof FreeStroke) {
        stroke.points.forEach((point) => {
          point[0] += deltaX;
          point[1] += deltaY;
        });
      } else if (stroke instanceof TextStroke) {
        stroke.position[0] += deltaX;
        stroke.position[1] += deltaY;
      } else if (stroke instanceof LineStroke) {
        stroke.startPoint[0] += deltaX;
        stroke.startPoint[1] += deltaY;
        stroke.endPoint[0] += deltaX;
        stroke.endPoint[1] += deltaY;
      } else if (stroke instanceof ShapeStroke) {
        stroke.origin[0] += deltaX;
        stroke.origin[1] += deltaY;
        stroke.termination[0] += deltaX;
        stroke.termination[1] += deltaY;
      }
    });

    forceUpdate();
    setOriginCoords(currentCoords);
  };

  const endTranslation = () => {
    setIsTranslating(false);
    setOriginCoords(null);
    sendBoardUpdate();
  };

  return {
    isTranslating,
    startTranslation,
    translateStrokes,
    endTranslation,
  };
};
