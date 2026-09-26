# Code Standards

## General Principles

- **Small, Focused Modules:** Each component, hook, or utility function should have a single well-defined responsibility.
- **Root Cause Solutions:** Never apply fragile visual hacks (e.g. arbitrary negative offsets); compute exact mathematical values (e.g. 4-corner bounding raycasts).
- **Decoupled Concerns:** Keep 3D WebGL rendering logic (`components/canvas`), DOM UI overlays (`components/ui`), and state management (`lib/stores`) strictly separated.
- **Resource Lifecycle Hygiene:** Always dispose of Three.js geometries, materials, textures, and BVH acceleration structures when components unmount to prevent WebGL memory leaks.

## TypeScript

- **Strict Type Checking:** `strict: true` is enforced across the entire codebase.
- **No `any`:** Disallow `any`. Use strict interfaces, type unions, or generic parameters.
- **Math & Spatial Typing:** Use Three.js native types (`THREE.Vector3`, `THREE.Euler`, `THREE.Quaternion`) or explicit tuple types `[number, number, number]` for coordinates and transforms.
- **Input Validation:** Validate all external API inputs and file uploads using typed schemas before processing.

## React Three Fiber (R3F) & Three.js

- **Client Component Boundary:** All files importing Three.js or `@react-three/fiber` must include the `"use client";` directive at the top.
- **Memoized Geometries & Materials:** Instantiated geometries, materials, and BVH trees must be memoized using `useMemo` or cached in loaders to avoid rebuilding on every re-render.
- **No Direct Mutation in Render Loop:** Never trigger React state updates inside `useFrame()`. Use refs for continuous per-frame mutations (e.g. rotation animations, camera lerping).
- **OrbitControls Isolation:** Always wire gizmo drag state to control camera availability:
  ```tsx
  <TransformControls
    onDraggingChanged={(event) => {
      setOrbitControlsEnabled(!event.value);
    }}
  />
  ```
- **BVH Integration:** Register `three-mesh-bvh` once in the application root, or apply `geo.computeBoundsTree()` specifically on load and dispose with `geo.disposeBoundsTree()`.

## Next.js & API Routes

- **App Router Standards:** Place Route Handlers in `app/api/.../route.ts`.
- **Stateless & Async Dispatch:** Endpoints handling generative AI must be non-blocking. Dispatch the task, return an ID immediately, and provide a dedicated status endpoint.
- **Standardized Response Shapes:**
  ```typescript
  // Success
  { success: true, data: T }
  // Error
  { success: false, error: string, statusCode: number }
  ```

## Styling & Theme

- **Tailwind Tokens Only:** Always use predefined theme tokens (`bg-base`, `text-primary`, `border-subtle`). Do not introduce arbitrary arbitrary hardcoded hex codes in component class strings.
- **Pointer Events Control:** Viewport UI overlays (toolbars, inspectors) must use `pointer-events-none` on container wraps and `pointer-events-auto` on interactive buttons to avoid intercepting 3D canvas drag events.

## File & Directory Organization

```
app/                    # Next.js App Router (pages and API routes)
components/
  canvas/               # R3F components living inside WebGL Canvas
  ui/                   # DOM overlays, HUD, modals, and toolbars
lib/
  ai/                   # Generative AI adapters and mock engines
  export/               # Scene export utilities (GLTF/GLB)
  snapping/             # BVH raycasting and elevation calculation
  terrain/              # DEM decoders, shaders, and web workers
  stores/               # Zustand store definitions
types/                  # Shared TypeScript interfaces
public/                 # Static heightmaps, textures, and default models
```
