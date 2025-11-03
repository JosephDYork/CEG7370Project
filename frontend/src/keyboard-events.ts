import { WhiteboardState } from "./board-state";
import { EditorState } from "./editor-state";
import { TextBrushStroke } from "./text-brush";

export const keyDownEvent = (
  e: KeyboardEvent,
  editorState: EditorState,
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>,
  setBoardState: React.Dispatch<React.SetStateAction<WhiteboardState>>
) => {
  if (!(editorState.currentStroke instanceof TextBrushStroke)) return;

  switch (e.key) {
    case "Enter":
      setBoardState((prev) => {
        if (!editorState.currentStroke) return prev;
        const newStrokes = [...prev.strokes, editorState.currentStroke];
        return new WhiteboardState(prev.version, newStrokes);
      });
      setEditorState((prev) => prev.setCurrentStroke(null));
      break;
    case "Backspace":
      e.preventDefault();
      setEditorState((prev) => {
        if (
          !prev.currentStroke ||
          !(prev.currentStroke instanceof TextBrushStroke)
        ) {
          return prev;
        }
        return prev.setCurrentStroke(
          new TextBrushStroke(
            prev.currentStroke.id,
            prev.currentStroke.color,
            prev.currentStroke.fontSize,
            prev.currentStroke.position,
            prev.currentStroke.text.slice(0, -1)
          )
        );
      });
      break;
    case "Escape":
      setEditorState((prev) => prev.setCurrentStroke(null));
      break;
    default:
      if (e.key.length === 1) {
        setEditorState((prev) => {
          if (
            !prev.currentStroke ||
            !(prev.currentStroke instanceof TextBrushStroke)
          ) {
            return prev;
          }
          return prev.setCurrentStroke(
            new TextBrushStroke(
              prev.currentStroke.id,
              prev.currentStroke.color,
              prev.currentStroke.fontSize,
              prev.currentStroke.position,
              prev.currentStroke.text + e.key
            )
          );
        });
      }
      break;
  }
};
