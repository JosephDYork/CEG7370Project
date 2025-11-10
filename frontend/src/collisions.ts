import { FreeStroke, TextStroke, LineStroke, ShapeStroke } from "./strokes";
import {
  checkPointNearLine,
  checkPointNearRectangle,
  checkPointNearCircle,
  checkPointNearEllipse,
} from "./geometry";

export const isPointOnStroke = (
  point: [number, number],
  stroke: FreeStroke | TextStroke | LineStroke | ShapeStroke,
  tolerance: number = 10,
  ctx?: CanvasRenderingContext2D
): boolean => {
  const [x, y] = point;

  if (stroke instanceof FreeStroke) {
    return stroke.points.some(
      (strokePoint, i, points) =>
        i < points.length - 1 &&
        checkPointNearLine(
          point,
          strokePoint as [number, number],
          points[i + 1] as [number, number],
          tolerance
        )
    );
  }

  if (stroke instanceof TextStroke) {
    if (!ctx) return false;
    const [x1, y1, x2, y2] = stroke.getBoundingBox(ctx);
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }

  if (stroke instanceof LineStroke) {
    return checkPointNearLine(
      point,
      stroke.startPoint,
      stroke.endPoint,
      tolerance
    );
  }

  if (stroke instanceof ShapeStroke) {
    switch (stroke.type) {
      case "square":
        return checkPointNearRectangle(
          point,
          stroke.origin,
          stroke.termination,
          tolerance
        );
      case "circle":
        return checkPointNearCircle(
          point,
          stroke.origin,
          stroke.termination,
          tolerance
        );
      case "ellipse":
        return checkPointNearEllipse(
          point,
          stroke.origin,
          stroke.termination,
          tolerance
        );
      default:
        return false;
    }
  }

  return false;
};
