import React from 'react';

interface ChatPanelProps {
  width?: string;
  height?: string;
}

const ChatPanel = ({ width = '100%', height = '100%' }: ChatPanelProps) => {
    return (
        <div style={{ width, height, borderLeft: '1px solid #ccc' }}></div>
    );
};

export default ChatPanel;