"use client";

import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { MapPin, Landmark } from "lucide-react";
import {
  sampleRealElevationWorldY,
  sampleRealElevationMeters,
  getCachedFerganaDEM,
  loadFerganaDEM,
} from "@/lib/terrain/realTerrainLoader";

interface LandmarkPin {
  name: string;
  coords: [number, number]; // [worldX, worldZ]
  type: "settlement" | "facility" | "country";
}

const FERGANA_SUX_PINS: LandmarkPin[] = [
  // Country Border Labels
  { name: "UZBEKISTAN", coords: [-38, -35], type: "country" },
  { name: "KYRGYZSTAN", coords: [28, -25], type: "country" },
  { name: "КЫРГЫЗСТАН", coords: [36, 18], type: "country" },

  // Valley settlements, cultural facilities, and topographic landmarks
  { name: "Sux Riverbed", coords: [-35, -15], type: "settlement" },
  { name: "Escarpment Ridge", coords: [6, -8], type: "settlement" },
  { name: "Arekhis", coords: [-42, 10], type: "settlement" },
  { name: "Bogchi Zangat", coords: [-36, 28], type: "settlement" },
  { name: "School 22", coords: [-22, -30], type: "facility" },
  { name: "Sux Tarix Muzeyi", coords: [-30, -44], type: "facility" },
];

export function Earth3DBadges() {
  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const mapboxConfig = useSceneStore((state) => state.mapboxConfig);
  const exaggeration = mapboxConfig.exaggeration || 1.25;

  const [realDem, setRealDem] = useState<Float32Array | null>(getCachedFerganaDEM());

  useEffect(() => {
    if (activeLocationId === "fergana_alay" && !realDem) {
      loadFerganaDEM().then((data) => {
        if (data) setRealDem(data);
      });
    }
  }, [activeLocationId, realDem]);

  // Only display for Fergana Valley / Sux location
  if (activeLocationId !== "fergana_alay") {
    return null;
  }

  return (
    <group>
      {FERGANA_SUX_PINS.map((pin, i) => {
        const groundY = sampleRealElevationWorldY(pin.coords[0], pin.coords[1], 120, exaggeration, realDem);
        const y = groundY + (pin.type === "country" ? 7.5 : 2.4);
        const meters = Math.round(sampleRealElevationMeters(pin.coords[0], pin.coords[1], 120, realDem));

        return (
          <group key={i} position={[pin.coords[0], y, pin.coords[1]]}>
            <Html
              center
              distanceFactor={110}
              zIndexRange={[100, 0]}
              className="pointer-events-none select-none"
            >
              {pin.type === "country" ? (
                <div className="font-extrabold tracking-widest text-[13px] text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] uppercase">
                  {pin.name}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#202124]/90 text-white text-[11px] font-medium shadow-md border border-white/20 whitespace-nowrap backdrop-blur-xs">
                  {pin.type === "facility" ? (
                    <Landmark className="w-3 h-3 text-[#8ab4f8]" />
                  ) : (
                    <MapPin className="w-3 h-3 text-[#34a853]" />
                  )}
                  <span>{pin.name}</span>
                  <span className="text-[10px] text-emerald-400/90 font-mono ml-0.5">
                    {meters}m
                  </span>
                </div>
              )}
            </Html>
          </group>
        );
      })}
    </group>
  );
}
