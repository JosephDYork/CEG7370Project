import { useEffect } from "react";
import { useKeyboardEvents } from "./hooks/keyboard-events";
import Header from "./components/header/header";
import Whiteboard from "./components/whiteboard/whiteboard";
import ToolsPanel from "./components/toolspanel/toolspanel";
import ChatPanel from "./components/chatpanel/chatpanel";
import Footer from "./components/footer/footer";
import "./app.css";

const App = () => {
  const { handleKeyDown } = useKeyboardEvents();

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="app">
      <Whiteboard />
      <div className="main-content">
        <Header />
        <ToolsPanel />
        <ChatPanel />
        <Footer />
      </div>
    </div>
  );
};

export default App;
