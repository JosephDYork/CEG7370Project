import './toolspanel.css';

interface ToolsPanelProps {
  width?: string;
  height?: string;
}

const ToolsPanel = ({ width = '100%', height = '100%' }: ToolsPanelProps) => {
    return (
        <div 
            className="toolspanel-container"
            style={{ width, height }}
        >
        </div>
    );
};

export default ToolsPanel;