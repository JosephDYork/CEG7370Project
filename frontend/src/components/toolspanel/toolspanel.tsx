import { useEditorStore } from "../../stores/editor-store";
import "./toolspanel.css";

const mathSymbols = [
    "+", "-", "*", "/",
    "÷", "∫", "∑", "√",
    "∏", "∂", "∞", "≤",
    "≥", "≠", "±", "∆",
    "π", "β", "θ", "λ",
];

const ToolsPanel = () => {
  const setBrushTool = useEditorStore((state) => state.setBrushTool);
  const setBrushColor = useEditorStore((state) => state.setBrushColor);
  const setBrushSize = useEditorStore((state) => state.setBrushSize);

  const onBrushColorChange = (event: React.FormEvent<HTMLInputElement>) => {
    const color = event.currentTarget.value;
    setBrushColor(color);
  };

  const onBrushSizeChange = (event: React.FormEvent<HTMLInputElement>) => {
    const size = parseInt(event.currentTarget.value, 10);
    setBrushSize(size);
  };

  return (
    <div className="toolspanel-container">
      <h3 className="toolspanel-header">DRAWING TOOLS</h3>
      <button
        id="selectButton"
        onClick={() => setBrushTool("select")}
        className="toolspanel-button"
      >
        📐 Select
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
        id="linesButton"
        onClick={() => setBrushTool("line")}
        className="toolspanel-button"
      >
        → Lines
      </button>
      <p>Color:</p>
      <input
        type="color"
        className="color-picker"
        onInput={onBrushColorChange}
      />
      <p>Brush Size:</p>
      <input
        type="range"
        min="1"
        max="10"
        className="brush-size-slider"
        onInput={onBrushSizeChange}
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
