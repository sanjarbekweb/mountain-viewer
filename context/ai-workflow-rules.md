# AI Workflow Rules

## Approach

Build Mountain Viewer & Architect incrementally using a disciplined, spec-driven workflow. The context files in `context/` define what to build, the architectural invariants, coding standards, visual language, and current project progress. Always implement directly against these specifications — never infer, speculate, or introduce unverified assumptions.

## Scoping Rules

- **One Feature Unit at a Time:** Complete, verify, and document one self-contained unit before advancing to the next.
- **Incremental Verification:** Test each addition immediately (e.g. verify terrain displacement renders before adding BVH raycasting; verify raycasting before adding gizmos).
- **Zero Unrequested Scope:** Do not add speculative libraries, animation systems, or cloud databases unless explicitly specified in the project scope.

## When to Split Work

Split an implementation step into distinct sub-tasks if it combines:
- WebGL / R3F Canvas components and DOM UI overlays in the same step.
- Terrain shader development and BVH raycasting algorithms simultaneously.
- AI route handler integration and client-side 3D model loaders at the same time.
- Changes affecting more than 3 system boundaries.

If a task cannot be verified in under 2 minutes, the scope is too broad — split it.

## Handling Missing or Ambiguous Requirements

- Do not guess or invent architectural behavior that is not documented in `context/`.
- If an edge case arises (e.g. how a building behaves when placed partially outside terrain bounds), document the decision as an open question or resolved decision in `context/progress-tracker.md` before coding.
- Always prefer conservative, stable, mathematically sound implementations over complex heuristic guesses.

## Protected Files & Conventions

Do not modify without explicit instruction:
- Global Three.js prototype extensions for `three-mesh-bvh` once initialized.
- Tailored shader chunks in `lib/terrain/terrainShader.ts` once verified for triplanar projection.
- Base elevation decoding algorithms in `lib/terrain/demDecoder.ts`.

## Keeping Docs in Sync

Update the relevant context file whenever:
- An architectural pattern or system boundary changes (`context/architecture.md`).
- A new UI token, color variable, or layout rule is introduced (`context/ui-context.md`).
- A TypeScript interface or storage rule changes (`context/code-standards.md`).
- A feature unit is started or completed (`context/progress-tracker.md`).

## Verification Checklist Before Moving to the Next Unit

Before declaring any unit complete and moving forward:
1. **End-to-End Functionality:** The current unit operates cleanly within its defined boundary without console errors.
2. **Invariants Preserved:** None of the 6 core invariants in `context/architecture.md` have been violated.
3. **TypeScript & Build Clean:** `npm run build` or `npx tsc --noEmit` succeeds with zero type errors.
4. **Documentation Updated:** `context/progress-tracker.md` is updated with completed tasks and session notes.
