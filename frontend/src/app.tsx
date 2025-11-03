import { useEffect, useRef, useState } from "react";
import { WhiteboardState } from "./board-state";
import { ChatRoomState, ChatMessageData } from "./chatroomState";
import { FreeBrushStroke } from "./free-brush";
import { TextBrushStroke } from "./text-brush";
import { LineBrushStroke } from "./line-brush";
import { CursorState, EditorState } from "./editor-state";
import {
  mouseDownEvent,
  mouseMoveEvent,
  mouseUpEvent,
  mouseLeaveEvent,
} from "./mouse-events";
import { keyDownEvent } from "./keyboard-events";
import Header from "./components/header/header";
import Whiteboard from "./components/whiteboard/whiteboard";
import ToolsPanel from "./components/toolspanel/toolspanel";
import ChatPanel from "./components/chatpanel/chatpanel";
import Footer from "./components/footer/footer";
import "./app.css";

export type WhiteboardArray = Array<
  FreeBrushStroke | TextBrushStroke | LineBrushStroke
>;

const App = () => {
  const cursorRef = useRef(new CursorState(0, 0, false));
  const [strokeCount, setStrokeCount] = useState(0);
  const [editorState, setEditorState] = useState(new EditorState("pen", 5, "#000000", null, null, []));
  const [chatRoomState, setChatRoomState] = useState<ChatRoomState | null>(null);
  const [boardState, setBoardState] = useState(new WhiteboardState(1.0, [])); // Just throwing in a version number for now

  const keyDownEventHandler = (e: KeyboardEvent) => {
    keyDownEvent(e, editorState, setEditorState, setBoardState);
  };

  const handleMouseUp = () => {
    mouseUpEvent(cursorRef, editorState, setEditorState, setBoardState);
    setStrokeCount((prev) => prev + 1);
  };

  const handleMouseLeave = () => {
    mouseLeaveEvent(editorState, cursorRef, setBoardState, setEditorState);
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => {
    mouseDownEvent(
      e,
      canvasRef,
      strokeCount,
      cursorRef,
      editorState,
      boardState,
      setEditorState,
      setStrokeCount
    );
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
  ) => {
    mouseMoveEvent(
      e,
      canvasRef,
      cursorRef,
      editorState,
      setEditorState
    );
  };

  useEffect(() => {
    document.addEventListener("keydown", keyDownEventHandler);
    return () => {
      document.removeEventListener("keydown", keyDownEventHandler);
    };
  }, [editorState]);

  // Be sure not to nest these setter hooks or else you'll get some wonky behavior.
  const handleUndo = () => {
    if (boardState.strokes.length === 0) return;

    const lastStroke = boardState.strokes[boardState.strokes.length - 1];
    if (lastStroke) {
      if (lastStroke.id === editorState.focusedStroke?.id) {
        setEditorState((prev) => {
          return prev.setFocusedStroke(null);
        });
      }
      setEditorState((prev) => {
        return prev.setUndoStack([...prev.undoStack, lastStroke]);
      });
      setBoardState((prev) => {
        const newStrokes = prev.strokes.slice(0, -1);
        return new WhiteboardState(prev.version, newStrokes);
      });
    }
  };

  const handleRedo = () => {
    if (editorState.undoStack.length === 0) return;

    const redoStroke = editorState.undoStack[editorState.undoStack.length - 1];
    if (redoStroke) {
      setEditorState((prev) => {
        return prev.setUndoStack(prev.undoStack.slice(0, -1));
      });
      setBoardState((prevState) => {
        const newStrokes = [...prevState.strokes, redoStroke];
        return new WhiteboardState(prevState.version, newStrokes);
      });
    }
  };

  const handleClear = () => {
    setBoardState((prev) => new WhiteboardState(prev.version, []));
    setEditorState((prev) => {
      return prev.setFocusedStroke(null);
    });
    setEditorState((prev) => {
      return prev.setUndoStack([]);
    });
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
          editorState={editorState}
          editorChangeCallback={setEditorState}
        />
        <Whiteboard
          editorState={editorState}
          whiteboardState={boardState}
          mouseMoveCallback={handleMouseMove}
          mouseDownCallback={handleMouseDown}
          mouseUpCallback={handleMouseUp}
          mouseLeaveCallback={handleMouseLeave}
          undoCallback={handleUndo}
          redoCallback={handleRedo}
        />
        <ChatPanel state={chatRoomState} />
      </div>
      <Footer cursorState={cursorRef} />
    </div>
  );
};

export default App;
