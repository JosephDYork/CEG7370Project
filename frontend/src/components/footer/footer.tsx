import "./footer.css";
import { useCursorStore } from "../../stores/cursor-store";
import { useViewportStore } from "../../stores/viewport-store";
import { useWebSocket } from "../../hooks/web-sockets";

const Footer = () => {
  const cursorState = useCursorStore((state) => state);
  const viewport = useViewportStore();
  const { connectionStatus, connectWebSocket } = useWebSocket();
  const { isConnected, isConnecting } = connectionStatus;

  // Convert screen cursor position to world coordinates
  const [worldX, worldY] = viewport.screenToWorld([cursorState.x, cursorState.y]);

  const getStatusText = () => {
    if (isConnecting) return "Connecting...";
    if (isConnected) return "Connected";
    return "Disconnected";
  };

  const getStatusClass = () => {
    if (isConnecting) return "status-connecting";
    if (isConnected) return "status-connected";
    return "status-disconnected";
  };

  const handleStatusClick = () => {
    if (!isConnecting) {
      connectWebSocket();
    }
  };

  return (
    <div className="footer-container floating-ui">
      <div className="footer-status">
        <div className="connection-status" onClick={handleStatusClick}>
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
