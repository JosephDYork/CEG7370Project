import "./footer.css";
import { useCursorStore } from "../../stores/cursor-store";
import { useViewportStore } from "../../stores/viewport-store";
import { useEditorStore } from "../../stores/editor-store";

const Footer = () => {
  const cursorState = useCursorStore((state) => state);
  const viewport = useViewportStore();
  const { isSocketConnected } = useEditorStore()
  const [worldX, worldY] = viewport.screenToWorld([cursorState.x, cursorState.y]);

  const getStatusText = () => {
    if (isSocketConnected) return "Connected";
    return "Disconnected";
  };

  const getStatusClass = () => {
    if (isSocketConnected) return "status-connected";
    return "status-disconnected";
  };

  return (
    <div className="footer-container floating-ui">
      <div className="footer-status">
        <div className="connection-status">
          <div className={`status-indicator ${getStatusClass()}`}></div>
          <span className="status-text">{getStatusText()}</span>
        </div>
        <span className="cursor-state">
          ({Math.round(worldX)}, {Math.round(worldY)})
        </span>
        <span className="zoom-level">
          {Math.round(viewport.zoom * 100)}%
        </span>
      </div>
    </div>
  );
};

export default Footer;
