/**
 * Real-world Digital Elevation Model (DEM) Loader
 * Loads sub-meter true-to-life elevation data from Mapbox Terrain-RGB DEM mosaics.
 */

export interface TerrainMetadata {
  locationId: string;
  name: string;
  zoom: number;
  tiles: string[];
  bounds: { west: number; east: number; north: number; south: number };
  center: { lat: number; lng: number };
  gridSize: number;
  minElevationMeters: number;
  maxElevationMeters: number;
  elevationDeltaMeters: number;
  groundResolutionMeters: number;
}

let cachedDemData: Float32Array | null = null;
let loadPromise: Promise<Float32Array | null> | null = null;

export const FERGANA_DEM_META: TerrainMetadata = {
  locationId: "fergana_alay",
  name: "Fergana Valley / Alay Range (Sux-Batken Border)",
  zoom: 14,
  tiles: ["11430,6204", "11431,6204", "11430,6205", "11431,6205"],
  bounds: {
    west: 71.1474609375,
    east: 71.19140625,
    north: 39.97712009843962,
    south: 39.943436461974215,
  },
  center: {
    lat: 39.96027828020692,
    lng: 71.16943359375,
  },
  gridSize: 512,
  minElevationMeters: 1147.1,
  maxElevationMeters: 1612.5,
  elevationDeltaMeters: 465.4,
  groundResolutionMeters: 7.33,
};

/**
 * Fetch and cache the 512x512 Float32 binary DEM grid
 */
export async function loadFerganaDEM(): Promise<Float32Array | null> {
  if (cachedDemData) return cachedDemData;
  if (loadPromise) return loadPromise;

  if (typeof window === "undefined") return null;

  loadPromise = (async () => {
    try {
      const res = await fetch("/terrain/fergana_dem_512.bin");
      if (!res.ok) throw new Error(`HTTP ${res.status} loading DEM`);
      const buffer = await res.arrayBuffer();
      cachedDemData = new Float32Array(buffer);
      return cachedDemData;
    } catch (err) {
      console.warn("Failed to load real DEM binary, falling back:", err);
      return null;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function getCachedFerganaDEM(): Float32Array | null {
  return cachedDemData;
}

/**
 * Sample true physical elevation in meters above sea level with bilinear interpolation
 */
export function sampleRealElevationMeters(
  worldX: number,
  worldZ: number,
  totalTerrainSize: number = 120,
  grid: Float32Array | null = cachedDemData
): number {
  if (!grid) return FERGANA_DEM_META.minElevationMeters;

  const N = FERGANA_DEM_META.gridSize; // 512
  const half = totalTerrainSize / 2;
  const u = Math.min(Math.max((worldX + half) / totalTerrainSize, 0), 1);
  const v = Math.min(Math.max((worldZ + half) / totalTerrainSize, 0), 1);

  const fx = u * (N - 1);
  const fy = v * (N - 1);

  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, N - 1);
  const y1 = Math.min(y0 + 1, N - 1);

  const s = fx - x0;
  const t = fy - y0;

  const h00 = grid[y0 * N + x0];
  const h10 = grid[y0 * N + x1];
  const h01 = grid[y1 * N + x0];
  const h11 = grid[y1 * N + x1];

  const h0 = h00 * (1 - s) + h10 * s;
  const h1 = h01 * (1 - s) + h11 * s;

  return h0 * (1 - t) + h1 * t;
}

/**
 * Sample 3D world height Y for Three.js geometry displacement
 * Transforms real elevation (1,147m - 1,612m) into scaled Three.js units
 */
export function sampleRealElevationWorldY(
  worldX: number,
  worldZ: number,
  totalTerrainSize: number = 120,
  exaggeration: number = 1.25,
  grid: Float32Array | null = cachedDemData
): number {
  const meters = sampleRealElevationMeters(worldX, worldZ, totalTerrainSize, grid);
  const minM = FERGANA_DEM_META.minElevationMeters; // 1147.1m
  const deltaM = FERGANA_DEM_META.elevationDeltaMeters; // 465.4m

  // 1 unit in world space is ~31.25m in physical space (120 units = 3,750m)
  const physicalScale = totalTerrainSize / 3750; // ~0.032 units/meter
  const baseValleyOffset = 2.0;

  const relativeElevation = (meters - minM) * physicalScale * exaggeration;
  return baseValleyOffset + relativeElevation;
}
