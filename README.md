<div align="center">

# 🏔️ Mountain Viewer & Architect
### **AETHERIS 3D Architectural Terrain & AI Synthesis Studio**

*A high-performance, browser-based 3D architectural terrain layout and visualization platform built with Next.js 15, React Three Fiber, Three.js, and spatial BVH acceleration.*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![R3F](https://img.shields.io/badge/R3F-v9.8-black?style=for-the-badge&logo=three.js&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-v5.0-4338CA?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br/>

[![Stars](https://img.shields.io/github/stars/sanjarbekweb/mountain-viewer?style=flat-square&color=06b6d4)](https://github.com/sanjarbekweb/mountain-viewer/stargazers)
[![Forks](https://img.shields.io/github/forks/sanjarbekweb/mountain-viewer?style=flat-square&color=6366f1)](https://github.com/sanjarbekweb/mountain-viewer/network/members)
[![Issues](https://img.shields.io/github/issues/sanjarbekweb/mountain-viewer?style=flat-square&color=10b981)](https://github.com/sanjarbekweb/mountain-viewer/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/sanjarbekweb/mountain-viewer?style=flat-square&color=f59e0b)](https://github.com/sanjarbekweb/mountain-viewer/pulls)

```
       ▲                   ▲                    ▲
      / \                 / \                  / \
     /   \               /   \                /   \
    /  ▲  \   ▲         /  ▲  \              /     \
   /  / \  \ / \       /  / \  \            /   ▲   \
  /  /   \  /   \     /  /   \  \          /   / \   \
 /__/     \/_____\   /__/     \__\        /___/   \___\
─────────────────────────────────────────────────────────
     M O U N T A I N   V I E W E R   &   A R C H I T E C T
─────────────────────────────────────────────────────────
```

[Live Demo](http://localhost:3000) • [Architecture](#-architecture--invariants) • [Features](#-features) • [Quick Start](#-quick-start) • [Keyboard Shortcuts](#-keyboard-shortcuts)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Interface Architecture (AETHERIS)](#-interface-architecture-aetheris)
- [System Architecture & Invariants](#-architecture--invariants)
- [Tech Stack](#-tech-stack)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Project Structure](#-project-structure)
- [Quick Start & Setup](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Exporting Scenes](#-exporting-scenes)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**Mountain Viewer & Architect** is an interactive, browser-based 3D architectural terrain layout and spatial composition suite. Designed specifically for architects, landscape planners, and game environment designers, it solves the fundamental challenge of positioning complex 3D structures on rugged alpine mountainsides with mathematical precision.

### Why Mountain Viewer?
Placing 3D buildings on steep terrain in standard 3D tools often results in awkward levitation, clipping, or requires tedious manual Boolean CSG operations. Mountain Viewer solves this automatically:
- **Sub-millisecond Cursor Snapping:** Instant surface projection across multi-thousand vertex terrains using `three-mesh-bvh`.
- **Zero-Levitation Foundations:** Dynamic 4-corner footprint raycasting measures slope differential ($\Delta Y$) and extrudes an adaptive subterranean concrete plinth to anchor structures naturally into cliffs.
- **Continuous 60 FPS Viewport:** Chunked $4 \times 4$ dynamic Level of Detail (LOD) and triplanar slope-splatting GLSL shaders prevent main-thread stutter.
- **Generative AI Ingestion:** Convert 2D concept sketches into textured 3D models via a non-blocking asynchronous cloud pipeline with automatic bottom-center pivot normalization.
- **Production GLB Export:** Export combined terrain, foundations, and architectural assets directly to industry-standard `.glb` format for Blender, Unreal Engine, or Unity.

---

## ✨ Key Features

### 🏔️ 1. Dynamic Alpine Terrain Engine
- **$4 \times 4$ Chunked Grid LOD:** Partitions terrain into 16 discrete tiles using `THREE.LOD` (LOD 0: $64 \times 64$, LOD 1: $32 \times 32$, LOD 2: $16 \times 16$) that update dynamically with camera distance.
- **Ridged Multi-Fractal DEM Generation:** Realistic alpine topography featuring jagged peaks, erosion ridges, and valleys computed with fractional Brownian motion.
- **Triplanar Slope-Splatting Shader:** Custom GLSL material projecting:
  - Lush alpine grass/meadow on flat terrain ($\theta < 25^\circ$)
  - Sheer rock face and slate cliffs on steep gradients ($\theta \ge 25^\circ$)
  - Glacial snow cover above customizable snowline elevations
- **Live Environmental Controls:** Sliders for wireframe mode, height multiplier, terrain dimensions, and snow coverage.

### ⚡ 2. Sub-Millisecond BVH Spatial Snapping
- **Continuous Raycasting under 0.2ms:** Powered by `three-mesh-bvh` spatial indexing for lag-free cursor tracking across high-poly terrains.
- **Holographic Placement Ghost:** Real-time preview showing prospective asset orientation, surface normal alignment, and foundation depth before placement.
- **Dual Snapping Modes:**
  - **Gravity-Aligned ($Y$-up):** Keeps architectural buildings perfectly upright while the plinth absorbs the terrain slope.
  - **Surface-Normal Aligned:** Orients environmental props (trees, boulders, fences) perpendicular to the mountain face.

### 🏛️ 3. Adaptive Subsurface Foundation Plinths (Anti-Levitation)
- **4-Corner Raycasting Quad:** Samples elevations at the four corners of the asset's bounding footprint $(X \pm \frac{W}{2}, Z \pm \frac{D}{2})$.
- **Slope Drop Calculation:** Derives $\Delta Y = Y_{max} - Y_{min}$ to establish the minimum necessary plinth depth.
- **Subterranean Concrete Geometry:** Generates a monolithic concrete base extending beneath the lowest slope corner, eliminating gaps or visual levitation even on $45^\circ+$ cliffs.

### 🤖 4. Cloud Generative AI 3D Pipeline
- **Non-Blocking Asynchronous Architecture:**
  - `POST /api/generate-model/dispatch`: Validates concept sketches and returns a unique `taskId` in <500ms.
  - `GET /api/generate-model/status?taskId=...`: Non-blocking polling avoids serverless execution timeouts.
- **Auto-Pivot Grounding (Invariant 3):** Every generated or ingested GLB model automatically computes its bounding box, centers at $(X=0, Z=0)$, and grounds its base at $Y_{min} = 0$.
- **Procedural Offline Fallback:** Fully operational local procedural generator ensures immediate testing even without external API keys.

### 🎛️ 5. Professional AETHERIS CAD Workspace
- **Desktop Chrome Title Bar:** Sleek top menu (File, Edit, AI Tools, View, Terrain, Settings) with quick project status.
- **Left 44px Tool Strip:** Fast toggles for Transform modes (`Q`, `W`, `E`, `R`), Terrain wireframe, and AI studio modal.
- **Drei `TransformControls` with Camera Isolation:** Camera orbit is automatically locked while dragging gizmos, eliminating camera jitter.
- **Right Accordion Panel:**
  - **Scene Controls:** Dynamic terrain height, LOD radius, and snowline parameters.
  - **Cloud AI Generator:** Concept sketch upload dropzone with decimation target presets.
  - **Scene Hierarchy Tree:** Full item list with rename, lock, visibility, duplicate, and delete operations.
  - **Asset Inspector:** Real-time numeric coordinate inputs (Position, Rotation, Scale) and custom plinth depth sliders.
- **Real-Time Performance Badge:** Live FPS counter, active WebGL renderer status, and LOD state indicator.

### 📦 6. One-Click Scene Export
- Packages all placed structures, adaptive concrete plinths, and terrain geometry into a unified binary `.glb` file using Three.js `GLTFExporter`.
- Retains mesh hierarchy, names, and precise spatial transformations for seamless import into Blender, Maya, Unreal Engine, and WebGL viewers.

---

## 🖥️ Interface Architecture (AETHERIS)

```
┌────────────────────────────────────────────────────────────────────────┐
│  🏔️ AETHERIS  File  Edit  AI Tools  View  Terrain  Settings      [?] [⚙]  │ Top Chrome
├─────┬─────────────────────────────────────────────────────────┬────────┤
│ [Q] │                                                         │ [▲]    │
│ [W] │                  3D WebGL Canvas                        │ SCENE  │ Right
│ [E] │                                                         │ CONTROLS
│ [R] │             • 4x4 Chunked Dynamic LOD                   ├────────┤ Accordion
│ ─── │             • BVH Real-Time Raycasting                  │ [▲]    │ Panel
│ [▦] │             • Transform Gizmos (Translate/Rotate/Scale) │ AI 3D  │
│ [▤] │             • Subterranean Plinth Generator             │ STUDIO │
│ ─── │                                                         ├────────┤
│ [📁]│                                                         │ [▲]    │
│ [🤖]│                                                         │ SCENE  │
│     │   [ 60 FPS • WebGL 2.0 • LOD: DYNAMIC ]                 │ TREE   │
│     │                                                         ├────────┤
│     │                                                         │ [▲]    │
│     │                                                         │ INSPECT│
├─────┴─────────────────────────────────────────────────────────┴────────┤
│  BVH Spatial Index: Active • DEM: Ridged Multi-fractal • Next.js + R3F │ Status
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Architecture & Invariants

Mountain Viewer is built with strict architectural boundaries to guarantee 60 FPS viewport rendering and rock-solid state management:

### Core Architectural Invariants

| # | Invariant Rule | Implementation Detail |
| :-: | :--- | :--- |
| **1** | **Non-Blocking API Handlers** | Generative AI routes return an asynchronous `taskId` in <500ms; never block serverless functions on long-running model generation. |
| **2** | **Main Thread Protection** | DEM height computations, elevation decoding, and tile processing run via Web Workers or optimized TypedArray transfers. |
| **3** | **Normalized Model Pivots** | Every ingested or generated model is normalized on import: bounding box centered at $(X=0, Z=0)$ with base flush at $Y_{min} = 0$. |
| **4** | **Camera-Gizmo Isolation** | `TransformControls` disables `OrbitControls` during active gizmo drag events (`dragging-changed`) to prevent camera fight and drift. |
| **5** | **Zero-Levitation Plinths** | Any architectural asset placed on sloped terrain dynamically extrudes an adaptive concrete plinth below its lowest footprint corner. |
| **6** | **Immutable State Consistency**| All scene mutations flow exclusively through the central Zustand store to preserve history and undo/redo (`Ctrl+Z`, `Ctrl+Y`). |

---

## 🛠️ Tech Stack

<div align="center">

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Core Framework** | **Next.js 16 (App Router)** | React Server Components, Route Handlers, Turbopack |
| **UI Library** | **React 19** | Concurrent rendering, hooks, and component lifecycle |
| **3D Engine** | **Three.js (r186)** | Core WebGL scenegraph, materials, shaders, and geometry |
| **React 3D Bridge** | **@react-three/fiber (R3F)** | Declarative Three.js components and render loop |
| **3D Helpers** | **@react-three/drei** | `TransformControls`, `OrbitControls`, `Sky`, `LOD` |
| **Spatial Indexing** | **three-mesh-bvh** | Fast Bounding Volume Hierarchy raycasting (<0.2ms) |
| **State Management** | **Zustand 5** | High-performance, lightweight reactive state store |
| **Styling & Icons** | **Tailwind CSS v4 + Lucide** | Modern dark CAD aesthetic, typography, and icon set |
| **Export Engine** | **Three GLTFExporter** | Unified binary `.glb` scene serialization |

</div>

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Context | Action |
| :---: | :--- | :--- |
| <kbd>Q</kbd> | Viewport | **Select Mode** (Inspect & pick objects) |
| <kbd>W</kbd> | Viewport | **Translate Mode** (Move on X, Y, Z axes) |
| <kbd>E</kbd> | Viewport | **Rotate Mode** (Yaw, pitch, and roll) |
| <kbd>R</kbd> | Viewport | **Scale Mode** (Uniform & non-uniform sizing) |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Global | **Undo** last scene modification |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Global | **Redo** undone modification |
| <kbd>Left Click + Drag</kbd> | Canvas | **Orbit Camera** around terrain target |
| <kbd>Right Click + Drag</kbd>| Canvas | **Pan Camera** across horizontal plane |
| <kbd>Scroll Wheel</kbd> | Canvas | **Zoom Camera** with polar angle limits |

---

## 📁 Project Structure

```bash
mountain-viewer/
├── app/
│   ├── api/
│   │   └── generate-model/
│   │       ├── dispatch/route.ts      # Async AI task initiation
│   │       └── status/route.ts        # Polling endpoint for task progress
│   ├── globals.css                    # AETHERIS dark CAD theme & custom sliders
│   ├── layout.tsx                     # Root Next.js layout & typography
│   └── page.tsx                       # Main CAD workstation orchestrator
├── components/
│   ├── canvas/                        # React Three Fiber WebGL Components
│   │   ├── AssetPlinth.tsx            # Adaptive subterranean concrete foundation
│   │   ├── EnvironmentRig.tsx         # Alpine sun, procedural sky & height fog
│   │   ├── MountainTerrain.tsx        # 4x4 chunked grid & BVH mesh wrapper
│   │   ├── PlacedEntity.tsx           # Instantiated asset with TransformControls
│   │   ├── PlacementGhost.tsx         # Holographic cursor snapping preview
│   │   ├── TerrainChunk.tsx           # Individual chunk LOD mesh
│   │   └── Viewport.tsx               # Main WebGL Canvas with camera rigs
│   └── ui/                            # DOM Overlay UI Components
│       ├── FpsBadge.tsx               # Real-time FPS & WebGL status counter
│       ├── LeftToolStrip.tsx          # 44px vertical CAD tool palette
│       ├── ModelGenerationModal.tsx   # AI 2D-to-3D concept upload & progress
│       ├── RightPanel.tsx             # Accordion: Scene, AI, Tree & Inspector
│       └── TopMenuBar.tsx             # Desktop-app title bar & menu actions
├── lib/
│   ├── ai/                            # Cloud AI generation interfaces & mock engine
│   ├── export/
│   │   └── sceneExporter.ts           # One-click GLTF/GLB binary packaging
│   ├── snapping/
│   │   ├── bvhRaycaster.ts            # three-mesh-bvh sub-millisecond raycaster
│   │   └── foundationCalculator.ts    # 4-corner slope drop & plinth calculator
│   ├── stores/
│   │   └── useSceneStore.ts           # Central Zustand store (entities, history)
│   └── terrain/
│       ├── demDecoder.ts              # Ridged multi-fractal & Mapbox DEM decoder
│       └── terrainShader.ts           # Triplanar slope-splatting GLSL material
├── public/
│   ├── heightmap.png                  # Sample digital elevation map
│   └── models/                        # Pre-packaged 3D assets (cabin, tower)
├── context/                           # Six-File Context Architecture Documentation
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-context.md
│   ├── code-standards.md
│   ├── ai-workflow-rules.md
│   └── progress-tracker.md
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.18+` or `v20+` recommended
- **npm** or **pnpm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/sanjarbekweb/mountain-viewer.git
cd mountain-viewer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch the 3D studio.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔑 Environment Configuration

Create a `.env.local` file in the root directory to enable cloud generative 3D providers:

```env
# Cloud Generative 3D Provider API Keys (Optional)
# If omitted, Mountain Viewer automatically activates its built-in procedural model generator.
MESHY_API_KEY=your_meshy_api_key_here
FAL_KEY=your_fal_key_here
```

---

## 💾 Exporting Scenes

1. Position and customize your structures on the mountain terrain.
2. Adjust foundation depths and rotation to match your architectural requirements.
3. Open **File** > **Export Scene** from the top menu or trigger the scene export action.
4. Your browser will download `alpine_mountain_scene.glb` containing:
   - Displaced terrain chunk meshes
   - Monolithic concrete foundation plinths
   - Architectural structures with all transforms and materials preserved

Import directly into **Blender**, **Unreal Engine**, **Unity**, or publish to online 3D viewers!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project (`git checkout -b feature/AmazingFeature`)
2. Follow the architectural invariants documented in `context/architecture.md`
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Crafted with 🏔️ by [Sanjarbek](https://github.com/sanjarbekweb) • Powered by Next.js & Three.js

[![Back to Top](https://img.shields.io/badge/Back%20to%20Top-↑-06b6d4?style=flat-square)](#-mountain-viewer--architect)

</div>