"use client";

import React from "react";
import {
  Globe2,
  Box,
  Sparkles,
  Layers,
  Settings,
  Mountain,
  Compass,
  FileCode2,
} from "lucide-react";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { ViewMode } from "@/types/scene";

interface AppSidebarProps {
  onOpenAIModal: () => void;
  onOpenSettings?: () => void;
}

export function AppSidebar({ onOpenAIModal, onOpenSettings }: AppSidebarProps) {
  const viewMode = useSceneStore((state) => state.viewMode);
  const setViewMode = useSceneStore((state) => state.setViewMode);

  const navItems = [
    {
      id: "dashboard" as ViewMode,
      label: "Earth 3D & Peaks",
      icon: Globe2,
      onClick: () => setViewMode("dashboard"),
    },
    {
      id: "studio" as ViewMode,
      label: "3D Studio",
      icon: Mountain,
      onClick: () => setViewMode("studio"),
    },
  ];

  return (
    <aside className="w-56 shrink-0 bg-[#0a0e17] border-r border-slate-800/80 p-4 flex flex-col justify-between select-none">
      {/* ── Brand Logo Header ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Mountain className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xs font-extrabold tracking-tight text-white">
              MOUNTAIN
            </div>
            <div className="text-[10px] font-semibold tracking-widest text-indigo-400 uppercase -mt-0.5">
              Architect 3D
            </div>
          </div>
        </div>

        {/* ── Navigation Items ── */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = viewMode === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#141b2a]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* AI Generator Action Button */}
          <button
            type="button"
            onClick={onOpenAIModal}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-indigo-300 hover:bg-[#141b2a] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI 3D Generator</span>
          </button>
        </nav>
      </div>

      {/* ── Bottom Section: Settings & Status ── */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="px-3 py-2 rounded-xl bg-[#121824] border border-slate-800/60">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Terrain DEM</span>
            <span className="text-indigo-400 font-bold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>BVH Raycast</span>
            <span className="text-emerald-400 font-bold">&lt;0.2ms</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-[#141b2a] transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
