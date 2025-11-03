import { useEffect } from "react";
import { useKeyboardEvents } from "./hooks/keyboard-events";
import { useEditorStore } from "./stores/editor-store";
import { useChatStore } from "./stores/chat-store";
import { ChatMessage } from "./stores/chat-store";
import Header from "./components/header/header";
import Whiteboard from "./components/whiteboard/whiteboard";
import ToolsPanel from "./components/toolspanel/toolspanel";
import ChatPanel from "./components/chatpanel/chatpanel";
import Footer from "./components/footer/footer";
import "./app.css";

const App = () => {
  const { handleKeyDown } = useKeyboardEvents();
  const editorStore = useEditorStore();
  const chatStore = useChatStore();

  const fetchChatRoomState = () => {
    return [
      new ChatMessage(
        "Alice Merrigold",
        "EN",
        "Hello, how can I help you?",
        "Hello, how can I assist you?"
      ),
      new ChatMessage(
        "Bob Builder",
        "FR",
        "Bonjour, comment puis-je vous aider?",
        "Hello, how can I assist you?"
      ),
      new ChatMessage(
        "Charlie Chaplin",
        "ES",
        "Hola, ¿cómo puedo ayudarte?",
        "Hello, how can I assist you?"
      ),
      new ChatMessage(
        "Daisy Ridley",
        "DE",
        "Hallo, wie kann ich Ihnen helfen?",
        "Hello, how can I assist you?"
      ),
      new ChatMessage(
        "Ethan Hunt",
        "IT",
        "Ciao, come posso aiutarti?",
        "Hello, how can I assist you?"
      ),
      new ChatMessage(
        "Fiona Shrek",
        "PT",
        "Olá, como posso ajudá-lo?",
        "Hello, how can I assist you?"
      ),
      new ChatMessage(
        "George Clooney",
        "RU",
        "Привет, чем я могу вам помочь?",
        "Hello, how can I assist you?"
      ),
    ];
  };

  useEffect(() => {
    const simulatedMessages = fetchChatRoomState();
    simulatedMessages.forEach((msg) => chatStore.addMessage(msg));
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editorStore, handleKeyDown]);

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <ToolsPanel />
        <Whiteboard />
        <ChatPanel />
      </div>
      <Footer />
    </div>
  );
};

export default App;
