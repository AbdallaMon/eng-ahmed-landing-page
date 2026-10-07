# Register 3D Redesign — Design Spec

**Date:** 2026-06-13
**Branch:** `3d`
**Owner ask:** "Flip the whole `/register` section into a *real* 3D (WebGL) experience. Every component is a distinct 3D scene; clicking changes the 3D background. Mobile-first. Fully optimized. Build everything myself, no paid assets. Keep the logic close to the current flow."

---

## 1. Goal & Scope

Replace the presentation layer of the **entire** `/register` section with a real-time WebGL 3D experience, while **keeping the existing business logic, state machine, backend calls, i18n, theme tokens, and routing untouched**.

In scope (every route under `src/app/register`):

- `/register` — lead-selection flow (intro → email → location → item → form)
- Lead forms — `LeadRegisterForm`, `CompleteRegisterForm`
- `/register/booking` — 9-step booking wizard
- `/register/checkout`, `/register/success`, `/register/cancel`, `/register/complete`

Out of scope:

- The main marketing site (anything outside `src/app/register`).
- Backend / API contracts. Same endpoints, same payloads.
- The `useLeadFlow` / `useBookingSteps` **state logic** — reused as-is; only the view layer changes. (Minor additive hooks allowed, e.g. exposing the active stage to the scene director.)

## 2. Non-Negotiable Constraints

1. **Mobile-first.** Designed for portrait, touch, and low-end GPUs *first*; desktop is the enhancement. Not "desktop with a mobile fallback."
2. **Optimized.** This is a live lead-capture funnel — conversion matters more than fidelity. Quality scales *down* automatically on weak devices and *never* blocks a lead from converting.
3. **No paid assets.** All 3D is procedural geometry built in code (low-poly, stylized) + free/CC0 HDRI environments. No purchased models, no large GLB downloads.
4. **Self-contained.** Stays inside `src/app/register/**`. Does not touch the root `layout.js`, `MUIProvider`, or the main site's RTL — same isolation rule the existing register section follows (see `CLAUDE.md`).
5. **Graceful degradation.** No WebGL / `prefers-reduced-motion` / detected low-power → a lightweight 2D/CSS fallback renders immediately. The flow is fully usable without WebGL.
6. **RTL safe.** Arabic is default. 3D scenes are direction-agnostic; DOM overlays follow the existing register RTL cache. Do **not** touch RTL/direction code (owner constraint).

## 3. Signature Mechanic

**Independent bespoke 3D scenes that cross-fade with a cinematic camera-push on selection.** (Approach "B" from brainstorming.)

- The register lives on one persistent WebGL canvas.
- Each decision point owns a **distinct 3D scene** (a `SceneComponent`).
- Selecting an option → the camera dollies forward + the outgoing scene cross-fades out while the incoming scene fades in → "the background changes" as the user travels into the chosen world.
- UI (cards, forms, wizard steps) float **as DOM** on glassmorphic surfaces above the canvas — kept in DOM for accessibility, i18n, and RTL.

This matches the owner's mental model exactly ("each option a different 3D scene, click changes the background") and keeps each scene an isolated, independently-buildable unit (ideal for parallel agent work).

## 4. Architecture

### 4.1 Layers

```
register/layout.jsx
 └─ RegisterProviders (existing: Language → Alert → Theme → Upload → LoadingToast)
     └─ Register3DRoot (NEW, client, lazy)
         ├─ <SceneCanvas>            // ONE persistent R3F <Canvas>
         │   └─ <SceneDirector>      // reads flow stage → mounts active SceneComponent, runs transitions
         │       ├─ <CameraRig>      // animated camera (lerp in useFrame / GSAP)
         │       ├─ <LightingRig>    // shared lights + Environment (HDRI), reused across scenes
         │       ├─ <Effects>        // tiered postprocessing (gated by device tier)
         │       └─ <ActiveScene/>   // one of the Scene Registry entries, with enter/exit transition
         └─ <UiOverlay>              // DOM, absolutely positioned over canvas (cards/forms/wizard/header)
```

### 4.2 Key modules (new, under `register/three/`)

