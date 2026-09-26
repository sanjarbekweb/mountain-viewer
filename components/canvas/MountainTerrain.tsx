"use client";

import React, { useMemo, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import * as THREE from "three";
import { generateAlpineFractalDEM } from "@/lib/terrain/demDecoder";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { TerrainChunk } from "./TerrainChunk";
import { Google3DTiles } from "./Google3DTiles";
import { getLandmarkById } from "@/lib/terrain/earthLandmarks";
import { generateFerganaSatelliteTexture } from "@/lib/terrain/satelliteTextureGenerator";
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
    const googleTilesConfig = useSceneStore((state) => state.googleTilesConfig);
    const mapboxConfig = useSceneStore((state) => state.mapboxConfig);

    const { size, maxElevation, snowElevation, rockSlopeAngle, wireframe, mapSource, activeLocationId } = terrainConfig;
    const landmark = getLandmarkById(activeLocationId);
    const CHUNK_GRID_COUNT = 4; // 4x4 chunked terrain
    const chunkSize = size / CHUNK_GRID_COUNT;

    // Generate high-resolution photorealistic satellite texture for Fergana Sux
    const satelliteTexture = useMemo(() => {
      if (activeLocationId === "fergana_alay") {
        return generateFerganaSatelliteTexture();
      }
      return null;
    }, [activeLocationId]);

    // Determine shader map mode: 0 = Alpine, 1 = Mapbox Light, 2 = Mapbox Outdoors, 3 = Mapbox Satellite
    const shaderMapMode = useMemo(() => {
      if (mapSource === "mapbox_simulator") {
        if (mapboxConfig.style === "light") return 1.0;
        if (mapboxConfig.style === "outdoors") return 2.0;
        if (mapboxConfig.style === "satellite") return 3.0;
        return 3.0;
      }
      return 0.0;
    }, [mapSource, mapboxConfig.style]);

    const elevationMultiplier = mapSource === "mapbox_simulator" ? mapboxConfig.exaggeration : 1.0;

    // Generate high-resolution continuous elevation field with morphological adjustments per landmark
    const { elevationGrid, elevationFn } = useMemo(() => {
      const resolution = 256;
      const baseGrid = generateAlpineFractalDEM(resolution, resolution, maxElevation);

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
        const h0 = baseGrid.data[i00] * (1 - fx) + baseGrid.data[i10] * fx;
        const h1 = baseGrid.data[i01] * (1 - fx) + baseGrid.data[i11] * fx;
        let h = h0 * (1 - fz) + h1 * fz;

        // Morphological shaping per landmark
        const distFromCenter = Math.sqrt(worldX * worldX + worldZ * worldZ) / half;
        if (activeLocationId === "fergana_alay") {
          // Exact 3D landscape of Sux / Fergana gorge & Kyrgyzstan border escarpment
          const normX = worldX / half;
          const normZ = worldZ / half;

          // Diagonal fault line / ridge cutting from top-left towards bottom-right
          const ridgePos = -0.12 + normZ * 0.58 + Math.sin(normZ * 6.5) * 0.05;
          const distToRidge = normX - ridgePos;

          if (distToRidge < -0.06) {
            // Western valley floor: fertile basin with Sux gravel riverbed depression
            const riverPos = -0.52 + normZ * 0.42 + Math.sin(normZ * 5.0) * 0.07;
            const distToRiver = Math.abs(normX - riverPos);
            const riverTrench = Math.exp(-distToRiver * distToRiver * 80.0) * 3.5;
            const valleyBase = 4.2 + (normZ + 1.0) * 1.8;
            h = Math.max(valleyBase - riverTrench, 1.2);
          } else if (distToRidge <= 0.08) {
            // Massive 3D escarpment wall rising 30m sharply over narrow transition
            const t = (distToRidge + 0.06) / 0.14; // 0 to 1
            const smoothT = t * t * (3.0 - 2.0 * t);
            const valleyH = 5.2;
            const mountainH = 29.0 + Math.sin(normZ * 10.0) * 3.5;
            h = valleyH + (mountainH - valleyH) * smoothT;
          } else {
            // Eastern folded arid mountains of Kyrgyzstan: parallel corrugated waves & erosion gullies
            const gullyFreq = (normX * 0.7 - normZ * 0.7) * 20.0;
            const gullyWave = Math.sin(gullyFreq) * 5.2 + Math.sin(gullyFreq * 2.1) * 2.2;
            const strataWave = Math.sin(normX * 12.0 + normZ * 7.0) * 2.8;
            const baseHigh = 26.5 + distToRidge * 14.0;
            h = Math.max(baseHigh + gullyWave + strataWave, 18.0);
          }
        } else if (activeLocationId === "mount_fuji") {
          // Conical volcano profile with central caldera crater
          const cone = Math.max(0, 1 - distFromCenter);
          const crater = distFromCenter < 0.12 ? Math.cos((distFromCenter / 0.12) * Math.PI) * 4 : 0;
          h = cone * maxElevation * 1.15 - crater;
        } else if (activeLocationId === "yosemite_half_dome") {
          // Sheer cliff face on one side (Z > 0)
          if (worldZ > 4) {
            h *= Math.max(0.1, 1 - (worldZ - 4) / 18);
          }
        } else if (activeLocationId === "matterhorn") {
          // Pyramidal 4-ridge sharpening
          const ridge = Math.abs(Math.sin(worldX * 0.15) * Math.cos(worldZ * 0.15));
          h += ridge * 6;
        }

        return Math.max(h * elevationMultiplier, 0);
      };

      return { elevationGrid: baseGrid, elevationFn: fn };
    }, [size, maxElevation, activeLocationId, elevationMultiplier]);

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
        {/* Google 3D Tiles integration when active */}
        {mapSource === "google_3d_tiles" && googleTilesConfig.apiKey && (
          <Google3DTiles apiKey={googleTilesConfig.apiKey} />
        )}

        {/* 4x4 Chunked LOD Terrain Meshes */}
        {chunks.map(({ cx, cz, key }) => (
          <TerrainChunk
            key={`${key}_${activeLocationId}`}
            chunkX={cx}
            chunkZ={cz}
            chunkSize={chunkSize}
            totalSize={size}
            elevationFn={elevationFn}
            snowElevation={snowElevation}
            rockSlopeAngle={rockSlopeAngle}
            wireframe={wireframe}
            mapMode={shaderMapMode}
            showContourLines={mapboxConfig.showContourLines}
            contourInterval={mapboxConfig.contourInterval}
            satelliteTexture={satelliteTexture}
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
