import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  color: string;
  lineWidth: number;
  spirals?: boolean;
  template?: string;
  mode?: 'trace' | 'color';
  selfCorrecting?: boolean;
  onAccuracyUpdate?: (accuracy: number) => void;
  onFirstStroke?: () => void;
}

export interface DrawingCanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getCanvasImage: () => string | null;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      color,
      lineWidth,
      spirals = false,
      template,
      mode = 'color',
      selfCorrecting = false,
      onAccuracyUpdate,
      onFirstStroke,
    },
    ref
  ) => {
    const templateCanvasRef = useRef<HTMLCanvasElement>(null);
    const traceLayerRef = useRef<HTMLCanvasElement>(null);
    const colorLayerRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState<Point | null>(null);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [accuracyPoints, setAccuracyPoints] = useState<{ total: number; accurate: number }>({
      total: 0,
      accurate: 0,
    });

    // Undo/Redo state for trace layer
    const [traceHistory, setTraceHistory] = useState<ImageData[]>([]);
    const [traceHistoryStep, setTraceHistoryStep] = useState(-1);

    // Undo/Redo state for color layer
    const [colorHistory, setColorHistory] = useState<ImageData[]>([]);
    const [colorHistoryStep, setColorHistoryStep] = useState(-1);

    // Initialize template canvas with spirals or template
    useEffect(() => {
      const canvas = templateCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (spirals) {
        drawSpirals(ctx, canvas.width, canvas.height);
      } else if (template) {
        drawTemplate(ctx, canvas.width, canvas.height, template);
      }
    }, [spirals, template]);

    // Initialize trace layer
    useEffect(() => {
      const canvas = traceLayerRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setTraceHistory([imageData]);
        setTraceHistoryStep(0);
      }
    }, []);

    // Initialize color layer
    useEffect(() => {
      const canvas = colorLayerRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setColorHistory([imageData]);
        setColorHistoryStep(0);
      }
    }, []);

    const saveTraceState = () => {
      const canvas = traceLayerRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = traceHistory.slice(0, traceHistoryStep + 1);
      newHistory.push(imageData);

      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setTraceHistoryStep((prev) => prev + 1);
      }

      setTraceHistory(newHistory);
    };

    const saveColorState = () => {
      const canvas = colorLayerRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = colorHistory.slice(0, colorHistoryStep + 1);
      newHistory.push(imageData);

      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setColorHistoryStep((prev) => prev + 1);
      }

      setColorHistory(newHistory);
    };

    const undo = () => {
      if (mode === 'trace') {
        if (traceHistoryStep > 0) {
          setTraceHistoryStep((prev) => prev - 1);
          const canvas = traceLayerRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.putImageData(traceHistory[traceHistoryStep - 1], 0, 0);
        }
      } else {
        if (colorHistoryStep > 0) {
          setColorHistoryStep((prev) => prev - 1);
          const canvas = colorLayerRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.putImageData(colorHistory[colorHistoryStep - 1], 0, 0);
        }
      }
    };

    const redo = () => {
      if (mode === 'trace') {
        if (traceHistoryStep < traceHistory.length - 1) {
          setTraceHistoryStep((prev) => prev + 1);
          const canvas = traceLayerRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.putImageData(traceHistory[traceHistoryStep + 1], 0, 0);
        }
      } else {
        if (colorHistoryStep < colorHistory.length - 1) {
          setColorHistoryStep((prev) => prev + 1);
          const canvas = colorLayerRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.putImageData(colorHistory[colorHistoryStep + 1], 0, 0);
        }
      }
    };

    const clear = () => {
      if (mode === 'trace') {
        const canvas = traceLayerRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveTraceState();
      } else {
        const canvas = colorLayerRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveColorState();
      }
      setAccuracyPoints({ total: 0, accurate: 0 });
      if (onAccuracyUpdate) onAccuracyUpdate(0);
    };

    const getCanvasImage = () => {
      // Combine all layers into one image
      const tempCanvas = document.createElement('canvas');
      const template = templateCanvasRef.current;
      const trace = traceLayerRef.current;
      const colorLayer = colorLayerRef.current;
      
      if (!template || !trace || !colorLayer) return null;
      
      tempCanvas.width = template.width;
      tempCanvas.height = template.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(template, 0, 0);
      ctx.drawImage(colorLayer, 0, 0);
      ctx.drawImage(trace, 0, 0);
      
      return tempCanvas.toDataURL();
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      undo,
      redo,
      clear,
      canUndo: mode === 'trace' ? traceHistoryStep > 0 : colorHistoryStep > 0,
      canRedo: mode === 'trace' ? traceHistoryStep < traceHistory.length - 1 : colorHistoryStep < colorHistory.length - 1,
      getCanvasImage,
    }));

    const drawSpirals = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const spiralSizes = [
        { centerX: width * 0.25, centerY: height * 0.3, size: 80 },
        { centerX: width * 0.6, centerY: height * 0.35, size: 120 },
        { centerX: width * 0.4, centerY: height * 0.65, size: 100 },
        { centerX: width * 0.75, centerY: height * 0.7, size: 90 },
      ];

      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 2;

      spiralSizes.forEach(({ centerX, centerY, size }) => {
        ctx.beginPath();
        for (let angle = 0; angle < 6 * Math.PI; angle += 0.1) {
          const radius = (size / (6 * Math.PI)) * angle;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });
    };

    const drawTemplate = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      topic: string
    ) => {
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'transparent';

      const centerX = width / 2;
      const centerY = height / 2;

      const lowerTopic = topic.toLowerCase();

      if (lowerTopic.includes('daisy') || lowerTopic.includes('flower')) {
        drawDaisy(ctx, centerX, centerY, 80);
      } else if (lowerTopic.includes('cloud')) {
        drawCloud(ctx, centerX, centerY, 120);
      } else if (lowerTopic.includes('dog')) {
        drawDog(ctx, centerX, centerY, 100);
      } else if (lowerTopic.includes('music') || lowerTopic.includes('note')) {
        drawMusicNote(ctx, centerX, centerY, 120);
      } else if (lowerTopic.includes('star')) {
        drawStar(ctx, centerX, centerY, 5, 100, 50);
      } else {
        drawHeart(ctx, centerX, centerY, 100);
      }
    };

    const drawDaisy = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.25, 0, 2 * Math.PI);
      ctx.stroke();

      // Petals
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        ctx.beginPath();
        const petalX = cx + Math.cos(angle) * size * 0.45;
        const petalY = cy + Math.sin(angle) * size * 0.45;
        ctx.ellipse(petalX, petalY, size * 0.25, size * 0.45, angle, 0, 2 * Math.PI);
        ctx.stroke();
      }
    };

    const drawCloud = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
      ctx.beginPath();
      // Main cloud body with circles
      ctx.arc(cx - size * 0.3, cy, size * 0.3, 0, 2 * Math.PI);
      ctx.arc(cx, cy - size * 0.15, size * 0.35, 0, 2 * Math.PI);
      ctx.arc(cx + size * 0.3, cy, size * 0.3, 0, 2 * Math.PI);
      ctx.stroke();
    };

    const drawDog = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
      // Simple dog face
      // Head
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.5, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Left ear
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.45, cy - size * 0.3, size * 0.25, size * 0.4, -0.3, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Right ear
      ctx.beginPath();
      ctx.ellipse(cx + size * 0.45, cy - size * 0.3, size * 0.25, size * 0.4, 0.3, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Left eye
      ctx.beginPath();
      ctx.arc(cx - size * 0.2, cy - size * 0.1, size * 0.08, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Right eye
      ctx.beginPath();
      ctx.arc(cx + size * 0.2, cy - size * 0.1, size * 0.08, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Nose
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.15, size * 0.12, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Mouth
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.15, size * 0.25, 0.2, Math.PI - 0.2);
      ctx.stroke();
    };

    const drawMusicNote = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
      // Note head
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.15, cy + size * 0.25, size * 0.15, size * 0.2, 0.3, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Stem
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.15);
      ctx.lineTo(cx, cy - size * 0.35);
      ctx.stroke();
      
      // Flag
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.35);
      ctx.quadraticCurveTo(cx + size * 0.3, cy - size * 0.25, cx + size * 0.15, cy - size * 0.05);
      ctx.stroke();
    };

    const drawStar = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.stroke();
    };

    const drawHeart = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(cx, cy + topCurveHeight);
      ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + topCurveHeight);
      ctx.bezierCurveTo(
        cx - size / 2,
        cy + (size + topCurveHeight) / 2,
        cx,
        cy + (size + topCurveHeight) / 1.2,
        cx,
        cy + size
      );
      ctx.bezierCurveTo(
        cx,
        cy + (size + topCurveHeight) / 1.2,
        cx + size / 2,
        cy + (size + topCurveHeight) / 2,
        cx + size / 2,
        cy + topCurveHeight
      );
      ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + topCurveHeight);
      ctx.closePath();
      ctx.stroke();
    };

    const getMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const checkAccuracy = (x: number, y: number): boolean => {
      const bgCanvas = templateCanvasRef.current;
      if (!bgCanvas) return false;

      const ctx = bgCanvas.getContext('2d');
      if (!ctx) return false;

      const imageData = ctx.getImageData(x, y, 1, 1);
      const [r, g, b, a] = imageData.data;

      return a > 0 && (r < 250 || g < 250 || b < 250);
    };

    const applySelfCorrection = (point: Point): Point => {
      const bgCanvas = templateCanvasRef.current;
      if (!bgCanvas) return point;

      const searchRadius = 20;
      let nearestPoint = point;
      let minDistance = searchRadius;

      for (let dx = -searchRadius; dx <= searchRadius; dx += 2) {
        for (let dy = -searchRadius; dy <= searchRadius; dy += 2) {
          const testX = point.x + dx;
          const testY = point.y + dy;
          if (checkAccuracy(testX, testY)) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
              minDistance = distance;
              nearestPoint = { x: testX, y: testY };
            }
          }
        }
      }

      return nearestPoint;
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = mode === 'trace' ? traceLayerRef.current : colorLayerRef.current;
      if (!canvas) return;

      const point = getMousePos(canvas, e);
      setIsDrawing(true);
      setLastPoint(point);
      
      // Trigger first stroke callback
      if (!hasDrawn && onFirstStroke) {
        onFirstStroke();
        setHasDrawn(true);
      }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;

      const canvas = mode === 'trace' ? traceLayerRef.current : colorLayerRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let currentPoint = getMousePos(canvas, e);

      // Apply self-correction only for trace mode
      if (selfCorrecting && mode === 'trace') {
        currentPoint = applySelfCorrection(currentPoint);
      }

      // Check accuracy if enabled and in trace mode
      if (onAccuracyUpdate && template && mode === 'trace') {
        const isAccurate = checkAccuracy(currentPoint.x, currentPoint.y);
        setAccuracyPoints((prev) => {
          const newPoints = {
            total: prev.total + 1,
            accurate: prev.accurate + (isAccurate ? 1 : 0),
          };
          const accuracy = (newPoints.accurate / newPoints.total) * 100;
          onAccuracyUpdate(accuracy);
          return newPoints;
        });
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      }

      setLastPoint(currentPoint);
    };

    const stopDrawing = () => {
      if (isDrawing) {
        setIsDrawing(false);
        setLastPoint(null);
        if (mode === 'trace') {
          saveTraceState();
        } else {
          saveColorState();
        }
      }
    };

    return (
      <div className="relative w-full h-full">
        {/* Template layer (bottom) */}
        <canvas ref={templateCanvasRef} className="absolute inset-0 w-full h-full" />
        {/* Color layer (middle) - always visible at full opacity */}
        <canvas
          ref={colorLayerRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: mode === 'trace' ? 0.3 : 1 }}
        />
        {/* Trace layer (top) - keep at full opacity in color mode so lines stay black */}
        <canvas
          ref={traceLayerRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 1 }}
        />
        {/* Interactive layer */}
        <canvas
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ width: '100%', height: '100%' }}
          width={traceLayerRef.current?.width}
          height={traceLayerRef.current?.height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
