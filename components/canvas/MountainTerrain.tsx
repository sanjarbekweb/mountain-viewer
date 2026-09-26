"use client";

import React, { useMemo, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import * as THREE from "three";
import { generateAlpineFractalDEM } from "@/lib/terrain/demDecoder";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { TerrainChunk } from "./TerrainChunk";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";

// Extend Three.js prototype once
if (!(THREE.BufferGeometry.prototype as unknown as { computeBoundsTree?: unknown }).computeBoundsTree) {
  THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  THREE.Mesh.prototype.raycast = acceleratedRaycast;
}

export interface MountainTerrainHandle {
  mesh: THREE.Mesh | null;
  sampleHeight: (x: number, z: number) => number;
}

interface MountainTerrainProps {
  onTerrainClick?: (point: THREE.Vector3, normal: THREE.Vector3) => void;
  onTerrainHover?: (point: THREE.Vector3, normal: THREE.Vector3) => void;
}

export const MountainTerrain = forwardRef<MountainTerrainHandle, MountainTerrainProps>(
  function MountainTerrain({ onTerrainClick, onTerrainHover }, ref) {
    const collisionMeshRef = useRef<THREE.Mesh>(null!);
    const terrainConfig = useSceneStore((state) => state.terrainConfig);

    const { size, maxElevation, snowElevation, rockSlopeAngle, wireframe } = terrainConfig;
    const CHUNK_GRID_COUNT = 4; // 4x4 chunked terrain
    const chunkSize = size / CHUNK_GRID_COUNT;

    // Generate high-resolution continuous elevation field
    const { elevationGrid, elevationFn } = useMemo(() => {
      const resolution = 256;
      const grid = generateAlpineFractalDEM(resolution, resolution, maxElevation);

      const fn = (worldX: number, worldZ: number): number => {
        const half = size / 2;
        const u = Math.min(Math.max((worldX + half) / size, 0), 1);
        const v = Math.min(Math.max((worldZ + half) / size, 0), 1);

        const gx = Math.min(Math.floor(u * (resolution - 1)), resolution - 2);
        const gz = Math.min(Math.floor(v * (resolution - 1)), resolution - 2);

        const fx = u * (resolution - 1) - gx;
        const fz = v * (resolution - 1) - gz;

        const i00 = gz * resolution + gx;
        const i10 = i00 + 1;
        const i01 = (gz + 1) * resolution + gx;
        const i11 = i01 + 1;

        // Bilinear interpolation for smooth derivative & normals
        const h0 = grid.data[i00] * (1 - fx) + grid.data[i10] * fx;
        const h1 = grid.data[i01] * (1 - fx) + grid.data[i11] * fx;
        return h0 * (1 - fz) + h1 * fz;
      };

      return { elevationGrid: grid, elevationFn: fn };
    }, [size, maxElevation]);

    // Build unified collision geometry with BVH tree for sub-0.2ms raycasting
    const collisionGeometry = useMemo(() => {
      const geo = new THREE.PlaneGeometry(size, size, 128, 128);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, elevationFn(x, z));
      }

      geo.computeVertexNormals();
      geo.computeBoundsTree(); // BVH tree for instantaneous snapping

      return geo;
    }, [size, elevationFn]);

    useEffect(() => {
      return () => {
        if (collisionGeometry) {
          collisionGeometry.disposeBoundsTree();
          collisionGeometry.dispose();
        }
      };
    }, [collisionGeometry]);

    // Expose mesh handle to parent
    useImperativeHandle(
      ref,
      () => ({
        mesh: collisionMeshRef.current,
        sampleHeight: elevationFn,
      }),
      [elevationFn]
    );

    // Generate 4x4 array of chunk indices [0, 1, 2, 3] x [0, 1, 2, 3]
    const chunks = useMemo(() => {
      const list: { cx: number; cz: number; key: string }[] = [];
      for (let cz = 0; cz < CHUNK_GRID_COUNT; cz++) {
        for (let cx = 0; cx < CHUNK_GRID_COUNT; cx++) {
          list.push({ cx, cz, key: `chunk_${cx}_${cz}` });
        }
      }
      return list;
    }, []);

    const handleClick = useCallback(
      (e: any) => {
        e.stopPropagation();
        if (e.point && onTerrainClick) {
          const norm = e.normal
            ? e.normal.clone().transformDirection(collisionMeshRef.current.matrixWorld).normalize()
            : new THREE.Vector3(0, 1, 0);
          onTerrainClick(e.point, norm);
        }
      },
      [onTerrainClick]
    );

    const handlePointerMove = useCallback(
      (e: any) => {
        if (e.point && onTerrainHover) {
          const norm = e.normal
            ? e.normal.clone().transformDirection(collisionMeshRef.current.matrixWorld).normalize()
            : new THREE.Vector3(0, 1, 0);
          onTerrainHover(e.point, norm);
        }
      },
      [onTerrainHover]
    );

    return (
      <group>
        {/* 4x4 Chunked LOD Terrain Meshes */}
        {chunks.map(({ cx, cz, key }) => (
          <TerrainChunk
            key={key}
            chunkX={cx}
            chunkZ={cz}
            chunkSize={chunkSize}
            totalSize={size}
            elevationFn={elevationFn}
            snowElevation={snowElevation}
            rockSlopeAngle={rockSlopeAngle}
            wireframe={wireframe}
          />
        ))}

        {/* BVH Spatial Index Collision Mesh (Invisible overlay capturing exact mouse picking) */}
        <mesh
          ref={collisionMeshRef}
          geometry={collisionGeometry}
          visible={false}
          onClick={handleClick}
          onPointerMove={handlePointerMove}
        >
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    );
  }
);
