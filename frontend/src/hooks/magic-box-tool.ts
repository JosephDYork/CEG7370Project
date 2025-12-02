import { useEditorStore } from "../stores/editor-store";
import { useBoardStore } from "../stores/board-store";
import { useMagicBoxStore } from "../stores/magic-box-store";
import { useWebSocket } from "./web-sockets";
import { ShapeStroke } from "../models/shape-stroke";
import { TextStroke } from "../models/text-stroke";
import { FreeStroke } from "../models/free-stroke";
import { LineStroke } from "../models/line-stroke";
import type { Point } from "../models/strokes";
import {
  renderFreeStroke,
  renderLineStroke,
  renderShapeStroke,
  renderTextStroke,
} from "../rendering";
import api from "../api";

export const useMagicBoxTool = () => {
  const { brushTool, getCurrentLanguage } = useEditorStore();
  const { strokes, addStrokes, removeStrokes } = useBoardStore();
  const { sendAddBoardMessage, sendRemoveBoardMessage } = useWebSocket();
  const { 
    isProcessing, 
    progress, 
    magicBoxExists,
    setIsProcessing, 
    setProgress, 
    setMagicBoxExists,
    setErrorMessage,
    resetOCRState
  } = useMagicBoxStore();

  const startMagicBox = (coords: Point) => {
    if (brushTool !== "magicbox") {
      return null;
    }
    
    setMagicBoxExists(true);
    const magicBox = new ShapeStroke(
      "magicbox",
      "square",
      "#FF6B6B",
      3,
      coords,
      coords
    );
    return magicBox;
  };

  const updateMagicBox = (
    magicBox: ShapeStroke,
    coords: Point
  ): ShapeStroke => {
    const updatedMagicBox = magicBox.updateTermination(coords[0], coords[1]);
    return updatedMagicBox;
  };

  const performOCROnRegion = async (
    magicBox: ShapeStroke
  ): Promise<void> => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProgress({ status: "Initializing OCR...", progress: 0 });

    try {
      // Get the bounding box of the magic box selection (in world coordinates)
      const bbox = magicBox.getBoundingBox();
      const [minX, minY, maxX, maxY] = bbox;
      const width = maxX - minX;
      const height = maxY - minY;
      
      setProgress({ status: "Rendering region...", progress: 0.2 });

      // Create a temporary canvas for the selected region
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      tempCanvas.width = width;
      tempCanvas.height = height;

      // Fill with white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      // Translate to render strokes in the correct position
      ctx.translate(-minX, -minY);

      // Find and render all strokes within the magic box region
      const strokesInRegion = strokes.filter((stroke) => {
        if (stroke.id === "magicbox") return false;
        const strokeBBox = stroke.getBoundingBox();
        const [sMinX, sMinY, sMaxX, sMaxY] = strokeBBox;
        return !(sMaxX < minX || sMinX > maxX || sMaxY < minY || sMinY > maxY);
      });

      for (const stroke of strokesInRegion) {
        switch (stroke.type) {
          case "free":
            renderFreeStroke(ctx, stroke as FreeStroke, [], []);
            break;
          case "line":
            renderLineStroke(ctx, stroke as LineStroke, [], []);
            break;
          case "shape":
            renderShapeStroke(ctx, stroke as ShapeStroke, [], []);
            break;
          case "text":
            renderTextStroke(ctx, stroke as TextStroke, [], [], getCurrentLanguage());
            break;
        }
      }

      setProgress({ status: "Processing image...", progress: 0.4 });
      const blob = await new Promise<Blob>((resolve, reject) => {
        tempCanvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          "image/jpeg",
          1
        );
      });

      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to read blob as base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const response = await api.post("/ocr", {
        image: base64Image,
        x: minX,
        y: minY,
        width: width,
        height: height,
      });

      const result = response.data;
      setProgress({ status: "Processing results...", progress: 0.8 });
      const newTextStrokes: TextStroke[] = result.textBlocks
        .filter((block: any) => block.confidence >= 60)
        .map((block: any) => {
          const worldX = minX + block.left;
          const worldY = minY + block.top + (block.height || 16);
          return new TextStroke(
            `ocr-text-${Date.now()}-${Math.random()}`,
          "#000000",
            block.height || 16,
            [worldX, worldY],
            block.text,
            getCurrentLanguage(),
            {}
        );
      });

      setProgress({ status: "Updating whiteboard...", progress: 0.9 });

      // Remove original strokes from the region
      if (strokesInRegion.length > 0) {
        removeStrokes(strokesInRegion);
        sendRemoveBoardMessage(strokesInRegion);
      }

      // Add new text strokes
      if (newTextStrokes.length > 0) {
        addStrokes(newTextStrokes);
        sendAddBoardMessage(newTextStrokes);
      }

      setProgress({ 
        status: `Complete! Detected ${result.textBlocks.length} text block(s)`,
        progress: 1.0,
      });
      setTimeout(() => {
        resetOCRState();
      }, 2000);
    } catch (error) {
      console.error("OCR Error:", error);
      const errorMsg = error instanceof Error ? error.message : "OCR processing failed";
      setErrorMessage(errorMsg);
      setProgress({ status: errorMsg, progress: 0 });
      setTimeout(() => {
        resetOCRState();
      }, 3000);
    }
  };

  const endMagicBox = async (
    magicBox: ShapeStroke | null
  ): Promise<void> => {
    setMagicBoxExists(false);
    
    if (!magicBox) return;

    // Validate magic box size (minimum 5x5 world units)
    const width = Math.abs(magicBox.termination[0] - magicBox.origin[0]);
    const height = Math.abs(magicBox.termination[1] - magicBox.origin[1]);
    
    if (width < 5 || height < 5) {
      return;
    }

    // Prevent multiple simultaneous OCR operations
    if (isProcessing) {
      return;
    }

    // Perform OCR on the selected region
    await performOCROnRegion(magicBox);
  };

  return {
    startMagicBox,
    updateMagicBox,
    endMagicBox,
    magicBoxExists,
    isProcessing,
    progress,
  };
};
