export class LineBrushStroke {
  id: string;
  color: string;
  size: number;
  startPoint: [number, number];
  endPoint: [number, number];

  constructor(
    strokeId: string,
    strokeColor: string,
    strokeSize: number,
    startPoint: [number, number],
    endPoint: [number, number]
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = strokeSize;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
  }

  updateEndPoint(newEndX: number, newEndY: number): void {
    this.endPoint = [newEndX, newEndY];
  }
}