import "./header.css";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useTranslationStore } from "../../stores/translation-store";
import { useUndoRedo } from "../../hooks/undo-redo";

const getFocusedButtonClass = (bool: boolean) => {
  return bool ? "header-bar-button" : "header-bar-button selected";
}

const Header = () => {
  const targetLanguage = useTranslationStore((state) => state.targetLanguage);
  const currentTool = useEditorStore((state) => state.brushTool);
  const setBrushTool = useEditorStore((state) => state.setBrushTool);
  const clearStrokes = useBoardStore((state) => state.clearStrokes);
  const { handleUndo, handleRedo } = useUndoRedo();
  const setTargetLanguage = useTranslationStore(
    (state) => state.setTargetLanguage
  );

  return (
    <div className="header-container floating-ui">
      <div className="header-logo-section">
        <img src="/polyboard.svg" alt="Polyboard" className="header-logo" />
      </div>
      <div className="header-bar-wrapper">
        <button title="Pan View" className={getFocusedButtonClass(currentTool !== "pan")}>
          🖐
        </button>
        <button title="Select Tool" className={getFocusedButtonClass(currentTool !== "select")}
        onClick={() => setBrushTool("select")}>
          👆
        </button>
        <button title="Erase Tool" className={getFocusedButtonClass(currentTool !== "erase")}
        onClick={() => setBrushTool("erase")}>
          🧼
        </button>
        <button title="Draw Tool" className={getFocusedButtonClass(currentTool !== "pen")}
        onClick={() => setBrushTool("pen")}>
          ✏
        </button>
        <button title="Text Tool" className={getFocusedButtonClass(currentTool !== "text")}
        onClick={() => setBrushTool("text")}>
          📝
        </button>
        <button title="Line Tool" className={getFocusedButtonClass(currentTool !== "line")}
        onClick={() => setBrushTool("line")}>
          📏
        </button>
        <button title="Rectangle Tool" className={getFocusedButtonClass(currentTool !== "square")}
        onClick={() => setBrushTool("square")}>
          ⬜
        </button>
        <button title="Ellipse Tool" className={getFocusedButtonClass(currentTool !== "ellipse")}
        onClick={() => setBrushTool("ellipse")}>
          ⬭
        </button>
        <button
          title="Undo Tool"
          className="header-bar-button"
          onClick={handleUndo}
        >
          ↩
        </button>
        <button
          title="Redo Tool"
          className="header-bar-button"
          onClick={handleRedo}
        >
          ↪
        </button>
        <button
          title="Clear Tool"
          className="header-bar-button"
          onClick={clearStrokes}
        >
          🗑️
        </button>
        <div className="header-language-section">
          <select
            className="header-language-select"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </div>
      <div className="header-actions-section">
        <button className="header-button header-button-export">
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default Header;
