import type React from "react";
import { BrushDetails } from "../../whiteboardState";
import "./toolspanel.css";

interface ToolsPanelProps {
  brushDetails: BrushDetails;
  brushChangeCallback: (brush: BrushDetails) => void;
}

const mathSymbols = [
    "+", "-", "*", "/",
    "÷", "∫", "∑", "√",
    "∏", "∂", "∞", "≤",
    "≥", "≠", "±", "∆",
    "π", "β", "θ", "λ",
];

const ToolsPanel = ({ brushDetails, brushChangeCallback }: ToolsPanelProps) => {
  const onToolChange = (toolString: string) => {
    const newBrush = new BrushDetails(
      brushDetails.color,
      brushDetails.size,
      toolString
    );
    brushChangeCallback(newBrush);
  };

  const onBrushColorChange = (e: React.InputEvent<HTMLInputElement>) => {
    const newBrush = new BrushDetails(
      e.currentTarget.value,
      brushDetails.size,
      brushDetails.tool
    );
    brushChangeCallback(newBrush);
  };

  const onBrushSizeChange = (e: React.InputEvent<HTMLInputElement>) => {
    const newBrush = new BrushDetails(
      brushDetails.color,
      e.currentTarget.valueAsNumber,
      brushDetails.tool
    );
    brushChangeCallback(newBrush);
  };

  return (
    <div className="toolspanel-container">
      <h3 className="toolspanel-header">DRAWING TOOLS</h3>
      <button
        id="undoButton"
        onClick={() => onToolChange("pen")}
        className="toolspanel-button"
      >
        ✏️ Pen
      </button>
      <button
        id="redoButton"
        onClick={() => onToolChange("eraser")}
        className="toolspanel-button"
      >
        🗑️ Eraser
      </button>
      <button
        id="textButton"
        onClick={() => onToolChange("text")}
        className="toolspanel-button"
      >
        📝 Text
      </button>
      <button
        id="linesButton"
        onClick={() => onToolChange("lines")}
        className="toolspanel-button"
      >
        → Lines
      </button>
      <button
        id="shapesButton"
        onClick={() => onToolChange("shapes")}
        className="toolspanel-button"
      >
        📐 Shapes
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
