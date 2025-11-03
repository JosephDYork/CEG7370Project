import "./footer.css";
import { useCursorStore } from "../../stores/cursor-store";

const Footer = () => {
  const cursorState = useCursorStore((state) => state);

  return (
    <div className="footer-container">
      <div className="footer-status">
        <div className="status-dot"></div>
        <span className="status-text">Connected</span>
        <span className="cursor-state">
          ({Math.round(cursorState.x)}, {Math.round(cursorState.y)})
        </span>
      </div>
    </div>
  );
};

export default Footer;
