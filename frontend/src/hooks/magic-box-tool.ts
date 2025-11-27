import { useEditorStore } from "../stores/editor-store";
import { useBoardStore } from "../stores/board-store";
import { useMagicBoxStore } from "../stores/magic-box-store";
import { useWebSocket } from "./web-sockets";
import { ShapeStroke } from "../models/shape-stroke";
import { TextStroke } from "../models/text-stroke";
import { FreeStroke } from "../models/free-stroke";
import { LineStroke } from "../models/line-stroke";
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
    confidenceThreshold,
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
    canvasRef: React.RefObject<HTMLCanvasElement>,
    magicBox: ShapeStroke
  ): Promise<void> => {
    if (!canvasRef.current) {
      setErrorMessage("Canvas not available");
      return;
    }

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
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        throw new Error('Could not get temporary canvas context');
      }

      // Fill with white background
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, width, height);

      // Translate to render strokes in the correct position
      tempCtx.translate(-minX, -minY);

      // Find and render all strokes within the magic box region
      const strokesInRegion = strokes.filter((stroke) => {
        if (stroke.id === "magicbox") return false;
        const strokeBBox = stroke.getBoundingBox();
        const [sMinX, sMinY, sMaxX, sMaxY] = strokeBBox;
        
        // Check if stroke overlaps with magic box
        return !(sMaxX < minX || sMinX > maxX || sMaxY < minY || sMinY > maxY);
      });

      // Render each stroke to the temp canvas
      for (const stroke of strokesInRegion) {
        switch (stroke.type) {
          case 'free':
            {
              const freeStroke = stroke as FreeStroke;
              tempCtx.strokeStyle = freeStroke.color;
              tempCtx.lineWidth = freeStroke.size;
              tempCtx.lineCap = "round";
              tempCtx.lineJoin = "round";
              tempCtx.beginPath();
              for (let i = 0; i < freeStroke.points.length; i++) {
                const [x, y] = freeStroke.points[i];
                if (i === 0) tempCtx.moveTo(x, y);
                else tempCtx.lineTo(x, y);
              }
              tempCtx.stroke();
            }
            break;
          case 'line':
            {
              const lineStroke = stroke as LineStroke;
              tempCtx.strokeStyle = lineStroke.color;
              tempCtx.lineWidth = lineStroke.size;
              tempCtx.lineCap = "round";
              tempCtx.beginPath();
              tempCtx.moveTo(lineStroke.startPoint[0], lineStroke.startPoint[1]);
              tempCtx.lineTo(lineStroke.endPoint[0], lineStroke.endPoint[1]);
              tempCtx.stroke();
            }
            break;
          case 'shape':
            {
              const shapeStroke = stroke as ShapeStroke;
              const x = shapeStroke.origin[0];
              const y = shapeStroke.origin[1];
              const w = shapeStroke.termination[0] - x;
              const h = shapeStroke.termination[1] - y;
              tempCtx.strokeStyle = shapeStroke.color;
              tempCtx.lineWidth = shapeStroke.size;
              tempCtx.beginPath();
              if (shapeStroke.shapeType === 'square') {
                tempCtx.rect(x, y, w, h);
              } else if (shapeStroke.shapeType === 'ellipse') {
                const cx = x + w / 2;
                const cy = y + h / 2;
                const rx = Math.abs(w / 2);
                const ry = Math.abs(h / 2);
                tempCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
              }
              tempCtx.stroke();
            }
            break;
          case 'text':
            {
              const textStroke = stroke as TextStroke;
              tempCtx.font = `${textStroke.size}px Arial`;
              tempCtx.fillStyle = textStroke.color;
              tempCtx.fillText(textStroke.text, textStroke.position[0], textStroke.position[1]);
            }
            break;
        }
      }

      setProgress({ status: "Processing image...", progress: 0.4 });

      // Perform OCR on the temporary canvas
      const ocrResults = await performOCR(
        tempCanvas,
        [0, 0, width, height], // Use full temp canvas bounds
        (p) => setProgress(p)
      );

      // Filter by confidence threshold
      const highConfidenceResults = ocrResults.filter(
        r => r.confidence >= confidenceThreshold
      );

      if (highConfidenceResults.length === 0) {
        const lowConfCount = ocrResults.length;
        const message = lowConfCount > 0 
          ? `Text detected but confidence too low (${Math.round(ocrResults[0]?.confidence || 0)}% < ${confidenceThreshold}%)`
          : "No text detected";
        
        setProgress({ status: message, progress: 1.0 });
        setTimeout(() => {
          resetOCRState();
        }, 3000);
        return;
      }

      setProgress({ status: "Creating text strokes...", progress: 0.7 });

      // Find all strokes within the magic box region (already found above)
      // Create TextStroke objects from high-confidence OCR results
      const newTextStrokes: TextStroke[] = [];
      highConfidenceResults.forEach((result, index) => {
        const textStroke = new TextStroke(
          `ocr-text-${Date.now()}-${index}`,
          "#000000",
          result.bbox.height || 16,
          [minX + result.bbox.x, minY + result.bbox.y + (result.bbox.height || 16)],
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

      setProgress({ 
        status: `Complete! Detected ${highConfidenceResults.length} text block(s)`, 
        progress: 1.0 
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
    canvasRef: React.RefObject<HTMLCanvasElement>,
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
