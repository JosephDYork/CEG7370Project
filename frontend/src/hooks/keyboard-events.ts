import { TextStroke } from "../strokes";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useWebSocket } from "./web-sockets";

export const useKeyboardEvents = () => {
  const { addStroke } = useBoardStore();
  const { sendBoardUpdate } = useWebSocket();
  const { currentStroke, setCurrentStroke } = useEditorStore();

  const updateTextStroke = (text: string) => {
    if (!(currentStroke instanceof TextStroke)) return;

    const updatedStroke = new TextStroke(
      currentStroke.id,
      currentStroke.color,
      currentStroke.size,
      currentStroke.position,
      text
    );
    setCurrentStroke(updatedStroke);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!(currentStroke instanceof TextStroke)) return;

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
        updateTextStroke(currentStroke.text.slice(0, -1));
        break;

      case "Escape":
        setCurrentStroke(null);
        break;

      default:
        if (e.key.length === 1) {
          updateTextStroke(currentStroke.text + e.key);
        }
        break;
    }
  };

  return { handleKeyDown };
};