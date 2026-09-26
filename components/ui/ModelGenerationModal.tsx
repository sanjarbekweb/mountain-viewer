"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Maximize2,
  Layers,
} from "lucide-react";
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

  const setAssetToPlace = useSceneStore((state) => state.setAssetToPlace);

  if (!isOpen) return null;

  const samples = [
    {
      id: "alpine_retreat",
      name: "Cantilever Alpine Lodge",
      desc: "Mass timber frame with glass curtain walls",
      dimensions: [7, 5, 8] as [number, number, number],
      thumb: "🏔️",
    },
    {
      id: "modernist_cube",
      name: "Geometric Cliff Cube",
      desc: "Modular dark concrete and steel box",
      dimensions: [5.5, 4, 5.5] as [number, number, number],
      thumb: "📐",
    },
    {
      id: "ridge_shelter",
      name: "High Ridge Climber Shelter",
      desc: "Aerodynamic faceted dome shelter",
      dimensions: [4.5, 3.5, 4.5] as [number, number, number],
      thumb: "🏕️",
    },
  ];

  const handleStartGeneration = async () => {
    try {
      setStatus("dispatching");
      setErrorMsg(null);
      setProgress(5);

      // Step 1: Dispatch non-blocking task
      const res = await fetch("/api/generate-model/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptHint,
          polycount,
          imageUrl: selectedSample,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to dispatch generation task");
      }

      const data = await res.json();
      const currentTaskId = data.taskId;
      setTaskId(currentTaskId);
      setStatus("processing");

      // Step 2: Poll status endpoint
      const interval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/generate-model/status?taskId=${currentTaskId}`);
          if (!pollRes.ok) return;

          const pollData = await pollRes.json();
          setProgress(pollData.progress || 0);

          if (pollData.status === "SUCCEEDED") {
            clearInterval(interval);
            setStatus("succeeded");
            setGeneratedModelUrl(pollData.modelUrl || "/models/sample_cabin.glb");
          } else if (pollData.status === "FAILED") {
            clearInterval(interval);
            setStatus("failed");
            setErrorMsg(pollData.error || "Generation process failed");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 1500);
    } catch (err: unknown) {
      setStatus("failed");
      setErrorMsg(err instanceof Error ? err.message : "Error starting generation");
    }
  };

  const handlePlaceInScene = () => {
    const selectedObj = samples.find((s) => s.id === selectedSample) || samples[0];
    setAssetToPlace({
      name: `AI: ${selectedObj.name}`,
      type: "ai_generated",
      sourceUrl: generatedModelUrl || "/models/sample_cabin.glb",
      dimensions: selectedObj.dimensions,
      alignToNormal: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">AI 3D Model Studio</h2>
              <p className="text-[11px] text-slate-400">Convert 2D concept sketches into decimated mountain structures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {status === "idle" && (
            <>
              {/* Concept Presets / Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Select Architectural Concept or Upload
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {samples.map((sample) => {
                    const isSelected = selectedSample === sample.id;
                    return (
                      <div
                        key={sample.id}
                        onClick={() => {
                          setSelectedSample(sample.id);
                          setPromptHint(sample.name);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                          isSelected
                            ? "bg-cyan-950/40 border-cyan-500 text-cyan-200"
                            : "bg-slate-950/50 border-slate-800 hover:bg-slate-800/40 text-slate-400"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{sample.thumb}</span>
                        <p className="text-[11px] font-medium text-slate-200 truncate">{sample.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{sample.dimensions[0]}×{sample.dimensions[2]}m</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prompt Hint */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Architectural Style & Materials
                </label>
                <input
                  type="text"
                  value={promptHint}
                  onChange={(e) => setPromptHint(e.target.value)}
                  placeholder="e.g. Alpine glass cantilever cabin with slate base"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Target Decimation Polycount */}
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Target Polycount (<span className="text-cyan-300 font-mono">{(polycount / 1000).toFixed(0)}k faces</span>)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">60 FPS Optimized</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="50000"
                  step="5000"
                  value={polycount}
                  onChange={(e) => setPolycount(parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <button
                onClick={handleStartGeneration}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Synthesize 3D Model</span>
              </button>
            </>
          )}

          {(status === "dispatching" || status === "processing") && (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-indigo-400 absolute" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-100">
                  Generating Volumetric Mesh
                </h3>
                <p className="text-xs text-slate-400">
                  {progress < 30
                    ? "Synthesizing multi-view depth fields..."
                    : progress < 75
                    ? "Remeshing geometry topology & Draco decimation..."
                    : "Calibrating bottom-center pivot coordinates..."}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-[11px] font-mono text-cyan-300">{progress}% Completed</p>
            </div>
          )}

          {status === "succeeded" && (
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-100">Structure Synthesized Successfully!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Water-tight geometry decimated to {(polycount / 1000).toFixed(0)}k polygons with bottom-center pivot calibration.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePlaceInScene}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Snap into Mountain Scene</span>
                </button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Generation Failed</h3>
              <p className="text-xs text-rose-300">{errorMsg || "An error occurred"}</p>
              <button
                onClick={() => setStatus("idle")}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
