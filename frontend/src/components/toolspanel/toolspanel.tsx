import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { FreeStroke } from "../../models/free-stroke";
import { TextStroke } from "../../models/text-stroke";
import { LineStroke } from "../../models/line-stroke";
import { ShapeStroke } from "../../models/shape-stroke";
import type { StrokeType } from "../../models/strokes";
import "./toolspanel.css";

const mathSymbols = [
  "+",
  "-",
  "*",
  "÷",
  "∫",
  "∑",
  "√",
  "∏",
  "≤",
  "≥",
  "≠",
  "±",
  "∆",
  "π",
  "θ",
  "λ",
];

const ToolsPanel = () => {
  const setBrushTool = useEditorStore((state) => state.setBrushTool);
  const setBrushColor = useEditorStore((state) => state.setBrushColor);
  const setBrushSize = useEditorStore((state) => state.setBrushSize);
  const { strokes, updateAllStrokes } = useBoardStore();
  const { focusedStrokes } = useEditorStore();

  const updateFocusedStrokes = (updates: { color?: string; size?: number }) => {
    if (focusedStrokes.length > 0) {
      const updatedStrokes = strokes.map((stroke) =>
        focusedStrokes.some((focused) => focused.id === stroke.id)
          ? stroke.withUpdates(updates)
          : stroke
      );
      updateAllStrokes(updatedStrokes);
    }
  };

  const onBrushColorChange = (event: React.FormEvent<HTMLInputElement>) => {
    const color = event.currentTarget.value;
    setBrushColor(color);
    updateFocusedStrokes({ color: color });
  };

  const onBrushSizeChange = (event: React.FormEvent<HTMLInputElement>) => {
    const size = parseInt(event.currentTarget.value, 10);
    setBrushSize(size);
    updateFocusedStrokes({ size: size });
  };

  return (
    <div className="toolspanel-container">
      <h3 className="toolspanel-header">DRAWING TOOLS</h3>
      <button
        id="selectButton"
        onClick={() => setBrushTool("select")}
        className="toolspanel-button"
      >
        👆 Select
      </button>
      <button
        id="penButton"
        onClick={() => setBrushTool("pen")}
        className="toolspanel-button"
      >
        ✏️ Pen
      </button>
      <button
        id="eraserButton"
        onClick={() => setBrushTool("eraser")}
        className="toolspanel-button"
      >
        🗑️ Eraser
      </button>
      <button
        id="textButton"
        onClick={() => setBrushTool("text")}
        className="toolspanel-button"
      >
        📝 Text
      </button>
      <button
        id="lineButton"
        onClick={() => setBrushTool("line")}
        className="toolspanel-button"
      >
        📏 Line
      </button>
      <button
        id="squareButton"
        onClick={() => setBrushTool("square")}
        className="toolspanel-button"
      >
        ⬜ Square
      </button>
      <button
        id="ellipseButton"
        onClick={() => setBrushTool("ellipse")}
        className="toolspanel-button"
      >
        ⬭ Ellipse
      </button>
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
      <h3 className="toolspanel-header">MATH SYMBOLS</h3>
      <div className="math-symbols-grid">
        {mathSymbols.map((symbol) => (
          <button key={symbol} className="math-symbol-button">
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolsPanel;
