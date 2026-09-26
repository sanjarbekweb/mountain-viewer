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

      {/* Atmospheric Depth Fog (Soft Distant Horizon, clear nearby terrain) */}
      <fog attach="fog" args={[isLight ? "#f8fafc" : "#1a1e28", 140, 450]} />

      {/* Luminous Ambient Fill Light */}
      <ambientLight intensity={isLight ? 1.5 : 1.0} />

      {/* Rich Sky-to-Ground Hemisphere Illumination */}
      <hemisphereLight args={["#ffffff", "#cbd5e1", isLight ? 1.4 : 0.9]} />

      {/* Primary Daylight Sunlight */}
      <directionalLight
        position={[70, 85, 50]}
        intensity={isLight ? 3.2 : 2.2}
        color={isLight ? "#ffffff" : "#f8fafc"}
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

      {/* Daylight Fill Light from opposite side */}
      <directionalLight
        position={[-50, 45, -40]}
        intensity={isLight ? 1.4 : 0.8}
        color={isLight ? "#e0f2fe" : "#93c5fd"}
      />

      {/* Additional Counter-Rim Light for complete 360-degree clarity */}
      <directionalLight
        position={[15, 60, -70]}
        intensity={isLight ? 1.0 : 0.6}
        color="#ffffff"
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
