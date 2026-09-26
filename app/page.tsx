"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Toolbar } from "@/components/ui/Toolbar";
import { Sidebar } from "@/components/ui/Sidebar";
import { InspectorPanel } from "@/components/ui/InspectorPanel";
import { ModelGenerationModal } from "@/components/ui/ModelGenerationModal";
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

  const assets = useSceneStore((state) => state.assets);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportScene = async () => {
    try {
      showToast("Packaging scene geometry into .GLB...");

      // Simple export group creation
      const exportObjects: THREE.Object3D[] = [];
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

      exportObjects.push(exportGroup);
      await exportSceneToGLB(exportObjects, "alpine_mountain_scene.glb");
      showToast("Scene exported successfully as alpine_mountain_scene.glb");
    } catch (err) {
      console.error(err);
      showToast("Export failed");
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <Viewport />

      {/* Floating Viewport Toolbar */}
      <Toolbar
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onExportScene={handleExportScene}
      />

      {/* Left Dock: Asset Library & Scene Hierarchy */}
      <Sidebar onOpenAIModal={() => setIsAIModalOpen(true)} />

      {/* Right Dock: Asset Properties & Plinth Inspector */}
      <InspectorPanel />

      {/* AI Concept to 3D Synthesis Modal */}
      <ModelGenerationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-300 text-xs font-medium shadow-2xl backdrop-blur-md pointer-events-none transition-all animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Bottom Status Ribbon */}
      <div className="absolute bottom-2 right-4 z-10 pointer-events-none text-[10px] text-slate-500 font-mono flex items-center gap-3">
        <span>BVH Spatial Index: Active</span>
        <span>•</span>
        <span>DEM: Alpine Ridged Multi-fractal</span>
        <span>•</span>
        <span>Next.js 15 + R3F</span>
      </div>
    </main>
  );
}
