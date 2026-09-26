"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { TilesRenderer } from "3d-tiles-renderer";
import { GoogleCloudAuthPlugin } from "3d-tiles-renderer/plugins";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { getLandmarkById } from "@/lib/terrain/earthLandmarks";

interface Google3DTilesProps {
  apiKey?: string;
  onTileLoaded?: () => void;
  onError?: (err: Error) => void;
}

export function Google3DTiles({ apiKey, onTileLoaded, onError }: Google3DTilesProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const tilesRef = useRef<TilesRenderer | null>(null);
  const { camera, gl } = useThree();

  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const landmark = getLandmarkById(activeLocationId);
  const setGoogleTilesConfig = useSceneStore((state) => state.setGoogleTilesConfig);

  useEffect(() => {
    if (!apiKey) return;

    try {
      setGoogleTilesConfig({ status: "connecting" });

      // Google Photorealistic 3D Tiles Root URL
      const tiles = new TilesRenderer("https://tile.googleapis.com/v1/3dtiles/root.json");

      // Register Google Cloud Auth Plugin
      const authPlugin = new GoogleCloudAuthPlugin({
        apiToken: apiKey,
        autoRefreshToken: true,
      });
      tiles.registerPlugin(authPlugin);

      // Link camera and renderer
      tiles.setCamera(camera);
      tiles.setResolutionFromRenderer(camera, gl);

      tiles.addEventListener("load-tile-set", () => {
        setGoogleTilesConfig({ status: "active" });
        onTileLoaded?.();
      });

      tilesRef.current = tiles;
      if (groupRef.current) {
        groupRef.current.add(tiles.group);
      }

      return () => {
        if (tilesRef.current) {
          if (groupRef.current) {
            groupRef.current.remove(tilesRef.current.group);
          }
          tilesRef.current.dispose();
          tilesRef.current = null;
        }
      };
    } catch (err: any) {
      console.warn("Google 3D Tiles initialization failed:", err);
      setGoogleTilesConfig({ status: "error", errorMessage: err?.message || "Failed to load Google 3D Tiles" });
      onError?.(err);
    }
  }, [apiKey, camera, gl, setGoogleTilesConfig, onTileLoaded, onError]);

  useFrame(() => {
    if (tilesRef.current) {
      tilesRef.current.setCamera(camera);
      tilesRef.current.setResolutionFromRenderer(camera, gl);
      tilesRef.current.update();
    }
  });

  return (
    <group ref={groupRef} name="GooglePhotorealistic3DTiles">
      {/* Georeferenced marker indicator */}
      <mesh position={[0, landmark.elevationScale * 0.8, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#818cf8" wireframe />
      </mesh>
    </group>
  );
}
