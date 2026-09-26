# Architecture Context

## Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) + TypeScript | React server/client application framework and API endpoints |
| **3D Rendering** | Three.js + @react-three/fiber + @react-three/drei | WebGL canvas viewport, camera rigs, lighting, and materials |
| **Spatial Indexing** | three-mesh-bvh | Accelerated bounding volume hierarchy raycasting on terrain |
| **UI & Styling** | Tailwind CSS + Lucide React | Dark technical design system, toolbars, sidebars, and dialogs |
| **State Management** | Zustand + Middleware (temporal/immer) | Scene graph state, selection, transform modes, and undo/redo |
| **AI 3D Worker** | Meshy-4 / Fal.ai TRELLIS / TripoSR (w/ Mock Fallback) | Cloud generative image-to-3D mesh generation |
| **Geometry Optimization** | DracoLoader / MeshoptDecoder | Decompressing and loading compact runtime 3D models |
| **Scene Export** | three/addons/exporters/GLTFExporter.js | Packaging complete assembled scene into binary `.glb` |

## System Boundaries

- `app/` — Application shell, layout, global styles, and Next.js Route Handlers.
  - `app/api/generate-model/dispatch/` — Dispatches generation tasks to AI providers, returning task IDs.
  - `app/api/generate-model/status/` — Polling status check for task progression and model download URL.
  - `app/api/terrain/elevation-tile/` — Proxies or serves raw DEM elevation tiles.
- `components/canvas/` — Pure React Three Fiber components living inside the WebGL `<Canvas>`.
  - `Viewport.tsx` — Main 3D Canvas with camera, lighting, and event orchestrator.
  - `MountainTerrain.tsx` — Chunked LOD terrain meshes with BVH spatial tree generation.
  - `PlacedEntity.tsx` — Individual placed asset instance with gizmos and foundation plinth.
  - `AssetPlinth.tsx` — Adaptive subsurface concrete base geometry.
  - `EnvironmentRig.tsx` — Directional sun, procedural sky, ambient lighting, and alpine height fog.
- `components/ui/` — HTML/DOM overlays, sidebars, and control panels.
  - `Sidebar.tsx` — Left dock containing Asset Palette and Scene Hierarchy Tree.
  - `Toolbar.tsx` — Top viewport controls (Transform tools, Snap mode, Camera views, Undo/Redo).
  - `InspectorPanel.tsx` — Right sidebar for coordinate transforms, material, and plinth depth.
  - `ModelGenerationModal.tsx` — AI 2D-to-3D concept upload, progress bar, and 3D preview.
- `lib/stores/` — Zustand store definitions (`useSceneStore.ts`) managing entities, selections, and history.
- `lib/terrain/` — Elevation decoders (`demDecoder.ts`), worker scripts (`terrainWorker.ts`), and custom triplanar shaders (`terrainShader.ts`).
- `lib/snapping/` — BVH accelerated spatial math (`bvhRaycaster.ts`) and 4-corner foundation calculator (`foundationCalculator.ts`).
- `lib/ai/` — Cloud AI adapter interfaces and mock generation fallback.
- `lib/export/` — Three.js GLTFExporter packaging logic (`sceneExporter.ts`).

## Storage Model

- **Browser State (Zustand Memory):** Real-time scene graph holding placed entities (`id`, `name`, `modelUrl`, `transform`, `foundationParams`, `visibility`, `locked`).
- **Client Cache (IndexedDB / Cache API):** Downloaded and generated `.glb` asset blobs and decoded DEM elevation tiles to prevent redundant network transfers.
- **Server Ephemeral Memory:** In-memory or temporary cache for AI task tracking and provider callbacks.
- **Static Assets (`public/`):** Base terrain heightmaps, demo building models (e.g. alpine cabin, modern villa, observation tower), and default textures.

## Auth and Access Model

- **Standalone Client-Centric Application:** No mandatory login wall for core architectural exploration and scene assembly.
- **AI Credentials:** AI API keys (`MESHY_API_KEY`, `FAL_KEY`) are protected on the server side in `.env.local` and never leaked to the client browser.
- **Local Isolation:** Project state is saved locally to browser storage or exported directly as `.json` project files and `.glb` binary models.

## AI & Background Task Pipeline

```
Client (Upload 2D Image)
  │
  ├─► POST /api/generate-model/dispatch
  │     └─► Dispatches to Meshy/Fal.ai / Mock Engine (returns taskId)
  │
  ├─► Loop (Interval 2.5s): GET /api/generate-model/status?taskId={id}
  │     └─► Returns { status: "PROCESSING", progress: 65 }
  │
  └─► On "SUCCEEDED": Returns { modelUrl: "/api/cached-model?id=..." }
        └─► Client loads GLB -> Auto-centers pivot to (0, Y_min, 0) -> Ready to snap
```

## Invariants

1. **Request Handlers Never Run Long-Lived AI Work:** Route handlers must return immediately with a `taskId` (under 500ms). Never wait synchronously for 30–90 second AI completions in a Next.js serverless route.
2. **Main Thread Never Blocks on DEM Decoding:** Multi-thousand vertex DEM height computations and tile conversions must run via Web Worker or efficient TypedArray transfers to preserve 60 FPS viewport rendering.
3. **Pivots Always Grounded at Base:** All imported or generated 3D meshes must be normalized upon load such that their bounding box center is at $(X=0, Z=0)$ and their base is at $Y_{min}=0$.
4. **TransformControls Must Isolate OrbitControls:** Whenever a transform gizmo interaction begins (`dragging-changed: true`), `OrbitControls` must be immediately disabled until the interaction finishes.
5. **Zero-Levitation Invariant:** Every architectural asset placed on non-flat terrain must have an active subsurface plinth extending below the lowest corner elevation of its bounding footprint.
6. **Immutable State Mutations:** All scene graph updates must be dispatched through the Zustand store to maintain undo/redo consistency.
