import { useMemo } from "react";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useWebSocket } from "../../hooks/web-sockets"
import { debounce } from "lodash";
import "./toolspanel.css";

const ToolsPanel = () => {
  const { sendUpdateBoardMessage } = useWebSocket()
  const { updateStrokes } = useBoardStore();
  const { focusedStrokes, setBrushColor, setBrushSize } = useEditorStore();
  const debouncedUpdate = useMemo(() => debounce(sendUpdateBoardMessage, 100), []);

  // We might want to just consider debouncing the whole function here tbh.
  const onBrushColorChange = (event: React.FormEvent<HTMLInputElement>) => {
    const color = event.currentTarget.value;
    setBrushColor(color);
    updateStrokes(
      [...focusedStrokes].map((stroke) => stroke.withUpdates({ color: color }))
    );
    debouncedUpdate(
      [...focusedStrokes].map((stroke) => stroke.withUpdates({ color: color }))
    )
  };

  // Same thing with this one, although it's not as pressing as the color picking experience.
  const onBrushSizeChange = (event: React.FormEvent<HTMLInputElement>) => {
    const size = parseInt(event.currentTarget.value, 10);
    setBrushSize(size);
    updateStrokes(
      [...focusedStrokes].map((stroke) => stroke.withUpdates({ size: size }))
    );
    debouncedUpdate(
      [...focusedStrokes].map((stroke) => stroke.withUpdates({ size: size }))
    )
  };

  return (
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
  );
};

export default ToolsPanel;
