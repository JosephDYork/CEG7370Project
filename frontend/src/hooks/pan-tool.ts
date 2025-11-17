import { useViewportStore } from "../stores/viewport-store";
import { useEditorStore } from "../stores/editor-store";

export const usePanTool = () => {
  const { isPanning, pan, setIsPanning } = useViewportStore();
  const { brushTool } = useEditorStore();

  let lastPanX = 0;
  let lastPanY = 0;

  const startPan = (x: number, y: number) => {
    if (brushTool === "pan") {
      setIsPanning(true);
      lastPanX = x;
      lastPanY = y;
    }
  };

  const updatePan = (x: number, y: number) => {
    if (isPanning && brushTool === "pan") {
      const dx = x - lastPanX;
      const dy = y - lastPanY;
      pan(dx, dy);
      lastPanX = x;
      lastPanY = y;
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
