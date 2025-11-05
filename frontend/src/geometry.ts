import { renderToPipeableStream } from "react-dom/server";

export const checkPointNearLine = (
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number],
  tolerance: number
): boolean => {
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const [cx, cy] = point;

  const A = x2 - x1;
  const B = y2 - y1;
  const C = x1 - cx;
  const D = y1 - cy;

  const a = A * A + B * B;
  const b = 2 * (A * C + B * D);
  const c = C * C + D * D - tolerance * tolerance;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return false;
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDiscriminant) / (2 * a);
  const t2 = (-b + sqrtDiscriminant) / (2 * a);

  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
};

export const checkPointNearRectangle = (
  point: [number, number],
  corner1: [number, number],
  corner2: [number, number],
  tolerance: number
): boolean => {
  const [x, y] = point;
  const [x1, y1] = corner1;
  const [x2, y2] = corner2;

  return (
    checkPointNearLine([x1, y1], [x2, y1], [x, y], tolerance) ||
    checkPointNearLine([x2, y1], [x2, y2], [x, y], tolerance) ||
    checkPointNearLine([x2, y2], [x1, y2], [x, y], tolerance) ||
    checkPointNearLine([x1, y2], [x1, y1], [x, y], tolerance)
  );
};

export const checkPointNearCircle = (
  point: [number, number],
  corner1: [number, number],
  corner2: [number, number],
  tolerance: number
): boolean => {
  const [x, y] = point;
  const [x1, y1] = corner1;
  const [x2, y2] = corner2;

  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const radius = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

  return Math.abs(distance - radius) <= tolerance;
};

export const checkPointNearEllipse = (
  point: [number, number],
  corner1: [number, number],
  corner2: [number, number],
  tolerance: number
): boolean => {
  const [x, y] = point;
  const [x1, y1] = corner1;
  const [x2, y2] = corner2;

  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const radiusX = Math.abs(x2 - x1) / 2;
  const radiusY = Math.abs(y2 - y1) / 2;

  const normalizedX = (x - centerX) / radiusX;
  const normalizedY = (y - centerY) / radiusY;
  const ellipseDistance = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);

  return (
    Math.abs(ellipseDistance - 1) <= tolerance / Math.min(radiusX, radiusY)
  );
};
