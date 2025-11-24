import "./header.css";
import { useBoardStore } from "../../stores/board-store";
import { useEditorStore } from "../../stores/editor-store";
import { useTranslationStore } from "../../stores/translation-store";
import { useViewportStore } from "../../stores/viewport-store";
import { useUndoRedo } from "../../hooks/undo-redo";
import { exportWhiteboardToSVG } from "../../utils/svg-export";
import { useWebSocket } from "../../hooks/web-sockets";

const getFocusedButtonClass = (bool: boolean) => {
  return bool ? "header-bar-button selected" : "header-bar-button";
}

const Header = () => {
  const { strokes, removeStrokes } = useBoardStore();
  const { brushTool, setBrushTool } = useEditorStore();
  const targetLanguage = useTranslationStore((state) => state.targetLanguage);
  const { clearStrokes, strokes } = useBoardStore();
  const { handleUndo, handleRedo } = useUndoRedo();
  const { sendUpdateBoardMessage } = useWebSocket();
  const setTargetLanguage = useTranslationStore(
    (state) => state.setTargetLanguage
  );

  const handleResetView = () => {
    viewport.resetViewport();
  };

  const handleExportSVG = () => {
    const defaultFilename = `polyboard-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)}.svg`;
    const filename = prompt("Enter filename for SVG export:", defaultFilename);
    
    if (filename) {
      // Ensure .svg extension
      const finalFilename = filename.endsWith('.svg') ? filename : `${filename}.svg`;
      exportWhiteboardToSVG(strokes, finalFilename);
    }
  };

  return (
    <div className="header-container floating-ui">
      <div className="header-logo-section">
        <img src="/polyboard.svg" alt="Polyboard" className="header-logo" />
      </div>
      <div className="header-bar-wrapper">
        <button title="Pan View" className={getFocusedButtonClass(brushTool == "pan")}
        onClick={() => setBrushTool("pan")}>
          🖐
        </button>
        <button title="Select Tool" className={getFocusedButtonClass(brushTool == "select")}
        onClick={() => setBrushTool("select")}>
          👆
        </button>
        <button title="Erase Tool" className={getFocusedButtonClass(brushTool == "erase")}
        onClick={() => setBrushTool("erase")}>
          🧼
        </button>
        <button title="Draw Tool" className={getFocusedButtonClass(brushTool == "pen")}
        onClick={() => setBrushTool("pen")}>
          ✏
        </button>
        <button title="Text Tool" className={getFocusedButtonClass(brushTool == "text")}
        onClick={() => setBrushTool("text")}>
          📝
        </button>
        <button title="Line Tool" className={getFocusedButtonClass(brushTool == "line")}
        onClick={() => setBrushTool("line")}>
          📏
        </button>
        <button title="Rectangle Tool" className={getFocusedButtonClass(brushTool == "square")}
        onClick={() => setBrushTool("square")}>
          ⬜
        </button>
        <button title="Ellipse Tool" className={getFocusedButtonClass(brushTool == "ellipse")}
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
          onClick={() => {
            removeStrokes(strokes)
            sendUpdateBoardMessage(strokes)
          }}
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
        <button 
          className="header-button header-button-reset"
          onClick={handleResetView}
          title="Reset View (Center & Zoom 100%)"
        >
          🎯 Reset View
        </button>
        <button 
          className="header-button header-button-export"
          onClick={handleExportSVG}
          title="Export whiteboard as SVG"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default Header;
