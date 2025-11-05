import "./footer.css";
import { useCursorStore } from "../../stores/cursor-store";
import { useWebSocket } from "../../hooks/web-sockets";

const Footer = () => {
  const cursorState = useCursorStore((state) => state);
  const { connectionStatus, connectWebSocket } = useWebSocket();
  const { isConnected, isConnecting } = connectionStatus;

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
    <div className="footer-container">
      <div className="footer-status">
        <div
          className="connection-status"
          onClick={handleStatusClick}
        >
          <div className={`status-indicator ${getStatusClass()}`}></div>
          <span className="status-text">{getStatusText()}</span>
        </div>
        <span className="cursor-state">
          ({Math.round(cursorState.x)}, {Math.round(cursorState.y)})
        </span>
      </div>
    </div>
  );
};

export default Footer;
