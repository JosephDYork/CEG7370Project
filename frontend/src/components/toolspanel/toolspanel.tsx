import { useMemo } from "react";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useWebSocket } from "../../hooks/web-sockets";
import { debounce } from "lodash";
import "./toolspanel.css";

const ToolsPanel = () => {
  const { sendUpdateBoardMessage } = useWebSocket();
  const { strokes,updateStrokes } = useBoardStore();
  const { brushTool, focusedStrokes, brushColor, brushSize, brushFillColor, setCurrentTopStrokeNumber, clearFocusedStrokes, addFocusedStroke, setBrushColor, setBrushSize, setBrushFillColor } = useEditorStore();
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

  const onBrushFillColorChange = (event: React.FormEvent<HTMLInputElement>) => {
    const color = event.currentTarget.value;

    setBrushFillColor(color);
    const newStrokes = [...focusedStrokes].map((stroke) => stroke.withUpdates({ fillColor: color }));
    updateStrokes(newStrokes);
    debouncedUpdate(newStrokes);

    clearFocusedStrokes();
    newStrokes.forEach((stroke) => addFocusedStroke(stroke));
  };

  const sendStrokesToFront = () => {
    const maxStrokeOrder = Math.max(...strokes.map(s => s.strokeOrder));

    setCurrentTopStrokeNumber(maxStrokeOrder + 1);
    const newStrokes = [...focusedStrokes].map(
      (stroke) => stroke.withUpdates({ strokeOrder: maxStrokeOrder + 1 })
    );

    updateStrokes(newStrokes);
    sendUpdateBoardMessage(newStrokes);
  }

  const sendStrokesToBack = () => {
    const minStrokeOrder = Math.min(...strokes.map(s => s.strokeOrder));
    const newStrokes = [...focusedStrokes].map(
      (stroke) => stroke.withUpdates({ strokeOrder: minStrokeOrder - 1 })
    );

    updateStrokes(newStrokes);
    sendUpdateBoardMessage(newStrokes);
  }

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
          defaultValue={brushColor}
        />
        <p>Fill Color:</p>
        <input
          type="color"
          className="color-picker"
          onInput={onBrushFillColorChange}
          defaultValue={brushFillColor}
        />
        <p>Brush Size:</p>
        <input
          type="range"
          min="1"
          max="10"
          className="brush-size-slider"
          onInput={onBrushSizeChange}
          defaultValue={brushSize}
        />
        <button 
          className="send-to-front-button"
          onClick={sendStrokesToFront}
          >
            Send to front
        </button>
        <button 
          className="send-to-front-button"
          onClick={sendStrokesToBack}
          >
            Send to back
        </button>
      </div>
    )
  );
};

export default ToolsPanel;
