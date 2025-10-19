// Measures tracing accuracy for a coloring/tracing web app with radius-based tolerance.
// Compares user strokes against a skeletonized/faint target outline.
// Any non-white target pixel counts as a pixel that should be traced, but slight offsets are tolerated.

export interface AccuracyResult {
  filledAccuracy: number;    // % of target pixels correctly traced
  overfillAccuracy: number;  // % of traced pixels outside target
  totalAccuracy: number;     // weighted combination: 70% filled, 30% overfill
  filledPixels: number;      // number of correctly traced pixels
  targetPixels: number;      // total number of pixels that should be traced
  overFilledPixels: number;  // number of traced pixels outside the target
  totalPixels: number;       // total pixels on the canvas
  elapsedTime: number;       // total active drawing time in milliseconds
}

/**
 * Calculates tracing accuracy by comparing the user's strokes on the trace canvas
 * against the target outline with a small radius tolerance.
 *
 * Method:
 * - Each non-white pixel in the target canvas counts as a "target pixel."
 * - A target pixel is considered filled if any user stroke pixel is within `radius`.
 * - Any stroke pixel outside all target pixels counts as overfilled.
 * - Filled accuracy = correctly filled pixels / total target pixels.
 * - Overfill accuracy = 1 - overfilled pixels / total canvas pixels.
 * - Total accuracy = weighted sum: 70% filled + 30% overfill.
 *
 * @param traceCanvas - Canvas containing the user's tracing strokes
 * @param targetCanvas - Canvas containing the target outline
 * @param elapsedTime - Time spent actively drawing in milliseconds
 * @param radius - tolerance radius in pixels for counting a stroke as on the line (default 2)
 * @returns AccuracyResult containing detailed tracing metrics
 */
export function calculateAccuracy(
  traceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  elapsedTime: number,
  radius = 2
): AccuracyResult {
  if (traceCanvas.width !== targetCanvas.width || traceCanvas.height !== targetCanvas.height) {
    throw new Error("Trace and target canvases must be the same size.");
  }

  const width = traceCanvas.width;
  const height = traceCanvas.height;

  const traceCtx = traceCanvas.getContext("2d");
  const targetCtx = targetCanvas.getContext("2d");
  if (!traceCtx || !targetCtx) throw new Error("Failed to get 2D context from one or both canvases");

  const traceData = traceCtx.getImageData(0, 0, width, height).data;
  const targetData = targetCtx.getImageData(0, 0, width, height).data;

  let filledPixels = 0;
  let targetPixels = 0;
  let overFilledPixels = 0;

  // Helper: checks if a pixel in target is non-white
  const isTargetPixel = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    const [r, g, b, a] = targetData.slice(i, i + 4);
    return !(r > 240 && g > 240 && b > 240 && a > 40);
  };

  // Helper: checks if a pixel in trace is drawn
  const isTracePixel = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    const [r, g, b, a] = traceData.slice(i, i + 4);
    return a > 40;
  };

  // Loop through all pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const targetPixel = isTargetPixel(x, y);
      if (targetPixel) targetPixels++;

      // Check if user stroke is near this target pixel
      let filled = false;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (isTracePixel(nx, ny)) filled = true;
        }
      }
      if (filled) filledPixels++;
    }
  }

  // Count overfilled pixels (strokes not near any target pixel)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isTracePixel(x, y)) {
        // Check if near any target pixel
        let nearTarget = false;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (isTargetPixel(nx, ny)) nearTarget = true;
          }
        }
        if (!nearTarget) overFilledPixels++;
      }
    }
  }

  const filledAccuracy = targetPixels ? filledPixels / targetPixels : 0;
  const totalPixels = width * height;
  const overfillAccuracy = totalPixels ? 1 - overFilledPixels / totalPixels : 1;
  const totalAccuracy = 0.7 * filledAccuracy + 0.3 * overfillAccuracy;

  return {
    filledAccuracy,
    overfillAccuracy,
    totalAccuracy,
    filledPixels,
    targetPixels,
    overFilledPixels,
    totalPixels,
    elapsedTime,
  };
}
