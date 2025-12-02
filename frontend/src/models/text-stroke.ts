import type { Stroke, Point, BoundingBox } from "./strokes";
import { useEditorStore } from "../stores/editor-store";

export interface ITextStroke extends Stroke {
  size: number;
  position: Point;
  srcText: string;
  srcLang: string;
  translations: Record<string, string>;
}

export class TextStroke implements ITextStroke {
  type = "text";
  id: string;
  color: string;
  size: number;
  position: Point;
  srcText: string;
  srcLang: string;
  translations: Record<string, string>;

  constructor(
    strokeId: string,
    strokeColor: string,
    fontSize: number,
    position: Point,
    srcText: string,
    srcLang: string,
    translations: Record<string, string>
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.size = fontSize;
    this.position = position;
    this.srcText = srcText;
    this.srcLang = srcLang;
    this.translations = translations;
  }

  getCentroid(): Point {
    return [this.position[0], this.position[1] - this.size / 2];
  }

  getBoundingBox(): BoundingBox {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Ensure we are actually using the translated text for the bbox.
    // things were not lining up at all when switching languages.
    const { currentLanguage } = useEditorStore.getState(); 
    const text = this.translations[currentLanguage] || this.srcText;

    ctx!.font = `${this.size}px Arial`;
    const textWidth = ctx!.measureText(text).width;

    return [
      this.position[0],
      this.position[1] - this.size,
      this.position[0] + textWidth,
      this.position[1],
    ];
  }

  isPointNear(
    point: Point,
    tolerance: number = 10,
  ): boolean {
    if (tolerance) {}; // throw this is to shut up the builder.
    const [x, y] = point;
    const [x1, y1, x2, y2] = this.getBoundingBox();
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }

  withUpdates(updates: { color?: string; size?: number }): TextStroke {
    return new TextStroke(
      this.id,
      updates.color ?? this.color,
      updates.size ?? this.size,
      this.position,
      this.srcText,
      this.srcLang,
      this.translations
    );
  }
}
