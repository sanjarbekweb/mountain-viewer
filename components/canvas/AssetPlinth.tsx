"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { FoundationSettings } from "@/types/scene";

interface AssetPlinthProps {
  dimensions: [number, number, number]; // [width, height, depth]
  foundation: FoundationSettings;
}

export function AssetPlinth({ dimensions, foundation }: AssetPlinthProps) {
  if (!foundation.enabled || foundation.depth <= 0.05) return null;

  const [width, , depth] = dimensions;
  const plinthDepth = foundation.depth;

  // Plinth footprint is slightly wider than the building to create a clean terraced slab
  const plinthWidth = width * 1.04;
  const plinthLength = depth * 1.04;

  const material = useMemo(() => {
    switch (foundation.material) {
      case "stone":
        return new THREE.MeshStandardMaterial({
          color: foundation.color || "#4b5563",
          roughness: 0.95,
          metalness: 0.05,
        });
      case "dark_slate":
        return new THREE.MeshStandardMaterial({
          color: foundation.color || "#334155",
          roughness: 0.85,
          metalness: 0.1,
        });
      case "concrete":
      default:
        return new THREE.MeshStandardMaterial({
          color: foundation.color || "#64748b",
          roughness: 0.75,
          metalness: 0.15,
        });
    }
  }, [foundation.material, foundation.color]);

  return (
    <group position={[0, -plinthDepth / 2, 0]}>
      {/* Subsurface foundation slab sinking into mountain rock */}
      <mesh castShadow receiveShadow material={material}>
        <boxGeometry args={[plinthWidth, plinthDepth, plinthLength]} />
      </mesh>

      {/* Subtle architectural perimeter trim at ground level */}
      <mesh position={[0, plinthDepth / 2, 0]}>
        <boxGeometry args={[plinthWidth * 1.02, 0.15, plinthLength * 1.02]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
    </group>
  );
}
