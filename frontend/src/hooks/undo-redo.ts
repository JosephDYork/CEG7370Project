import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";

export const useUndoRedo = () => {
  const { strokes, removeLastStroke, addStroke } = useBoardStore();
  const {
    focusedStrokes,
    undoStack,
    clearFocusedStrokes,
    addToUndoStack,
    removeFromUndoStack,
  } = useEditorStore();

  const handleUndo = () => {
    if (strokes.length === 0) return;

    const lastStroke = removeLastStroke();
    if (lastStroke) {
      if (focusedStrokes.some((s) => s.id === lastStroke.id)) {
        clearFocusedStrokes();
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
