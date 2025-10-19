/* Measures Parkinson's spiral test accuracy using Apple Pencil input
   Tracks stroke coordinates, velocity, acceleration, jerk, and pressure
*/

export interface SpiralStroke {
  x: number;
  y: number;
  pressure: number;  // 0-1
  timestamp: number; // ms
}

export interface SpiralAccuracyResult {
  pixelDeviation: number;       // mean distance from reference spiral path (pixels)
  velocityMean: number;         // mean stroke velocity
  accelerationMean: number;     // mean stroke acceleration
  jerkMean: number;             // mean stroke jerk
  pressureMean: number;         // mean pressure
  pressureStd: number;          // standard deviation of pressure
  totalAccuracy: number;        // weighted score combining deviation and smoothness
  elapsedTime: number;          // total drawing time (ms)
}

/**
 * Calculates spiral drawing accuracy.
 *
 * Method:
 * - Compares each stroke point to the closest reference spiral point
 * - Computes velocity, acceleration, jerk based on timestamps
 * - Computes mean and std of pressure values
 * - Computes weighted total accuracy combining deviation and smoothness
 *
 * @param strokes Array of user stroke points {x, y, pressure, timestamp}
 * @param referencePath Array of reference spiral points [{x, y}]
 * @param elapsedTime Total drawing time in ms
 * @returns SpiralAccuracyResult
 */
export function calculateSpiralAccuracy(
  strokes: SpiralStroke[],
  referencePath: { x: number; y: number }[],
  elapsedTime: number
): SpiralAccuracyResult {
  if (strokes.length < 2 || referencePath.length < 2) {
    throw new Error("Not enough points to calculate accuracy.");
  }

  // --- Pixel/path deviation ---
  let totalDeviation = 0;
  for (const stroke of strokes) {
    // Find closest point in referencePath
    let minDist = Infinity;
    for (const ref of referencePath) {
      const dx = stroke.x - ref.x;
      const dy = stroke.y - ref.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) minDist = dist;
    }
    totalDeviation += minDist;
  }
  const pixelDeviation = totalDeviation / strokes.length;

  // velocity, acceleration, jerk
  const velocities: number[] = [];
  const accelerations: number[] = [];
  const jerks: number[] = [];

  for (let i = 1; i < strokes.length; i++) {
    const dt = strokes[i].timestamp - strokes[i - 1].timestamp;
    if (dt === 0) continue;
    const dx = strokes[i].x - strokes[i - 1].x;
    const dy = strokes[i].y - strokes[i - 1].y;
    const v = Math.sqrt(dx * dx + dy * dy) / dt;
    velocities.push(v);
  }

  for (let i = 1; i < velocities.length; i++) {
    const a = (velocities[i] - velocities[i - 1]) / (strokes[i + 1].timestamp - strokes[i].timestamp);
    accelerations.push(a);
  }

  for (let i = 1; i < accelerations.length; i++) {
    const j = (accelerations[i] - accelerations[i - 1]) / (strokes[i + 2].timestamp - strokes[i + 1].timestamp);
    jerks.push(j);
  }

  const mean = (arr: number[]) => arr.reduce((sum, val) => sum + val, 0) / (arr.length || 1);
  const std = (arr: number[]) => {
    const m = mean(arr);
    return Math.sqrt(arr.reduce((sum, val) => sum + (val - m) ** 2, 0) / (arr.length || 1));
  };

  const velocityMean = mean(velocities);
  const accelerationMean = mean(accelerations);
  const jerkMean = mean(jerks);

  // --- Pressure metrics ---
  const pressures = strokes.map((s) => s.pressure);
  const pressureMean = mean(pressures);
  const pressureStd = std(pressures);

  // --- Total accuracy ---
  // You can weight deviation and smoothness (lower deviation & jerk = higher accuracy)
  const totalAccuracy = 1 / (1 + pixelDeviation + jerkMean); // simple example

  return {
    pixelDeviation,
    velocityMean,
    accelerationMean,
    jerkMean,
    pressureMean,
    pressureStd,
    totalAccuracy,
    elapsedTime,
  };
}
