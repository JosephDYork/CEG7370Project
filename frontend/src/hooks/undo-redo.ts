import { useBoardStore } from "../stores/board-store";
import { useEditorStore } from "../stores/editor-store";
import { useWebSocket } from "./web-sockets";

export const useUndoRedo = () => {
  const { strokes, removeStrokes, addStrokes } = useBoardStore();
  const { sendAddBoardMessage, sendRemoveBoardMessage } = useWebSocket();
  const {
    focusedStrokes,
    undoStack,
    clearFocusedStrokes,
    addToUndoStack,
    removeFromUndoStack,
  } = useEditorStore();

  const handleUndo = () => {
    if (strokes.length === 0) return;

    const lastStroke = strokes[strokes.length - 1];
    removeStrokes([lastStroke]);
    sendRemoveBoardMessage([lastStroke])

    if ([...focusedStrokes].some((s) => s.id === lastStroke.id)) {
      clearFocusedStrokes();
    }

    addToUndoStack(lastStroke);
  };

  const handleRedo = () => {
    if (undoStack.length === 0) return;

    const redoStroke = undoStack[undoStack.length - 1];
    if (redoStroke) {
      removeFromUndoStack();
      addStrokes([redoStroke]);
      sendAddBoardMessage([redoStroke])
    }
  };

  return { handleUndo, handleRedo };
};
