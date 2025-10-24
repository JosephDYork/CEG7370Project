import React, { useState, useRef, useEffect } from 'react';

class WhiteboardStroke {
  id: string;
  color: string;
  points: Array<Array<number>>;

  constructor(
    strokeId: string,
    strokeColor: string,
    xOrigin: number,
    yOrigin: number
  ) {
    this.id = strokeId;
    this.color = strokeColor;
    this.points = [[xOrigin, yOrigin]];
  }

  addPoint(pointX: number, pointY: number): void {
    this.points.push([pointX, pointY]);
  }
}

class WhiteboardState {
  version: number;
  strokes: Array<WhiteboardStroke>;

  constructor(
    version: number,
    strokes: Array<WhiteboardStroke>
  ) {
    this.version = version;
    this.strokes = strokes;
  }
}

interface WhiteboardProps {
  width?: string;
  height?: string;
}

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
    if (colorPickerRef.current && colorPickerRef.current.type === 'color') {
      return colorPickerRef.current.value;
    }

    return '#000000';
  };

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

    ctx.fillStyle = 'rgb(231,231,204)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var stroke of allStrokes) {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
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
    drawStrokes();
  }, [whiteboardState, currentStroke]);

  return (
    <div className="whiteboard-container" style={{ width, height, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        id="whiteboard-canvas"
        style={{
          width: '98%',
          height: '98%',
          margin: '0.5rem',
          borderRadius: '0.5rem',
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div
        id="buttonContainer"
        className="button-container"
        style={{
          position: 'absolute',
          top: '2%',
          left: '1.7%',
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '5px'
        }}
        onMouseEnter={() => setInButtonContainer(true)}
        onMouseLeave={() => setInButtonContainer(false)}
      >
        <input
          ref={colorPickerRef}
          type="color"
          id="colorPicker"
          defaultValue="#000000"
          style={{ marginRight: '10px' }}
        />
        <button id="undoButton" onClick={handleUndo} style={{ marginRight: '5px' }}>
          <img src="/undo.svg" alt="Undo"></img></button>
        <button id="redoButton" onClick={handleRedo} style={{ marginRight: '5px' }}>
          <img src="/redo.svg" alt="Redo"></img></button>
        <button id="clearButton" onClick={handleClear} style={{ marginRight: '5px'}}>
          <img src="/trash.svg" height={20} width={15} style={{padding: '3px 1px 1px 1px'}} alt="Clear"></img>
        </button>
      </div>
    </div>
  );
};

export default Whiteboard;

