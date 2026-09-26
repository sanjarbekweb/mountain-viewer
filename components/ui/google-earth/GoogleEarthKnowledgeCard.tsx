"use client";

import React from "react";
import {
  X,
  MapPin,
  Mountain,
  Box,
  Trash2,
  Move,
  RotateCw,
  Maximize2,
  MousePointer,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { getLandmarkById } from "@/lib/terrain/earthLandmarks";
import { TransformMode } from "@/types/scene";

interface GoogleEarthKnowledgeCardProps {
  onExportScene?: () => void;
}

export function GoogleEarthKnowledgeCard({ onExportScene }: GoogleEarthKnowledgeCardProps) {
  const theme = useSceneStore((state) => state.theme);
  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const selectAsset = useSceneStore((state) => state.selectAsset);
  const assets = useSceneStore((state) => state.assets);
  const updateAsset = useSceneStore((state) => state.updateAsset);
  const removeAsset = useSceneStore((state) => state.removeAsset);
  const transformMode = useSceneStore((state) => state.transformMode);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);

  const landmark = getLandmarkById(activeLocationId);
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const isLight = theme === "light";

  const transformTools: { mode: TransformMode; label: string; icon: any }[] = [
    { mode: "select", label: "Select", icon: MousePointer },
    { mode: "translate", label: "Translate", icon: Move },
    { mode: "rotate", label: "Rotate", icon: RotateCw },
    { mode: "scale", label: "Scale", icon: Maximize2 },
  ];

  return (
    <div className="w-80 select-none pointer-events-auto">
      {/* 1. If an asset is selected: Show Asset Inspector Card */}
      <AnimatePresence mode="wait">
        {selectedAsset ? (
          <motion.div
            key="asset-card"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`rounded-2xl p-5 shadow-xl border ${
              isLight ? "bg-white border-gray-200 text-gray-900" : "bg-[#202124] border-[#3c4043] text-gray-100"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Box className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-[#8ab4f8]"}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Structure Inspector</h3>
              </div>
              <button
                type="button"
                onClick={() => selectAsset(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 pt-3 text-xs">
              {/* Transform Mode Pills */}
              <div>
                <label className="text-[10px] uppercase font-semibold text-gray-400 block mb-1.5">
                  Gizmo Tool
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {transformTools.map((tool) => {
                    const isToolActive = transformMode === tool.mode;
                    const Icon = tool.icon;

                    return (
                      <button
                        key={tool.mode}
                        type="button"
                        onClick={() => setTransformMode(tool.mode)}
                        className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-colors ${
                          isToolActive
                            ? isLight ? "bg-blue-600 text-white" : "bg-[#8ab4f8] text-[#202124] font-bold"
                            : isLight ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-[#303134] text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mb-0.5" />
                        <span className="text-[9px]">{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedAsset.name}
                  onChange={(e) => updateAsset(selectedAsset.id, { name: e.target.value })}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${
                    isLight ? "bg-gray-50 border-gray-200 focus:border-blue-600" : "bg-[#303134] border-[#3c4043] focus:border-[#8ab4f8]"
                  }`}
                />
              </div>

              {/* Adaptive Foundation Plinth Depth */}
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>Foundation Depth</span>
                  <span className="font-mono font-bold">{selectedAsset.foundation.depth}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={selectedAsset.foundation.depth}
                  onChange={(e) =>
                    updateAsset(selectedAsset.id, {
                      foundation: { ...selectedAsset.foundation, depth: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Foundation Material */}
              <div>
                <label className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                  Plinth Material
                </label>
                <select
                  value={selectedAsset.foundation.material}
                  onChange={(e) =>
                    updateAsset(selectedAsset.id, {
                      foundation: { ...selectedAsset.foundation, material: e.target.value as any },
                    })
                  }
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer focus:outline-none ${
                    isLight ? "bg-gray-50 border-gray-200 focus:border-blue-600" : "bg-[#303134] border-[#3c4043] focus:border-[#8ab4f8]"
                  }`}
                >
                  <option value="concrete">Reinforced Concrete</option>
                  <option value="stone">Alpine Granite Stone</option>
                  <option value="dark_slate">Dark Basalt Slate</option>
                </select>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => {
                  removeAsset(selectedAsset.id);
                  selectAsset(null);
                }}
                className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-xs border border-red-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Structure
              </button>
            </div>
          </motion.div>
        ) : (
          /* 2. Otherwise: Show Google Earth Summit Knowledge Card */
          <motion.div
            key="landmark-card"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`rounded-2xl overflow-hidden shadow-xl border ${
              isLight ? "bg-white border-gray-200 text-gray-900" : "bg-[#202124] border-[#3c4043] text-gray-100"
            }`}
          >
            {/* Mountain Image Header */}
            <div className="relative h-32 w-full overflow-hidden bg-gray-800">
              <img
                src={landmark.thumbnailUrl}
                alt={landmark.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white">
                {landmark.altitude}m
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                  Mountain Peak
                </div>
                <h3 className="text-sm font-bold mt-0.5">{landmark.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  <span>{landmark.region}, {landmark.country}</span>
                </p>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                {landmark.description}
              </p>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>{landmark.lat.toFixed(4)}° N, {landmark.lng.toFixed(4)}° E</span>
                <span className="text-emerald-500 font-semibold">BVH &lt;0.2ms</span>
              </div>

              {onExportScene && (
                <button
                  type="button"
                  onClick={onExportScene}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isLight ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124]"
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Export Scene (.GLB)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
