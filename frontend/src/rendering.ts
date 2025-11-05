import { FreeStroke, TextStroke, LineStroke, ShapeStroke } from "./strokes";

export const renderTextStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: TextStroke,
  focusedStroke?: TextStroke
) => {
  console.log("rendering a free stroke");
  ctx.fillStyle = stroke.color;
  ctx.font = `${stroke.size}px Arial`;
  ctx.fillText(stroke.text, stroke.position[0], stroke.position[1]);

  if (stroke.id === focusedStroke?.id) {
    renderSelectBox(ctx, stroke);
  }
};

export const renderSelectBox = (
  ctx: CanvasRenderingContext2D,
  stroke: FreeStroke | TextStroke | LineStroke | ShapeStroke
) => {
  const [x1, y1, x2, y2] = stroke.getBoundingBox(ctx);
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#9191ffff";
  ctx.strokeRect(x1 - 5, y1 - 5, x2 - x1 + 10, y2 - y1 + 10);
  ctx.stroke();
};

export const renderFreeStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: FreeStroke,
  focusedStroke?: FreeStroke
) => {
  if (stroke.points.length === 0) return;

  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
  for (const point of stroke.points) {
    ctx.lineTo(point[0], point[1]);
  }

  ctx.stroke();

  if (stroke.id === focusedStroke?.id) {
    renderSelectBox(ctx, stroke);
  }
};

export const renderLineStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: LineStroke,
  focusedStroke?: LineStroke
) => {
  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.moveTo(...stroke.startPoint);
  ctx.lineTo(...stroke.endPoint);
  ctx.stroke();

  if (stroke.id === focusedStroke?.id) {
    renderSelectBox(ctx, stroke);
  }
};

export const renderShapeStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: ShapeStroke,
  focusedStroke?: ShapeStroke
) => {
  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.lineSize;

  const [x1, y1] = stroke.origin;
  const [x2, y2] = stroke.termination;
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;

  switch (stroke.type) {
    case "square":
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      break;
    case "ellipse":
      ctx.ellipse(
        centerX,
        centerY,
        Math.abs(x2 - x1) / 2,
        Math.abs(y2 - y1) / 2,
        0,
        0,
        2 * Math.PI
      );
      break;
    case "circle":
      const radius = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      break;
  }
  ctx.stroke();

  if (stroke.id === focusedStroke?.id) {
    renderSelectBox(ctx, stroke);
  }
};
