"use client";

import React, { useState } from "react";
import {
  Compass,
  Search,
  Bell,
  ChevronDown,
  Play,
  Sparkles,
  Mountain,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Box,
  Eye,
  Sliders,
  Sun,
  Activity,
  ArrowRight,
  Globe2,
} from "lucide-react";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { EARTH_MOUNTAIN_LANDMARKS, getLandmarkById } from "@/lib/terrain/earthLandmarks";

interface EarthDashboardProps {
  onOpenAIModal: () => void;
  onEnterStudio: () => void;
}

export function EarthDashboard({ onOpenAIModal, onEnterStudio }: EarthDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isKeySaved, setIsKeySaved] = useState(false);

  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const selectLocation = useSceneStore((state) => state.selectLocation);
  const terrainConfig = useSceneStore((state) => state.terrainConfig);
  const updateTerrainConfig = useSceneStore((state) => state.updateTerrainConfig);
  const googleTilesConfig = useSceneStore((state) => state.googleTilesConfig);
  const setGoogleTilesConfig = useSceneStore((state) => state.setGoogleTilesConfig);
  const assets = useSceneStore((state) => state.assets);
  const selectAsset = useSceneStore((state) => state.selectAsset);

  const currentLandmark = getLandmarkById(activeLocationId);

  // Filter landmarks based on search query
  const filteredLandmarks = EARTH_MOUNTAIN_LANDMARKS.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setGoogleTilesConfig({
        apiKey: apiKeyInput.trim(),
        status: "active",
      });
      updateTerrainConfig({ mapSource: "google_3d_tiles" });
      setIsKeySaved(true);
      setTimeout(() => setIsKeySaved(false), 3000);
    }
  };

  const handleSelectMountain = (id: string) => {
    selectLocation(id);
    onEnterStudio();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0d111b] text-slate-100 p-6 lg:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
      {/* ── Top Header Row: Search + User Profile ── */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar (Pill shape from reference) */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mountain peaks, GPS coordinates, or regions..."
            className="w-full bg-[#151b28] border border-slate-800/80 rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
          />
        </div>

        {/* Right Header: Notification + User Profile */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            title="Notifications"
            className="relative p-2.5 rounded-full bg-[#151b28] border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0d111b]" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#151b28] border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
              AJ
            </div>
            <span className="text-xs font-semibold text-slate-200">Aaron_J</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* ── Main Layout: Left 2 Columns + Right Sidebar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left & Middle Column (Span 8) */}
        <div className="xl:col-span-8 space-y-8">
          {/* ── Hero Banner Card (Reference 'Embark on Crazies Journey') ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171f33] via-[#141b2c] to-[#121624] border border-slate-800/80 p-8 shadow-2xl flex flex-col justify-between min-h-[260px]">
            {/* Background Graphic & Glow */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/40 via-purple-500/10 to-transparent" />
            <div
              className="absolute right-4 -bottom-6 w-96 h-56 bg-contain bg-no-repeat bg-right-bottom opacity-40 pointer-events-none mix-blend-screen"
              style={{ backgroundImage: `url(${currentLandmark.thumbnailUrl})` }}
            />

            <div className="relative z-10 max-w-lg space-y-3">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold tracking-wider uppercase">
                <Globe2 className="w-3 h-3 text-indigo-400 animate-spin" />
                <span>Google Earth 3D Tiles Supported</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                Architectural Terrain Studio <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  for Real-World Mountain Peaks
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                Stream photorealistic 3D topography from Google Earth, snap concept architectural models directly into steep cliffs with adaptive foundation plinths, and generate assets with AI.
              </p>
            </div>

            {/* Bottom Action Row */}
            <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onEnterStudio}
                className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch 3D Studio ({currentLandmark.name})
              </button>

              <button
                type="button"
                onClick={onOpenAIModal}
                className="px-5 py-2.5 rounded-full bg-[#1e273d] hover:bg-[#25304b] text-slate-200 border border-slate-700/80 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Generate 3D with AI
              </button>

              <div className="ml-auto text-xs font-mono text-slate-400 hidden sm:flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentLandmark.altitude}m Elevation</span>
              </div>
            </div>
          </div>

          {/* ── Trending Mountain Sites ('Trending Games 🔥' from reference) ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>Trending Mountain Sites</span>
                <span className="text-amber-400">🔥</span>
              </h2>
              <span className="text-xs text-slate-400">
                {filteredLandmarks.length} real-world geographic peaks
              </span>
            </div>

            {/* Grid of Mountain Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLandmarks.map((landmark) => {
                const isSelected = landmark.id === activeLocationId;

                return (
                  <div
                    key={landmark.id}
                    onClick={() => handleSelectMountain(landmark.id)}
                    className={`group relative overflow-hidden rounded-2xl bg-[#141b2a] border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
                        : "border-slate-800/80 hover:border-slate-700 hover:bg-[#182133]"
                    }`}
                  >
                    {/* Top Image Preview */}
                    <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                      <img
                        src={landmark.thumbnailUrl}
                        alt={landmark.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141b2a] via-transparent to-black/30" />

                      {/* Pill Tag */}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-slate-200 uppercase tracking-wider">
                        {landmark.tag}
                      </div>

                      {/* Elevation Badge */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-300">
                        {landmark.altitude}m
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {landmark.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{landmark.region}, {landmark.country}</span>
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                        <span>{landmark.lat.toFixed(2)}°N, {landmark.lng.toFixed(2)}°E</span>
                        <span className="text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Fly To <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Recent Architectural Projects & Placed Models ('Recent Plays') ── */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Active Scene Structures
            </h2>

            <div className="space-y-2.5">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    selectAsset(asset.id);
                    onEnterStudio();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#141b2a] border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700/60">
                      {asset.thumbnailUrl ? (
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Box className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{asset.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>Type: {asset.type}</span>
                        <span>•</span>
                        <span>Foundation: {asset.foundation.depth}m ({asset.foundation.material})</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAsset(asset.id);
                      onEnterStudio();
                    }}
                    className="px-4 py-1.5 rounded-full bg-[#1e273d] hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel (Span 4) — Stream / Config / Telemetries ── */}
        <div className="xl:col-span-4 space-y-6">
          {/* 1. Live 3D Stream Card ('Stream' from reference) */}
          <div className="rounded-3xl bg-[#141b2a] border border-slate-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live 3D Viewport
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                60 FPS WebGL
              </span>
            </div>

            {/* Mini Viewport Video / Canvas Thumbnail with Play Overlay */}
            <div
              onClick={onEnterStudio}
              className="group relative h-44 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 cursor-pointer"
            >
              <img
                src={currentLandmark.thumbnailUrl}
                alt="3D Viewport Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600/90 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-white font-mono bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                <span>{currentLandmark.name}</span>
                <span className="text-indigo-400">LOD: DYNAMIC</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onEnterStudio}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Enter Fullscreen Studio
            </button>
          </div>

          {/* 2. Google Earth 3D Tiles Configuration Card */}
          <div className="rounded-3xl bg-[#141b2a] border border-slate-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-indigo-400" />
                Google 3D Tiles
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                  googleTilesConfig.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {googleTilesConfig.status === "active" ? "Connected" : "Demo Mode"}
              </span>
            </div>

            {/* Map Source Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Elevation & Tile Engine</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateTerrainConfig({ mapSource: "google_3d_tiles" })}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-medium transition-colors ${
                    terrainConfig.mapSource === "google_3d_tiles"
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-[#161d2d] text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Google 3D Tiles
                </button>
                <button
                  type="button"
                  onClick={() => updateTerrainConfig({ mapSource: "procedural_alpine" })}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-medium transition-colors ${
                    terrainConfig.mapSource === "procedural_alpine"
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-[#161d2d] text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Alpine DEM
                </button>
              </div>
            </div>

            {/* Google Maps API Key Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                Google Maps API Key (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-[#161d2d] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 rounded-xl bg-[#24304c] hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isKeySaved ? "Saved!" : "Connect"}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Enables Photorealistic 3D Tiles streamed from Google Maps Platform.
              </p>
            </div>
          </div>

          {/* 3. Mountain Telemetry & Controls */}
          <div className="rounded-3xl bg-[#141b2a] border border-slate-800/80 p-5 space-y-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              Peak Telemetry & Physics
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#161d2d] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Latitude</span>
                <span className="font-mono font-bold text-slate-200">{currentLandmark.lat.toFixed(4)}° N</span>
              </div>
              <div className="bg-[#161d2d] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Longitude</span>
                <span className="font-mono font-bold text-slate-200">{currentLandmark.lng.toFixed(4)}° E</span>
              </div>
              <div className="bg-[#161d2d] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 block mb-0.5">Peak Altitude</span>
                <span className="font-mono font-bold text-indigo-400">{currentLandmark.altitude}m</span>
              </div>
              <div className="bg-[#161d2d] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 block mb-0.5">BVH Index</span>
                <span className="font-mono font-bold text-emerald-400">Sub-0.2ms</span>
              </div>
            </div>

            {/* Quick LOD and Snow Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Terrain LOD Segments</span>
                  <span className="font-mono text-slate-200">{terrainConfig.segments}</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="256"
                  step="32"
                  value={terrainConfig.segments}
                  onChange={(e) => updateTerrainConfig({ segments: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Snow Line Elevation</span>
                  <span className="font-mono text-slate-200">{terrainConfig.snowElevation}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={terrainConfig.snowElevation}
                  onChange={(e) => updateTerrainConfig({ snowElevation: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
