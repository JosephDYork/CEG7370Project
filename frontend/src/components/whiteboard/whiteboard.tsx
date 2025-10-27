import React, { useState, useRef, useEffect } from 'react';
import { WhiteboardState, WhiteboardStroke } from './whiteboardtypes';
import type { WhiteboardProps } from './whiteboardtypes';
import api from './api';
import './whiteboard.css';

const Whiteboard = ({ width = '100%', height = '100%' }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef({ x: 0, y: 0, isdown: false });

  const [strokeCount, setStrokeCount] = useState(0);
  const [inButtonContainer, setInButtonContainer] = useState(false);
  const [UndoStack, setUndoStack] = useState<Array<WhiteboardStroke>>([]);
  const [currentStroke, setCurrentStroke] = useState<WhiteboardStroke | null>(null);
  const [whiteboardState, setWhiteboardState] = useState(new WhiteboardState(1.00, [])); // Just throwing in a version number for now

  const setCanvasSize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = canvasRef.current.clientHeight;

      drawStrokes();
    }
  };

  const setStrokeColor = (): string => {
    if (colorPickerRef.current) {
      return colorPickerRef.current.value;
    }

    return '#000000';
  };
  
  const getInitialState = async (): Promise<WhiteboardState> => {
    try {
      const response = await api.get('/whiteboardState');
      return response.data as WhiteboardState;
    } catch (error) {
      console.error('Error fetching initial whiteboard state:', error);
      return new WhiteboardState(1.00, []);
    }
  };

  // Most important function. This mulls through all the strokes and draws them to the
  // canvas in order. Make sure not to mess up this data structure or you'll break everything.
  const drawStrokes = () => {
    var allStrokes: Array<WhiteboardStroke> = [];

    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Whiteboard canvas does not exist');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    if (currentStroke) {
      allStrokes = [...whiteboardState.strokes, currentStroke];
    } else {
      allStrokes = [...whiteboardState.strokes];
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    for (var stroke of allStrokes) {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 2;
      var points = stroke.points;
      if (points.length > 0) {
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();
      }
    }
  };

  // Allows us to get the grid effect on the whiteboard. Mess with grid size to change spacing.
  // Will probably need to adjust if we add a zoom feature.
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    const gridColor = 'rgba(0, 0, 0, 0.1)';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorRef.current.x = x;
    cursorRef.current.y = y;

    if (cursorRef.current.isdown && currentStroke) {
      currentStroke.addPoint(x, y);
      setCurrentStroke(currentStroke);
    }

    drawStrokes();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorRef.current.isdown = true;

    if (!inButtonContainer) {
      const color = setStrokeColor();
      setCurrentStroke(new WhiteboardStroke(
        `stroke-${strokeCount}`,
        color,
        x,
        y
      ));
      setStrokeCount(prev => prev + 1);
    }

    drawStrokes();
  };

  const handleMouseUp = () => {
    cursorRef.current.isdown = false;

    if (currentStroke) {
      setWhiteboardState(prev => {
        const newStrokes = [...prev.strokes, currentStroke];
        return new WhiteboardState(
          prev.version,
          newStrokes
        );
      });
      setCurrentStroke(null);
    }

    drawStrokes();
  };

  // Be sure not to nest these setter hooks or else you'll get some wonky behavior.
  const handleUndo = () => {
    if (whiteboardState.strokes.length === 0) return;

    const lastStroke = whiteboardState.strokes[whiteboardState.strokes.length - 1];
    if (lastStroke) {
      setUndoStack(prev => [...prev, lastStroke]);
      setWhiteboardState(prev => {
        const newStrokes = prev.strokes.slice(0, -1);
        return new WhiteboardState(
          prev.version,
          newStrokes
        );
      });
    }
  };

  const handleRedo = () => {
    if (UndoStack.length === 0) return;

    const redoStroke = UndoStack[UndoStack.length - 1];
    if (redoStroke) {
      setUndoStack(prev => prev.slice(0, -1));
      setWhiteboardState(prevState => {
        const newStrokes = [...prevState.strokes, redoStroke];
        return new WhiteboardState(
          prevState.version,
          newStrokes
        );
      });
    }
  };

  const handleClear = () => {
    setWhiteboardState(prev =>
      new WhiteboardState(
        prev.version,
        []
      )
    );

    setUndoStack([]);
  };

  useEffect(() => {
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  useEffect(() => {
    const data = getInitialState();

    data.then((initialState) => {
      setWhiteboardState(initialState);
    }).catch((error) => {
      console.error('Error setting initial whiteboard state:', error);
    });
  }, []);

  useEffect(() => {
    drawStrokes();
  }, [whiteboardState, currentStroke]);

  return (
    <div className="whiteboard-container" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        id="whiteboard-canvas"
        className="whiteboard-canvas"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div
        id="buttonContainer"
        className="button-container"
        onMouseEnter={() => setInButtonContainer(true)}
        onMouseLeave={() => setInButtonContainer(false)}
      >
        <input
          ref={colorPickerRef}
          type="color"
          id="colorPicker"
          className="color-picker"
          defaultValue="#000000"
        />
        <button id="undoButton" onClick={handleUndo} className="whiteboard-button">
          <img src="/undo.svg" alt="Undo"></img>
        </button>
        <button id="redoButton" onClick={handleRedo} className="whiteboard-button">
          <img src="/redo.svg" alt="Redo"></img>
        </button>
        <button id="clearButton" onClick={handleClear} className="whiteboard-button">
          <img src="/trash.svg" height={20} width={15} className="clear-button-icon" alt="Clear"></img>
        </button>
      </div>
    </div>
  );
};

export default Whiteboard;