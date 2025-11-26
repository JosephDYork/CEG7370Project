import { useEditorStore } from "../stores/editor-store";
import { useBoardStore } from "../stores/board-store";
import { useMagicBoxStore } from "../stores/magic-box-store";
import { useWebSocket } from "./web-sockets";
import { ShapeStroke } from "../models/shape-stroke";
import { TextStroke } from "../models/text-stroke";
import type { Point } from "../models/strokes";
import { performOCR } from "../utils/ocr";

export const useMagicBoxTool = () => {
  const { brushTool } = useEditorStore();
  const { strokes, addStrokes, removeStrokes } = useBoardStore();
  const { sendAddBoardMessage, sendRemoveBoardMessage } = useWebSocket();
  const { 
    isProcessing, 
    progress, 
    magicBoxExists,
    setIsProcessing, 
    setProgress, 
    setMagicBoxExists 
  } = useMagicBoxStore();

  const startMagicBox = (coords: Point) => {
    console.log("startMagicBox called", { brushTool, coords });
    if (brushTool !== "magicbox") {
      console.log("Not in magicbox mode, returning null");
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
    console.log("Created magic box:", magicBox);
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
    canvasRef: React.RefObject<HTMLCanvasElement>,
    magicBox: ShapeStroke
  ): Promise<void> => {
    if (!canvasRef.current) {
      throw new Error("Canvas not available");
    }

    setIsProcessing(true);
    setProgress({ status: "Initializing OCR...", progress: 0 });

    try {
      // Get the bounding box of the magic box selection
      const bbox = magicBox.getBoundingBox();
      
      setProgress({ status: "Processing image...", progress: 0.3 });

      // Perform OCR on the selected region
      const ocrResults = await performOCR(
        canvasRef.current,
        bbox,
        (p) => setProgress(p)
      );

      if (ocrResults.length === 0) {
        setProgress({ status: "No text detected", progress: 1.0 });
        setTimeout(() => {
          setIsProcessing(false);
          setProgress(null);
        }, 2000);
        return;
      }

      setProgress({ status: "Creating text strokes...", progress: 0.7 });

      // Find all strokes within the magic box region
      const strokesInRegion = strokes.filter((stroke) => {
        if (stroke.id === "magicbox") return false;
        const strokeBBox = stroke.getBoundingBox();
        const [sMinX, sMinY, sMaxX, sMaxY] = strokeBBox;
        const [mMinX, mMinY, mMaxX, mMaxY] = bbox;
        
        // Check if stroke overlaps with magic box
        return !(sMaxX < mMinX || sMinX > mMaxX || sMaxY < mMinY || sMinY > mMaxY);
      });

      // Create TextStroke objects from OCR results
      const newTextStrokes: TextStroke[] = [];
      ocrResults.forEach((result, index) => {
        const textStroke = new TextStroke(
          `ocr-text-${Date.now()}-${index}`,
          "#000000",
          result.bbox.height || 16,
          [result.bbox.x, result.bbox.y + (result.bbox.height || 16)],
          result.text
        );
        newTextStrokes.push(textStroke);
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

      setProgress({ status: "Complete!", progress: 1.0 });
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(null);
      }, 1500);

    } catch (error) {
      console.error("OCR Error:", error);
      setProgress({ status: "OCR failed", progress: 0 });
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(null);
      }, 2000);
    }
  };

  const endMagicBox = async (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    magicBox: ShapeStroke | null
  ): Promise<void> => {
    setMagicBoxExists(false);
    
    if (!magicBox) return;

    // Validate magic box size (minimum 5x5 world units - very permissive)
    const width = Math.abs(magicBox.termination[0] - magicBox.origin[0]);
    const height = Math.abs(magicBox.termination[1] - magicBox.origin[1]);
    
    console.log("Magic box size:", { width, height });
    
    if (width < 5 || height < 5) {
      console.log("Magic box too small, skipping OCR", { width, height });
      return;
    }

    // Prevent multiple simultaneous OCR operations
    if (isProcessing) {
      console.log("OCR already in progress, skipping");
      return;
    }

    console.log("Starting OCR on magic box region...");
    // Perform OCR on the selected region
    await performOCROnRegion(canvasRef, magicBox);
  };

  const isMagicBoxActive = (): boolean => {
    return brushTool === "magicbox";
  };

  return {
    startMagicBox,
    updateMagicBox,
    endMagicBox,
    isMagicBoxActive,
    magicBoxExists,
    isProcessing,
    progress,
  };
};
