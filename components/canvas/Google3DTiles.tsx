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
  const updateTerrainConfig = useSceneStore((state) => state.updateTerrainConfig);

  useEffect(() => {
    if (!apiKey) return;

    let isMounted = true;

    try {
      setGoogleTilesConfig({ status: "connecting", errorMessage: undefined });

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
        if (!isMounted) return;
        setGoogleTilesConfig({ status: "active", errorMessage: undefined });
        onTileLoaded?.();
      });

      // Handle loading or authentication errors (e.g. 403 Forbidden)
      tiles.addEventListener("load-error" as any, (event: any) => {
        if (!isMounted) return;
        const msg = event?.error?.message || event?.message || "Failed to authenticate or fetch Google 3D Tiles (Error 403)";
        console.warn("Google 3D Tiles warning:", msg);

        setGoogleTilesConfig({
          status: "error",
          errorMessage: "403 Forbidden: Enable 'Map Tiles API' in Google Cloud Console and check API key restrictions.",
        });

        // Graceful automatic fallback to high-precision Topo DEM
        updateTerrainConfig({ mapSource: "procedural_alpine" });
        onError?.(new Error(msg));
      });

      tilesRef.current = tiles;
      if (groupRef.current) {
        groupRef.current.add(tiles.group);
      }

      return () => {
        isMounted = false;
        if (tilesRef.current) {
          if (groupRef.current) {
            groupRef.current.remove(tilesRef.current.group);
          }
          tilesRef.current.dispose();
          tilesRef.current = null;
        }
      };
    } catch (err: any) {
      console.warn("Google 3D Tiles initialization error:", err);
      setGoogleTilesConfig({
        status: "error",
        errorMessage: err?.message || "Failed to initialize Google 3D Tiles",
      });
      updateTerrainConfig({ mapSource: "procedural_alpine" });
      onError?.(err);
    }
  }, [apiKey, camera, gl, setGoogleTilesConfig, updateTerrainConfig, onTileLoaded, onError]);

  useFrame(() => {
    if (tilesRef.current) {
      tilesRef.current.setCamera(camera);
      tilesRef.current.setResolutionFromRenderer(camera, gl);
      tilesRef.current.update();
    }
  });

  return (
    <group ref={groupRef} name="GooglePhotorealistic3DTiles">
      <mesh position={[0, landmark.elevationScale * 0.8, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#1a73e8" wireframe />
      </mesh>
    </group>
  );
}
