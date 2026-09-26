"use client";

import React, { useEffect } from "react";
import { Mountain, HelpCircle, Settings, Share2, Globe2, LayoutDashboard, MapPin } from "lucide-react";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { TransformMode, ViewMode } from "@/types/scene";
import { getLandmarkById } from "@/lib/terrain/earthLandmarks";

export interface TopMenuBarProps {
  onOpenAIModal: () => void;
  onExportScene: () => void;
}

export function TopMenuBar({ onOpenAIModal, onExportScene }: TopMenuBarProps) {
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const viewMode = useSceneStore((state) => state.viewMode);
  const setViewMode = useSceneStore((state) => state.setViewMode);
  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const mapSource = useSceneStore((state) => state.terrainConfig.mapSource);

  const landmark = getLandmarkById(activeLocationId);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Q/W/E/R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside form inputs or editable elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Ignore transform mode shortcuts if modifier keys are active
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Transform Modes: Q (Select), W (Translate), E (Rotate), R (Scale)
      switch (e.key.toLowerCase()) {
        case "q":
          e.preventDefault();
          setTransformMode("select" as TransformMode);
          break;
        case "w":
          e.preventDefault();
          setTransformMode("translate" as TransformMode);
          break;
        case "e":
          e.preventDefault();
          setTransformMode("rotate" as TransformMode);
          break;
        case "r":
          e.preventDefault();
          setTransformMode("scale" as TransformMode);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTransformMode, undo, redo]);

  return (
    <header className="w-full flex flex-col z-30 select-none border-b border-slate-800/80 bg-[#0d111b] pointer-events-auto">
      {/* Title bar row (height ~34px) */}
      <div className="h-[34px] px-4 flex items-center justify-between border-b border-slate-800/60">
        {/* Left side: App icon + title text + current location badge */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <Mountain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            MOUNTAIN ARCHITECT <span className="text-indigo-400 font-normal">:: Earth 3D</span>
          </span>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#151c2d] border border-slate-700/60 text-[10px] text-slate-300">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span className="font-semibold text-white">{landmark.name}</span>
            <span className="text-slate-500">({landmark.altitude}m)</span>
          </div>
        </div>

        {/* Center: View Switcher (Dashboard vs Studio) */}
        <div className="flex items-center bg-[#141b2a] p-0.5 rounded-full border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              viewMode === "dashboard"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe2 className="w-3 h-3" />
            <span>Earth Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("studio")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              viewMode === "studio"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mountain className="w-3 h-3" />
            <span>3D Studio</span>
          </button>
        </div>

        {/* Right side: Actions (Help, Settings, User avatar placeholder, Export/Share) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExportScene}
            title="Export Scene (.GLB)"
            aria-label="Export Scene"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-[#151c2d] hover:bg-indigo-600 border border-slate-700/60 transition-all text-xs font-semibold cursor-pointer"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden md:inline">Export .GLB</span>
          </button>

          <div className="w-px h-3.5 bg-slate-800 mx-1" />

          {/* User profile avatar */}
          <div
            title="User Profile: Aaron_J"
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center ring-1 ring-indigo-500/50 cursor-pointer overflow-hidden shadow-sm text-[10px] font-bold text-white"
          >
            AJ
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopMenuBar;
