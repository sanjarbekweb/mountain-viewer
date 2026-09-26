"use client";

import { useEffect, useRef, useState } from "react";

/** Compact FPS + WebGL badge overlay — positioned in the viewport top-right */
export default function FpsBadge() {
  const [fps, setFps] = useState(60);
  const frameRef = useRef(0);
  const lastRef = useRef(performance.now());
  const countRef = useRef(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      countRef.current++;
      const now = performance.now();
      if (now - lastRef.current >= 1000) {
        setFps(countRef.current);
        countRef.current = 0;
        lastRef.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fps-badge absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-md bg-black/60 backdrop-blur-sm border border-slate-700/50 px-2.5 py-1">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      <span className="text-slate-300">
        FPS: <span className="text-white font-semibold">{fps}</span>
      </span>
      <span className="text-slate-600 mx-0.5">|</span>
      <span className="text-slate-300">WebGL</span>
      <span className="text-slate-600 mx-0.5">|</span>
      <span className="text-slate-300">LOD: <span className="text-cyan-400 font-semibold">DYNAMIC</span></span>
    </div>
  );
}
