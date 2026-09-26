export type TransformMode = "select" | "translate" | "rotate" | "scale";
export type CameraView = "perspective" | "top" | "front" | "isometric";
export type ViewMode = "dashboard" | "studio";
export type MapSource = "google_3d_tiles" | "satellite_dem" | "procedural_alpine";

export interface FoundationSettings {
  enabled: boolean;
  depth: number;
  material: "concrete" | "stone" | "dark_slate";
  color?: string;
  autoAdaptive: boolean; // if true, dynamically calculates depth based on slope drop
}

export interface PlacedAsset {
  id: string;
  name: string;
  sourceUrl: string;
  thumbnailUrl?: string;
  type: "building" | "cabin" | "tower" | "prop" | "ai_generated";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  dimensions: [number, number, number]; // width (X), height (Y), depth (Z)
  alignToNormal: boolean;
  foundation: FoundationSettings;
  visible: boolean;
  locked: boolean;
}

export interface EarthLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  altitude: number; // in meters
  peakElevation: number; // in meters
  tag: string;
  description: string;
  thumbnailUrl: string;
  roughness: number;
  elevationScale: number;
}

export interface GoogleTilesConfig {
  apiKey: string;
  quality: "standard" | "high" | "ultra";
  maxDepth: number;
  showAttribution: boolean;
  status: "idle" | "connecting" | "active" | "error";
  errorMessage?: string;
}

export interface TerrainConfig {
  size: number;
  segments: number;
  maxElevation: number;
  wireframe: boolean;
  showLOD: boolean;
  snowElevation: number;
  rockSlopeAngle: number; // e.g. 25-30 degrees
  mapSource: MapSource;
  activeLocationId: string;
  satelliteTextureUrl?: string;
}

export interface AIModelTask {
  taskId: string;
  status: "QUEUED" | "PROCESSING" | "SUCCEEDED" | "FAILED";
  progress: number;
  modelUrl?: string;
  thumbnailUrl?: string;
  previewImage?: string;
  promptHint?: string;
  error?: string;
  createdAt: number;
}
