import { useRef } from "react";
import { useViewportStore } from "../stores/viewport-store";
import { useEditorStore } from "../stores/editor-store";

export const usePanTool = () => {
  const { isPanning, pan, setIsPanning } = useViewportStore();
  const { brushTool } = useEditorStore();

  const lastPanPos = useRef({ x: 0, y: 0 });

  const startPan = (x: number, y: number) => {
    if (brushTool === "pan") {
      setIsPanning(true);
      lastPanPos.current = { x, y };
    }
  };

  const updatePan = (x: number, y: number) => {
    if (isPanning && brushTool === "pan") {
      const dx = x - lastPanPos.current.x;
      const dy = y - lastPanPos.current.y;
      pan(dx, dy);
      lastPanPos.current = { x, y };
    }
  };

  const endPan = () => {
    if (brushTool === "pan") {
      setIsPanning(false);
    }
  };

  const isPanActive = () => {
    return brushTool === "pan";
  };

  return {
    startPan,
    updatePan,
    endPan,
    isPanActive,
    isPanning,
  };
};
