"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, MapPin, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { EARTH_MOUNTAIN_LANDMARKS, getLandmarkById } from "@/lib/terrain/earthLandmarks";

export function GoogleEarthSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const theme = useSceneStore((state) => state.theme);
  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const selectLocation = useSceneStore((state) => state.selectLocation);

  const activeLandmark = getLandmarkById(activeLocationId);
  const isLight = theme === "light";

  const filtered = EARTH_MOUNTAIN_LANDMARKS.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.country.toLowerCase().includes(query.toLowerCase()) ||
      m.region.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (id: string) => {
    selectLocation(id);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-80 sm:w-96 select-none pointer-events-auto">
      {/* Floating Pill Search Bar */}
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 shadow-md ${
          isLight
            ? "bg-white text-gray-900 border border-gray-200 focus-within:shadow-lg"
            : "bg-[#202124] text-white border border-[#3c4043] focus-within:border-[#8ab4f8]"
        }`}
      >
        <Search className={`w-4 h-4 shrink-0 ${isLight ? "text-gray-500" : "text-gray-400"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={activeLandmark ? `${activeLandmark.name} (${activeLandmark.altitude}m)` : "Search mountain summits or coordinates..."}
          className="w-full bg-transparent text-xs font-normal focus:outline-none placeholder:text-gray-400"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        ) : (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              isLight ? "bg-gray-100 text-gray-600" : "bg-[#303134] text-gray-300"
            }`}
          >
            {activeLandmark.altitude}m
          </span>
        )}
      </div>

      {/* Framer Motion Animated Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute left-0 right-0 top-12 z-50 rounded-2xl overflow-hidden shadow-2xl py-2 max-h-80 overflow-y-auto ${
                isLight
                  ? "bg-white border border-gray-200 divide-y divide-gray-100"
                  : "bg-[#202124] border border-[#3c4043] divide-y divide-[#303134]"
              }`}
            >
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Mountain Summits & Landmarks
              </div>

              {filtered.map((item) => {
                const isActive = item.id === activeLocationId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                      isActive
                        ? isLight
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "bg-[#303134] text-[#8ab4f8] font-semibold"
                        : isLight
                        ? "text-gray-700 hover:bg-gray-50"
                        : "text-gray-300 hover:bg-[#282a2d]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? (isLight ? "text-blue-600" : "text-[#8ab4f8]") : "text-gray-400"
                        }`}
                      />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">
                          {item.country} • {item.region}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">{item.altitude}m</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
