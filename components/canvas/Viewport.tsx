"use client";

import React, { useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { MountainTerrain, MountainTerrainHandle } from "./MountainTerrain";
import { PlacedEntity } from "./PlacedEntity";
import { EnvironmentRig } from "./EnvironmentRig";
import { PlacementGhost } from "./PlacementGhost";
import { Earth3DBadges } from "./Earth3DBadges";
import { calculateAdaptiveFoundation } from "@/lib/snapping/foundationCalculator";
import { PlacedAsset } from "@/types/scene";

export function Viewport() {
  const terrainRef = useRef<MountainTerrainHandle>(null);
  const [terrainMesh, setTerrainMesh] = useState<THREE.Mesh | null>(null);

  // Ghost preview coordinates
  const [ghostPos, setGhostPos] = useState<THREE.Vector3 | null>(null);
  const [ghostNormal, setGhostNormal] = useState<THREE.Vector3 | null>(null);

  const assets = useSceneStore((state) => state.assets);
  const assetToPlace = useSceneStore((state) => state.assetToPlace);
  const snapMode = useSceneStore((state) => state.snapMode);
  const addAsset = useSceneStore((state) => state.addAsset);
  const selectAsset = useSceneStore((state) => state.selectAsset);

  // Set terrain mesh once mounted
  const handleTerrainMount = useCallback((node: MountainTerrainHandle | null) => {
    if (node && node.mesh) {
      setTerrainMesh(node.mesh);
    }
  }, []);

  // Hover over terrain
  const handleTerrainHover = useCallback(
    (point: THREE.Vector3, normal: THREE.Vector3) => {
      if (assetToPlace) {
        setGhostPos(point);
        setGhostNormal(normal);
      }
    },
    [assetToPlace]
  );

  // Click on terrain: either place new asset or deselect
  const handleTerrainClick = useCallback(
    (point: THREE.Vector3, normal: THREE.Vector3) => {
      if (assetToPlace && terrainMesh) {
        const [w, h, d] = assetToPlace.dimensions;

        // Calculate initial adaptive foundation depth
        const foundationCalc = calculateAdaptiveFoundation(
          terrainMesh,
          point.x,
          point.z,
          w,
          d,
          0
        );

        // Calculate rotation if snapping to normal
        const rot: [number, number, number] = [0, 0, 0];
        if (snapMode === "terrain_normal") {
          const up = new THREE.Vector3(0, 1, 0);
          const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
          const e = new THREE.Euler().setFromQuaternion(q);
          rot[0] = e.x;
          rot[1] = e.y;
          rot[2] = e.z;
        }

        const newAsset: PlacedAsset = {
          id: crypto.randomUUID(),
          name: assetToPlace.name,
          sourceUrl: assetToPlace.sourceUrl,
          type: assetToPlace.type,
          position: [point.x, point.y, point.z],
          rotation: rot,
          scale: [1, 1, 1],
          dimensions: assetToPlace.dimensions,
          alignToNormal: snapMode === "terrain_normal",
          foundation: {
            enabled: true,
            depth: Math.round(foundationCalc.requiredFoundationDepth * 10) / 10,
            material: "concrete",
            autoAdaptive: true,
          },
          visible: true,
          locked: false,
        };

        addAsset(newAsset);
        setGhostPos(null);
        setGhostNormal(null);
      } else {
        // Deselect current asset
        selectAsset(null);
      }
    },
    [assetToPlace, terrainMesh, snapMode, addAsset, selectAsset]
  );

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [36, 28, 56], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onPointerMissed={() => selectAsset(null)}
      >
        {/* Sky, Sun, Fog, OrbitControls */}
        <EnvironmentRig />

        {/* BVH Displaced Mountain Terrain */}
        <MountainTerrain
          ref={handleTerrainMount}
          onTerrainClick={handleTerrainClick}
          onTerrainHover={handleTerrainHover}
        />

        {/* 3D Google Earth Landmark Badges & Country Labels */}
        <Earth3DBadges />

        {/* Real-time Cursor Snapping Ghost Preview */}
        <PlacementGhost position={ghostPos} normal={ghostNormal} />

        {/* Placed Architectural Entities with Plinths and Gizmos */}
        {assets.map((asset) => (
          <PlacedEntity key={asset.id} asset={asset} terrainMesh={terrainMesh} />
        ))}
      </Canvas>
    </div>
  );
}
