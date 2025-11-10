import { useState } from "react";
import { ShapeStroke, TextStroke } from "../strokes";
import { useEditorStore } from "../stores/editor-store";
import { useBoardStore } from "../stores/board-store";
import { checkRectangleInsideRectangle } from "../geometry";

export const useSelection = () => {
  const [selectBoxExists, setSelectBoxExists] = useState(false);
  const { addFocusedStroke, clearFocusedStrokes, setCurrentStroke } =
    useEditorStore();
  const { strokes } = useBoardStore();

  const startSelectBox = (coords: [number, number]) => {
    setSelectBoxExists(true);
    clearFocusedStrokes();
    const selectBox = new ShapeStroke(
      "selectbox",
      "square",
      "#0000FF",
      2,
      coords,
      coords
    );
    setCurrentStroke(selectBox);
    return selectBox;
  };

  const updateSelectBox = (
    selectBox: ShapeStroke,
    coords: [number, number],
    ctx: CanvasRenderingContext2D
  ) => {
    selectBox.updateTermination(coords[0], coords[1]);
    setCurrentStroke(selectBox);

    clearFocusedStrokes();
    strokes.forEach((stroke) => {
      const bbox =
        stroke instanceof TextStroke
          ? stroke.getBoundingBox(ctx)
          : stroke.getBoundingBox();

      const innerCorner1: [number, number] = [bbox[0], bbox[1]];
      const innerCorner2: [number, number] = [bbox[2], bbox[3]];

      if (
        checkRectangleInsideRectangle(
          innerCorner1,
          innerCorner2,
          selectBox.origin,
          selectBox.termination
        )
      ) {
        addFocusedStroke(stroke);
      }
    });
  };

  const endSelectBox = () => {
    setSelectBoxExists(false);
    setCurrentStroke(null);
  };

  return {
    selectBoxExists,
    startSelectBox,
    updateSelectBox,
    endSelectBox,
  };
};
