import { TextStroke, type ITextStroke } from "../models/text-stroke";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useWebSocket } from "./web-sockets";

export const useKeyboardEvents = () => {
  const { strokes, updateAllStrokes, addStroke } = useBoardStore();
  const { sendBoardUpdate } = useWebSocket();
  const {
    currentStroke,
    focusedStrokes,
    clearFocusedStrokes,
    setCurrentStroke,
  } = useEditorStore();

  const updateTextStroke = (text: string) => {
    if (currentStroke?.type !== "text") return;

    const textStroke = currentStroke as TextStroke;
    const updatedStroke = new TextStroke(
      textStroke.id,
      textStroke.color,
      textStroke.size,
      textStroke.position,
      text
    );
    setCurrentStroke(updatedStroke);
  };

  const deleteFocusedStrokes = () => {
    const remainingStrokes = strokes.filter(
      (stroke) => !focusedStrokes.some((focused) => focused.id === stroke.id)
    );
    updateAllStrokes(remainingStrokes);
    sendBoardUpdate();
    setCurrentStroke(null);
  };

  const handleTextInput = (key: string) => {
    const textStroke = currentStroke as ITextStroke;

    switch (key) {
      case "Enter":
        if (currentStroke) {
          addStroke(currentStroke);
          sendBoardUpdate();
          setCurrentStroke(null);
        }
        break;
      case "Backspace":
        updateTextStroke(textStroke.text.slice(0, -1));
        break;
      case "Escape":
        setCurrentStroke(null);
        break;
      default:
        if (key.length === 1) {
          updateTextStroke(textStroke.text + key);
        }
        break;
    }
  };

  const handleNonTextInput = (key: string) => {
    switch (key) {
      case "Delete":
        deleteFocusedStrokes();
        break;
      case "Escape":
        clearFocusedStrokes();
        setCurrentStroke(null);
        break;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (currentStroke?.type === "text") {
      handleTextInput(e.key);
    } else {
      handleNonTextInput(e.key);
    }
  };

  return { handleKeyDown };
};
