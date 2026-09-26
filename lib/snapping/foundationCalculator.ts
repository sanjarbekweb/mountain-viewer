import * as THREE from "three";
import { raycastDownToTerrain } from "./bvhRaycaster";

export interface FoundationCalculationResult {
  centerHeight: number;
  minCornerElevation: number;
  maxCornerElevation: number;
  slopeDelta: number; // max elevation - min elevation across footprint
  requiredFoundationDepth: number;
  averageNormal: THREE.Vector3;
  isSteepSlope: boolean;
}

/**
 * 4-Corner Footprint Raycaster
 * Calculates terrain elevation variation under the asset's bounding footprint
 * and calculates the exact subterranean foundation depth required to eliminate levitation.
 */
export function calculateAdaptiveFoundation(
  terrainMesh: THREE.Mesh,
  centerX: number,
  centerZ: number,
  width: number,
  depth: number,
  rotationY: number = 0,
  safetyMargin: number = 0.8
): FoundationCalculationResult {
  const halfW = width / 2;
  const halfD = depth / 2;

  // 4 Local Footprint Corners
  const localCorners: [number, number][] = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
  ];

  const cosRot = Math.cos(rotationY);
  const sinRot = Math.sin(rotationY);

  const elevations: number[] = [];
  const normals: THREE.Vector3[] = [];

  // Raycast center
  const centerHit = raycastDownToTerrain(terrainMesh, centerX, centerZ);
  const centerHeight = centerHit ? centerHit.point.y : 0;
  if (centerHit) {
    normals.push(centerHit.normal);
  }

  // Raycast 4 corners
  for (const [lx, lz] of localCorners) {
    // Rotate corner by rotationY
    const worldCornerX = centerX + (lx * cosRot - lz * sinRot);
    const worldCornerZ = centerZ + (lx * sinRot + lz * cosRot);

    const hit = raycastDownToTerrain(terrainMesh, worldCornerX, worldCornerZ);
    if (hit) {
      elevations.push(hit.point.y);
      normals.push(hit.normal);
    }
  }

  // If no hits detected, fallback to center or 0
  if (elevations.length === 0) {
    return {
      centerHeight,
      minCornerElevation: centerHeight,
      maxCornerElevation: centerHeight,
      slopeDelta: 0,
      requiredFoundationDepth: 1.5,
      averageNormal: new THREE.Vector3(0, 1, 0),
      isSteepSlope: false,
    };
  }

  const minElev = Math.min(...elevations, centerHeight);
  const maxElev = Math.max(...elevations, centerHeight);
  const slopeDelta = maxElev - minElev;

  // Drop below lowest corner to sink into terrain
  const dropBelowCenter = centerHeight - minElev;
  const requiredFoundationDepth = Math.max(1.2, dropBelowCenter + safetyMargin);

  // Compute average normal
  const avgNormal = new THREE.Vector3();
  for (const n of normals) {
    avgNormal.add(n);
  }
  if (normals.length > 0) {
    avgNormal.divideScalar(normals.length).normalize();
  } else {
    avgNormal.set(0, 1, 0);
  }

  // Steep slope if angle from vertical > 25 degrees (normal.y < cos(25°) ≈ 0.906)
  const isSteepSlope = avgNormal.y < 0.906 || slopeDelta > 2.5;

  return {
    centerHeight,
    minCornerElevation: minElev,
    maxCornerElevation: maxElev,
    slopeDelta,
    requiredFoundationDepth,
    averageNormal: avgNormal,
    isSteepSlope,
  };
}
