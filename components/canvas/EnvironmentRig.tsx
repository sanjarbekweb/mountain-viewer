"use client";

import React, { useRef } from "react";
import { OrbitControls, Sky } from "@react-three/drei";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function EnvironmentRig() {
  const isDraggingGizmo = useSceneStore((state) => state.isDraggingGizmo);
  const theme = useSceneStore((state) => state.theme);
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  const isLight = theme === "light";

  return (
    <>
      {/* Google Earth / Mapbox Daylight Atmosphere & Sky */}
      <Sky
        distance={450000}
        sunPosition={isLight ? [50, 70, 40] : [30, 40, 25]}
        turbidity={isLight ? 2.5 : 6}
        rayleigh={isLight ? 0.5 : 1.8}
        mieCoefficient={0.003}
        mieDirectionalG={0.85}
      />

      {/* Atmospheric Depth Fog (Crisp Daylight Horizon) */}
      <fog attach="fog" args={[isLight ? "#eef4f9" : "#1a1e28", 60, 320]} />

      {/* Luminous Ambient Fill Light */}
      <ambientLight intensity={isLight ? 1.1 : 0.75} />

      {/* Primary Sunlight */}
      <directionalLight
        position={[65, 75, 45]}
        intensity={isLight ? 2.4 : 1.8}
        color={isLight ? "#ffffff" : "#f1f5f9"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={280}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-bias={-0.0004}
      />

      {/* Skylight Fill from opposite side */}
      <directionalLight
        position={[-40, 30, -35]}
        intensity={isLight ? 0.75 : 0.45}
        color={isLight ? "#dbeafe" : "#93c5fd"}
      />

      {/* Camera Controls with Ground Clipping Prevention */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!isDraggingGizmo} // Disable when gizmo dragging
        maxPolarAngle={Math.PI / 2 - 0.04} // Prevents camera from dipping beneath terrain
        minDistance={5}
        maxDistance={240}
        dampingFactor={0.06}
      />
    </>
  );
}
