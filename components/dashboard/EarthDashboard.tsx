"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Play,
  Sparkles,
  Mountain,
  MapPin,
  Box,
  Layers,
  Globe2,
  ArrowRight,
  Sliders,
  Check,
  Compass,
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
  const [keySaved, setKeySaved] = useState(false);

  const activeLocationId = useSceneStore((state) => state.terrainConfig.activeLocationId);
  const selectLocation = useSceneStore((state) => state.selectLocation);
  const terrainConfig = useSceneStore((state) => state.terrainConfig);
  const updateTerrainConfig = useSceneStore((state) => state.updateTerrainConfig);
  const googleTilesConfig = useSceneStore((state) => state.googleTilesConfig);
  const setGoogleTilesConfig = useSceneStore((state) => state.setGoogleTilesConfig);
  const assets = useSceneStore((state) => state.assets);
  const selectAsset = useSceneStore((state) => state.selectAsset);

  const currentLandmark = getLandmarkById(activeLocationId);

  const filteredLandmarks = EARTH_MOUNTAIN_LANDMARKS.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnectKey = () => {
    if (apiKeyInput.trim()) {
      setGoogleTilesConfig({
        apiKey: apiKeyInput.trim(),
        status: "active",
      });
      updateTerrainConfig({ mapSource: "google_3d_tiles" });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    }
  };

  const handleSelectPeak = (id: string) => {
    selectLocation(id);
    onEnterStudio();
  };

  // Mock friends/expedition members matching reference design
  const onlineSurveyors = [
    {
      name: "Mr.Salon",
      role: "Playing Warcraft",
      mountain: "Matterhorn West Face",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Warmonder_kek",
      role: "Playing Call of Duty",
      mountain: "Mont Blanc Glacier",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Dolly_doll",
      role: "Action/RPG",
      mountain: "Yosemite Half Dome",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Celine_Dion",
      role: "Action/RPG",
      mountain: "Mount Fuji Summit",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80",
    },
  ];

  const siteGroups = [
    {
      name: "Google 3D Tiles Stream",
      detail: "Photorealistic Meshes",
      avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Alpine DEM Zone",
      detail: "High-Precision 0.1m",
      avatar: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "AI Generative Studio",
      detail: "TRELLIS-3D & Meshy",
      avatar: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=100&q=80",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#11141c] text-white p-6 lg:p-7 space-y-6 scrollbar-thin scrollbar-thumb-[#202536]">
      {/* ── TOP HEADER ROW: Search Bar + Profile ── */}
      <div className="flex items-center justify-between gap-4">
        {/* Pill Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#181c28] border border-white/5 rounded-full pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#7064e9] transition-all"
          />
        </div>

        {/* Right Header: Notification + User Profile */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative p-2 rounded-full bg-[#181c28] border border-white/5 hover:bg-[#202536] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7064e9]" />
          </button>

          {/* Profile Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#181c28] border border-white/5 cursor-pointer hover:bg-[#202536] transition-colors">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                alt="Aaron_J"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-semibold text-slate-200">Aaron_J</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* ── BENTO GRID LAYOUT (Main 2 Columns + Right Column) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ── LEFT & CENTER AREA (Span 8) ── */}
        <div className="xl:col-span-8 space-y-6">
          {/* 1. HERO FEATURED CARD ('It Takes Two' Style from Reference) */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#181c28] border border-white/5 p-7 flex items-center justify-between min-h-[200px] shadow-xl group">
            {/* Background Image Overlay */}
            <div
              className="absolute right-0 top-0 bottom-0 w-3/5 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url(${currentLandmark.thumbnailUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#181c28] via-[#181c28]/95 to-transparent pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 space-y-3 max-w-sm">
              {/* Starburst Red Badge */}
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#ef4444] text-white text-[9px] font-extrabold uppercase tracking-wider shadow-md shadow-red-500/30">
                NEW
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
                Embark on the Craziest <br />
                Journey of Your Life
              </h2>

              {/* Price / Elevation Spec */}
              <div className="text-lg font-extrabold text-white">
                $ {currentLandmark.altitude.toLocaleString()}m
              </div>

              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onEnterStudio}
                  className="px-5 py-2 rounded-full bg-[#7064e9] hover:bg-[#8174f8] text-white font-bold text-xs shadow-lg shadow-[#7064e9]/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Launch 3D Flight
                </button>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentLandmark.name}
                </span>
              </div>
            </div>

            {/* Right Graphic: Floating Mountain Character / Model */}
            <div className="relative z-10 hidden sm:block pr-6">
              <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-2xl border border-white/10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <img
                  src={currentLandmark.thumbnailUrl}
                  alt={currentLandmark.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 2. TRENDING MOUNTAINS ('Trending Games 🔥' from Reference) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Trending mountains</span>
              <span className="text-[#fcd34d]">🔥</span>
            </h3>

            {/* 3 Bento Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filteredLandmarks.slice(0, 3).map((landmark) => {
                const isSelected = landmark.id === activeLocationId;

                return (
                  <div
                    key={landmark.id}
                    onClick={() => handleSelectPeak(landmark.id)}
                    className={`group relative overflow-hidden rounded-[20px] bg-[#181c28] border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "border-[#7064e9] ring-2 ring-[#7064e9]/30"
                        : "border-white/5 hover:border-white/20 hover:bg-[#1e2333]"
                    }`}
                  >
                    {/* Top Image */}
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={landmark.thumbnailUrl}
                        alt={landmark.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181c28] via-transparent to-transparent" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-slate-200">
                        {landmark.altitude}m
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="p-3.5 space-y-0.5">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#7064e9] transition-colors truncate">
                        {landmark.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {landmark.country} • {landmark.region}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. LOWER BENTO ROW: Accessories promo + Recent plays */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Left Card: Accessories for GAMERS style */}
            <div
              onClick={onOpenAIModal}
              className="sm:col-span-5 rounded-[22px] bg-[#181c28] border border-white/5 p-5 flex flex-col justify-between cursor-pointer hover:border-white/20 hover:bg-[#1e2333] transition-all group"
            >
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Concept to 3D</p>
                <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider mt-0.5">
                  <span>AI MODEL STUDIO</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#7064e9]" />
                </h4>
              </div>

              {/* Center graphic preview */}
              <div className="my-3 py-3 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#202536] border border-white/10 flex items-center justify-center text-[#7064e9] group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center font-medium">
                Upload 2D image → Instant GLB model
              </div>
            </div>

            {/* Right Card: Recent plays style */}
            <div className="sm:col-span-7 rounded-[22px] bg-[#181c28] border border-white/5 p-5 space-y-3">
              <h4 className="text-xs font-bold text-white">Recent site projects</h4>

              <div className="space-y-2.5">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => {
                      selectAsset(asset.id);
                      onEnterStudio();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#202536] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-[#202536] border border-white/5 flex items-center justify-center shrink-0">
                        <Box className="w-4 h-4 text-[#7064e9]" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">
                          {asset.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {asset.type} • {asset.foundation.depth}m Plinth
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3.5 py-1 rounded-full border border-white/10 text-[11px] font-semibold text-slate-300 group-hover:border-[#7064e9] group-hover:text-white group-hover:bg-[#7064e9] transition-all cursor-pointer shrink-0"
                    >
                      Play
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Span 4) — Stream, Friends Online, Groups ── */}
        <div className="xl:col-span-4 space-y-5">
          {/* 1. STREAM CARD ('Stream' from Reference) */}
          <div className="rounded-[24px] bg-[#181c28] border border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Stream</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Video / 3D Stream Thumbnail with Play Button */}
            <div
              onClick={onEnterStudio}
              className="relative h-36 w-full rounded-[18px] overflow-hidden bg-slate-900 border border-white/5 group cursor-pointer"
            >
              <img
                src={currentLandmark.thumbnailUrl}
                alt="3D Stream"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-[#7064e9] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>

              {/* Title overlay */}
              <div className="absolute top-2.5 left-3 text-[11px] font-bold text-white uppercase tracking-wider drop-shadow-md">
                3D Live Viewport
              </div>
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded-md">
                <span>{currentLandmark.name}</span>
                <span className="text-[#fcd34d]">60 FPS</span>
              </div>
            </div>
          </div>

          {/* 2. FRIENDS ONLINE ('Friends online' from Reference) */}
          <div className="rounded-[24px] bg-[#181c28] border border-white/5 p-5 space-y-3">
            <span className="text-xs font-bold text-white block">Friends online</span>

            <div className="space-y-3">
              {onlineSurveyors.map((person) => (
                <div key={person.name} className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-[#181c28]" />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-[11px] font-semibold text-slate-200 truncate">
                      {person.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {person.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. GROUPS ('Groups' from Reference) */}
          <div className="rounded-[24px] bg-[#181c28] border border-white/5 p-5 space-y-3">
            <span className="text-xs font-bold text-white block">Groups</span>

            <div className="space-y-3">
              {siteGroups.map((group) => (
                <div key={group.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-slate-800 shrink-0">
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-semibold text-slate-200 truncate">
                        {group.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {group.detail}
                      </div>
                    </div>
                  </div>

                  {/* Overlapping member avatars icon representation */}
                  <div className="flex -space-x-1.5 shrink-0">
                    <div className="w-4 h-4 rounded-full bg-slate-700 ring-1 ring-[#181c28]" />
                    <div className="w-4 h-4 rounded-full bg-indigo-600 ring-1 ring-[#181c28]" />
                  </div>
                </div>
              ))}
            </div>

            {/* Google 3D Tiles Key Connector */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-[#7064e9]" />
                  Google 3D Tiles
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#10b981] font-bold">
                  {googleTilesConfig.status === "active" ? "Connected" : "Ready"}
                </span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Google API Key..."
                  className="flex-1 bg-[#202536] border border-white/5 rounded-xl px-2.5 py-1 text-[11px] text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-[#7064e9]"
                />
                <button
                  type="button"
                  onClick={handleConnectKey}
                  className="px-3 py-1 rounded-xl bg-[#7064e9] hover:bg-[#8174f8] text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {keySaved ? <Check className="w-3 h-3" /> : "Set"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
