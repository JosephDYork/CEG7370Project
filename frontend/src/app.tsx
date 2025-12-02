import { useEffect } from "react";
import { useKeyboardEvents } from "./hooks/keyboard-events";
import Header from "./components/header/header";
import Whiteboard from "./components/whiteboard/whiteboard";
import ToolsPanel from "./components/toolspanel/toolspanel";
import ChatPanel from "./components/chatpanel/chatpanel";
import Footer from "./components/footer/footer";
import { OCRProgress } from "./components/ocr-progress/ocr-progress";
import { WelcomePanel } from "./components/welcomepanel/welcomepanel";
import "./app.css";

const App = () => {
  const { handleKeyDown, handleKeyUp } = useKeyboardEvents();

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="app">
      <Whiteboard />
      <div className="main-content">
        <Header />
        <ToolsPanel />
        <ChatPanel />
        <Footer />
      </div>
      <OCRProgress />
      <WelcomePanel />
    </div>
  );
};

export default App;
