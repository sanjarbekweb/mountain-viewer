# Mountain Viewer & Architect — Project Overview

## Overview

Mountain Viewer & Architect is an interactive, browser-based 3D architectural terrain layout and visualization platform built with Next.js 15, React Three Fiber (R3F), and Three.js. It enables architects, landscape planners, and designers to stream and render real-world digital elevation models (DEM) with GPU-accelerated LOD chunking, snap and align architectural structures directly to rugged mountain slopes using `three-mesh-bvh`, generate custom 3D buildings from 2D concept images using a cloud AI pipeline, and export fully assembled 3D mountain scenes into industry-standard GLTF/GLB files.

## Goals

1. **Sub-millisecond Terrain Raycasting:** Deliver continuous, high-precision cursor snapping to mountain terrain in under 0.2ms using accelerated BVH spatial indexing.
2. **Zero-Levitation Grounding:** Automatically calculate adaptive subsurface concrete foundation plinths based on 4-corner slope elevation differentials to eliminate floating building artifacts.
3. **Smooth 60 FPS Viewport:** Stream and render 4x4 chunked terrain with distance-based LOD, Web Worker elevation decoding, and triplanar slope shaders without dropping frames on the main thread.
4. **Seamless AI Image-to-3D Ingestion:** Provide an asynchronous dispatch and polling pipeline that converts 2D sketches into watertight, Draco-compressed 3D models with normalized bottom-center pivots.
5. **Production-Ready Scene Graph & Export:** Enable full asset manipulation (translate/rotate/scale gizmos, layer hierarchy, visibility/lock toggles) and one-click combined GLTF scene export.

## Core User Flow

1. **Terrain Initialization:** User opens the application and views a realistic alpine mountain terrain displaced from high-precision DEM data with alpine lighting and height fog.
2. **Camera Exploration:** User orbits, pans, and zooms with polar-angle clamps preventing the camera from clipping beneath the terrain.
3. **Asset Placement & Snapping:** User selects a building from the asset palette and hovers over the mountain; a cursor preview snaps to the surface elevation and slope normal.
4. **Adaptive Foundation Generation:** Upon clicking, the building is instantiated with an automatically sized subterranean concrete plinth accommodating the terrain slope.
5. **Interactive Transformation:** User clicks an asset to activate Drei `TransformControls` (Translate, Rotate, Scale) with gizmo dragging safely isolated from camera controls.
6. **AI Model Generation:** User uploads a concept image sketch or prompt via the AI Studio modal, watches asynchronous generation progress, and receives an optimized GLB model ready for instant placement.
7. **Scene Hierarchy Management:** User organizes assets in the sidebar tree, toggles visibility, locks positions, renames items, and inspects coordinate transforms.
8. **Combined Scene Export:** User clicks "Export Scene" to download the merged mountain terrain, architectural structures, and foundation blocks as a single `.glb` file.

## Features

### 1. Terrain Engine
- 4x4 chunked grid mesh with distance-based Level of Detail (LOD).
- High-precision Mapbox RGB DEM decoding (0.1m vertical elevation accuracy) offloaded to a Web Worker.
- Dynamic triplanar slope-splatting shader (alpine grass/meadow on flats, rock/slate on slopes $>25^\circ$, snow cover at alpine heights).
- Configurable terrain dimensions, height multiplier, and wireframe toggle.

### 2. Spatial Snapping & Physics Plinth
- `three-mesh-bvh` accelerated raycasting for real-time mouse picking.
- 4-corner footprint raycasting quad to measure slope drop ($\Delta Y = Y_{max} - Y_{min}$).
- Dynamic subterranean concrete plinth generation to anchor buildings cleanly into mountain slopes.
- Dual orientation modes: Gravity-aligned ($Y$-up) for architectural structures vs. Surface-normal aligned for environmental props.

### 3. Cloud AI 3D Pipeline
- Asynchronous dispatch endpoint (`POST /api/generate-model/dispatch`) accepting concept images.
- Non-blocking client polling endpoint (`GET /api/generate-model/status?taskId=...`) avoiding serverless timeouts.
- Automatic mesh normalization: geometry bounding box auto-centered $(X_c, Z_c = 0)$ and base aligned $(Y_{min} = 0)$ so assets land flush on ground.
- Draco/Meshopt geometry decimation (<30k polygons) and IndexedDB client-side model caching.
- Fallback local procedural building generator for offline testing and credit-free development.

### 4. Scene Management & Viewport Tooling
- Transform gizmos (`TransformControls`) supporting Translate (`W`), Rotate (`E`), and Scale (`R`).
- Automatic decoupling of `OrbitControls` while dragging gizmos.
- Scene graph hierarchy sidebar with search, select, rename, delete, duplicate, and visibility/lock toggles.
- Complete undo/redo history stack (`Ctrl+Z`, `Ctrl+Y`).
- Combined GLTF/GLB export utility packing terrain, foundations, and placed structures.

## Scope

### In Scope
- Client-side Next.js 15 App Router + React Three Fiber WebGL viewport.
- Synthetic & Mapbox RGB DEM tile decoding with Web Worker acceleration.
- BVH accelerated raycasting and adaptive plinth generation.
- TransformControls gizmo with orbit camera conflict avoidance.
- Asynchronous AI generation dispatch/status architecture with mock/fallback mode.
- Local model ingestion, IndexedDB caching, and GLTF binary export.
- Full dark-mode UI with sidebar, asset palette, inspector panel, and toolbar.

### Out of Scope
- Multi-user real-time collaborative editing (WebSocket / CRDTs).
- Full multiplayer physics engine (rigid body physics simulation, ragdolls).
- In-browser boolean CSG mesh slicing of the terrain (excavation digging).
- Authentication and user billing/subscriptions.

## Success Criteria

1. **Snapping Latency:** Terrain raycasting and snap updates execute under 0.2ms per frame without hitching.
2. **Elevation Precision:** DEM displacement produces smooth slope contours without visible 8-bit stairstep terracing.
3. **Foundation Integrity:** Placed structures on slopes up to 45° exhibit zero levitation or empty space underneath.
4. **Transform Stability:** Gizmo dragging operates smoothly with zero camera wobble or jitter from OrbitControls.
5. **Export Fidelity:** Exported `.glb` scenes import cleanly into Blender and standard GLTF viewers with correct transformations and hierarchy preserved.
