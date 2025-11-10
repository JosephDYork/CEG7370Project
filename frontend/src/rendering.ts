import { FreeStroke } from "./models/free-stroke";
import { TextStroke } from "./models/text-stroke";
import { LineStroke } from "./models/line-stroke";
import { ShapeStroke } from "./models/shape-stroke";
import type { StrokeType } from "./models/strokes";

const BOX_BORDER = "#9191ff";
const BOX_BORDER_WIDTH = 1;
const HANDLE_FILL = "#ffffff";
const SELECTION_BOX_FILL = "#9191ff1a";

export const renderBoundingBox = (
  ctx: CanvasRenderingContext2D,
  stroke: StrokeType
) => {
  const [x1, y1, x2, y2] = stroke.getBoundingBox(ctx);
  const padding = 5,
    handleSize = 6;

  ctx.strokeStyle = BOX_BORDER;
  ctx.lineWidth = BOX_BORDER_WIDTH;
  ctx.fillStyle = HANDLE_FILL;
  ctx.strokeRect(
    x1 - padding,
    y1 - padding,
    x2 - x1 + 2 * padding,
    y2 - y1 + 2 * padding
  );

  [
    [x1, y1],
    [x2, y1],
    [x1, y2],
    [x2, y2],
  ].forEach(([x, y]) => {
    const handleX = x + (x === x1 ? -padding : padding);
    const handleY = y + (y === y1 ? -padding : padding);
    ctx.fillRect(
      handleX - handleSize / 2,
      handleY - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.strokeRect(
      handleX - handleSize / 2,
      handleY - handleSize / 2,
      handleSize,
      handleSize
    );
  });
};

export const renderTextStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: TextStroke,
  focusedStrokes: StrokeType[]
) => {
  ctx.fillStyle = stroke.color;
  ctx.font = `${stroke.size}px Arial`;
  ctx.fillText(stroke.text, stroke.position[0], stroke.position[1]);
  if (focusedStrokes.some((s) => s.id === stroke.id))
    renderBoundingBox(ctx, stroke);
};

export const renderFreeStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: FreeStroke,
  focusedStrokes: StrokeType[]
) => {
  if (!stroke.points.length) return;
  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
  stroke.points.forEach((point) => ctx.lineTo(point[0], point[1]));
  ctx.stroke();
  if (focusedStrokes.some((s) => s.id === stroke.id))
    renderBoundingBox(ctx, stroke);
};

export const renderLineStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: LineStroke,
  focusedStrokes: StrokeType[]
) => {
  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.moveTo(...stroke.startPoint);
  ctx.lineTo(...stroke.endPoint);
  ctx.stroke();
  if (focusedStrokes.some((s) => s.id === stroke.id))
    renderBoundingBox(ctx, stroke);
};

export const renderSelectionBox = (
  ctx: CanvasRenderingContext2D,
  stroke: ShapeStroke
) => {
  const [x1, y1] = stroke.origin;
  const [x2, y2] = stroke.termination;
  ctx.strokeStyle = BOX_BORDER;
  ctx.lineWidth = BOX_BORDER_WIDTH;
  ctx.fillStyle = SELECTION_BOX_FILL;
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
};

export const renderShapeStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: ShapeStroke,
  focusedStrokes: StrokeType[]
) => {
  if (stroke.id === "selectbox") return;

  ctx.beginPath();
  const [x1, y1] = stroke.origin;
  const [x2, y2] = stroke.termination;
  const [centerX, centerY] = [(x1 + x2) / 2, (y1 + y2) / 2];
  const [w, h] = [Math.abs(x2 - x1), Math.abs(y2 - y1)];

  switch (stroke.shapeType) {
    case "square":
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineSize;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      break;
    case "ellipse":
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineSize;
      ctx.ellipse(centerX, centerY, w / 2, h / 2, 0, 0, 2 * Math.PI);
      ctx.stroke();
      break;
    case "circle":
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineSize;
      ctx.arc(centerX, centerY, Math.min(w, h) / 2, 0, 2 * Math.PI);
      ctx.stroke();
      break;
  }

  if (focusedStrokes.some((s) => s.id === stroke.id))
    renderBoundingBox(ctx, stroke);
};
