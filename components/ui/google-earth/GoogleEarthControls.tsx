"use client";

import React, { useState } from "react";
import { Compass, Plus, Minus, Sun, Moon, Box, Maximize, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useSceneStore } from "@/lib/stores/useSceneStore";

export function GoogleEarthControls() {
  const theme = useSceneStore((state) => state.theme);
  const toggleTheme = useSceneStore((state) => state.toggleTheme);
  const [is3D, setIs3D] = useState(true);

  const isLight = theme === "light";

  const buttonStyle = `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 shadow-md cursor-pointer ${
    isLight
      ? "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
      : "bg-[#202124] text-gray-200 hover:bg-[#303134] hover:text-white border border-[#3c4043]"
  }`;

  return (
    <div className="flex flex-col items-center gap-2 select-none pointer-events-auto">
      {/* Light / Dark Theme Switcher */}
      <motion.button
        type="button"
        title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={buttonStyle}
      >
        {isLight ? <Moon className="w-4 h-4 text-gray-700" /> : <Sun className="w-4 h-4 text-amber-300" />}
      </motion.button>

      {/* 3D / 2D Toggle */}
      <motion.button
        type="button"
        title={is3D ? "Switch to Top-down 2D" : "Switch to 3D Orbit"}
        onClick={() => setIs3D(!is3D)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${buttonStyle} font-semibold text-xs`}
      >
        <span>{is3D ? "3D" : "2D"}</span>
      </motion.button>

      {/* Compass / Reset North */}
      <motion.button
        type="button"
        title="Reset North"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={buttonStyle}
      >
        <Compass className="w-4 h-4 text-red-500" />
      </motion.button>

      {/* Zoom In & Out Group */}
      <div
        className={`flex flex-col rounded-full overflow-hidden shadow-md border ${
          isLight ? "bg-white border-gray-200" : "bg-[#202124] border-[#3c4043]"
        }`}
      >
        <button
          type="button"
          title="Zoom In"
          className={`w-10 h-10 flex items-center justify-center transition-colors ${
            isLight ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#303134]"
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className={`h-px w-6 mx-auto ${isLight ? "bg-gray-200" : "bg-[#3c4043]"}`} />
        <button
          type="button"
          title="Zoom Out"
          className={`w-10 h-10 flex items-center justify-center transition-colors ${
            isLight ? "text-gray-700 hover:bg-gray-100" : "text-gray-200 hover:bg-[#303134]"
          }`}
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
