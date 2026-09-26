"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { LeftToolStrip } from "@/components/ui/LeftToolStrip";
import { RightPanel } from "@/components/ui/RightPanel";
import { EarthDashboard } from "@/components/dashboard/EarthDashboard";
import { ModelGenerationModal } from "@/components/ui/ModelGenerationModal";
import FpsBadge from "@/components/ui/FpsBadge";
import { exportSceneToGLB } from "@/lib/export/sceneExporter";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { ArrowLeft, Share2, Mountain, Globe2, Play } from "lucide-react";
import { getLandmarkById } from "@/lib/terrain/earthLandmarks";
import * as THREE from "three";

// Dynamically import Three.js Viewport to avoid SSR canvas rendering issues
const Viewport = dynamic(
  () => import("@/components/canvas/Viewport").then((mod) => mod.Viewport),
  { ssr: false }
);

export default function MountainArchitectPage() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const viewMode = useSceneStore((state) => state.viewMode);
  const setViewMode = useSceneStore((state) => state.setViewMode);
  const assets = useSceneStore((state) => state.assets);
  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);

  const currentLandmark = getLandmarkById(activeLocationId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportScene = async () => {
    try {
      showToast("Packaging scene geometry into .GLB...");

      const exportGroup = new THREE.Group();

      for (const asset of assets) {
        if (!asset.visible) continue;
        const [w, h, d] = asset.dimensions;
        const assetMesh = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({ color: 0x854d0e })
        );
        assetMesh.name = asset.name;
        assetMesh.position.set(...asset.position);
        assetMesh.rotation.set(...asset.rotation);
        assetMesh.scale.set(...asset.scale);

        // Foundation slab
        if (asset.foundation.enabled) {
          const plinth = new THREE.Mesh(
            new THREE.BoxGeometry(w * 1.04, asset.foundation.depth, d * 1.04),
            new THREE.MeshStandardMaterial({ color: 0x475569 })
          );
          plinth.position.set(
            asset.position[0],
            asset.position[1] - asset.foundation.depth / 2,
            asset.position[2]
          );
          exportGroup.add(plinth);
        }

        exportGroup.add(assetMesh);
      }

      await exportSceneToGLB([exportGroup], "alpine_mountain_scene.glb");
      showToast("Scene exported successfully as alpine_mountain_scene.glb");
    } catch (err) {
      console.error(err);
      showToast("Export failed");
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0c0e15] font-sans select-none p-2 sm:p-3 lg:p-4 flex items-center justify-center">
      {/* ── Main Bento App Window Shell (Reference Design Outer Shell) ── */}
      <div className="relative w-full h-full max-w-[1720px] bg-[#11141c] rounded-[28px] border border-white/5 shadow-2xl flex overflow-hidden">
        {/* Left Navigation Bar */}
        <AppSidebar
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {/* Dynamic View Mode: Earth Dashboard vs 3D Studio Canvas */}
        {viewMode === "dashboard" ? (
          <EarthDashboard
            onOpenAIModal={() => setIsAIModalOpen(true)}
            onEnterStudio={() => setViewMode("studio")}
          />
        ) : (
          <div className="relative flex-1 overflow-hidden flex flex-col bg-[#090c13]">
            {/* ── Studio Top Floating Bar ── */}
            <div className="h-11 px-4 border-b border-white/5 bg-[#11141c] flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("dashboard")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181c28] hover:bg-[#7064e9] text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Mountain className="w-3.5 h-3.5 text-[#7064e9]" />
                  <span>{currentLandmark.name}</span>
                  <span className="text-[11px] font-mono text-[#fcd34d]">({currentLandmark.altitude}m)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportScene}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7064e9] hover:bg-[#8174f8] text-white text-xs font-bold transition-all shadow-md shadow-[#7064e9]/20 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Export .GLB</span>
                </button>
              </div>
            </div>

            {/* ── 3D Viewport Content Area ── */}
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-0 pl-11 pr-80">
                <Viewport />
                <FpsBadge />
              </div>

              {/* Studio Left Tool Strip */}
              <LeftToolStrip
                onOpenAIModal={() => setIsAIModalOpen(true)}
              />

              {/* Studio Right Accordion Panel */}
              <RightPanel
                onStartGeneration={() => setIsAIModalOpen(true)}
              />

              {/* In-viewport Bottom Status Pill */}
              <div className="absolute bottom-3 left-14 z-10 pointer-events-none text-[10px] text-slate-300 font-mono flex items-center gap-2 bg-[#181c28]/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                <span className="text-[#10b981] font-bold">● Google 3D Earth</span>
                <span className="text-slate-600">•</span>
                <span>BVH Continuous Snapping Active</span>
                <span className="text-slate-600">•</span>
                <span className="text-[#7064e9]">LOD Dynamic</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Concept to 3D Synthesis Modal */}
        <ModelGenerationModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-full bg-[#181c28]/95 border border-[#7064e9] text-white text-xs font-semibold shadow-2xl backdrop-blur-md pointer-events-none animate-bounce">
            {toastMessage}
          </div>
        )}
      </div>
    </main>
  );
}
