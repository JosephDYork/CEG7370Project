import './chatmessage.css';

interface ChatMessageProps {
  userName?: string;
  languageCode?: string;
  originalMessage?: string;
  translatedMessage?: string;
}

const ChatMessage = ({ userName, languageCode, originalMessage, translatedMessage }: ChatMessageProps) => {
    return (
        <div className="chatmessage-container">
            <div className="title-container">
                <h3 className="language-code">{languageCode}</h3>
                <h3 className="user-name">{userName}</h3>
            </div>
            <div className="message-bubble">
                <p className="original-message">{originalMessage}</p>
                <p className="translated-message">{translatedMessage}</p>
            </div>
        </div>
    );
};

export default ChatMessage;
