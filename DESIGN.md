---
name: Mountain-Architect-Bento
description: Premium dark bento-grid dashboard aesthetic inspired by modern gaming dashboards and TypeUI design systems. Built on deep obsidian slate, luminous violet-lavender accents, soft pill geometry, and crisp typographical hierarchy.
license: MIT
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->
# Mountain Architect Design System (TypeUI Bento & Modern)

## Mission
Deliver an exceptionally polished, gaming-studio grade 3D architectural and terrain visualization platform. Seamlessly bridges real-world Google Earth 3D topography with generative AI asset placement inside a cohesive, human-centered bento dashboard.

## Brand Foundations
- **Visual Style:** Modern, clean, bento-grid, dark matte obsidian, liquid glass accents, playful precision
- **Surface Palette:**
  - App Background: `#11141c` (Deep Matte Slate)
  - Bento Card Base: `#181c28` (Elevated Obsidian)
  - Bento Card Border: `rgba(255, 255, 255, 0.06)` (1px Ultra-subtle border)
  - Card Hover Surface: `#1e2333`
  - Input & Pill Surface: `#202536`
- **Accent Palette:**
  - Primary Lavender Glow: `#7064e9` (Luminous Soft Indigo/Violet)
  - Primary Accent Hover: `#8174f8`
  - Highlight Citrus/Yellow: `#fcd34d` (Warm Golden Amber)
  - Red Badge Alert: `#ef4444` (Vibrant Coral Red for 'NEW')
  - Success Indicator: `#10b981` (Emerald Online/Active Dot)
- **Typography Scale:**
  - Scale: 10px / 12px / 13px / 14px / 16px / 20px / 28px
  - Font Families: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
  - Monospace: JetBrains Mono, "SF Mono", Consolas
- **Geometry & Border Radius Scale:**
  - Window Shell: `rounded-[28px]` or `rounded-[32px]`
  - Bento Cards: `rounded-[24px]` (24px)
  - Thumbnail Previews: `rounded-[18px]`
  - Interactive Action Buttons & Badges: `rounded-full` (Pill geometry)
  - Micro Badges: `rounded-md` / `rounded-lg`
- **Spacing Scale:**
  - Base unit: 4px | Scales: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40px

## Component Rules
1. **Pill Buttons:** Active state must use solid primary `#7064e9` with white text and soft colored glow (`shadow-lg shadow-[#7064e9]/30`). Inactive buttons must use transparent or `#202536` with smooth transitions.
2. **Bento Card Structure:** Every card has internal padding (`p-5` or `p-6`), rounded corners (`rounded-[24px]`), and 1px border (`border-white/5` or `border-slate-800/80`).
3. **Typography Contrast:** Primary titles in `#ffffff` font-bold. Secondary captions in `#8b94a5` or `#94a3b8`.
4. **Hero Banner:** Must feature high-impact visual composition, bold heading, red starburst tag, and clean metric badge.
5. **Interactive 3D Viewport:** Embedded cleanly as a bento card or full-bleed studio mode with instant toggle.
<!-- TYPEUI_SH_MANAGED_END -->
