export type TransformMode = "select" | "translate" | "rotate" | "scale";
export type CameraView = "perspective" | "top" | "front" | "isometric";

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

export interface TerrainConfig {
  size: number;
  segments: number;
  maxElevation: number;
  wireframe: boolean;
  showLOD: boolean;
  snowElevation: number;
  rockSlopeAngle: number; // e.g. 25-30 degrees
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
