"use client";

import React, { useState } from 'react';
import { 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Upload, 
  Box,
  Globe2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useSceneStore } from '@/lib/stores/useSceneStore';
import { EARTH_MOUNTAIN_LANDMARKS } from '@/lib/terrain/earthLandmarks';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-800/80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#131926] px-3.5 py-2 flex items-center justify-between hover:bg-[#192233] transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight 
            size={14} 
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          />
          <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">
            {title}
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="px-3.5 py-3 space-y-3.5 bg-[#0e131f]/70">
          {children}
        </div>
      )}
    </div>
  );
}

interface RightPanelProps {
  onStartGeneration?: () => void;
  generationStatus?: 'idle' | 'generating' | 'completed' | 'error';
  generationProgress?: number;
}

export function RightPanel({
  onStartGeneration,
  generationStatus = 'idle',
  generationProgress = 0
}: RightPanelProps) {
  const { 
    terrainConfig, 
    updateTerrainConfig,
    selectLocation,
    googleTilesConfig,
    setGoogleTilesConfig,
    assets,
    selectedAssetId,
    selectAsset,
    updateAsset,
    removeAsset
  } = useSceneStore();

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const getLodLabel = (segments: number) => {
    if (segments >= 192) return 'High';
    if (segments >= 128) return 'Medium';
    return 'Low';
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0b0f19]/95 backdrop-blur-md border-l border-slate-800/80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent z-20">
      <div className="flex flex-col h-full pb-10">
        
        {/* ── GOOGLE EARTH 3D & LOCATION CONTROLS ── */}
        <CollapsibleSection title="Google Earth 3D & Peaks" defaultOpen={true}>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-indigo-400" />
                Active Mountain Peak
              </label>
              <select
                value={terrainConfig.activeLocationId}
                onChange={(e) => selectLocation(e.target.value)}
                className="w-full bg-[#151c2d] border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {EARTH_MOUNTAIN_LANDMARKS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.altitude}m) — {m.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Source Engine Switcher */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Terrain Engine
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateTerrainConfig({ mapSource: 'google_3d_tiles' })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
                    terrainConfig.mapSource === 'google_3d_tiles'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#151c2d] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Google 3D Tiles
                </button>
                <button
                  type="button"
                  onClick={() => updateTerrainConfig({ mapSource: 'procedural_alpine' })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
                    terrainConfig.mapSource === 'procedural_alpine'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#151c2d] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Alpine DEM
                </button>
              </div>
            </div>

            {/* Google API Key input */}
            {terrainConfig.mapSource === 'google_3d_tiles' && (
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 block">
                  Google Maps API Key
                </label>
                <input
                  type="password"
                  value={googleTilesConfig.apiKey}
                  onChange={(e) => setGoogleTilesConfig({ apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#151c2d] border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ── SCENE & LOD CONTROLS ── */}
        <CollapsibleSection title="Scene Controls" defaultOpen={true}>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Terrain Mesh LOD</span>
                <span className="text-white font-mono">{getLodLabel(terrainConfig.segments)} ({terrainConfig.segments})</span>
              </div>
              <input
                type="range"
                min="32"
                max="256"
                step="32"
                value={terrainConfig.segments}
                onChange={(e) => updateTerrainConfig({ segments: parseInt(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Snow Elevation Line</span>
                <span className="text-white font-mono">{terrainConfig.snowElevation ?? 24}m</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={terrainConfig.snowElevation ?? 24}
                onChange={(e) => updateTerrainConfig({ snowElevation: parseInt(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wireframeToggle"
                checked={terrainConfig.wireframe ?? false}
                onChange={(e) => updateTerrainConfig({ wireframe: e.target.checked })}
                className="accent-indigo-500"
              />
              <label htmlFor="wireframeToggle" className="text-xs text-slate-300 cursor-pointer">
                Show Wireframe Mesh
              </label>
            </div>
          </div>
        </CollapsibleSection>

        {/* ── CLOUD AI GENERATOR ── */}
        <CollapsibleSection title="Cloud AI Generator" defaultOpen={true}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Concept Image / Sketch</label>
              <div 
                onClick={onStartGeneration}
                className="w-full aspect-video bg-[#151c2d] rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Upload size={20} className="mb-1.5" />
                <span className="text-xs font-semibold">Upload 2D Architectural Sketch</span>
              </div>
            </div>

            <button 
              onClick={onStartGeneration}
              disabled={generationStatus === 'generating'}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              Generate 3D Model
            </button>

            {generationStatus === 'generating' && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-[10px] text-indigo-400 font-medium">
                  <span>GENERATING 3D MODEL...</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ── SCENE TREE & ASSETS ── */}
        <CollapsibleSection title="Scene Tree & Assets" defaultOpen={true}>
          <div className="space-y-1">
            {assets.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">
                No structures placed yet
              </div>
            ) : (
              assets.map((asset) => {
                const isActive = asset.id === selectedAssetId;
                
                return (
                  <div 
                    key={asset.id}
                    onClick={() => selectAsset(asset.id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                      isActive ? 'bg-indigo-950/40 border border-indigo-500/40' : 'hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Box size={14} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                      <span className={`text-xs truncate ${isActive ? 'text-indigo-300 font-semibold' : 'text-slate-300'}`}>
                        {asset.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateAsset(asset.id, { visible: !(asset.visible ?? true) }) }}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Toggle Visibility"
                      >
                        {(asset.visible ?? true) ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateAsset(asset.id, { locked: !asset.locked }) }}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Toggle Lock"
                      >
                        {asset.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeAsset(asset.id) }}
                        className="text-slate-500 hover:text-red-400 p-0.5"
                        title="Delete Asset"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CollapsibleSection>

        {/* ── ASSET INSPECTOR ── */}
        {selectedAsset && (
          <CollapsibleSection title="Asset Inspector" defaultOpen={true}>
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Structure Name</label>
                <input 
                  type="text" 
                  value={selectedAsset.name}
                  onChange={(e) => updateAsset(selectedAsset.id, { name: e.target.value })}
                  className="w-full bg-[#151c2d] border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Position (X, Y, Z)</label>
                <div className="flex gap-1.5">
                  {['x', 'y', 'z'].map((axis, i) => (
                    <input
                      key={axis}
                      type="number"
                      value={selectedAsset.position?.[i] ?? 0}
                      onChange={(e) => {
                        const newPos = [...(selectedAsset.position ?? [0,0,0])] as [number, number, number];
                        newPos[i] = parseFloat(e.target.value) || 0;
                        updateAsset(selectedAsset.id, { position: newPos });
                      }}
                      className="w-1/3 bg-[#151c2d] border border-slate-700/80 rounded-lg px-1.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] uppercase text-slate-500 mb-1">
                  <span>Adaptive Foundation Depth</span>
                  <span className="font-mono text-white">{selectedAsset.foundation?.depth ?? 0}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={selectedAsset.foundation?.depth ?? 0}
                  onChange={(e) => updateAsset(selectedAsset.id, { foundation: { ...selectedAsset.foundation, depth: parseFloat(e.target.value) } })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Foundation Plinth Material</label>
                <select 
                  value={selectedAsset.foundation?.material ?? 'concrete'}
                  onChange={(e) => updateAsset(selectedAsset.id, { foundation: { ...selectedAsset.foundation, material: e.target.value as "concrete" | "stone" | "dark_slate" } })}
                  className="w-full bg-[#151c2d] border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="concrete">Reinforced Concrete</option>
                  <option value="stone">Alpine Granite Stone</option>
                  <option value="dark_slate">Dark Basalt Slate</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  removeAsset(selectedAsset.id);
                  selectAsset(null);
                }}
                className="w-full py-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-red-900/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} />
                Delete Selected Asset
              </button>
            </div>
          </CollapsibleSection>
        )}

      </div>
    </div>
  );
}
