export class TextBrushStroke {
  id: string;
  color: string;
  fontSize: number;
  position: [number, number];
  text: string;

  constructor(
    strokeId: string,
    strokeColor: string,
    fontSize: number,
    position: [number, number],
    text: string
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.fontSize = fontSize;
    this.position = position;
    this.text = text;
  }
}