import { create } from "zustand";
import { PlacedAsset, TransformMode, TerrainConfig, ViewMode, GoogleTilesConfig } from "@/types/scene";
import { getLandmarkById } from "@/lib/terrain/earthLandmarks";

interface SceneStore {
  // Navigation & View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Asset Management
  assets: PlacedAsset[];
  selectedAssetId: string | null;
  transformMode: TransformMode;
  snapMode: "terrain_normal" | "gravity_upright";
  isDraggingGizmo: boolean;

  // Placement Tool
  assetToPlace: {
    name: string;
    type: PlacedAsset["type"];
    sourceUrl: string;
    dimensions: [number, number, number];
    alignToNormal: boolean;
  } | null;

  // Terrain & Google Earth Configuration
  terrainConfig: TerrainConfig;
  googleTilesConfig: GoogleTilesConfig;

  // History (Undo / Redo)
  historyPast: PlacedAsset[][];
  historyFuture: PlacedAsset[][];

  // Actions
  selectAsset: (id: string | null) => void;
  setTransformMode: (mode: TransformMode) => void;
  setSnapMode: (mode: "terrain_normal" | "gravity_upright") => void;
  setDraggingGizmo: (isDragging: boolean) => void;
  setAssetToPlace: (asset: SceneStore["assetToPlace"]) => void;

  addAsset: (asset: PlacedAsset) => void;
  updateAsset: (id: string, updates: Partial<PlacedAsset>) => void;
  removeAsset: (id: string) => void;
  duplicateAsset: (id: string) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;

  updateTerrainConfig: (updates: Partial<TerrainConfig>) => void;
  setGoogleTilesConfig: (updates: Partial<GoogleTilesConfig>) => void;
  selectLocation: (locationId: string) => void;

  undo: () => void;
  redo: () => void;
}

const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  size: 160,
  segments: 192,
  maxElevation: 42,
  wireframe: false,
  showLOD: true,
  snowElevation: 24,
  rockSlopeAngle: 28,
  mapSource: "procedural_alpine",
  activeLocationId: "matterhorn",
};

const DEFAULT_GOOGLE_TILES_CONFIG: GoogleTilesConfig = {
  apiKey: "",
  quality: "high",
  maxDepth: 18,
  showAttribution: true,
  status: "idle",
};

export const useSceneStore = create<SceneStore>((set, get) => ({
  viewMode: "dashboard", // default to modern Google Earth 3D Explorer dashboard
  setViewMode: (mode) => set({ viewMode: mode }),

  assets: [
    {
      id: "preset-alpine-lodge",
      name: "Alpine Timber Lodge",
      sourceUrl: "/models/sample_cabin.glb",
      thumbnailUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80",
      type: "cabin",
      position: [12, 11.2, -8],
      rotation: [0, 0.4, 0],
      scale: [1, 1, 1],
      dimensions: [6, 4.5, 8],
      alignToNormal: false,
      foundation: {
        enabled: true,
        depth: 2.8,
        material: "stone",
        autoAdaptive: true,
      },
      visible: true,
      locked: false,
    },
    {
      id: "preset-lookout-tower",
      name: "Panoramic Lookout Tower",
      sourceUrl: "/models/sample_tower.glb",
      thumbnailUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80",
      type: "tower",
      position: [-24, 21.8, 16],
      rotation: [0, -0.6, 0],
      scale: [1, 1, 1],
      dimensions: [4, 12, 4],
      alignToNormal: false,
      foundation: {
        enabled: true,
        depth: 3.5,
        material: "concrete",
        autoAdaptive: true,
      },
      visible: true,
      locked: false,
    },
  ],
  selectedAssetId: "preset-alpine-lodge",
  transformMode: "translate",
  snapMode: "gravity_upright",
  isDraggingGizmo: false,
  assetToPlace: null,
  terrainConfig: DEFAULT_TERRAIN_CONFIG,
  googleTilesConfig: DEFAULT_GOOGLE_TILES_CONFIG,
  historyPast: [],
  historyFuture: [],

  selectAsset: (id) => set({ selectedAssetId: id }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  setSnapMode: (mode) => set({ snapMode: mode }),

  setDraggingGizmo: (isDragging) => set({ isDraggingGizmo: isDragging }),

  setAssetToPlace: (asset) => set({ assetToPlace: asset }),

  addAsset: (asset) => {
    const { assets, historyPast } = get();
    set({
      historyPast: [...historyPast.slice(-20), assets],
      historyFuture: [],
      assets: [...assets, asset],
      selectedAssetId: asset.id,
      assetToPlace: null, // exit placement mode after drop
    });
  },

  updateAsset: (id, updates) => {
    const { assets } = get();
    const updated = assets.map((a) => (a.id === id ? { ...a, ...updates } : a));
    set({
      assets: updated,
    });
  },

  removeAsset: (id) => {
    const { assets, historyPast, selectedAssetId } = get();
    set({
      historyPast: [...historyPast.slice(-20), assets],
      historyFuture: [],
      assets: assets.filter((a) => a.id !== id),
      selectedAssetId: selectedAssetId === id ? null : selectedAssetId,
    });
  },

  duplicateAsset: (id) => {
    const { assets, historyPast } = get();
    const source = assets.find((a) => a.id === id);
    if (!source) return;

    const duplicate: PlacedAsset = {
      ...source,
      id: crypto.randomUUID(),
      name: `${source.name} (Copy)`,
      position: [source.position[0] + 3, source.position[1], source.position[2] + 3],
    };

    set({
      historyPast: [...historyPast.slice(-20), assets],
      historyFuture: [],
      assets: [...assets, duplicate],
      selectedAssetId: duplicate.id,
    });
  },

  toggleVisibility: (id) => {
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id === id ? { ...a, visible: !a.visible } : a
      ),
    }));
  },

  toggleLock: (id) => {
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id === id ? { ...a, locked: !a.locked } : a
      ),
    }));
  },

  updateTerrainConfig: (updates) => {
    set((state) => ({
      terrainConfig: { ...state.terrainConfig, ...updates },
    }));
  },

  setGoogleTilesConfig: (updates) => {
    set((state) => ({
      googleTilesConfig: { ...state.googleTilesConfig, ...updates },
    }));
  },

  selectLocation: (locationId) => {
    const landmark = getLandmarkById(locationId);
    set((state) => ({
      terrainConfig: {
        ...state.terrainConfig,
        activeLocationId: locationId,
        maxElevation: landmark.elevationScale,
      },
    }));
  },

  undo: () => {
    const { historyPast, assets, historyFuture } = get();
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    set({
      historyPast: historyPast.slice(0, -1),
      historyFuture: [assets, ...historyFuture],
      assets: previous,
    });
  },

  redo: () => {
    const { historyPast, assets, historyFuture } = get();
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    set({
      historyPast: [...historyPast, assets],
      historyFuture: historyFuture.slice(1),
      assets: next,
    });
  },
}));
