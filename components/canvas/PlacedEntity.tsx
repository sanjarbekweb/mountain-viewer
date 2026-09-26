"use client";

import React, { useRef, useEffect, useMemo, Suspense } from "react";
import * as THREE from "three";
import { TransformControls, useGLTF } from "@react-three/drei";
import { PlacedAsset } from "@/types/scene";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { AssetPlinth } from "./AssetPlinth";
import { calculateAdaptiveFoundation } from "@/lib/snapping/foundationCalculator";

interface PlacedEntityProps {
  asset: PlacedAsset;
  terrainMesh: THREE.Mesh | null;
}

/**
 * Loads GLTF/GLB model and normalizes pivot to bottom-center (Y_min = 0)
 * per Invariant 3.
 */
function GLTFModelInstance({ url, dimensions }: { url: string; dimensions: [number, number, number] }) {
  const { scene } = useGLTF(url);

  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const group = new THREE.Group();
    // Offset cloned mesh so its base is at y=0 and center at x=0, z=0
    clone.position.set(-center.x, -box.min.y, -center.z);
    group.add(clone);

    // Optional scale adjustment to match target dimensions if non-zero
    if (size.x > 0 && dimensions[0] > 0) {
      const scaleX = dimensions[0] / size.x;
      const scaleZ = dimensions[2] / size.z;
      const scaleAvg = (scaleX + scaleZ) / 2;
      group.scale.set(scaleAvg, scaleAvg, scaleAvg);
    }

    return group;
  }, [scene, dimensions]);

  return <primitive object={normalizedScene} />;
}

export function PlacedEntity({ asset, terrainMesh }: PlacedEntityProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const transformRef = useRef<THREE.EventDispatcher | null>(null);

  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const transformMode = useSceneStore((state) => state.transformMode);
  const isSelected = selectedAssetId === asset.id;

  const selectAsset = useSceneStore((state) => state.selectAsset);
  const updateAsset = useSceneStore((state) => state.updateAsset);
  const setDraggingGizmo = useSceneStore((state) => state.setDraggingGizmo);

  // Recalculate adaptive plinth when position or rotation changes
  useEffect(() => {
    if (!terrainMesh || !asset.foundation.autoAdaptive) return;

    const [x, , z] = asset.position;
    const [w, , d] = asset.dimensions;
    const rotY = asset.rotation[1];

    const result = calculateAdaptiveFoundation(terrainMesh, x, z, w, d, rotY);
    if (Math.abs(result.requiredFoundationDepth - asset.foundation.depth) > 0.1) {
      updateAsset(asset.id, {
        foundation: {
          ...asset.foundation,
          depth: Math.round(result.requiredFoundationDepth * 10) / 10,
        },
      });
    }
  }, [asset.position, asset.rotation, asset.dimensions, terrainMesh, asset.foundation.autoAdaptive]);

  // TransformControls dragging listener (Invariant 4: isolate OrbitControls)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = transformRef.current as any;
    if (!controls) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDraggingChange = (event: any) => {
      setDraggingGizmo(Boolean(event.value));
    };

    controls.addEventListener("dragging-changed", handleDraggingChange);
    return () => {
      controls.removeEventListener("dragging-changed", handleDraggingChange);
    };
  }, [setDraggingGizmo, isSelected, transformMode]);

  if (!asset.visible) return null;

  // Procedural fallback when GLTF is loading or for preset models
  const renderFallbackMesh = () => {
    const [w, h, d] = asset.dimensions;

    if (asset.type === "tower") {
      return (
        <group position={[0, 0, 0]}>
          <mesh position={[0, h * 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[w * 0.4, w * 0.5, h * 0.9, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[0, h * 0.92, 0]} castShadow>
            <cylinderGeometry args={[w * 0.7, w * 0.7, h * 0.12, 12]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, h * 0.98, 0]}>
            <cylinderGeometry args={[w * 0.65, w * 0.65, h * 0.08, 12]} />
            <meshPhysicalMaterial color="#e0f2fe" transmission={0.8} roughness={0.1} />
          </mesh>
        </group>
      );
    }

    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, h * 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h * 0.8, d]} />
          <meshStandardMaterial color="#854d0e" roughness={0.8} />
        </mesh>
        <mesh position={[0, h * 0.9, 0]} castShadow>
          <coneGeometry args={[Math.max(w, d) * 0.8, h * 0.45, 4]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      </group>
    );
  };

  return (
    <>
      <group
        ref={groupRef}
        position={asset.position}
        rotation={asset.rotation}
        scale={asset.scale}
        onClick={(e) => {
          e.stopPropagation();
          selectAsset(asset.id);
        }}
      >
        {/* Render 3D Model with Invariant 3 Pivot Normalization */}
        {asset.sourceUrl && (asset.sourceUrl.endsWith(".glb") || asset.sourceUrl.endsWith(".gltf")) ? (
          <Suspense fallback={renderFallbackMesh()}>
            <GLTFModelInstance url={asset.sourceUrl} dimensions={asset.dimensions} />
          </Suspense>
        ) : (
          renderFallbackMesh()
        )}

        {/* Adaptive Subsurface Concrete / Stone Foundation Plinth */}
        <AssetPlinth dimensions={asset.dimensions} foundation={asset.foundation} />

        {/* Selection Bounding Halo */}
        {isSelected && (
          <mesh position={[0, asset.dimensions[1] / 2, 0]}>
            <boxGeometry
              args={[
                asset.dimensions[0] * 1.08,
                asset.dimensions[1] * 1.08,
                asset.dimensions[2] * 1.08,
              ]}
            />
            <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.35} />
          </mesh>
        )}
      </group>

      {/* TransformControls Gizmo */}
      {isSelected && !asset.locked && transformMode !== "select" && (
        <TransformControls
          ref={transformRef as unknown as React.Ref<never>}
          object={groupRef}
          mode={transformMode}
          size={0.75}
          onChange={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position;
              const rot = groupRef.current.rotation;
              const scl = groupRef.current.scale;

              updateAsset(asset.id, {
                position: [pos.x, pos.y, pos.z],
                rotation: [rot.x, rot.y, rot.z],
                scale: [scl.x, scl.y, scl.z],
              });
            }
          }}
        />
      )}
    </>
  );
}
