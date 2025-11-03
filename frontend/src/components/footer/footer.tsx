import './footer.css';
import { CursorState } from '../../editor-state';

export type FooterProps = {
    cursorState: React.RefObject<CursorState>;
};

const Footer = ({ cursorState }: FooterProps) => {
    return (
        <div className="footer-container">
            <div className="footer-status">
                <div className="status-dot"></div>
                <span className="status-text">Connected</span>
                <span className="cursor-state">({Math.round(cursorState.current?.x)}, {Math.round(cursorState.current?.y)})</span>
            </div>
        </div>
    );
};

export default Footer;