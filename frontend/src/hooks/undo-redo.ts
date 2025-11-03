import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";

export const useUndoRedo = () => {
  const { strokes, removeLastStroke, addStroke } = useBoardStore();
  const {
    focusedStroke,
    undoStack,
    setFocusedStroke,
    addToUndoStack,
    removeFromUndoStack,
  } = useEditorStore();

  const handleUndo = () => {
    if (strokes.length === 0) return;

    const lastStroke = removeLastStroke();
    if (lastStroke) {
      if (lastStroke.id === focusedStroke?.id) {
        setFocusedStroke(null);
      }

      addToUndoStack(lastStroke);
    }
  };

  const handleRedo = () => {
    if (undoStack.length === 0) return;

    const redoStroke = undoStack[undoStack.length - 1];
    if (redoStroke) {
      removeFromUndoStack();
      addStroke(redoStroke);
    }
  };

  return { handleUndo, handleRedo };
};
