"use client";

import React from "react";
import * as THREE from "three";
import { useSceneStore } from "@/lib/stores/useSceneStore";

interface PlacementGhostProps {
  position: THREE.Vector3 | null;
  normal: THREE.Vector3 | null;
}

export function PlacementGhost({ position, normal }: PlacementGhostProps) {
  const assetToPlace = useSceneStore((state) => state.assetToPlace);
  const snapMode = useSceneStore((state) => state.snapMode);

  if (!assetToPlace || !position) return null;

  const [w, h, d] = assetToPlace.dimensions;

  // Rotation alignment
  const rotation: [number, number, number] = [0, 0, 0];
  if (snapMode === "terrain_normal" && normal) {
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    rotation[0] = euler.x;
    rotation[1] = euler.y;
    rotation[2] = euler.z;
  }

  return (
    <group position={[position.x, position.y, position.z]} rotation={rotation}>
      {/* Holographic Building Body Preview */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.8}
          emissive="#0284c7"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Subsurface Foundation Ghost */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[w * 1.05, 2, d * 1.05]} />
        <meshStandardMaterial
          color="#475569"
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>

      {/* Placement Ring Indicator */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(w, d) * 0.6, Math.max(w, d) * 0.7, 32]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
