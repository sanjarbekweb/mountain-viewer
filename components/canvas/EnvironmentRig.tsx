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
      {/* Google Earth Style Atmosphere & Sky */}
      <Sky
        distance={450000}
        sunPosition={isLight ? [50, 60, 40] : [20, 25, 15]}
        turbidity={isLight ? 4 : 8}
        rayleigh={isLight ? 0.8 : 2.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Atmospheric Depth Fog */}
      <fog attach="fog" args={[isLight ? "#dce6f2" : "#11141c", 40, 260]} />

      {/* Ambient Fill Light */}
      <ambientLight intensity={isLight ? 0.75 : 0.45} />

      {/* Primary Sunlight */}
      <directionalLight
        position={[60, 60, 40]}
        intensity={isLight ? 2.2 : 1.6}
        color={isLight ? "#ffffff" : "#e0e7ff"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={260}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0004}
      />

      {/* Skylight Fill from opposite side */}
      <directionalLight
        position={[-40, 20, -30]}
        intensity={isLight ? 0.5 : 0.3}
        color={isLight ? "#bae6fd" : "#818cf8"}
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
