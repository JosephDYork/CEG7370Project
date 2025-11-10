import { TextStroke } from "../models/text-stroke";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useWebSocket } from "./web-sockets";

export const useKeyboardEvents = () => {
  const { addStroke } = useBoardStore();
  const { sendBoardUpdate } = useWebSocket();
  const { currentStroke, setCurrentStroke } = useEditorStore();

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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (currentStroke?.type !== "text") return;

    const textStroke = currentStroke as TextStroke;

    switch (e.key) {
      case "Enter":
        if (currentStroke) {
          addStroke(currentStroke);
          sendBoardUpdate();
          setCurrentStroke(null);
        }
        break;

      case "Backspace":
        e.preventDefault();
        updateTextStroke(textStroke.text.slice(0, -1));
        break;

      case "Escape":
        setCurrentStroke(null);
        break;

      default:
        if (e.key.length === 1) {
          updateTextStroke(textStroke.text + e.key);
        }
        break;
    }
  };

  return { handleKeyDown };
};
