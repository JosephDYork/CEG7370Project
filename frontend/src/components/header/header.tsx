import "./header.css";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useTranslationStore } from "../../stores/translation-store";

const Header = () => {
  const clearStrokes = useBoardStore((state) => state.clearStrokes);
  const clearUndoStack = useEditorStore((state) => state.clearUndoStack);
  const targetLanguage = useTranslationStore((state) => state.targetLanguage);
  const setTargetLanguage = useTranslationStore((state) => state.setTargetLanguage);

  return (
    <div className="header-container">
      <div className="header-logo-section">
        <img src="/polyboard.svg" alt="Polyboard" className="header-logo" />
      </div>
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
      <div className="header-actions-section">
        <button
          className="header-button header-button-clear"
          onClick={() => {
            clearStrokes();
            clearUndoStack();
          }}
        >
          Clear Canvas
        </button>
        <button className="header-button header-button-save">Save</button>
        <button className="header-button header-button-export">
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default Header;
