"use client";

import React, { useState } from "react";
import {
  Compass,
  Layers,
  Box,
  Sparkles,
  X,
  MapPin,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Check,
  Globe2,
  Lock,
  Unlock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSceneStore, ActivePanelType } from "@/lib/stores/useSceneStore";
import { EARTH_MOUNTAIN_LANDMARKS } from "@/lib/terrain/earthLandmarks";

interface GoogleEarthDrawerProps {
  onOpenAIModal?: () => void;
}

export function GoogleEarthDrawer({ onOpenAIModal }: GoogleEarthDrawerProps) {
  const theme = useSceneStore((state) => state.theme);
  const activePanel = useSceneStore((state) => state.activePanel);
  const setActivePanel = useSceneStore((state) => state.setActivePanel);

  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const selectLocation = useSceneStore((state) => state.selectLocation);
  const terrainConfig = useSceneStore((state) => state.terrainConfig);
  const updateTerrainConfig = useSceneStore((state) => state.updateTerrainConfig);
  const googleTilesConfig = useSceneStore((state) => state.googleTilesConfig);
  const setGoogleTilesConfig = useSceneStore((state) => state.setGoogleTilesConfig);
  const mapboxConfig = useSceneStore((state) => state.mapboxConfig);
  const updateMapboxConfig = useSceneStore((state) => state.updateMapboxConfig);

  const assets = useSceneStore((state) => state.assets);
  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const selectAsset = useSceneStore((state) => state.selectAsset);
  const updateAsset = useSceneStore((state) => state.updateAsset);
  const removeAsset = useSceneStore((state) => state.removeAsset);

  const [apiKeyInput, setApiKeyInput] = useState(googleTilesConfig.apiKey || "");
  const [keySaved, setKeySaved] = useState(false);
  const [mapboxTokenInput, setMapboxTokenInput] = useState(mapboxConfig.accessToken || "");
  const [mapboxTokenSaved, setMapboxTokenSaved] = useState(false);

  const isLight = theme === "light";

  const handleTogglePanel = (panel: ActivePanelType) => {
    setActivePanel(activePanel === panel ? "none" : panel);
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setGoogleTilesConfig({
        apiKey: apiKeyInput.trim(),
        status: "active",
      });
      updateTerrainConfig({ mapSource: "google_3d_tiles" });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2500);
    }
  };

  const handleSaveMapboxToken = () => {
    if (mapboxTokenInput.trim()) {
      updateMapboxConfig({
        accessToken: mapboxTokenInput.trim(),
        status: "connected",
      });
      setMapboxTokenSaved(true);
      setTimeout(() => setMapboxTokenSaved(false), 2500);
    }
  };

  const navItems = [
    { id: "layers" as ActivePanelType, label: "Layers & Terrain", icon: Layers },
    { id: "projects" as ActivePanelType, label: "Placed Structures", icon: Box },
    { id: "ai" as ActivePanelType, label: "AI 3D Synthesis", icon: Sparkles },
  ];

  return (
    <div className="flex items-start pointer-events-auto">
      {/* Floating Vertical Icon Strip (Google Earth Left Rail) */}
      <div
        className={`flex flex-col gap-1 p-1.5 rounded-full shadow-md z-30 ${
          isLight ? "bg-white border border-gray-200" : "bg-[#202124] border border-[#3c4043]"
        }`}
      >
        {navItems.map((item) => {
          const isActive = activePanel === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              type="button"
              title={item.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTogglePanel(item.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isActive
                  ? isLight
                    ? "bg-blue-600 text-white"
                    : "bg-[#8ab4f8] text-[#202124]"
                  : isLight
                  ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  : "text-gray-400 hover:bg-[#303134] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          );
        })}
      </div>

      {/* Framer Motion Sliding Panel */}
      <AnimatePresence>
        {activePanel !== "none" && activePanel !== "inspector" && (
          <motion.div
            initial={{ opacity: 0, x: -16, scale: 0.98 }}
            animate={{ opacity: 1, x: 12, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`w-80 rounded-2xl shadow-xl p-5 z-20 overflow-y-auto max-h-[calc(100vh-140px)] ${
              isLight
                ? "bg-white border border-gray-200 text-gray-900"
                : "bg-[#202124] border border-[#3c4043] text-gray-100"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {activePanel === "layers" && "Map Layers & 3D Tiles"}
                {activePanel === "projects" && "Placed Structures"}
                {activePanel === "ai" && "AI Concept to 3D"}
              </h3>
              <button
                type="button"
                onClick={() => setActivePanel("none")}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* 1. LAYERS PANEL */}
            {activePanel === "layers" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                    Map Elevation Engine
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateTerrainConfig({ mapSource: "mapbox_simulator" })}
                      className={`py-2 px-1.5 rounded-lg text-[11px] font-medium transition-colors text-center cursor-pointer ${
                        terrainConfig.mapSource === "mapbox_simulator"
                          ? isLight ? "bg-blue-600 text-white font-bold" : "bg-[#8ab4f8] text-[#202124] font-bold"
                          : isLight ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-[#303134] hover:bg-gray-700 text-gray-300"
                      }`}
                    >
                      Mapbox 3D
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTerrainConfig({ mapSource: "google_3d_tiles" })}
                      className={`py-2 px-1.5 rounded-lg text-[11px] font-medium transition-colors text-center cursor-pointer ${
                        terrainConfig.mapSource === "google_3d_tiles"
                          ? isLight ? "bg-blue-600 text-white font-bold" : "bg-[#8ab4f8] text-[#202124] font-bold"
                          : isLight ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-[#303134] hover:bg-gray-700 text-gray-300"
                      }`}
                    >
                      Google 3D
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTerrainConfig({ mapSource: "procedural_alpine" })}
                      className={`py-2 px-1.5 rounded-lg text-[11px] font-medium transition-colors text-center cursor-pointer ${
                        terrainConfig.mapSource === "procedural_alpine"
                          ? isLight ? "bg-blue-600 text-white font-bold" : "bg-[#8ab4f8] text-[#202124] font-bold"
                          : isLight ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-[#303134] hover:bg-gray-700 text-gray-300"
                      }`}
                    >
                      Alpine Topo
                    </button>
                  </div>
                </div>

                {/* Mapbox Simulator Interactive Controls */}
                {terrainConfig.mapSource === "mapbox_simulator" && (
                  <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-gray-500">
                          Mapbox Style
                        </label>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-[#8ab4f8]">
                          {mapboxConfig.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(["light", "outdoors", "satellite"] as const).map((styleName) => (
                          <button
                            key={styleName}
                            type="button"
                            onClick={() => updateMapboxConfig({ style: styleName })}
                            className={`py-1.5 px-1 rounded text-[10px] font-semibold capitalize cursor-pointer transition-colors text-center ${
                              mapboxConfig.style === styleName
                                ? isLight ? "bg-blue-600 text-white" : "bg-[#8ab4f8] text-[#202124]"
                                : isLight ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-[#303134] hover:bg-gray-700 text-gray-300"
                            }`}
                          >
                            {styleName === "light" ? "Light Topo" : styleName === "outdoors" ? "Outdoors" : "Satellite"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Elevation Exaggeration Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Elevation Exaggeration</span>
                        <span className="font-mono font-semibold">{mapboxConfig.exaggeration.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="2.5"
                        step="0.05"
                        value={mapboxConfig.exaggeration}
                        onChange={(e) => updateMapboxConfig({ exaggeration: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* Topographic Contour Lines */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-gray-500">
                          Topographic Contour Lines
                        </label>
                        <input
                          type="checkbox"
                          checked={mapboxConfig.showContourLines}
                          onChange={(e) => updateMapboxConfig({ showContourLines: e.target.checked })}
                          className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                        />
                      </div>
                      {mapboxConfig.showContourLines && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-gray-400">Contour Interval:</span>
                          {[10, 15, 25, 50].map((intv) => (
                            <button
                              key={intv}
                              type="button"
                              onClick={() => updateMapboxConfig({ contourInterval: intv })}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                                mapboxConfig.contourInterval === intv
                                  ? isLight ? "bg-blue-600 text-white" : "bg-[#8ab4f8] text-[#202124] font-bold"
                                  : isLight ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-[#303134] text-gray-300 hover:bg-gray-700"
                              }`}
                            >
                              {intv}m
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Optional Mapbox Token */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                        Mapbox Token (Optional)
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="password"
                          value={mapboxTokenInput}
                          onChange={(e) => setMapboxTokenInput(e.target.value)}
                          placeholder="pk.eyJ1..."
                          className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none ${
                            isLight
                              ? "bg-gray-50 border-gray-200 focus:border-blue-600"
                              : "bg-[#303134] border-[#3c4043] focus:border-[#8ab4f8]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleSaveMapboxToken}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            isLight ? "bg-blue-600 text-white" : "bg-[#8ab4f8] text-[#202124]"
                          }`}
                        >
                          {mapboxTokenSaved ? <Check className="w-3.5 h-3.5" /> : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Maps API Key field */}
                {terrainConfig.mapSource === "google_3d_tiles" && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <label className="text-[11px] font-semibold text-gray-500 block">
                      Google Maps API Key
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Paste API key..."
                        className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none ${
                          isLight
                            ? "bg-gray-50 border-gray-200 focus:border-blue-600"
                            : "bg-[#303134] border-[#3c4043] focus:border-[#8ab4f8]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          isLight ? "bg-blue-600 text-white" : "bg-[#8ab4f8] text-[#202124]"
                        }`}
                      >
                        {keySaved ? <Check className="w-3.5 h-3.5" /> : "Apply"}
                      </button>
                    </div>

                    {googleTilesConfig.status === "error" && (
                      <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] space-y-1 mt-2">
                        <div className="font-semibold">Error 403 (Forbidden)</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-300 leading-tight space-y-0.5">
                          <p>1. Enable <strong>Map Tiles API</strong> in Google Cloud Console.</p>
                          <p>2. Ensure key allows <strong>Map Tiles API</strong> and <code>localhost:3000</code>.</p>
                          <p>3. Ensure a billing account is linked to your project.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Terrain Sliders */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Terrain Mesh Detail</span>
                      <span className="font-mono">{terrainConfig.segments}</span>
                    </div>
                    <input
                      type="range"
                      min="32"
                      max="256"
                      step="32"
                      value={terrainConfig.segments}
                      onChange={(e) => updateTerrainConfig({ segments: parseInt(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Snow Line Elevation</span>
                      <span className="font-mono">{terrainConfig.snowElevation}m</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      step="1"
                      value={terrainConfig.snowElevation}
                      onChange={(e) => updateTerrainConfig({ snowElevation: parseInt(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="wireframeCheck"
                      checked={terrainConfig.wireframe}
                      onChange={(e) => updateTerrainConfig({ wireframe: e.target.checked })}
                      className="accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="wireframeCheck" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                      Show Wireframe Mesh
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PLACED STRUCTURES PANEL */}
            {activePanel === "projects" && (
              <div className="space-y-2 text-xs">
                {assets.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No structures placed on mountain</p>
                ) : (
                  assets.map((asset) => {
                    const isSelected = asset.id === selectedAssetId;

                    return (
                      <div
                        key={asset.id}
                        onClick={() => selectAsset(asset.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? isLight ? "bg-blue-50 border border-blue-200" : "bg-[#303134] border border-[#8ab4f8]"
                            : isLight ? "hover:bg-gray-50 border border-transparent" : "hover:bg-[#282a2d] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Box className={`w-4 h-4 shrink-0 ${isSelected ? "text-blue-600 dark:text-[#8ab4f8]" : "text-gray-400"}`} />
                          <div className="truncate">
                            <div className="font-semibold truncate">{asset.name}</div>
                            <div className="text-[10px] text-gray-400">
                              Plinth: {asset.foundation.depth}m ({asset.foundation.material})
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAsset(asset.id, { visible: !asset.visible });
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                          >
                            {asset.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAsset(asset.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 3. AI GENERATOR PANEL */}
            {activePanel === "ai" && (
              <div className="space-y-3.5 text-xs">
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Convert 2D architectural sketches into slope-grounded 3D GLB models.
                </p>

                <div
                  onClick={onOpenAIModal}
                  className={`p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isLight
                      ? "border-gray-300 hover:border-blue-600 bg-gray-50"
                      : "border-gray-600 hover:border-[#8ab4f8] bg-[#303134]"
                  }`}
                >
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="font-semibold">Upload Concept Sketch</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, or WEBP</span>
                </div>

                <button
                  type="button"
                  onClick={onOpenAIModal}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    isLight ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Open Model Generator
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
