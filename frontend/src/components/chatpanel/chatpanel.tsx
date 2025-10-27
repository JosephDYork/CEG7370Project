import ChatMessage from './chatmessage';
import './chatpanel.css';

interface ChatPanelProps {
  width?: string;
  height?: string;
}

const ChatPanel = ({ width = '100%', height = '100%' }: ChatPanelProps) => {
    return (
        <div 
            className="chatpanel-container" 
            style={{ width, height }}
        >
            <div className="chatpanel-header">
                <div className="chat-title">
                    <h3>Live Chat (Translated)</h3>
                </div>
            </div>
            <div className="chatpanel-content">
                <ChatMessage userName="Alice Merrigold" languageCode="EN" originalMessage="Hello, how can I help you?" translatedMessage="Hello, how can I assist you?" />
                <ChatMessage userName="Bob Builder" languageCode="FR" originalMessage="Bonjour, comment puis-je vous aider?" translatedMessage="Hello, how can I assist you?" />
                <ChatMessage userName="Charlie Chaplin" languageCode="ES" originalMessage="Hola, ¿cómo puedo ayudarte?" translatedMessage="Hello, how can I assist you?" />
                <ChatMessage userName="Daisy Ridley" languageCode="DE" originalMessage="Hallo, wie kann ich Ihnen helfen?" translatedMessage="Hello, how can I assist you?" />
            </div>
        </div>
    );
};

export default ChatPanel;