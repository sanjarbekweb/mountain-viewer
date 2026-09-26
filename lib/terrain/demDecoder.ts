/**
 * Digital Elevation Model (DEM) and Fractal Alpine Elevation Generator
 */

export interface ElevationGrid {
  width: number;
  height: number;
  data: Float32Array; // heights in world units
  minElevation: number;
  maxElevation: number;
}

/**
 * Decode Mapbox RGB DEM format:
 * elevation (meters) = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
 */
export function decodeMapboxRGB(
  pixelData: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  verticalScale: number = 0.05
): ElevationGrid {
  const data = new Float32Array(width * height);
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < width * height; i++) {
    const r = pixelData[i * 4];
    const g = pixelData[i * 4 + 1];
    const b = pixelData[i * 4 + 2];

    const meters = -10000 + (r * 65536 + g * 256 + b) * 0.1;
    const scaledHeight = meters * verticalScale;
    data[i] = scaledHeight;

    if (scaledHeight < min) min = scaledHeight;
    if (scaledHeight > max) max = scaledHeight;
  }

  return { width, height, data, minElevation: min, maxElevation: max };
}

/**
 * Procedural Alpine Mountain Elevation Generator
 * Generates realistic jagged ridges, cirques, and glacial valleys using
 * Ridged Multi-fractal noise with domain warping.
 */
export function generateAlpineFractalDEM(
  width: number,
  height: number,
  maxElevation: number = 38
): ElevationGrid {
  const data = new Float32Array(width * height);
  let min = Infinity;
  let max = -Infinity;

  // Simple deterministic pseudo-random hash
  function pseudoRandom(x: number, y: number): number {
    const dot = x * 12.9898 + y * 78.233;
    const sin = Math.sin(dot) * 43758.5453123;
    return sin - Math.floor(sin);
  }

  function smoothNoise(x: number, y: number): number {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;

    // Quintic interpolation curve (smoother derivatives than cubic)
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);

    const a = pseudoRandom(i, j);
    const b = pseudoRandom(i + 1, j);
    const c = pseudoRandom(i, j + 1);
    const d = pseudoRandom(i + 1, j + 1);

    return (
      a * (1 - u) * (1 - v) +
      b * u * (1 - v) +
      c * (1 - u) * v +
      d * u * v
    );
  }

  // Fractional Brownian Motion with Ridged Multi-fractal
  function fbmRidged(nx: number, ny: number): number {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let weight = 1;

    for (let o = 0; o < 6; o++) {
      const n = smoothNoise(nx * freq, ny * freq);
      // Ridged noise: sharp mountain crests
      let signal = 1.0 - Math.abs(n * 2.0 - 1.0);
      signal = signal * signal * weight;
      weight = Math.min(1.0, Math.max(0.0, signal * 2.0));
      sum += signal * amp;
      freq *= 2.05;
      amp *= 0.52;
    }
    return sum;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1);
      const v = y / (height - 1);

      // Distance from center for radial mountain mass falloff
      const dx = (u - 0.5) * 2;
      const dy = (v - 0.5) * 2;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      const boundaryFalloff = Math.max(0, 1.0 - Math.pow(distFromCenter, 1.8));

      // Domain warping for natural ridge twists
      const warpX = smoothNoise(u * 3, v * 3) * 0.4;
      const warpY = smoothNoise(u * 3 + 5.2, v * 3 + 1.3) * 0.4;

      const baseElevation = fbmRidged((u + warpX) * 3.5, (v + warpY) * 3.5);
      // Valley carving
      const valley = Math.pow(smoothNoise(u * 2, v * 2), 2) * 0.3;

      let elevation = (baseElevation - valley) * boundaryFalloff * maxElevation;
      if (elevation < 0) elevation = 0;

      const idx = y * width + x;
      data[idx] = elevation;

      if (elevation < min) min = elevation;
      if (elevation > max) max = elevation;
    }
  }

  return { width, height, data, minElevation: min, maxElevation: max };
}
