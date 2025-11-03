import { TextStroke } from "../brushes";
import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";

export const useKeyboardEvents = () => {
  const { addStroke } = useBoardStore();
  const { currentStroke, setCurrentStroke } = useEditorStore();

  const updateTextStroke = (text: string) => {
    if (!(currentStroke instanceof TextStroke)) return;

    const updatedStroke = new TextStroke(
      currentStroke.id,
      currentStroke.color,
      currentStroke.fontSize,
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