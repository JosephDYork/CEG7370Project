import type { Stroke } from "../models/strokes";
import type { FreeStroke } from "../models/free-stroke";
import type { TextStroke } from "../models/text-stroke";
import type { LineStroke } from "../models/line-stroke";
import type { ShapeStroke } from "../models/shape-stroke";

/**
 * Converts a freehand stroke to an SVG path element
 */
function freeStrokeToSVG(stroke: FreeStroke): string {
  if (!stroke.points.length) return "";

  const pathData = stroke.points
    .map((point, index) => {
      const [x, y] = point;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  return `<path d="${pathData}" stroke="${stroke.color}" stroke-width="${stroke.size}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
}

/**
 * Converts a text stroke to an SVG text element
 */
function textStrokeToSVG(stroke: TextStroke): string {
  const [x, y] = stroke.position;
  const escapedText = stroke.text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  return `<text x="${x}" y="${y}" fill="${stroke.color}" font-size="${stroke.size}" font-family="Arial">${escapedText}</text>`;
}

/**
 * Converts a line stroke to an SVG line element
 */
function lineStrokeToSVG(stroke: LineStroke): string {
  const [x1, y1] = stroke.startPoint;
  const [x2, y2] = stroke.endPoint;

  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-linecap="round" />`;
}

/**
 * Converts a shape stroke to an SVG element (rectangle or ellipse)
 */
function shapeStrokeToSVG(stroke: ShapeStroke): string {
  const [x1, y1] = stroke.origin;
  const [x2, y2] = stroke.termination;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);

  if (stroke.shapeType === "square") {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${stroke.color}" stroke-width="${stroke.size}" fill="none" />`;
  } else if (stroke.shapeType === "ellipse") {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const rx = width / 2;
    const ry = height / 2;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${stroke.color}" stroke-width="${stroke.size}" fill="none" />`;
  }

  return "";
}

/**
 * Converts a single stroke to its SVG representation
 */
function strokeToSVG(stroke: Stroke): string {
  switch (stroke.type) {
    case "free":
      return freeStrokeToSVG(stroke as FreeStroke);
    case "text":
      return textStrokeToSVG(stroke as TextStroke);
    case "line":
      return lineStrokeToSVG(stroke as LineStroke);
    case "shape":
      return shapeStrokeToSVG(stroke as ShapeStroke);
    default:
      return "";
  }
}

/**
 * Calculates the bounding box for all strokes
 */
function calculateBoundingBox(strokes: Stroke[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (strokes.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  strokes.forEach((stroke) => {
    const [x1, y1, x2, y2] = stroke.getBoundingBox();
    minX = Math.min(minX, x1);
    minY = Math.min(minY, y1);
    maxX = Math.max(maxX, x2);
    maxY = Math.max(maxY, y2);
  });

  // Add some padding
  const padding = 20;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Exports all strokes as an SVG string
 */
export function exportToSVG(strokes: Stroke[]): string {
  const bbox = calculateBoundingBox(strokes);

  const svgElements = strokes
    .filter((stroke) => stroke.id !== "selectbox") // Exclude selection box
    .map((stroke) => strokeToSVG(stroke))
    .filter((svg) => svg !== "")
    .join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="${bbox.minX} ${bbox.minY} ${bbox.width} ${bbox.height}" 
     width="${bbox.width}" 
     height="${bbox.height}">
  ${svgElements}
</svg>`;
}

/**
 * Downloads an SVG string as a file
 */
export function downloadSVG(svgContent: string, filename: string = "polyboard.svg"): void {
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports and downloads the whiteboard as an SVG file
 */
export function exportWhiteboardToSVG(strokes: Stroke[], filename?: string): void {
  const svgContent = exportToSVG(strokes);
  downloadSVG(svgContent, filename);
}
