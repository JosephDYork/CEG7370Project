import "./header.css";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";

const Header = () => {
  const clearStrokes = useBoardStore((state) => state.clearStrokes);
  const clearUndoStack = useEditorStore((state) => state.clearUndoStack);

  return (
    <div className="header-container">
      <div className="header-logo-section">
        <img src="/polyboard.svg" alt="Polyboard" className="header-logo" />
      </div>
      <div className="header-language-section">
        <select className="header-language-select">
          <option value="workspace1">English</option>
          <option value="workspace2">Spanish</option>
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
