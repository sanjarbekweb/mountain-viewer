"use client";

import React, { useState, useEffect } from "react";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { getLandmarkById } from "@/lib/terrain/earthLandmarks";

export function GoogleEarthTelemetry() {
  const [fps, setFps] = useState(60);
  const theme = useSceneStore((state) => state.theme);
  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const mapSource = useSceneStore((state) => state.terrainConfig.mapSource);
  const landmark = getLandmarkById(activeLocationId);

  const isLight = theme === "light";

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className={`px-3 py-1 rounded-md text-[11px] font-mono select-none pointer-events-none shadow-sm ${
        isLight
          ? "bg-white/90 text-gray-700 border border-gray-200"
          : "bg-[#202124]/90 text-gray-300 border border-[#3c4043]"
      }`}
    >
      <span>{landmark.lat.toFixed(4)}°N, {landmark.lng.toFixed(4)}°E</span>
      <span className="mx-2 text-gray-400">•</span>
      <span>elev {landmark.altitude.toLocaleString()}m</span>
      <span className="mx-2 text-gray-400">•</span>
      <span>{mapSource === "google_3d_tiles" ? "Google 3D Tiles" : "Topo DEM"}</span>
      <span className="mx-2 text-gray-400">•</span>
      <span>{fps} FPS</span>
    </div>
  );
}
