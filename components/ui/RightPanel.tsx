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
  Box
} from 'lucide-react';
import { useSceneStore } from '@/lib/stores/useSceneStore';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-800/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#161b22] px-3 py-2 flex items-center justify-between hover:bg-[#1c2128] transition-colors"
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
        <div className="px-3 py-2.5 space-y-3 bg-[#0d1117]/50">
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
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0d1117]/95 backdrop-blur-sm border-l border-slate-800 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent z-20">
      <div className="flex flex-col h-full pb-10">
        
        {/* SCENE CONTROLS */}
        <CollapsibleSection title="Scene Controls" defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Terrain LOD</span>
                <span>{getLodLabel(terrainConfig.segments)} ({terrainConfig.segments})</span>
              </div>
              <input
                type="range"
                min="32"
                max="256"
                step="32"
                value={terrainConfig.segments}
                onChange={(e) => updateTerrainConfig({ segments: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Snow Elevation</span>
                <span>{terrainConfig.snowElevation ?? 20}</span>
              </div>
              <input
                type="range"
                min="0"
                max="38"
                step="1"
                value={terrainConfig.snowElevation ?? 20}
                onChange={(e) => updateTerrainConfig({ snowElevation: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wireframeToggle"
                checked={terrainConfig.wireframe ?? false}
                onChange={(e) => updateTerrainConfig({ wireframe: e.target.checked })}
                className="accent-cyan-500"
              />
              <label htmlFor="wireframeToggle" className="text-xs text-slate-300">
                Show Wireframe
              </label>
            </div>
          </div>
        </CollapsibleSection>

        {/* CLOUD AI GENERATOR */}
        <CollapsibleSection title="Cloud AI Generator" defaultOpen={true}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Prompt</label>
              <div className="w-full aspect-square bg-slate-800/80 rounded-lg border border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-700/50 hover:text-slate-300 hover:border-slate-400 transition-colors cursor-pointer mb-2">
                <Upload size={24} className="mb-2" />
                <span className="text-xs font-medium">Click to Upload</span>
              </div>
            </div>
            
            <div>
              <input 
                type="text" 
                placeholder="Architectural Style (e.g. brutalist chalet)" 
                className="w-full bg-[#161b22] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button 
              onClick={onStartGeneration}
              disabled={generationStatus === 'generating'}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              Generate 3D From Image
            </button>

            {generationStatus === 'generating' && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-[10px] text-cyan-400 font-medium">
                  <span>GENERATING...</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}

            {generationStatus === 'completed' && (
              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded transition-colors">
                  Add to Scene
                </button>
                <button className="flex-1 py-1.5 bg-[#161b22] hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase border border-slate-700 rounded transition-colors">
                  Download .GLB
                </button>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* SCENE TREE & ASSETS */}
        <CollapsibleSection title="Scene Tree & Assets" defaultOpen={true}>
          <div className="space-y-1">
            {assets.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">
                No assets in scene
              </div>
            ) : (
              assets.map((asset) => {
                const isActive = asset.id === selectedAssetId;
                
                return (
                  <div 
                    key={asset.id}
                    onClick={() => selectAsset(asset.id)}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                      isActive ? 'bg-cyan-900/20' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Box size={14} className={isActive ? 'text-cyan-500' : 'text-slate-500'} />
                      <span className={`text-xs truncate ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {asset.name} {isActive && <span className="text-[10px] font-bold opacity-75 ml-1">(ACTIVE)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateAsset(asset.id, { visible: !(asset.visible ?? true) }) }}
                        className="text-slate-500 hover:text-slate-300"
                        title="Toggle Visibility"
                      >
                        {(asset.visible ?? true) ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateAsset(asset.id, { locked: !asset.locked }) }}
                        className="text-slate-500 hover:text-slate-300"
                        title="Toggle Lock"
                      >
                        {asset.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeAsset(asset.id) }}
                        className="text-slate-500 hover:text-red-400"
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

        {/* ASSET INSPECTOR */}
        {selectedAsset && (
          <CollapsibleSection title="Asset Inspector" defaultOpen={true}>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Name</label>
                <input 
                  type="text" 
                  value={selectedAsset.name}
                  onChange={(e) => updateAsset(selectedAsset.id, { name: e.target.value })}
                  className="w-full bg-[#161b22] border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Position (X, Y, Z)</label>
                <div className="flex gap-1">
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
                      className="w-1/3 bg-[#161b22] border border-slate-700 rounded px-1.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 text-center"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Rotation (X, Y, Z)</label>
                <div className="flex gap-1">
                  {['x', 'y', 'z'].map((axis, i) => (
                    <input
                      key={axis}
                      type="number"
                      value={selectedAsset.rotation?.[i] ?? 0}
                      onChange={(e) => {
                        const newRot = [...(selectedAsset.rotation ?? [0,0,0])] as [number, number, number];
                        newRot[i] = parseFloat(e.target.value) || 0;
                        updateAsset(selectedAsset.id, { rotation: newRot });
                      }}
                      className="w-1/3 bg-[#161b22] border border-slate-700 rounded px-1.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 text-center"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Scale (X, Y, Z)</label>
                <div className="flex gap-1">
                  {['x', 'y', 'z'].map((axis, i) => (
                    <input
                      key={axis}
                      type="number"
                      value={selectedAsset.scale?.[i] ?? 1}
                      onChange={(e) => {
                        const newScale = [...(selectedAsset.scale ?? [1,1,1])] as [number, number, number];
                        newScale[i] = parseFloat(e.target.value) || 1;
                        updateAsset(selectedAsset.id, { scale: newScale });
                      }}
                      className="w-1/3 bg-[#161b22] border border-slate-700 rounded px-1.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 text-center"
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] uppercase text-slate-500 mb-1">
                  <span>Foundation Depth</span>
                  <span>{selectedAsset.foundation?.depth ?? 0}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={selectedAsset.foundation?.depth ?? 0}
                  onChange={(e) => updateAsset(selectedAsset.id, { foundation: { ...selectedAsset.foundation, depth: parseFloat(e.target.value) } })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">Foundation Material</label>
                <select 
                  value={selectedAsset.foundation?.material ?? 'concrete'}
                  onChange={(e) => updateAsset(selectedAsset.id, { foundation: { ...selectedAsset.foundation, material: e.target.value as "concrete" | "stone" | "dark_slate" } })}
                  className="w-full bg-[#161b22] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="concrete">Concrete</option>
                  <option value="stone">Stone</option>
                  <option value="dark_slate">Dark Slate</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  removeAsset(selectedAsset.id);
                  selectAsset(null);
                }}
                className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-wider rounded border border-red-900/50 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={12} />
                Delete Asset
              </button>
            </div>
          </CollapsibleSection>
        )}

      </div>
    </div>
  );
}
