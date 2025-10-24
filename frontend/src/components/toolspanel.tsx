import React from 'react';

interface ToolsPanelProps {
  width?: string;
  height?: string;
}

const ToolsPanel = ({ width = '100%', height = '100%' }: ToolsPanelProps) => {
    return (
        <div style={{ width, height, borderLeft: '1px solid #ccc' }}></div>
    );
};

export default ToolsPanel;