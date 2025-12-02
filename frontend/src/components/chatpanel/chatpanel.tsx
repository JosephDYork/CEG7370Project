import ChatMessage from "../chatmessage/chatmessage";
import { useChatStore, ChatMessage as ChatMessageModel } from "../../stores/chat-store";
import "./chatpanel.css";
import { useState } from "react";
import api from "../../api";
import { useEditorStore } from "../../stores/editor-store";
import { useWebSocket } from "../../hooks/web-sockets";

const ChatPanel = () => {
  const [text, setText] = useState("");
  const {messages, addMessages, removeMessages } = useChatStore();
  const { getCurrentLanguage } = useEditorStore();
  const { sendChatMessage } = useWebSocket();

  const sendMessage = async () => {
    if (!text || text.trim().length === 0) return;

    const userName = "You";
    const languageCode = getCurrentLanguage();
    const originalMessage = text.trim();
    const optimistic = new ChatMessageModel(userName, languageCode, originalMessage, "Translating...");

    // Add optimistic message
    addMessages([optimistic]);
    setText("");

    try {
      const resp = await api.post("/translate", {
        text: originalMessage,
        target_language: languageCode,
      });

      const translated = resp?.data?.translated_text ?? `${originalMessage} [translated to ${languageCode}]`;

      // Replace optimistic message (last one) with final translated message
      const currentMessages = useChatStore.getState().messages;
      const lastIndex = currentMessages.length - 1;
      if (lastIndex >= 0) {
        removeMessages([lastIndex]);
      }

      const updated = new ChatMessageModel(userName, languageCode, originalMessage, translated);
      addMessages([updated]);
      sendChatMessage(updated);
    } catch {
      const fallback = `${originalMessage} [translated to ${languageCode}]`;
      const currentMessages = useChatStore.getState().messages;
      const lastIndex = currentMessages.length - 1;
      if (lastIndex >= 0) {
        removeMessages([lastIndex]);
      }
      const updated = new ChatMessageModel(userName, languageCode, originalMessage, fallback);
      addMessages([updated]);
      sendChatMessage(updated);
    }
  };

  return (
    <div className="chatpanel-container floating-ui">
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
          <img
            className="chatpanel-input-icon"
            src="/send.svg"
            height="15px"
            width="15px"
            alt="Send"
          />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
