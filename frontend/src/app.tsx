import { useEffect } from "react";
import { useKeyboardEvents } from "./hooks/keyboard-events";
import { useEditorStore } from "./stores/editor-store";
import Header from "./components/header/header";
import Whiteboard from "./components/whiteboard/whiteboard";
import ToolsPanel from "./components/toolspanel/toolspanel";
import ChatPanel from "./components/chatpanel/chatpanel";
import Footer from "./components/footer/footer";
import "./app.css";

const App = () => {
  const { handleKeyDown } = useKeyboardEvents();
  const editorStore = useEditorStore();

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editorStore, handleKeyDown]);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000/ws');
    websocket.onopen = () => console.log('Connected to WebSocket server');
    websocket.onmessage = (event) => {
        console.log(event.data)
    };
    websocket.onclose = () => console.log('Disconnected from WebSocket server');

    return () => websocket.close();
  }, []);

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
