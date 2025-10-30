import './header.css';

interface HeaderProps {
    clearCanvasCallback?: () => void;
}

const Header = ({ clearCanvasCallback }: HeaderProps) => {
    return (
        <div className="header-container" >
            <div className="header-logo-section">
                <img
                    src="/polyboard.svg"
                    alt="Polyboard"
                    className="header-logo"
                />
            </div>
            <div className="header-language-section">
                <select className="header-language-select">
                    <option value="workspace1">English</option>
                    <option value="workspace2">Spanish</option>
                </select>
            </div>
            <div className="header-actions-section">
                <button className="header-button header-button-clear" onClick={clearCanvasCallback}>
                    Clear Canvas
                </button>
                <button className="header-button header-button-save">
                    Save
                </button>
                <button className="header-button header-button-export">
                    Export PDF
                </button>
            </div>
        </div>
    );
};

export default Header;