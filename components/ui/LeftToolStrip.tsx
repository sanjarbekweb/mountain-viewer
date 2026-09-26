"use client";

import React from "react";
import {
  MousePointer,
  Move,
  RotateCw,
  Maximize2,
  Mountain,
  Grid3X3,
  Box,
  Sparkles,
  Camera,
  Cloud,
} from "lucide-react";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { TransformMode } from "@/types/scene";

export interface LeftToolStripProps {
  onOpenAssetLibrary?: () => void;
  onOpenAIModal?: () => void;
  onModifyTerrain?: () => void;
  onCameraControls?: () => void;
  className?: string;
}

export function LeftToolStrip({
  onOpenAssetLibrary,
  onOpenAIModal,
  onModifyTerrain,
  onCameraControls,
  className = "",
}: LeftToolStripProps) {
  const transformMode = useSceneStore((state) => state.transformMode);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const terrainConfig = useSceneStore((state) => state.terrainConfig);
  const updateTerrainConfig = useSceneStore((state) => state.updateTerrainConfig);

  const isWireframeActive = Boolean(terrainConfig?.wireframe);

  const transformTools: {
    mode: TransformMode;
    label: string;
    shortcut: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { mode: "select", label: "Select", shortcut: "Q", icon: MousePointer },
    { mode: "translate", label: "Translate", shortcut: "W", icon: Move },
    { mode: "rotate", label: "Rotate", shortcut: "E", icon: RotateCw },
    { mode: "scale", label: "Scale", shortcut: "R", icon: Maximize2 },
  ];

  return (
    <aside
      aria-label="Left Tool Strip"
      className={`absolute left-0 top-0 bottom-0 w-11 z-20 flex flex-col bg-[#0d1117]/90 backdrop-blur-sm border-r border-slate-800 py-1 select-none pointer-events-auto ${className}`}
    >
      {/* Group 1: Selection & Transform */}
      <div className="flex flex-col items-center">
        {transformTools.map((tool) => {
          const isActive = transformMode === tool.mode;
          const Icon = tool.icon;

          return (
            <button
              key={tool.mode}
              type="button"
              onClick={() => setTransformMode(tool.mode)}
              title={`${tool.label} (${tool.shortcut})`}
              aria-label={`${tool.label} (${tool.shortcut})`}
              className={`w-11 h-11 flex items-center justify-center transition-colors border-l-2 ${
                isActive
                  ? "border-cyan-400 bg-slate-800/80 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-slate-700 mx-auto my-1 shrink-0" />

      {/* Group 2: Terrain */}
      <div className="flex flex-col items-center">
        {/* Mountain (Modify Terrain) */}
        <button
          type="button"
          onClick={onModifyTerrain}
          title="Modify Terrain"
          aria-label="Modify Terrain"
          className="w-11 h-11 flex items-center justify-center transition-colors border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <Mountain className="w-4 h-4" />
        </button>

        {/* Grid3X3 (Toggle Wireframe) */}
        <button
          type="button"
          onClick={() => updateTerrainConfig({ wireframe: !isWireframeActive })}
          title="Toggle Wireframe"
          aria-label="Toggle Wireframe"
          className={`w-11 h-11 flex items-center justify-center transition-colors border-l-2 ${
            isWireframeActive
              ? "border-cyan-400 bg-slate-800/80 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-slate-700 mx-auto my-1 shrink-0" />

      {/* Group 3: Assets */}
      <div className="flex flex-col items-center">
        {/* Box (Asset Library) */}
        <button
          type="button"
          onClick={onOpenAssetLibrary}
          title="Asset Library"
          aria-label="Asset Library"
          className="w-11 h-11 flex items-center justify-center transition-colors border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <Box className="w-4 h-4" />
        </button>

        {/* Sparkles (AI Generator) */}
        <button
          type="button"
          onClick={onOpenAIModal}
          title="AI Generator"
          aria-label="AI Generator"
          className="w-11 h-11 flex items-center justify-center transition-colors border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Group 4: Bottom Tools & Status (mt-auto) */}
      <div className="mt-auto flex flex-col items-center">
        {/* Divider */}
        <div className="w-6 h-px bg-slate-700 mx-auto my-1 shrink-0" />

        {/* Camera (Camera Controls) */}
        <button
          type="button"
          onClick={onCameraControls}
          title="Camera Controls"
          aria-label="Camera Controls"
          className="w-11 h-11 flex items-center justify-center transition-colors border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Cloud (Cloud Status indicator) */}
        <button
          type="button"
          title="Cloud Status: Connected"
          aria-label="Cloud Status: Connected"
          className="w-11 h-11 flex items-center justify-center relative transition-colors border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <Cloud className="w-4 h-4" />
          <span className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1117]" />
        </button>
      </div>
    </aside>
  );
}

export default LeftToolStrip;
