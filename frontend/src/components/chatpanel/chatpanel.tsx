import type { ChatPanelProps } from '../../chatroomState';
import ChatMessage from './chatmessage';

import './chatpanel.css';


const ChatPanel = ({ state }: ChatPanelProps) => {
    return (
        <div className="chatpanel-container">
            <div className="chatpanel-header">
                <div className="chat-title">
                    <h3>Live Chat (Translated)</h3>
                </div>
            </div>
            <div className="chatpanel-content">
                {state?.messages.map((msg, index) => (
                    <ChatMessage 
                        key={index}
                        userName={msg.userName}
                        languageCode={msg.languageCode}
                        originalMessage={msg.originalMessage}
                        translatedMessage={msg.translatedMessage}
                    />
                ))}
            </div>
            <div className='chatpanel-input-container'>
                <input 
                    type="text" 
                    className='chatpanel-text-input' 
                    placeholder='Type your message here...' 
                />
                <button className='chatpanel-send-button'><img className='chatpanel-input-icon' src="/send.svg" height="15px" width="15px" alt="Send" /></button>
            </div>
        </div>
    );
};

export default ChatPanel;