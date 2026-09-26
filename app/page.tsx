"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { TopMenuBar } from "@/components/ui/TopMenuBar";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { LeftToolStrip } from "@/components/ui/LeftToolStrip";
import { RightPanel } from "@/components/ui/RightPanel";
import { EarthDashboard } from "@/components/dashboard/EarthDashboard";
import { ModelGenerationModal } from "@/components/ui/ModelGenerationModal";
import FpsBadge from "@/components/ui/FpsBadge";
import { exportSceneToGLB } from "@/lib/export/sceneExporter";
import { useSceneStore } from "@/lib/stores/useSceneStore";
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
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0e17] font-sans select-none flex flex-col">
      {/* ─── Top Chrome: Title Bar + Location Badge + View Switcher ─── */}
      <TopMenuBar
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onExportScene={handleExportScene}
      />

      {/* ─── Main Content Area with Sidebar ─── */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left Navigation Bar (matching reference design) */}
        <AppSidebar
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {/* Dynamic View: Earth 3D Dashboard vs 3D Studio Canvas */}
        {viewMode === "dashboard" ? (
          <EarthDashboard
            onOpenAIModal={() => setIsAIModalOpen(true)}
            onEnterStudio={() => setViewMode("studio")}
          />
        ) : (
          <div className="relative flex-1 overflow-hidden">
            {/* 3D WebGL Canvas Viewport — fills available studio space */}
            <div className="absolute inset-0 pl-11 pr-80">
              <Viewport />

              {/* FPS / WebGL / LOD Badge (inside viewport area) */}
              <FpsBadge />
            </div>

            {/* Left Vertical Tool Strip for 3D Studio */}
            <LeftToolStrip
              onOpenAIModal={() => setIsAIModalOpen(true)}
            />

            {/* Right Panel: Scene Controls + AI Generator + Tree + Inspector */}
            <RightPanel
              onStartGeneration={() => setIsAIModalOpen(true)}
            />

            {/* Bottom Status Ribbon */}
            <div className="absolute bottom-2 left-14 z-10 pointer-events-none text-[10px] text-slate-400 font-mono flex items-center gap-2 bg-[#0d111b]/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
              <span>Google Earth 3D & DEM</span>
              <span className="text-slate-600">•</span>
              <span>BVH Continuous Raycast Active</span>
              <span className="text-slate-600">•</span>
              <span>LOD Dynamic Chunks</span>
            </div>
          </div>
        )}

        {/* AI Concept to 3D Synthesis Modal (overlay) */}
        <ModelGenerationModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 text-xs font-semibold shadow-2xl backdrop-blur-md pointer-events-none animate-fade-in">
            {toastMessage}
          </div>
        )}
      </div>
    </main>
  );
}
