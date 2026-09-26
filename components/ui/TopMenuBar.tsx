"use client";

import React, { useEffect } from "react";
import { Mountain, HelpCircle, Settings, Share2, User } from "lucide-react";
import { useSceneStore } from "@/lib/stores/useSceneStore";
import { TransformMode } from "@/types/scene";

export interface TopMenuBarProps {
  onOpenAIModal: () => void;
  onExportScene: () => void;
}

export function TopMenuBar({ onOpenAIModal, onExportScene }: TopMenuBarProps) {
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Q/W/E/R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside form inputs or editable elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Ignore transform mode shortcuts if modifier keys are active
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Transform Modes: Q (Select), W (Translate), E (Rotate), R (Scale)
      switch (e.key.toLowerCase()) {
        case "q":
          e.preventDefault();
          setTransformMode("select" as TransformMode);
          break;
        case "w":
          e.preventDefault();
          setTransformMode("translate" as TransformMode);
          break;
        case "e":
          e.preventDefault();
          setTransformMode("rotate" as TransformMode);
          break;
        case "r":
          e.preventDefault();
          setTransformMode("scale" as TransformMode);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTransformMode, undo, redo]);

  const menuItems: { label: string; onClick?: () => void }[] = [
    { label: "File" },
    { label: "Edit" },
    { label: "AI Tools", onClick: onOpenAIModal },
    { label: "View" },
    { label: "Terrain" },
    { label: "Settings" },
  ];

  return (
    <header className="w-full flex flex-col z-30 select-none border-b border-[#30363d]/80 pointer-events-auto shadow-md">
      {/* 1. Title bar row (height ~32px) */}
      <div className="h-[32px] bg-[#0d1117] border-b border-[#21262d] px-3 flex items-center justify-between">
        {/* Left side: App icon + title text */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-cyan-500/20">
            <Mountain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-white tracking-wide">
            AETHERIS :: Mountain Architect
          </span>
        </div>

        {/* Right side: Icon buttons (Help, Settings, User avatar placeholder, Export/Share) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Help & Documentation"
            aria-label="Help"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            title="Settings"
            aria-label="Settings"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onExportScene}
            title="Export Scene (.GLB) / Share"
            aria-label="Export / Share Scene"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-slate-700/60 mx-1" />

          {/* User avatar placeholder */}
          <div
            title="User Profile"
            className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center ring-1 ring-slate-700 cursor-pointer overflow-hidden shadow-sm"
          >
            <User className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* 2. Menu bar row (height ~28px) */}
      <div className="h-[28px] bg-[#161b22] px-2 flex items-center gap-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="text-xs font-normal px-3 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}

export default TopMenuBar;
