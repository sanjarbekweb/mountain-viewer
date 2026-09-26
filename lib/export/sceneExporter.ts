import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

/**
 * Exports current 3D scene entities and terrain into a combined .glb file
 */
export async function exportSceneToGLB(
  sceneObjects: THREE.Object3D[],
  filename: string = "mountain_architect_scene.glb"
): Promise<void> {
  const exportGroup = new THREE.Group();
  exportGroup.name = "MountainArchitect_Export";

  // Clone objects into export group
  for (const obj of sceneObjects) {
    if (obj) {
      exportGroup.add(obj.clone(true));
    }
  }

  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      exportGroup,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: "model/gltf-binary" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);
          resolve();
        } else {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: "application/json" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = filename.replace(".glb", ".gltf");
          link.click();
          URL.revokeObjectURL(link.href);
          resolve();
        }
      },
      (error) => {
        console.error("GLTF export error:", error);
        reject(error);
      },
      { binary: true }
    );
  });
}
