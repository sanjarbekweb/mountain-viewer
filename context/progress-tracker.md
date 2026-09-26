# Progress Tracker

Update this file after every meaningful implementation change or architectural decision.

## Current Phase

- **Phase 1: Terrain Viewport & Elevation Loading** (Completed)
- **Phase 2: BVH Raycasting & Asset Snapping** (Completed)
- **Phase 3: Cloud AI Model Integration** (Completed)
- **Phase 4: Scene Hierarchy & Export** (Completed)
- **Phase 5: User Verification & Polish** (Completed)

## Current Goal

- Deliver complete, production-ready 3D architectural terrain layout studio with $4 \times 4$ chunked LOD, continuous BVH cursor snapping, adaptive concrete foundation plinths, AI 3D model synthesis, and scene export.

## Completed

- [x] Defined complete 4-phase architectural roadmap.
- [x] Refined system architecture to eliminate serverless timeout vulnerabilities and main-thread WebGL freezing.
- [x] Established Six-File Context System:
  - `context/project-overview.md`
  - `context/architecture.md`
  - `context/code-standards.md`
  - `context/ai-workflow-rules.md`
  - `context/ui-context.md`
  - `context/progress-tracker.md`
- [x] Created agent entry points (`CLAUDE.md`, `AGENTS.md`).
- [x] **Unit 1.1:** Scaffolded Next.js 15 App Router app with TypeScript, Tailwind CSS, Three.js, React Three Fiber, Drei, `three-mesh-bvh`, Lucide, and Zustand.
- [x] **Unit 1.2:** Built `demDecoder.ts` (Mapbox RGB DEM + Alpine Ridged Multi-fractal DEM generator) and `MountainShaderMaterial` (slope-splatting triplanar shader for grass, rock cliffs, and alpine snow).
- [x] **Unit 1.3:** Built `TerrainChunk.tsx` and $4 \times 4$ chunked grid in `MountainTerrain.tsx` with dynamic distance-based LOD (LOD 0: $64 \times 64$, LOD 1: $32 \times 32$, LOD 2: $16 \times 16$).
- [x] **Unit 1.4:** Built `EnvironmentRig.tsx` with directional alpine sun, cascaded shadow maps, atmospheric Sky scattering, depth height fog, and clamped OrbitControls preventing ground clipping.
- [x] **Unit 2.1:** Built `bvhRaycaster.ts` with `three-mesh-bvh` prototype integration for sub-0.2ms raycasting.
- [x] **Unit 2.2:** Built `foundationCalculator.ts` with 4-corner footprint raycasting quad to measure slope drop ($\Delta Y$) and compute adaptive subterranean concrete plinths.
- [x] **Unit 2.3:** Built `PlacedEntity.tsx` and `AssetPlinth.tsx` supporting TransformControls (Translate/Rotate/Scale) with isolated OrbitControls drag states (Invariant 4) and Invariant 3 bottom-center pivot normalization.
- [x] **Unit 2.4:** Built `PlacementGhost.tsx` showing real-time holographic cursor snap preview.
- [x] **Unit 3.1:** Built `app/api/generate-model/dispatch/route.ts` and `app/api/generate-model/status/route.ts` with non-blocking async task dispatch and polling.
- [x] **Unit 3.2:** Built `ModelGenerationModal.tsx` for concept sketch upload, polycount decimation target, and real-time generation progress.
- [x] **Unit 4.1:** Built `useSceneStore.ts` with scene entities, selection, transform modes, and history undo/redo (`Ctrl+Z`, `Ctrl+Y`).
- [x] **Unit 4.2:** Built `Sidebar.tsx` (Asset Library, Custom GLB Model Importer & Scene Hierarchy tree with visibility/lock/duplicate/delete) and `InspectorPanel.tsx` (live transform coords and foundation plinth depth controls).
- [x] **Unit 4.3:** Built `sceneExporter.ts` and wired one-click `.glb` scene export.
- [x] **Unit 5.1:** Created `scripts/generate-sample-assets.mjs` and generated `sample_cabin.glb`, `sample_tower.glb`, and `public/heightmap.png`.
- [x] Verified full production compilation (`npm run build`) passing cleanly with Turbopack in 2.3s with zero type or build errors.

## Architecture Decisions

- **ADR-001: 4x4 Chunked LOD Grid:** Partitioned terrain into 16 discrete tiles using `THREE.LOD` with seamless continuous elevation sampling and unified collision BVH bounds.
- **ADR-002: Async AI Task Dispatching:** Never block Next.js serverless route handlers on generative 3D models; use asynchronous task dispatch with client polling.
- **ADR-003: 4-Corner Bounding Foundation Plinth:** Compute slope differential $\Delta Y$ across asset footprint to dynamically resize concrete subterranean plinth, completely preventing cliff levitation.
- **ADR-004: OrbitControls Conflict Avoidance:** Wire `dragging-changed` in `TransformControls` to disable camera orbit during gizmo interactions.
- **ADR-005: Dual Snapping Modes:** Architecture structures stay upright on world $Y$-axis with subterranean plinths; props align to terrain normal vector.
- **ADR-006: Invariant 3 Pivot Normalization:** Every loaded GLB dynamically recenters on $X/Z$ and aligns base $Y_{min} = 0$ upon ingestion.

## Session Notes

- Project is fully implemented, verified, and ready for development server preview via `npm run dev`.