- `Register3DRoot.jsx` — top-level client wrapper. Decides **3D vs 2D-fallback** (capability + reduced-motion + perf tier). Lazy-loads the heavy 3D bundle via `next/dynamic({ ssr: false })`.
- `SceneCanvas.jsx` — the single `<Canvas>`: `dpr={[1, 2]}` clamped, `frameloop` tuned, `<PerformanceMonitor>` + `<AdaptiveDpr>`, `gl` tuned for mobile (antialias off on low tier, powerPreference).
- `SceneDirector.jsx` — maps the current flow `stage` (from `useLeadFlow` / route) to a registered scene; orchestrates enter/exit cross-fade + camera-push.
- `sceneRegistry.js` — `{ stageKey → lazy SceneComponent }`. The seam every agent plugs a scene into.
- `CameraRig.jsx`, `LightingRig.jsx`, `Effects.jsx` — shared rigs.
- `lib/quality.js` — device-tier detection → quality profile (dpr cap, postprocessing on/off, poly budget, shadows on/off).
- `lib/materials.js` — shared procedural materials + brand palette (gold/beige/brown from `register/theme/colors`), vertex-colored, **texture-free**.
- `lib/transitions.js` — camera-push + scene cross-fade primitives, honoring `?speed=` / reduced-motion (mirrors existing `register/lib/animations.js` controls).
- `fallback/` — the 2D/CSS version of each stage (reuses the current flow's visuals as the degraded path).

### 4.3 Scene contract (the seam for agents)

Every scene is a self-contained component with a uniform interface so the director and agents share one mental model:

```js
// register/three/scenes/<Name>Scene.jsx
export default function XScene({ progress, quality, reducedMotion }) { ... }
// progress: 0→1 enter/exit drive from SceneDirector
// quality:  { tier, dpr, postProcessing, polyBudget, shadows }
// reducedMotion: boolean — skip idle/ambient motion
```

A scene MUST: build only procedural geometry (no external model files), respect `quality.polyBudget`, gate its own expensive effects on `quality`, idle-animate only when `!reducedMotion`, and clean up on unmount.

## 5. Scene Catalogue

Brand palette throughout: brown `#594534` / taupe / gold highlight (from `register/theme/colors`). Stylized low-poly, warm cinematic lighting.

| Stage | Scene | Concept (procedural, low-poly, texture-free) |
|---|---|---|
| Intro `designIntro` | `IntroScene` | A golden architectural object morphing blueprint→furnished volume; brand hero. |
| `email` | (reuses Intro backdrop) | Calm hold of the intro world while the email glass card rises. |
| Location `INSIDE_UAE` | `InsideUaeScene` | Desert dunes + stylized skyline silhouette (Burj-like towers) + palms + warm sunset. |
| Location `OUTSIDE_UAE` | `OutsideUaeScene` | Slowly rotating low-poly globe / abstract world, cool-to-warm gradient sky. |
| Item `APARTMENT` | `ApartmentScene` | Stylized residential tower / unit volume. |
| Item `CONSTRUCTION_VILLA` | `ConstructionVillaScene` | Villa with scaffolding, a crane, half-built walls. |
| Item `PART_OF_HOME` | `PartOfHomeScene` | Cutaway house with one room/section lit and highlighted. |
| Lead forms | `AmbientFormScene` | Quiet, slow ambient 3D backdrop behind a readable glass form surface. |
| Booking wizard (9 steps) | `WizardAmbientScene` | Calm ambient environment; subtle shift per step. |
| `success` | `SuccessScene` | Celebratory — golden particles / confetti burst. |
| `cancel` | `CancelScene` | Muted, desaturated calm scene. |
| `checkout` / `complete` | reuse `AmbientFormScene` | Neutral ambient backdrop during payment/redirect. |

## 6. Mobile-First Optimization Strategy

- **One canvas**, never multiple. Pause render when tab hidden / canvas offscreen.
- **DPR clamp** `[1, 2]`; `<AdaptiveDpr>` + `<PerformanceMonitor>` step quality down on sustained low FPS.
- **Texture-free procedural** materials (vertex colors, MeshStandard/`flatShading`) → zero texture downloads, tiny payload.
- **Poly budget per tier** — scenes read `quality.polyBudget` and reduce segment counts / instance counts on low tier.
- **Tiered postprocessing** — low: none/vignette; medium: vignette; high: Bloom + DoF + vignette. Composer disabled entirely on low tier.
- **Shadows** off on low/medium; baked-feel via lighting instead.
- **Touch-first interaction** — primary motion is ambient/auto (scenes look alive with no input). Optional gyro/device-orientation + touch-drag parallax as enhancement (permission-gated, never required). No mouse-hover dependency.
- **Portrait-first framing** — camera fov + positions tuned for vertical screens; widened for landscape/desktop.
- **Aggressive code-split** — every scene lazy-loaded; `next/dynamic({ ssr: false })` for the whole 3D root; preload the *next* scene's chunk on interaction intent.
- **Shared rigs** — one lighting/environment/effects setup reused across scenes (no per-scene re-instantiation).
- **HDRI** via `@pmndrs/assets` (CC0), small/compressed; or fully procedural lighting on low tier.

## 7. Progressive Enhancement / Fallback

`Register3DRoot` chooses at mount:

1. **3D path** — WebGL available, not reduced-motion, perf tier ≥ low.
2. **2D fallback path** — otherwise. Renders the existing-style flow (gradient/photo backdrops + Framer Motion) so the funnel is fully functional. Lives in `register/three/fallback/`.

The fallback is a first-class deliverable, not an afterthought — it guarantees no lead is ever blocked.

## 8. Tech Stack (all free / open-source)

To install (pin React-19/Next-16-compatible versions; verify at install):

- `three`
- `@react-three/fiber` (v9 — React 19 support)
- `@react-three/drei` (v10 — R3F v9)
- `@react-three/postprocessing`
- `@pmndrs/assets` (CC0 HDRI/textures, lazy-loaded)
- `leva` (devDependency — tuning only, tree-shaken/guarded out of prod)

Keep `framer-motion` (already present) for DOM overlay + the 2D fallback transitions.

## 9. Decomposition (build order)

Sub-projects, built in this order. SP-0 unblocks everything; SP-1…4 then parallelize, and within SP-1 each *scene* is independently assignable to an agent.

- **SP-0 — Foundation.** Install + verify libs. Build `Register3DRoot`, `SceneCanvas`, `SceneDirector`, `sceneRegistry`, `CameraRig`, `LightingRig`, `Effects`, `lib/quality`, `lib/materials`, `lib/transitions`, capability/fallback gate, and a single placeholder scene proving the seam end-to-end. Wire into `register/layout` behind the existing providers without breaking the current flow.
- **SP-1 — Lead-selection flow.** Intro/location/item scenes + glass UI overlays + camera-push transitions, driven by existing `useLeadFlow`.
- **SP-2 — Lead forms.** `AmbientFormScene` + glass form surfaces; keep inputs DOM/accessible.
- **SP-3 — Booking wizard.** `WizardAmbientScene` + 9-step DOM overlay over 3D.
- **SP-4 — Checkout / success / cancel / complete.** `SuccessScene`, `CancelScene`, ambient reuse.

Each SP ships its own 2D fallback alongside the 3D scenes.

## 10. Verification

- `npm run build` passes; `npm run lint` clean (no new errors beyond the known pre-existing `DotsLoader` warning).
- Real-device / throttled-mobile check: funnel completes end-to-end on a low-tier profile and with WebGL disabled (fallback).
- No regression to backend calls, deep-linking (`?leadId`/`?step`), reset, or the checkout redirect.
- Frame budget: stays interactive (no long jank) on mid mobile; quality auto-drops under load.

## 11. Risks

- **R3F v9 ↔ React 19 / Next 16** version friction → verify at install, pin compatible versions, smoke-test SSR boundary (`ssr:false`).
- **Mobile GPU variance** → mitigated by tiering + fallback.
- **Scope size** ("all of register") → mitigated by SP-0 seam + per-scene agent decomposition.
- **Conversion safety** → fallback path is mandatory and tested.
