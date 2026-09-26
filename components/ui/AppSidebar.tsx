"use client";

import React from "react";
import {
  Home,
  Gamepad2,
  ShoppingBag,
  Gem,
  Settings,
  Mountain,
  Sparkles,
  Layers,
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

  return (
    <aside className="w-52 shrink-0 bg-[#11141c] p-5 flex flex-col justify-between select-none">
      {/* ── Brand Logo Header (Game Story Style from Reference) ── */}
      <div className="space-y-7">
        <div className="flex items-center gap-2.5 px-2">
          {/* Logo Icon */}
          <div className="w-7 h-7 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs shadow-md">
            <Mountain className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-white leading-none">
              Mountain
            </div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
              Story
            </div>
          </div>
        </div>

        {/* ── Navigation Links (Matching Reference Active Pill) ── */}
        <nav className="space-y-2">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => setViewMode("dashboard")}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "dashboard"
                ? "bg-[#7064e9] text-white shadow-lg shadow-[#7064e9]/30"
                : "text-slate-400 hover:text-white hover:bg-[#181c28]"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          {/* 2. Mountains / 3D Studio */}
          <button
            type="button"
            onClick={() => setViewMode("studio")}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "studio"
                ? "bg-[#7064e9] text-white shadow-lg shadow-[#7064e9]/30"
                : "text-slate-400 hover:text-white hover:bg-[#181c28]"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>3D Studio</span>
          </button>

          {/* 3. Architectures / Purchases */}
          <button
            type="button"
            onClick={onOpenAIModal}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#181c28] transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>AI Models</span>
          </button>

          {/* 4. Achievements */}
          <button
            type="button"
            onClick={() => setViewMode("dashboard")}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#181c28] transition-all cursor-pointer"
          >
            <Gem className="w-4 h-4" />
            <span>Achievements</span>
          </button>

          {/* 5. Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#181c28] transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* ── Bottom Status Pill ── */}
      <div className="p-3 rounded-2xl bg-[#181c28] border border-white/5 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Google 3D</span>
          <span className="text-[#10b981] font-bold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>BVH Raycast</span>
          <span className="text-[#7064e9] font-mono">&lt;0.2ms</span>
        </div>
      </div>
    </aside>
  );
}
