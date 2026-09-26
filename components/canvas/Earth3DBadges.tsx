"use client";

import React from "react";
import { Html } from "@react-three/drei";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { MapPin, School, Landmark } from "lucide-react";

interface LandmarkPin {
  name: string;
  position: [number, number, number];
  type: "settlement" | "facility" | "country";
}

const FERGANA_SUX_PINS: LandmarkPin[] = [
  // Country Border Labels
  { name: "UZBEKISTAN", position: [-55, 12, -45], type: "country" },
  { name: "KYRGYZSTAN", position: [15, 33, -30], type: "country" },
  { name: "КЫРГЫЗСТАН", position: [42, 28, 25], type: "country" },

  // Village & Cultural Places in the Valley
  { name: "Sux Tarix Muzeyi", position: [-42, 10, -55], type: "facility" },
  { name: "School 22", position: [-25, 9, -42], type: "facility" },
  { name: "Arekhis", position: [-48, 7, -10], type: "settlement" },
  { name: "Bogchi Zangat", position: [-42, 6, 12], type: "settlement" },
  { name: "Shohsanem Medical", position: [-34, 6, 32], type: "facility" },
];

export function Earth3DBadges() {
  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);

  // Only display for Fergana Valley / Sux location
  if (activeLocationId !== "fergana_alay") {
    return null;
  }

  return (
    <group>
      {FERGANA_SUX_PINS.map((pin, i) => (
        <group key={i} position={pin.position}>
          <Html
            center
            distanceFactor={110}
            zIndexRange={[100, 0]}
            className="pointer-events-none select-none"
          >
            {pin.type === "country" ? (
              <div className="font-extrabold tracking-widest text-[14px] text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                {pin.name}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#202124]/85 text-white text-[11px] font-medium shadow-lg border border-white/20 whitespace-nowrap backdrop-blur-xs">
                {pin.type === "facility" ? (
                  <Landmark className="w-3 h-3 text-[#8ab4f8]" />
                ) : (
                  <MapPin className="w-3 h-3 text-[#34a853]" />
                )}
                <span>{pin.name}</span>
              </div>
            )}
          </Html>
        </group>
      ))}
    </group>
  );
}
