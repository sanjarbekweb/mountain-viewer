"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Mountain,
  Box,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSceneStore } from "@/lib/stores/useSceneStore";

interface ModelGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModelGenerationModal({ isOpen, onClose }: ModelGenerationModalProps) {
  const [promptHint, setPromptHint] = useState("Minimalist alpine cantilever retreat");
  const [polycount, setPolycount] = useState(25000);
  const [selectedSample, setSelectedSample] = useState<string | null>("alpine_retreat");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "dispatching" | "processing" | "succeeded" | "failed">("idle");
  const [progress, setProgress] = useState(0);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const theme = useSceneStore((state) => state.theme);
  const setAssetToPlace = useSceneStore((state) => state.setAssetToPlace);

  const isLight = theme === "light";

  const samples = [
    {
      id: "alpine_retreat",
      name: "Cantilever Alpine Lodge",
      desc: "Mass timber frame with glass curtain walls",
      dimensions: [7, 5, 8] as [number, number, number],
      icon: Mountain,
    },
    {
      id: "modernist_cube",
      name: "Geometric Cliff Cube",
      desc: "Modular dark concrete and steel structure",
      dimensions: [5.5, 4, 5.5] as [number, number, number],
      icon: Box,
    },
    {
      id: "ridge_shelter",
      name: "High Ridge Climber Shelter",
      desc: "Aerodynamic faceted alpine dome shelter",
      dimensions: [4.5, 3.5, 4.5] as [number, number, number],
      icon: Compass,
    },
  ];

  const handleStartGeneration = async () => {
    try {
      setStatus("dispatching");
      setErrorMsg(null);
      setProgress(5);

      const res = await fetch("/api/generate-model/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptHint,
          targetPolycount: polycount,
          dimensions: [7, 5, 8],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.taskId) {
        throw new Error(data.error || "Dispatch failed");
      }

      setTaskId(data.taskId);
      setStatus("processing");

      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/generate-model/status?taskId=${data.taskId}`);
          const pollData = await pollRes.json();

          if (pollData.progress) {
            setProgress(pollData.progress);
          }

          if (pollData.status === "SUCCEEDED") {
            clearInterval(pollInterval);
            setStatus("succeeded");
            setProgress(100);
            setGeneratedModelUrl(pollData.modelUrl || "/models/sample_cabin.glb");
          } else if (pollData.status === "FAILED") {
            clearInterval(pollInterval);
            setStatus("failed");
            setErrorMsg(pollData.error || "Model generation failed");
          }
        } catch (err: any) {
          clearInterval(pollInterval);
          setStatus("failed");
          setErrorMsg(err?.message || "Polling error");
        }
      }, 1000);
    } catch (err: any) {
      setStatus("failed");
      setErrorMsg(err?.message || "Generation request failed");
    }
  };

  const handlePlaceInScene = () => {
    const activeSample = samples.find((s) => s.id === selectedSample) || samples[0];

    setAssetToPlace({
      name: activeSample.name,
      type: "ai_generated",
      sourceUrl: generatedModelUrl || "/models/sample_cabin.glb",
      dimensions: activeSample.dimensions,
      alignToNormal: false,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border p-6 z-10 ${
              isLight ? "bg-white border-gray-200 text-gray-900" : "bg-[#202124] border-[#3c4043] text-gray-100"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${isLight ? "text-blue-600" : "text-[#8ab4f8]"}`} />
                <h2 className="text-sm font-bold uppercase tracking-wider">AI 3D Model Generator</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4 py-4 text-xs">
              {/* Image Upload Area */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                  2D Architectural Concept
                </label>
                <div
                  className={`p-6 rounded-xl border border-dashed text-center flex flex-col items-center justify-center cursor-pointer ${
                    isLight
                      ? "border-gray-300 hover:border-blue-600 bg-gray-50"
                      : "border-gray-600 hover:border-[#8ab4f8] bg-[#303134]"
                  }`}
                >
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="font-semibold">Drop concept sketch or browse</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Supports PNG, JPG, WEBP</p>
                </div>
              </div>

              {/* Architectural Style Hint */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                  Architectural Style
                </label>
                <input
                  type="text"
                  value={promptHint}
                  onChange={(e) => setPromptHint(e.target.value)}
                  placeholder="e.g. Modernist cantilever retreat with panoramic glass"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                    isLight ? "bg-gray-50 border-gray-200 focus:border-blue-600" : "bg-[#303134] border-[#3c4043] focus:border-[#8ab4f8]"
                  }`}
                />
              </div>

              {/* Sample Presets */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                  Preset Architectural Archetypes
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {samples.map((s) => {
                    const isSelected = selectedSample === s.id;
                    const Icon = s.icon;

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSample(s.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer text-left transition-colors ${
                          isSelected
                            ? isLight ? "bg-blue-50 border-blue-600 text-blue-900" : "bg-[#303134] border-[#8ab4f8] text-white"
                            : isLight ? "border-gray-200 hover:bg-gray-50" : "border-gray-700 hover:bg-gray-800 text-gray-300"
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? (isLight ? "text-blue-600" : "text-[#8ab4f8]") : "text-gray-400"}`} />
                        <div className="font-bold text-[11px] truncate">{s.name}</div>
                        <div className="text-[9px] text-gray-400 truncate">{s.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress bar if processing */}
              {status === "processing" && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-mono text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating geometry and textures...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full transition-all duration-300 ${isLight ? "bg-blue-600" : "bg-[#8ab4f8]"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error display */}
              {status === "failed" && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg || "Failed to generate 3D model"}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                  isLight ? "hover:bg-gray-100 text-gray-700" : "hover:bg-[#303134] text-gray-300"
                }`}
              >
                Cancel
              </button>

              {status === "succeeded" ? (
                <button
                  type="button"
                  onClick={handlePlaceInScene}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isLight ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-[#10b981] hover:bg-[#059669] text-white"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Place on Mountain
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={status === "dispatching" || status === "processing"}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    isLight ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate 3D Model
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
