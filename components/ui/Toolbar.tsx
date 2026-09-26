"use client";

import React, { useEffect } from "react";
import {
  MousePointer,
  Move,
  RotateCw,
  Maximize2,
  Undo2,
  Redo2,
  Sparkles,
  Download,
  Grid3X3,
  Compass,
  Building,
} from "lucide-react";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { TransformMode } from "@/types/scene";

interface ToolbarProps {
  onOpenAIModal: () => void;
  onExportScene: () => void;
}

export function Toolbar({ onOpenAIModal, onExportScene }: ToolbarProps) {
  const transformMode = useSceneStore((state) => state.transformMode);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const snapMode = useSceneStore((state) => state.snapMode);
  const setSnapMode = useSceneStore((state) => state.setSnapMode);
  const terrainConfig = useSceneStore((state) => state.terrainConfig);
  const updateTerrainConfig = useSceneStore((state) => state.updateTerrainConfig);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const historyPast = useSceneStore((state) => state.historyPast);
  const historyFuture = useSceneStore((state) => state.historyFuture);

  // Keyboard shortcut listener (Q, W, E, R, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        redo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case "q":
          setTransformMode("select");
          break;
        case "w":
          setTransformMode("translate");
          break;
        case "e":
          setTransformMode("rotate");
          break;
        case "r":
          setTransformMode("scale");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTransformMode, undo, redo]);

  const tools: { mode: TransformMode; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { mode: "select", label: "Select", shortcut: "Q", icon: <MousePointer className="w-4 h-4" /> },
    { mode: "translate", label: "Move", shortcut: "W", icon: <Move className="w-4 h-4" /> },
    { mode: "rotate", label: "Rotate", shortcut: "E", icon: <RotateCw className="w-4 h-4" /> },
    { mode: "scale", label: "Scale", shortcut: "R", icon: <Maximize2 className="w-4 h-4" /> },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl pointer-events-auto">
      {/* Transform Tools Group */}
      <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
        {tools.map((tool) => {
          const isActive = transformMode === tool.mode;
          return (
            <button
              key={tool.mode}
              onClick={() => setTransformMode(tool.mode)}
              title={`${tool.label} (${tool.shortcut})`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-semibold"
                  : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              {tool.icon}
              <span className="hidden sm:inline">{tool.label}</span>
              <kbd className={`text-[10px] px-1 rounded ${isActive ? "bg-cyan-600/40 text-slate-900" : "bg-slate-800 text-slate-400"}`}>
                {tool.shortcut}
              </kbd>
            </button>
          );
        })}
      </div>

      <div className="w-[1px] h-6 bg-slate-800 mx-1" />

      {/* Snapping Mode Toggle */}
      <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setSnapMode(snapMode === "gravity_upright" ? "terrain_normal" : "gravity_upright")}
          title={`Snapping: ${snapMode === "gravity_upright" ? "Gravity Upright (Y-Up)" : "Surface Normal Aligned"}`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          {snapMode === "gravity_upright" ? (
            <>
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Upright</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Normal</span>
            </>
          )}
        </button>

        {/* Wireframe Toggle */}
        <button
          onClick={() => updateTerrainConfig({ wireframe: !terrainConfig.wireframe })}
          title="Toggle Terrain Wireframe"
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            terrainConfig.wireframe ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/30" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-slate-800 mx-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          disabled={historyPast.length === 0}
          title="Undo (Ctrl+Z)"
          className="p-2 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyFuture.length === 0}
          title="Redo (Ctrl+Y)"
          className="p-2 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-slate-800 mx-1" />

      {/* AI Generative 3D Studio Button */}
      <button
        onClick={onOpenAIModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
        <span>AI 3D Studio</span>
      </button>

      {/* Export Combined GLB */}
      <button
        onClick={onExportScene}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 transition-colors"
        title="Export full scene (terrain + assets) as .GLB"
      >
        <Download className="w-3.5 h-3.5 text-slate-300" />
        <span className="hidden md:inline">Export Scene</span>
      </button>
    </div>
  );
}
