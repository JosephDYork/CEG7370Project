import { TextStroke, type ITextStroke } from "../models/text-stroke";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useWebSocket } from "./web-sockets";

// this needs to be global if you want cross-instance memory margish
let previousTool: string | null = null;

export const useKeyboardEvents = () => {
  const { addStrokes, removeStrokes } = useBoardStore();
  const { sendAddBoardMessage, sendRemoveBoardMessage } = useWebSocket()
  const {
    currentStroke,
    focusedStrokes,
    brushTool,
    clearFocusedStrokes,
    setCurrentStroke,
    setBrushTool,
  } = useEditorStore();


  const updateTextStroke = (text: string) => {
    if (currentStroke?.type !== "text") return;

    const textStroke = currentStroke as TextStroke;
    const updatedStroke = new TextStroke(
      textStroke.id,
      textStroke.color,
      textStroke.size,
      textStroke.position,
      text,
      textStroke.srcLang,
      textStroke.translations
    );
    setCurrentStroke(updatedStroke);
  };

  const handleTextInput = (key: string) => {
    const textStroke = currentStroke as ITextStroke;

    switch (key) {
      case "Enter":
        if (currentStroke) {
          addStrokes([currentStroke]);
          sendAddBoardMessage([currentStroke])
          setCurrentStroke(null);
        }
        break;
      case "Backspace":
        updateTextStroke(textStroke.srcText.slice(0, -1));
        break;
      case "Escape":
        setCurrentStroke(null);
        break;
      default:
        if (key.length === 1) {
          updateTextStroke(textStroke.srcText + key);
        }
        break;
    }
  };

  const handleNonTextInput = (key: string) => {
    switch (key) {
      case "Delete":
        removeStrokes([...focusedStrokes]);
        sendRemoveBoardMessage([...focusedStrokes])
        setCurrentStroke(null);
        break;
      case "Escape":
        clearFocusedStrokes();
        setCurrentStroke(null);
        break;
      case " ":
        if (brushTool !== "pan") {
          previousTool = brushTool;
          setBrushTool("pan");
        }
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === " " && brushTool === "pan" && previousTool) {
      setBrushTool(previousTool);
      previousTool = null;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (currentStroke?.type === "text") {
      handleTextInput(e.key);
    } else {
      handleNonTextInput(e.key);
    }
  };

  return { handleKeyDown, handleKeyUp };
};
