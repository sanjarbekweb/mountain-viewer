# UI Context

## Theme

Dark technical CAD / 3D workspace aesthetic. The UI surrounds a full-bleed WebGL viewport with floating, semi-transparent frosted panels (glassmorphism with `backdrop-blur-md`), crisp 1px borders, high-contrast typography, and vibrant precision accent colors (cyan for active tools/transforms, emerald for success, amber for warnings).

## Colors

All UI elements must utilize these design tokens:

| Role | Token / CSS Variable | Tailwind Equivalent | Hex Value | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas Background** | `--bg-canvas` | `bg-slate-950` | `#020617` | WebGL canvas clear color / fallback |
| **Surface Base** | `--bg-base` | `bg-slate-900/90` | `#0f172a` | Sidebars and main panel background |
| **Surface Elevated** | `--bg-elevated` | `bg-slate-800/80` | `#1e293b` | Cards, input fields, tool button hover |
| **Primary Accent** | `--accent-primary`| `text-cyan-400`, `bg-cyan-500` | `#06b6d4` | Active gizmo modes, primary actions |
| **Secondary Accent**| `--accent-secondary`| `text-indigo-400`, `bg-indigo-500` | `#6366f1` | Selection highlights, AI generate badge |
| **Success State** | `--state-success` | `text-emerald-400`, `bg-emerald-500` | `#10b981` | Model generation complete, snap locked |
| **Warning State** | `--state-warning` | `text-amber-400`, `bg-amber-500` | `#f59e0b` | Slope steepness warning, high polycount |
| **Danger State** | `--state-danger` | `text-rose-400`, `bg-rose-500` | `#f43f5e` | Delete action, placement collision |
| **Text Primary** | `--text-primary` | `text-slate-100` | `#f8fafc` | Headers, active values, button labels |
| **Text Muted** | `--text-muted` | `text-slate-400` | `#94a3b8` | Coordinate labels, secondary stats |
| **Border Subtle** | `--border-subtle` | `border-slate-800` | `#1e293b` | Panel dividers, toolbar separators |
| **Border Active** | `--border-active` | `border-cyan-500/50` | `#06b6d480`| Selected asset card, focused input |

## Typography

| Role | Font Family | Tailwind Class | Notes |
| :--- | :--- | :--- | :--- |
| **Interface Headings** | Inter / System Sans | `font-semibold tracking-tight` | Crisp, legible technical labels |
| **Body & Controls** | Inter / System Sans | `text-xs font-medium` | Compact CAD-style control density |
| **Coordinates & Math**| JetBrains Mono / Geist Mono | `font-mono text-[11px]` | Monospaced alignment for X/Y/Z coords |

## Border Radius Scale

| Context | Class | Radius |
| :--- | :--- | :--- |
| **Buttons & Tool Icons** | `rounded-lg` | 8px |
| **Cards & Asset Items** | `rounded-xl` | 12px |
| **Panels & Sidebars** | `rounded-2xl` | 16px |
| **Modals & Dialogs** | `rounded-2xl` | 16px |
| **Badges & Pills** | `rounded-full` | 9999px |

## Layout Patterns

- **Full-Bleed 3D Viewport:** The WebGL `<Canvas>` spans `w-screen h-screen` fixed at `z-0`.
- **Floating Header Toolbar (`z-20`):** Centered at the top with quick tool toggles:
  - Transform mode buttons: Select (`Q`), Translate (`W`), Rotate (`E`), Scale (`R`).
  - Snapping mode: Terrain Normal vs Gravity Upright.
  - Camera views: Perspective, Top-Down, Front, Reset View.
  - History controls: Undo (`Ctrl+Z`), Redo (`Ctrl+Y`).
- **Collapsible Left Sidebar (`z-20`):** Fixed width (`w-80`), tabbed between:
  - *Asset Library:* Available 3D buildings, landscape props, and AI generation launcher.
  - *Scene Hierarchy:* Tree view of placed objects with visibility toggle, lock toggle, rename, and delete.
- **Floating Right Inspector Panel (`z-20`):** Shows transform properties (X, Y, Z position/rotation/scale) of the currently selected entity, foundation plinth depth slider, and material overrides.
- **Centered Modal Overlay (`z-50`):** For AI Image-to-3D generation, providing drag-and-drop image upload, prompt enhancement, and real-time generation progress bar.

## Icons

- **Library:** `lucide-react`
- **Standard Sizing:**
  - `w-4 h-4` (`16px`) for buttons, coordinate labels, and tree view items.
  - `w-5 h-5` (`20px`) for primary toolbar tools.
  - `w-8 h-8` (`32px`) for empty state and file upload dropzones.
- **Stroke Width:** `stroke-[1.75]` for optimal crispness on dark backgrounds.
