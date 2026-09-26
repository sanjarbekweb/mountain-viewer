"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleEarthSearch } from "@/components/ui/google-earth/GoogleEarthSearch";
import { GoogleEarthControls } from "@/components/ui/google-earth/GoogleEarthControls";
import { GoogleEarthDrawer } from "@/components/ui/google-earth/GoogleEarthDrawer";
import { GoogleEarthKnowledgeCard } from "@/components/ui/google-earth/GoogleEarthKnowledgeCard";
import { GoogleEarthTelemetry } from "@/components/ui/google-earth/GoogleEarthTelemetry";
import { ModelGenerationModal } from "@/components/ui/ModelGenerationModal";
import { exportSceneToGLB } from "@/lib/export/sceneExporter";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { TransformMode } from "@/types/scene";
import * as THREE from "three";

// Dynamically import Three.js Viewport to avoid SSR canvas issues
const Viewport = dynamic(
  () => import("@/components/canvas/Viewport").then((mod) => mod.Viewport),
  { ssr: false }
);

export default function GoogleEarthViewerPage() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const theme = useSceneStore((state) => state.theme);
  const assets = useSceneStore((state) => state.assets);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);

  const isLight = theme === "light";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard shortcuts (Q/W/E/R, Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "q":
          e.preventDefault();
          setTransformMode("select" as TransformMode);
          break;
        case "w":
          e.preventDefault();
          setTransformMode("translate" as TransformMode);
          break;
        case "e":
          e.preventDefault();
          setTransformMode("rotate" as TransformMode);
          break;
        case "r":
          e.preventDefault();
          setTransformMode("scale" as TransformMode);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTransformMode, undo, redo]);

  const handleExportScene = async () => {
    try {
      showToast("Packaging 3D scene into .GLB...");

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

      await exportSceneToGLB([exportGroup], "mountain_scene.glb");
      showToast("Scene exported as mountain_scene.glb");
    } catch (err) {
      console.error(err);
      showToast("Export failed");
    }
  };

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden font-sans select-none ${
        isLight ? "bg-[#dce6f2] text-[#202124]" : "bg-[#11141c] text-[#e8eaed]"
      }`}
    >
      {/* ── 1. Full-Bleed 3D Mountain Viewport (Zero Frame, Full Screen) ── */}
      <div className="absolute inset-0 z-0">
        <Viewport />
      </div>

      {/* ── 2. Top-Left Floating Controls: Search & Left Icon Drawer ── */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-3 pointer-events-none">
        <GoogleEarthSearch />
        <GoogleEarthDrawer onOpenAIModal={() => setIsAIModalOpen(true)} />
      </div>

      {/* ── 3. Top-Right / Right: Floating Knowledge & Structure Inspector Card ── */}
      <div className="absolute top-5 right-5 z-20 pointer-events-none">
        <GoogleEarthKnowledgeCard onExportScene={handleExportScene} />
      </div>

      {/* ── 4. Bottom-Right: Floating Google Earth Controls (Compass, 3D, Zoom, Theme) ── */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none">
        <GoogleEarthControls />
      </div>

      {/* ── 5. Bottom-Left: Telemetry Bar (Coordinates, Elevation, FPS) ── */}
      <div className="absolute bottom-4 left-5 z-20 pointer-events-none">
        <GoogleEarthTelemetry />
      </div>

      {/* ── 6. AI Image-to-3D Synthesis Modal (Overlay) ── */}
      <ModelGenerationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* ── 7. Framer Motion Floating Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-semibold shadow-xl border pointer-events-none ${
              isLight
                ? "bg-white text-gray-900 border-gray-200"
                : "bg-[#202124] text-white border-[#3c4043]"
            }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
