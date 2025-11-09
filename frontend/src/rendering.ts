import { IStroke } from "./strokes";

/**
 * Renders a selection box around a given stroke.
 * @param ctx The 2D rendering context of the canvas.
 * @param stroke The stroke to surround with a selection box.
 */
export const renderSelectBox = (
  ctx: CanvasRenderingContext2D,
  stroke: IStroke
) => {
  // The IStroke interface defines getBoundingBox() without a context parameter.
  // The stroke implementation is responsible for having access to a context if needed
  // or pre-calculating the box.
  const [x1, y1, x2, y2] = stroke.getBoundingBox();
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#9191ffff";
  ctx.strokeRect(x1 - 5, y1 - 5, x2 - x1 + 10, y2 - y1 + 10);
  ctx.stroke();
};

/**
 * Renders a single stroke on the canvas, applying focus styling if applicable.
 * This function leverages polymorphism by calling the `render` method on the stroke object,
 * which contains the specific rendering logic for that stroke type.
 * This assumes the `IStroke` interface will be updated to include a `render(ctx)` method.
 * @param ctx The 2D rendering context of the canvas.
 * @param stroke The stroke object to render, conforming to the IStroke interface.
 * @param focusedStroke An optional stroke object that is currently focused; if its ID matches, a select box will be rendered.
 */
export const renderStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: IStroke,
  focusedStroke?: IStroke
) => {
  // Polymorphically call the render method on the stroke object itself.
  // This avoids `instanceof` checks and keeps rendering logic encapsulated
  // within each respective stroke class.
  stroke.render(ctx);

  // Render a select box if the stroke is currently focused.
  if (stroke.id === focusedStroke?.id) {
    renderSelectBox(ctx, stroke);
  }
};