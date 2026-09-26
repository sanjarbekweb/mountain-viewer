import * as THREE from "three";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";

// Extend Three.js prototypes once for BVH spatial indexing
if (!(THREE.BufferGeometry.prototype as unknown as { computeBoundsTree?: unknown }).computeBoundsTree) {
  THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  THREE.Mesh.prototype.raycast = acceleratedRaycast;
}

export interface TerrainIntersection {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
}

const _raycaster = new THREE.Raycaster();
_raycaster.firstHitOnly = true; // three-mesh-bvh optimization

/**
 * Casts a vertical downward ray (-Y) directly onto the BVH-accelerated terrain mesh.
 * Returns exact contact point and surface normal in sub-0.2ms.
 */
export function raycastDownToTerrain(
  terrainMesh: THREE.Mesh,
  x: number,
  z: number,
  castFromY: number = 300
): TerrainIntersection | null {
  if (!terrainMesh || !terrainMesh.geometry) return null;

  // Origin high above terrain, direction straight down (-Y)
  const origin = new THREE.Vector3(x, castFromY, z);
  const direction = new THREE.Vector3(0, -1, 0);

  _raycaster.set(origin, direction);
  _raycaster.near = 0.1;
  _raycaster.far = castFromY + 100;

  const hits = _raycaster.intersectObject(terrainMesh, false);
  if (hits.length === 0) return null;

  const hit = hits[0];
  const normal = hit.normal
    ? hit.normal.clone().transformDirection(terrainMesh.matrixWorld)
    : new THREE.Vector3(0, 1, 0);

  return {
    point: hit.point,
    normal: normal.normalize(),
    distance: hit.distance,
  };
}
