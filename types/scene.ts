export type TransformMode = "select" | "translate" | "rotate" | "scale";
export type CameraView = "perspective" | "top" | "front" | "isometric";
export type MapSource = "mapbox_simulator" | "google_3d_tiles" | "procedural_alpine" | "satellite_dem";
export type ThemeMode = "dark" | "light";
export type MapboxStyle = "light" | "outdoors" | "satellite";

export interface MapboxConfig {
  accessToken: string;
  style: MapboxStyle;
  exaggeration: number;
  showContourLines: boolean;
  contourInterval: number;
  showRoadsAndWater: boolean;
  status: "simulating" | "connected";
}

export interface FoundationSettings {
  enabled: boolean;
  depth: number;
  material: "concrete" | "stone" | "dark_slate";
  color?: string;
  autoAdaptive: boolean;
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
  dimensions: [number, number, number];
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
  altitude: number;
  peakElevation: number;
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
  rockSlopeAngle: number;
  mapSource: MapSource;
  activeLocationId: string;
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
