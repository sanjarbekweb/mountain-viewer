"use client";

import React from "react";
import {
  X,
  Trash2,
  Sliders,
  Layers,
  Sparkles,
  ArrowDownToLine,
  ShieldAlert,
} from "lucide-react";
import { useSceneStore } from "@/lib/stores/useSceneStore";

export function InspectorPanel() {
  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const assets = useSceneStore((state) => state.assets);
  const updateAsset = useSceneStore((state) => state.updateAsset);
  const selectAsset = useSceneStore((state) => state.selectAsset);
  const removeAsset = useSceneStore((state) => state.removeAsset);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  if (!selectedAsset) return null;

  const [posX, posY, posZ] = selectedAsset.position;
  const [rotX, rotY, rotZ] = selectedAsset.rotation;
  const [sclX, sclY, sclZ] = selectedAsset.scale;

  // Convert rotation radians to degrees for UI
  const degX = Math.round((rotX * 180) / Math.PI);
  const degY = Math.round((rotY * 180) / Math.PI);
  const degZ = Math.round((rotZ * 180) / Math.PI);

  const handlePosChange = (axis: 0 | 1 | 2, val: number) => {
    const newPos: [number, number, number] = [...selectedAsset.position];
    newPos[axis] = val;
    updateAsset(selectedAsset.id, { position: newPos });
  };

  const handleRotChange = (axis: 0 | 1 | 2, deg: number) => {
    const newRot: [number, number, number] = [...selectedAsset.rotation];
    newRot[axis] = (deg * Math.PI) / 180;
    updateAsset(selectedAsset.id, { rotation: newRot });
  };

  const handleScaleChange = (axis: 0 | 1 | 2, val: number) => {
    const newScl: [number, number, number] = [...selectedAsset.scale];
    newScl[axis] = Math.max(0.1, val);
    updateAsset(selectedAsset.id, { scale: newScl });
  };

  return (
    <div className="absolute right-4 top-4 w-72 max-h-[calc(100vh-2rem)] z-20 flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Asset Inspector
          </h2>
        </div>
        <button
          onClick={() => selectAsset(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* Entity Title */}
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Structure Name
          </label>
          <input
            type="text"
            value={selectedAsset.name}
            onChange={(e) => updateAsset(selectedAsset.id, { name: e.target.value })}
            className="w-full mt-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Position Transform */}
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            World Position (Meters)
          </span>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-1.5">
              <span className="text-slate-500 text-[10px]">X</span>
              <input
                type="number"
                step="0.5"
                value={posX.toFixed(1)}
                onChange={(e) => handlePosChange(0, parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 focus:outline-none"
              />
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-1.5">
              <span className="text-cyan-400 text-[10px]">Y</span>
              <input
                type="number"
                step="0.5"
                value={posY.toFixed(1)}
                onChange={(e) => handlePosChange(1, parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 focus:outline-none"
              />
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-1.5">
              <span className="text-slate-500 text-[10px]">Z</span>
              <input
                type="number"
                step="0.5"
                value={posZ.toFixed(1)}
                onChange={(e) => handlePosChange(2, parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rotation Transform */}
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Rotation (Degrees)
          </span>
          <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-1.5">
              <span className="text-slate-500 text-[10px]">PITCH</span>
              <input
                type="number"
                value={degX}
                onChange={(e) => handleRotChange(0, parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 focus:outline-none"
              />
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-1.5">
              <span className="text-cyan-400 text-[10px]">YAW</span>
              <input
                type="number"
                value={degY}
                onChange={(e) => handleRotChange(1, parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 focus:outline-none"
              />
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-1.5">
              <span className="text-slate-500 text-[10px]">ROLL</span>
              <input
                type="number"
                value={degZ}
                onChange={(e) => handleRotChange(2, parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Adaptive Subsurface Plinth Foundation Controls */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Subsurface Plinth
            </span>
            <input
              type="checkbox"
              checked={selectedAsset.foundation.enabled}
              onChange={(e) =>
                updateAsset(selectedAsset.id, {
                  foundation: {
                    ...selectedAsset.foundation,
                    enabled: e.target.checked,
                  },
                })
              }
              className="accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {selectedAsset.foundation.enabled && (
            <>
              {/* Auto-Adaptive Slope Differential Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Auto-Slope Adaptation</span>
                <button
                  onClick={() =>
                    updateAsset(selectedAsset.id, {
                      foundation: {
                        ...selectedAsset.foundation,
                        autoAdaptive: !selectedAsset.foundation.autoAdaptive,
                      },
                    })
                  }
                  className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                    selectedAsset.foundation.autoAdaptive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {selectedAsset.foundation.autoAdaptive ? "Active (4-Ray)" : "Manual"}
                </button>
              </div>

              {/* Foundation Depth Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Plinth Depth</span>
                  <span className="font-mono text-cyan-300 font-medium">
                    {selectedAsset.foundation.depth.toFixed(1)}m
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.1"
                  value={selectedAsset.foundation.depth}
                  disabled={selectedAsset.foundation.autoAdaptive}
                  onChange={(e) =>
                    updateAsset(selectedAsset.id, {
                      foundation: {
                        ...selectedAsset.foundation,
                        depth: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-cyan-400 disabled:opacity-50"
                />
              </div>

              {/* Foundation Material */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400">Material Texture</span>
                <div className="grid grid-cols-3 gap-1">
                  {(["concrete", "stone", "dark_slate"] as const).map((mat) => {
                    const isCur = selectedAsset.foundation.material === mat;
                    return (
                      <button
                        key={mat}
                        onClick={() =>
                          updateAsset(selectedAsset.id, {
                            foundation: {
                              ...selectedAsset.foundation,
                              material: mat,
                            },
                          })
                        }
                        className={`py-1 rounded text-[10px] capitalize transition-colors ${
                          isCur
                            ? "bg-slate-800 text-cyan-400 border border-cyan-500/40 font-semibold"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {mat.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Delete Action */}
        <button
          onClick={() => removeAsset(selectedAsset.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 transition-colors text-xs font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Structure</span>
        </button>
      </div>
    </div>
  );
}
