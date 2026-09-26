"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { MountainShaderMaterial } from "@/lib/terrain/terrainShader";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";

// Extend Three.js prototype once
if (!(THREE.BufferGeometry.prototype as unknown as { computeBoundsTree?: unknown }).computeBoundsTree) {
  THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  THREE.Mesh.prototype.raycast = acceleratedRaycast;
}

interface TerrainChunkProps {
  chunkX: number; // 0 to 3
  chunkZ: number; // 0 to 3
  chunkSize: number; // e.g. 40 meters
  totalSize: number; // e.g. 160 meters
  elevationFn: (worldX: number, worldZ: number) => number;
  snowElevation: number;
  rockSlopeAngle: number;
  wireframe: boolean;
  mapMode?: number;
  showContourLines?: boolean;
  contourInterval?: number;
}

export function TerrainChunk({
  chunkX,
  chunkZ,
  chunkSize,
  totalSize,
  elevationFn,
  snowElevation,
  rockSlopeAngle,
  wireframe,
  mapMode = 1.0,
  showContourLines = true,
  contourInterval = 15.0,
}: TerrainChunkProps) {
  const groupRef = useRef<THREE.Group>(null!);

  // World center coordinate of this chunk
  const centerWorldX = (chunkX - 1.5) * chunkSize;
  const centerWorldZ = (chunkZ - 1.5) * chunkSize;

  // Build LOD geometries: High (64x64), Medium (32x32), Low (16x16)
  const lodGroup = useMemo(() => {
    const lod = new THREE.LOD();

    const resolutions = [
      { segments: 64, distance: 0 },   // High LOD for near camera
      { segments: 32, distance: 65 },  // Medium LOD
      { segments: 16, distance: 120 }, // Low LOD for distant periphery
    ];

    resolutions.forEach(({ segments, distance }) => {
      const geo = new THREE.PlaneGeometry(chunkSize, chunkSize, segments, segments);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const localX = pos.getX(i);
        const localZ = pos.getZ(i);
        const worldX = centerWorldX + localX;
        const worldZ = centerWorldZ + localZ;
        const height = elevationFn(worldX, worldZ);
        pos.setY(i, height);
      }

      geo.computeVertexNormals();

      // Only compute BVH for highest LOD mesh
      if (segments === 64) {
        geo.computeBoundsTree();
      }

      const mat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(MountainShaderMaterial.uniforms),
        vertexShader: MountainShaderMaterial.vertexShader,
        fragmentShader: MountainShaderMaterial.fragmentShader,
        wireframe,
      });

      mat.uniforms.snowElevation.value = snowElevation;
      const rad = (rockSlopeAngle * Math.PI) / 180;
      mat.uniforms.rockSlopeThreshold.value = Math.cos(rad);
      mat.uniforms.isWireframe.value = wireframe ? 1.0 : 0.0;
      mat.uniforms.mapMode.value = mapMode;
      mat.uniforms.showContourLines.value = showContourLines ? 1.0 : 0.0;
      mat.uniforms.contourInterval.value = contourInterval;

      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      mesh.castShadow = true;

      lod.addLevel(mesh, distance);
    });

    return lod;
  }, [chunkSize, centerWorldX, centerWorldZ, elevationFn, snowElevation, rockSlopeAngle, wireframe, mapMode, showContourLines, contourInterval]);

  // Update dynamic uniforms across all LOD level meshes
  useEffect(() => {
    if (lodGroup) {
      const rad = (rockSlopeAngle * Math.PI) / 180;
      const cosAngle = Math.cos(rad);

      lodGroup.levels.forEach((level) => {
        const mesh = level.object as THREE.Mesh;
        if (mesh.material instanceof THREE.ShaderMaterial) {
          mesh.material.uniforms.snowElevation.value = snowElevation;
          mesh.material.uniforms.rockSlopeThreshold.value = cosAngle;
          mesh.material.uniforms.isWireframe.value = wireframe ? 1.0 : 0.0;
          mesh.material.uniforms.mapMode.value = mapMode;
          mesh.material.uniforms.showContourLines.value = showContourLines ? 1.0 : 0.0;
          mesh.material.uniforms.contourInterval.value = contourInterval;
          mesh.material.wireframe = wireframe;
        }
      });
    }
  }, [lodGroup, snowElevation, rockSlopeAngle, wireframe, mapMode, showContourLines, contourInterval]);

  // Cleanup geometries on unmount
  useEffect(() => {
    return () => {
      if (lodGroup) {
        lodGroup.levels.forEach((level) => {
          const mesh = level.object as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.disposeBoundsTree();
            mesh.geometry.dispose();
          }
          if (mesh.material instanceof THREE.Material) {
            mesh.material.dispose();
          }
        });
      }
    };
  }, [lodGroup]);

  return (
    <primitive
      ref={groupRef}
      object={lodGroup}
      position={[centerWorldX, 0, centerWorldZ]}
    />
  );
}
