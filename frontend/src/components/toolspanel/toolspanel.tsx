import { useMemo } from "react";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useWebSocket } from "../../hooks/web-sockets";
import { debounce } from "lodash";
import "./toolspanel.css";

const ToolsPanel = () => {
  const { sendUpdateBoardMessage } = useWebSocket();
  const { updateStrokes } = useBoardStore();
  const { brushTool, focusedStrokes, clearFocusedStrokes, addFocusedStroke, setBrushColor, setBrushSize } = useEditorStore();
  const debouncedUpdate = useMemo(() => debounce(sendUpdateBoardMessage, 100), [sendUpdateBoardMessage]);

  // We might want to just consider debouncing the whole function here tbh.
  const onBrushColorChange = (event: React.FormEvent<HTMLInputElement>) => {
    const color = event.currentTarget.value;

    setBrushColor(color);
    const newStrokes = [...focusedStrokes].map((stroke) => stroke.withUpdates({ color: color }));

    updateStrokes(newStrokes);
    debouncedUpdate(newStrokes);

    clearFocusedStrokes();
    newStrokes.forEach((stroke) => addFocusedStroke(stroke));
  };

  // Same thing with this one, although it's not as pressing as the color picking experience.
  const onBrushSizeChange = (event: React.FormEvent<HTMLInputElement>) => {
    const size = parseInt(event.currentTarget.value, 10);

    setBrushSize(size);
    const newStrokes = [...focusedStrokes].map((stroke) => {
      if (stroke.type === "text") {
        return stroke.withUpdates({ size: size * 8 })
      } else {
        return stroke.withUpdates({ size: size })
      }
  })

    updateStrokes(newStrokes);
    debouncedUpdate(newStrokes);

    clearFocusedStrokes();
    newStrokes.forEach((stroke) => addFocusedStroke(stroke));
  };

  const isToolbarVisible = () => {
    return (
      brushTool !== "pan" &&
      brushTool !== "erase" &&
      brushTool !== "magicbox" &&
      (brushTool !== "select" || focusedStrokes.size > 0)
    );
  };

  return (
    isToolbarVisible() && (
      <div className="toolspanel-container floating-ui">
        <h3 className="toolspanel-header">Brush Tools</h3>
        <p>Color:</p>
        <input
          type="color"
          className="color-picker"
          onInput={onBrushColorChange}
          defaultValue={"#000000"}
        />
        <p>Brush Size:</p>
        <input
          type="range"
          min="1"
          max="10"
          className="brush-size-slider"
          onInput={onBrushSizeChange}
          defaultValue={2}
        />
        <div className="math-symbols-grid">
        </div>
      </div>
    )
  );
};

export default ToolsPanel;
