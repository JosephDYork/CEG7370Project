import ChatMessage from "../chatmessage/chatmessage";
import { useChatStore, ChatMessage as ChatMessageModel } from "../../stores/chat-store";
import "./chatpanel.css";
import { useState } from "react";
import { useEditorStore } from "../../stores/editor-store";
import { useWebSocket } from "../../hooks/web-sockets";

const ChatPanel = () => {
  const { sendChatMessage } = useWebSocket();
  const { getCurrentLanguage, username } = useEditorStore();
  const {messages, addMessages, removeMessages } = useChatStore();

  const [text, setText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);


  const sendMessage = async () => {
    if (!text || text.trim().length === 0) return;

    const languageCode = getCurrentLanguage();
    const originalMessage = text.trim();
    const optimistic = new ChatMessageModel(username, languageCode, originalMessage, "Translating...");

    // Add optimistic message
    addMessages([optimistic]);
    setText("");

    try {
      const resp = await fetch("/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: originalMessage,
          target_language: languageCode,
        }),
      });

      const data = await resp.json();
      const translated = data?.translated_text ?? `${originalMessage} [translated to ${languageCode}]`;

      // Replace optimistic message (last one) with final translated message
      const currentMessages = useChatStore.getState().messages;
      const lastIndex = currentMessages.length - 1;
      if (lastIndex >= 0) {
        removeMessages([lastIndex]);
      }

      const updated = new ChatMessageModel(username, languageCode, originalMessage, translated);
      addMessages([updated]);
      sendChatMessage(updated);
    } catch {
      const fallback = `${originalMessage} [translated to ${languageCode}]`;
      const currentMessages = useChatStore.getState().messages;
      const lastIndex = currentMessages.length - 1;
      if (lastIndex >= 0) {
        removeMessages([lastIndex]);
      }
      const updated = new ChatMessageModel(username, languageCode, originalMessage, fallback);
      addMessages([updated]);
      sendChatMessage(updated);
    }
  };

  return (
    <div className={`chatpanel-container floating-ui ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="chatpanel-toggle-button" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
              <path fill-rule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
            </svg>
          ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
                <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
              </svg>
          )}
      </button>
      {!isCollapsed && (
        <>
          <div className="chatpanel-header">
            <div className="chat-title">
              <h3>Live Chat (Translated)</h3>
            </div>
          </div>
          <div className="chatpanel-content">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                userName={msg.userName}
                languageCode={msg.languageCode}
                originalMessage={msg.originalMessage}
                translatedMessage={msg.translatedMessage}
              />
            ))}
          </div>
          <div className="chatpanel-input-container">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              type="text"
              className="chatpanel-text-input"
              placeholder="Type your message here..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button className="chatpanel-send-button" onClick={sendMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPanel;
