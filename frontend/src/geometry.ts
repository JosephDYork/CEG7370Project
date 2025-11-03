export const checkLineIntersectsCircle = (
  lineStart: number[],
  lineEnd: number[],
  circleCenter: number[],
  circleRadius: number
): boolean => {
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const [cx, cy] = circleCenter;

  const A = x2 - x1;
  const B = y2 - y1;
  const C = x1 - cx;
  const D = y1 - cy;

  const a = A * A + B * B;
  const b = 2 * (A * C + B * D);
  const c = C * C + D * D - circleRadius * circleRadius;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return false;
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDiscriminant) / (2 * a);
  const t2 = (-b + sqrtDiscriminant) / (2 * a);

  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
};
