import './footer.css';

interface FooterProps {
  width?: string;
  height?: string;
}

const Footer = ({ width = '100%', height = '100%' }: FooterProps) => {
    return (
        <div 
            className="footer-container"
            style={{ height: height, width: width }}
        >
            <div className="footer-status">
                <div className="status-dot"></div>
                <span className="status-text">Connected</span>
            </div>
        </div>
    );
};

export default Footer;