import React, { useEffect, useRef, useState } from "react";
import {
  WhiteboardState,
  WhiteboardStroke,
  BrushDetails,
} from "./whiteboardState";
import { ChatRoomState, ChatMessageData } from "./chatroomState";
import Header from "./components/header/header";
import Whiteboard from "./components/whiteboard/whiteboard";
import ToolsPanel from "./components/toolspanel/toolspanel";
import ChatPanel from "./components/chatpanel/chatpanel";
import Footer from "./components/footer/footer";
import "./app.css";


const App = () => {
  const cursorRef = useRef({ x: 0, y: 0, isdown: false });
  const [strokeCount, setStrokeCount] = useState(0);
  const [UndoStack, setUndoStack] = useState<Array<WhiteboardStroke>>([]);
  const [currentStroke, setCurrentStroke] = useState<WhiteboardStroke | null>(null);
  const [chatRoomState, setChatRoomState] = useState<ChatRoomState | null>(null);
  const [currentBrush, setCurrentBrush] = useState<BrushDetails>(
    new BrushDetails("#000000", 2, "pen"));
  const [whiteboardState, setWhiteboardState] = useState(
    new WhiteboardState(1.0, [])); // Just throwing in a version number for now

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorRef.current.x = x;
    cursorRef.current.y = y;

    if (cursorRef.current.isdown && currentStroke) {
      currentStroke.addPoint(x, y);
      setCurrentStroke(currentStroke);
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorRef.current.isdown = true;

    setCurrentStroke(
      new WhiteboardStroke(`stroke-${strokeCount}`, currentBrush.color,
        currentBrush.size, x, y)
    );

    setStrokeCount((prev) => prev + 1);
  };

  const handleMouseUp = () => {
    cursorRef.current.isdown = false;

    if (currentStroke) {
      setWhiteboardState((prev) => {
        const newStrokes = [...prev.strokes, currentStroke];
        return new WhiteboardState(prev.version, newStrokes);
      });
      setCurrentStroke(null);
    }
  };

  // Be sure not to nest these setter hooks or else you'll get some wonky behavior.
  const handleUndo = () => {
    if (whiteboardState.strokes.length === 0) return;

    const lastStroke =
      whiteboardState.strokes[whiteboardState.strokes.length - 1];
    if (lastStroke) {
      setUndoStack((prev) => [...prev, lastStroke]);
      setWhiteboardState((prev) => {
        const newStrokes = prev.strokes.slice(0, -1);
        return new WhiteboardState(prev.version, newStrokes);
      });
    }
  };

  const handleRedo = () => {
    if (UndoStack.length === 0) return;

    const redoStroke = UndoStack[UndoStack.length - 1];
    if (redoStroke) {
      setUndoStack((prev) => prev.slice(0, -1));
      setWhiteboardState((prevState) => {
        const newStrokes = [...prevState.strokes, redoStroke];
        return new WhiteboardState(prevState.version, newStrokes);
      });
    }
  };

  const handleClear = () => {
    setWhiteboardState((prev) => new WhiteboardState(prev.version, []));
    setUndoStack([]);
  };

  useEffect(() => {
    const fetchChatRoomState = () => {
      const simulatedMessages = [
        new ChatMessageData(
          "Alice Merrigold",
          "EN",
          "Hello, how can I help you?",
          "Hello, how can I assist you?"
        ),
        new ChatMessageData(
          "Bob Builder",
          "FR",
          "Bonjour, comment puis-je vous aider?",
          "Hello, how can I assist you?"
        ),
        new ChatMessageData(
          "Charlie Chaplin",
          "ES",
          "Hola, ¿cómo puedo ayudarte?",
          "Hello, how can I assist you?"
        ),
        new ChatMessageData(
          "Daisy Ridley",
          "DE",
          "Hallo, wie kann ich Ihnen helfen?",
          "Hello, how can I assist you?"
        ),
        new ChatMessageData(
          "Ethan Hunt",
          "IT",
          "Ciao, come posso aiutarti?",
          "Hello, how can I assist you?"
        ),
        new ChatMessageData(
          "Fiona Shrek",
          "PT",
          "Olá, como posso ajudá-lo?",
          "Hello, how can I assist you?"
        ),
        new ChatMessageData(
          "George Clooney",
          "RU",
          "Привет, чем я могу вам помочь?",
          "Hello, how can I assist you?"
        ),
      ];

      setChatRoomState(new ChatRoomState("room1", simulatedMessages));
    };

    fetchChatRoomState();
  }, []);

  return (
    <div className="App">
      <Header clearCanvasCallback={handleClear} />
      <div className="main-content">
        <ToolsPanel
          brushDetails={currentBrush}
          brushChangeCallback={setCurrentBrush}
        />
        <Whiteboard
          currentStroke={currentStroke}
          whiteboardState={whiteboardState}
          mouseMoveCallback={handleMouseMove}
          mouseDownCallback={handleMouseDown}
          mouseUpCallback={handleMouseUp}
          undoCallback={handleUndo}
          redoCallback={handleRedo}
        />
        <ChatPanel state={chatRoomState} />
      </div>
      <Footer />
    </div>
  );
};

export default App;
