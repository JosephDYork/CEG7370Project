import type React from "react";
import { EditorState } from "../../editor-state";
import "./toolspanel.css";

interface ToolsPanelProps {
  editorState: EditorState;
  editorChangeCallback: (newEditorState: EditorState) => void;
}

const mathSymbols = [
    "+", "-", "*", "/",
    "÷", "∫", "∑", "√",
    "∏", "∂", "∞", "≤",
    "≥", "≠", "±", "∆",
    "π", "β", "θ", "λ",
];

const ToolsPanel = ({ editorState, editorChangeCallback }: ToolsPanelProps) => {
  const onToolChange = (toolString: string) => {
    editorChangeCallback(editorState.setBrushTool(toolString));
  };

  const onBrushColorChange = (e: React.InputEvent<HTMLInputElement>) => {
    editorChangeCallback(editorState.setBrushColor(e.currentTarget.value));
  };

  const onBrushSizeChange = (e: React.InputEvent<HTMLInputElement>) => {
    editorChangeCallback(editorState.setBrushSize(parseInt(e.currentTarget.value)));
  };

  return (
    <div className="toolspanel-container">
      <h3 className="toolspanel-header">DRAWING TOOLS</h3>
      <button
        id="selectButton"
        onClick={() => onToolChange("select")}
        className="toolspanel-button"
      >
        📐 Select
      </button>
      <button
        id="penButton"
        onClick={() => onToolChange("pen")}
        className="toolspanel-button"
      >
        ✏️ Pen
      </button>
      <button
        id="eraserButton"
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
        onClick={() => onToolChange("line")}
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
