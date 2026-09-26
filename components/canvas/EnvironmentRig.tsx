"use client";

import React, { useRef } from "react";
import { OrbitControls, Sky } from "@react-three/drei";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function EnvironmentRig() {
  const isDraggingGizmo = useSceneStore((state) => state.isDraggingGizmo);
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  return (
    <>
      {/* Alpine Atmosphere & Sky */}
      <Sky
        distance={450000}
        sunPosition={[60, 45, 30]}
        turbidity={7}
        rayleigh={1.2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Atmospheric Alpine Depth Fog */}
      <fog attach="fog" args={["#0b1120", 30, 240]} />

      {/* Ambient Fill Light */}
      <ambientLight intensity={0.45} />

      {/* Primary Alpine Sunlight */}
      <directionalLight
        position={[60, 50, 30]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={250}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.0004}
      />

      {/* Cool Skylight Fill from opposite side */}
      <directionalLight position={[-40, 20, -30]} intensity={0.35} color="#93c5fd" />

      {/* Camera Controls with Ground Clipping Prevention */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!isDraggingGizmo} // Invariant 4: Disable when gizmo dragging
        maxPolarAngle={Math.PI / 2 - 0.04} // Prevents camera from dipping beneath terrain
        minDistance={5}
        maxDistance={220}
        dampingFactor={0.06}
      />
    </>
  );
}
