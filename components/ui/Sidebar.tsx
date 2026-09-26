"use client";

import React, { useState } from "react";
import {
  Layers,
  Box,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Mountain,
  Search,
} from "lucide-react";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { PlacedAsset } from "@/types/scene";

interface SidebarProps {
  onOpenAIModal: () => void;
}

export function Sidebar({ onOpenAIModal }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "hierarchy">("library");
  const [searchQuery, setSearchQuery] = useState("");

  const assets = useSceneStore((state) => state.assets);
  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const selectAsset = useSceneStore((state) => state.selectAsset);
  const assetToPlace = useSceneStore((state) => state.assetToPlace);
  const setAssetToPlace = useSceneStore((state) => state.setAssetToPlace);
  const toggleVisibility = useSceneStore((state) => state.toggleVisibility);
  const toggleLock = useSceneStore((state) => state.toggleLock);
  const duplicateAsset = useSceneStore((state) => state.duplicateAsset);
  const removeAsset = useSceneStore((state) => state.removeAsset);

  // Preset Architectural Assets
  const presets = [
    {
      name: "Alpine Timber Lodge",
      type: "cabin" as const,
      dimensions: [6, 4.5, 8] as [number, number, number],
      sourceUrl: "/models/sample_cabin.glb",
      desc: "Traditional heavy timber alpine lodge with steep snow-shedding roof.",
      tag: "Residential",
    },
    {
      name: "Panoramic Lookout Tower",
      type: "tower" as const,
      dimensions: [4, 12, 4] as [number, number, number],
      sourceUrl: "/models/sample_tower.glb",
      desc: "Multi-level cylindrical observation outpost with glass panoramic ring.",
      tag: "Observation",
    },
    {
      name: "Minimalist Cantilever Chalet",
      type: "cabin" as const,
      dimensions: [8, 4.2, 7] as [number, number, number],
      sourceUrl: "/models/sample_cabin.glb",
      desc: "Modern rectilinear mountain residence engineered for cliffside anchoring.",
      tag: "Modern",
    },
  ];

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`absolute left-4 top-4 bottom-4 z-20 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-12" : "w-80"
      }`}
    >
      <div className="relative flex-1 flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Mountain Architect</h1>
                <p className="text-[10px] text-slate-400">Terrain & Layout Studio</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Tab Selector */}
        {!isCollapsed && (
          <div className="flex p-1.5 gap-1 bg-slate-950/40 border-b border-slate-800/80">
            <button
              onClick={() => setActiveTab("library")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "library"
                  ? "bg-slate-800 text-cyan-400 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Asset Library</span>
            </button>
            <button
              onClick={() => setActiveTab("hierarchy")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "hierarchy"
                  ? "bg-slate-800 text-cyan-400 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scene ({assets.length})</span>
            </button>
          </div>
        )}

        {/* Main Body */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeTab === "library" ? (
              <>
                {/* Active Placement Banner if active */}
                {assetToPlace && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-cyan-300">Placement Active</p>
                      <p className="text-[11px] text-cyan-400/80">Click mountain to snap & drop</p>
                    </div>
                    <button
                      onClick={() => setAssetToPlace(null)}
                      className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* AI Model Generator Card */}
                <div
                  onClick={onOpenAIModal}
                  className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/60 cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Generative AI
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      Concept to 3D
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                    Generate Custom Structure
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload a sketch or enter a prompt to create decimated mountain architecture.
                  </p>
                </div>

                {/* Custom GLB Model File Import */}
                <div className="relative">
                  <input
                    type="file"
                    id="glb-upload-input"
                    accept=".glb,.gltf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      const name = file.name.replace(/\.[^/.]+$/, "");
                      setAssetToPlace({
                        name: name,
                        type: "building",
                        sourceUrl: url,
                        dimensions: [5, 4, 5],
                        alignToNormal: false,
                      });
                    }}
                  />
                  <label
                    htmlFor="glb-upload-input"
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/40 hover:bg-slate-900/60 cursor-pointer text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Import Custom .GLB Model</span>
                  </label>
                </div>

                <div className="pt-1">
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Preset Mountain Architecture
                  </h3>

                  <div className="space-y-2">
                    {presets.map((preset) => {
                      const isCurrentlyPlacing = assetToPlace?.name === preset.name;
                      return (
                        <div
                          key={preset.name}
                          onClick={() => {
                            setAssetToPlace({
                              name: preset.name,
                              type: preset.type,
                              sourceUrl: preset.sourceUrl,
                              dimensions: preset.dimensions,
                              alignToNormal: false,
                            });
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isCurrentlyPlacing
                              ? "bg-cyan-950/40 border-cyan-500 text-cyan-100"
                              : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-200">
                              {preset.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {preset.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                            {preset.desc}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Footprint: {preset.dimensions[0]}m × {preset.dimensions[2]}m</span>
                            <span className="flex items-center gap-1 text-cyan-400 font-medium">
                              <Plus className="w-3 h-3" /> Snap to Slope
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Scene Hierarchy Tab */
              <div className="space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search placed assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {filteredAssets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No assets placed yet. Click an item in the Asset Library to snap onto terrain.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAssetId === asset.id;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => selectAsset(asset.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10"
                              : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-300"
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-medium text-slate-200 truncate">
                              {asset.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Y: {asset.position[1].toFixed(1)}m • Plinth: {asset.foundation.depth}m
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVisibility(asset.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-200"
                              title={asset.visible ? "Hide" : "Show"}
                            >
                              {asset.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLock(asset.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-200"
                              title={asset.locked ? "Unlock" : "Lock"}
                            >
                              {asset.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateAsset(asset.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-200"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAsset(asset.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
