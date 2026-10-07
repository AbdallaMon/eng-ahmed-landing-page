# Register 3D Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the presentation layer of the entire `/register` section with a real-time, mobile-first WebGL 3D experience — one persistent canvas, a scene-director that swaps a distinct procedural 3D scene per decision point with a cinematic transition — while reusing the existing flow logic, backend calls, i18n, theme, and routing.

**Architecture:** A single lazy-loaded `<Canvas>` mounts as a fixed full-screen backdrop behind the existing DOM UI (cards/forms/wizard stay in DOM for a11y/RTL). A `Register3DProvider` holds the active `sceneKey` + capability and runs a DOM cross-fade veil; a `SceneDirector` inside the canvas renders the registered scene for that key under a shared lighting/camera/effects rig. Quality auto-scales by device tier; a 2D fallback renders when WebGL is unavailable or motion is reduced.

**Tech Stack:** `three@^0.184`, `@react-three/fiber@^9.6` (React-19 compatible), `@react-three/drei@^10.7`, `@react-three/postprocessing@^3.0`. Procedural-only geometry, **no textures, no model files, no HDRI downloads** (mobile-first). Existing `framer-motion` reused for DOM overlays + fallback.

**Testing note (project convention):** This repo has **no test runner** (verification gates are `npm run build` + `npm run lint` + dev smoke — see `CLAUDE.md`). Per instruction priority (project conventions > skill defaults), we follow the repo's gate rather than bolting on a test framework. Pure helpers are written defensively and verified by build/lint + a dev smoke of `/register`. Each task's verification step is concrete.

---

## File Structure (new — all under `src/app/register/three/`)

```
three/
  Register3DContext.js        // createContext + useRegister3D() + stage→sceneKey mapping
  Register3DProvider.jsx      // "use client" — capability gate, sceneKey state, veil, mounts backdrop, provides context
  SceneCanvas.jsx             // "use client" — the single <Canvas> (dpr, gl, PerformanceMonitor, AdaptiveDpr)
  SceneDirector.jsx           // renders the active registered scene under the rigs
  CameraRig.jsx               // owns the camera; portrait-first framing + idle float + transition dolly
  LightingRig.jsx             // procedural warm three-point lighting (no HDRI)
  Effects.jsx                 // tiered postprocessing (Bloom high / Vignette medium+ / off low)
  sceneRegistry.js            // sceneKey → lazy SceneComponent
  lib/
    capability.js             // detectCapability(): webgl + reducedMotion + tier + use3D
    quality.js                // QUALITY_PROFILES + getQualityProfile(tier)
    materials.js              // brand palette (from theme/colors) + texture-free material factories
    transitions.js            // useSceneTransition(sceneKey) veil hook + timing helpers
  scenes/
    PlaceholderScene.jsx      // SP-0 seam proof
    IntroScene.jsx            // SP-1
    InsideUaeScene.jsx        // SP-1
    OutsideUaeScene.jsx       // SP-1
    ApartmentScene.jsx        // SP-1
    ConstructionVillaScene.jsx// SP-1
    PartOfHomeScene.jsx       // SP-1
    AmbientFormScene.jsx      // SP-2
    WizardAmbientScene.jsx    // SP-3
    SuccessScene.jsx          // SP-4
    CancelScene.jsx           // SP-4
  fallback/
    Backdrop2D.jsx            // CSS gradient backdrop used when use3D is false
```

Modified: `src/app/register/layout.jsx` (mount the provider/backdrop). SP-1..4 also modify the existing overlay components to drive `setSceneKey` and let the canvas show through.

---

## The Scene Contract (the seam every scene/agent implements)

Every scene is a default-exported component rendered **inside** the R3F `<Canvas>` (so it returns three.js JSX, not DOM):

```jsx
// scenes/<Name>Scene.jsx — runs inside <Canvas>, returns three.js elements only.
export default function XScene({ quality, reducedMotion, t }) { ... }
```

Props:
- `quality` — `{ tier, dpr, postProcessing, bloom, dof, shadows, polyBudget, antialias }` from `getQualityProfile`. Scenes MUST scale segment/instance counts by `quality.polyBudget` and gate expensive features on it.
- `reducedMotion` — boolean. When true, no idle/auto motion (render a static pose).
- `t` — optional translate fn for any in-scene labels (rare; prefer DOM labels).

Camera convention (owned by `CameraRig`, scenes are authored to it):
- Camera looks at world origin `(0,0,0)`.
- Portrait: position ≈ `[0, 1.1, 6.2]`, fov `52`. Landscape/desktop: position ≈ `[0, 1.0, 5.4]`, fov `40`.
- Build scene content centered on the origin, roughly within a `6w × 5h × 6d` box so it frames well in both orientations. Keep the hero readable in the lower-center for portrait.

Rules: procedural geometry only (no `useGLTF`, no texture loads, no external HDRI); vertex colors / standard materials with `flatShading` where it suits the low-poly look; clean up on unmount (R3F auto-disposes JSX primitives — avoid manual global resources); never block on Suspense fetches.

---

## SP-0 — Foundation

### Task 0.1: Install + verify the 3D stack

**Files:** `package.json` (modify)

- [ ] **Step 1: Install** (versions verified compatible with React 19.2.1 / Next 16)

```bash
npm install three@^0.184 @react-three/fiber@^9.6 @react-three/drei@^10.7 @react-three/postprocessing@^3.0
```

- [ ] **Step 2: Verify install + peer deps resolve**

Run: `npm ls @react-three/fiber @react-three/drei @react-three/postprocessing three`
Expected: all four resolved, no `UNMET PEER DEPENDENCY` for react/react-dom.

- [ ] **Step 3: Build smoke (nothing imported yet — confirms deps don't break the build)**

Run: `npm run build`
Expected: build succeeds (same as before the install).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build(register): add react-three-fiber/drei/postprocessing for 3D register"
```

### Task 0.2: Capability detection

**Files:** Create `src/app/register/three/lib/capability.js`

- [ ] **Step 1: Implement**

```js
"use client";
// Detect rendering capability + a coarse perf tier for the 3D register.
// Cheap signals only — runs once on the client at mount, never benchmarks on
// the critical path. SSR-safe (returns the conservative path on the server).

export function supportsWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Coarse device tier from cheap, widely-available signals.
export function detectTier() {
  if (typeof window === "undefined") return "low";
  const mem = navigator.deviceMemory || 4; // GB where exposed (Chrome/Android)
  const cores = navigator.hardwareConcurrency || 4;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
  if (mem <= 3 || cores <= 4) return coarse ? "low" : "medium";
  if (mem <= 6 || cores <= 6) return "medium";
  return "high";
}

// use3D gates the whole WebGL path: present GPU AND motion not suppressed.
export function detectCapability() {
  const webgl = supportsWebGL();
  const reducedMotion = prefersReducedMotion();
  const tier = webgl ? detectTier() : "none";
  return { webgl, reducedMotion, tier, use3D: webgl && !reducedMotion };
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors in `capability.js`.

- [ ] **Step 3: Commit**

```bash
git add src/app/register/three/lib/capability.js
git commit -m "feat(register-3d): capability + device-tier detection"
```

### Task 0.3: Quality profiles

**Files:** Create `src/app/register/three/lib/quality.js`

- [ ] **Step 1: Implement**

```js
// Concrete quality profile per device tier. Scenes + canvas read from this so
// quality scales DOWN on weak devices (mobile-first). Values are deliberately
// conservative on low/medium — fidelity is secondary to a smooth funnel.
export const QUALITY_PROFILES = {
  low: {
    tier: "low",
    dpr: [1, 1.25],
    postProcessing: false,
    bloom: false,
    dof: false,
    shadows: false,
    polyBudget: 0.5, // scenes multiply segment/instance counts by this
    antialias: false,
  },
  medium: {
    tier: "medium",
    dpr: [1, 1.5],
    postProcessing: true,
    bloom: false,
    dof: false,
    shadows: false,
    polyBudget: 0.75,
    antialias: true,
  },
  high: {
    tier: "high",
    dpr: [1, 2],
    postProcessing: true,
    bloom: true,
    dof: true,
    shadows: true,
    polyBudget: 1,
    antialias: true,
  },
};

export function getQualityProfile(tier) {
  return QUALITY_PROFILES[tier] || QUALITY_PROFILES.low;
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/lib/quality.js
git commit -m "feat(register-3d): tiered quality profiles"
```

### Task 0.4: Brand materials + palette

**Files:** Create `src/app/register/three/lib/materials.js`

- [ ] **Step 1: Implement** (palette mirrors `register/theme/colors`)

```js
import * as THREE from "three";
import colors from "@/app/register/theme/colors";

// Brand palette as THREE colors (parsed once). Mirrors register/theme/colors so
// the 3D world matches the gold/beige identity.
export const PALETTE = {
  gold: new THREE.Color(colors.primary), // #d3ac71
  goldDark: new THREE.Color(colors.primaryDark), // #be975c
  cream: new THREE.Color(colors.primaryAlt), // #f7eedd
  sand: new THREE.Color(colors.secondary), // #e3b79a
  clay: new THREE.Color(colors.secondaryDark), // #a07559
  brown: new THREE.Color(colors.heading), // #383028
  bg: new THREE.Color(colors.bgPrimary), // #eae7e2
};

// Texture-free standard material — flat-shaded low-poly look, no downloads.
// Reuse via <meshStandardMaterial {...standardMat(color)} /> or create once.
export function standardMat(color, { flat = true, metalness = 0.05, roughness = 0.7 } = {}) {
  return { color, flatShading: flat, metalness, roughness };
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/lib/materials.js
git commit -m "feat(register-3d): brand palette + texture-free material helpers"
```

### Task 0.5: Transition veil hook

**Files:** Create `src/app/register/three/lib/transitions.js`

- [ ] **Step 1: Implement** (reuses existing speed/reduced-motion controls)

```js
"use client";
import { useEffect, useRef, useState } from "react";
import {
  getUrlSpeed,
  MOTION_SCALE,
  prefersReducedMotion,
} from "@/app/register/lib/animations";

// Cross-fade between scenes via a DOM veil (cheaper than rendering two scenes on
// mobile): when sceneKey changes, fade a brand veil IN, swap the rendered scene
// at the peak, then fade OUT. Honors ?speed= and prefers-reduced-motion.
export function useSceneTransition(sceneKey) {
  const [rendered, setRendered] = useState(sceneKey);
  const [veil, setVeil] = useState(0);
  const prev = useRef(sceneKey);
  const timers = useRef([]);

  useEffect(() => {
    if (sceneKey === prev.current) return;
    prev.current = sceneKey;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (prefersReducedMotion()) {
      setRendered(sceneKey);
      return;
    }
    const half = (260 * MOTION_SCALE) / getUrlSpeed();
    setVeil(1);
    timers.current.push(setTimeout(() => setRendered(sceneKey), half));
    timers.current.push(setTimeout(() => setVeil(0), half + 30));
    return () => timers.current.forEach(clearTimeout);
  }, [sceneKey]);

  // veilMs is exposed so the DOM veil's CSS transition matches the swap timing.
  const veilMs = (260 * MOTION_SCALE) / getUrlSpeed();
  return { rendered, veil, veilMs };
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/lib/transitions.js
git commit -m "feat(register-3d): DOM cross-fade veil transition hook"
```

### Task 0.6: Scene registry + stage mapping

**Files:** Create `src/app/register/three/sceneRegistry.js`

- [ ] **Step 1: Implement** (lazy scenes; PlaceholderScene is the only real one in SP-0 — the rest are added by SP-1..4 and registered here)

```js
import { lazy } from "react";

// sceneKey → lazy 3D scene component. Keys are stable contract strings the
// director + overlays agree on. Scenes are code-split (each loads on demand).
export const SCENES = {
  placeholder: lazy(() => import("@/app/register/three/scenes/PlaceholderScene")),
  intro: lazy(() => import("@/app/register/three/scenes/IntroScene")),
  INSIDE_UAE: lazy(() => import("@/app/register/three/scenes/InsideUaeScene")),
  OUTSIDE_UAE: lazy(() => import("@/app/register/three/scenes/OutsideUaeScene")),
  APARTMENT: lazy(() => import("@/app/register/three/scenes/ApartmentScene")),
  CONSTRUCTION_VILLA: lazy(() =>
    import("@/app/register/three/scenes/ConstructionVillaScene"),
  ),
  PART_OF_HOME: lazy(() => import("@/app/register/three/scenes/PartOfHomeScene")),
  form: lazy(() => import("@/app/register/three/scenes/AmbientFormScene")),
  wizard: lazy(() => import("@/app/register/three/scenes/WizardAmbientScene")),
  success: lazy(() => import("@/app/register/three/scenes/SuccessScene")),
  cancel: lazy(() => import("@/app/register/three/scenes/CancelScene")),
};

// Unknown keys fall back to the placeholder so a missing scene never crashes the
// canvas (it just shows the neutral seam scene).
export function resolveSceneComponent(key) {
  return SCENES[key] || SCENES.placeholder;
}
```

> NOTE for SP-1..4: until a scene file exists, leave its registry line pointing at `placeholder` (e.g. `intro: SCENES.placeholder`) OR add the file first. Do not ship a registry line importing a non-existent file — the lazy import only resolves when that key is selected, but keep `master` green by adding files before wiring keys.

- [ ] **Step 2: Adjust for SP-0 only** — comment out every lazy line except `placeholder` (uncomment each as its scene lands), so SP-0 builds with just the placeholder file present.

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/app/register/three/sceneRegistry.js
git commit -m "feat(register-3d): scene registry + safe resolve"
```

### Task 0.7: Placeholder scene (seam proof)

**Files:** Create `src/app/register/three/scenes/PlaceholderScene.jsx`

- [ ] **Step 1: Implement** (a slowly-rotating gold low-poly icosahedron — proves geometry + materials + quality + reducedMotion all flow through)

```jsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// Minimal scene proving the contract end-to-end: procedural geometry, brand
// material, polyBudget-aware detail, reducedMotion-aware idle spin.
export default function PlaceholderScene({ quality, reducedMotion }) {
  const ref = useRef();
  const detail = quality?.polyBudget >= 1 ? 1 : 0;

  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.y += delta * 0.3;
    ref.current.rotation.x += delta * 0.12;
  });

  return (
    <group>
      <mesh ref={ref} position={[0, 0.4, 0]}>
        <icosahedronGeometry args={[1.4, detail]} />
        <meshStandardMaterial {...standardMat(PALETTE.gold)} />
      </mesh>
      {/* ground plane to catch the warm light */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial {...standardMat(PALETTE.bg, { flat: false })} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/scenes/PlaceholderScene.jsx
git commit -m "feat(register-3d): placeholder scene proving the scene contract"
```

### Task 0.8: Lighting rig

**Files:** Create `src/app/register/three/LightingRig.jsx`

- [ ] **Step 1: Implement** (procedural warm three-point — no HDRI; shadows only on high)

```jsx
import { PALETTE } from "@/app/register/three/lib/materials";

// Warm, brand-tinted procedural lighting. No HDRI/environment fetch (mobile-first).
// Key from upper-right, warm fill, cool-ish rim for separation.
export default function LightingRig({ quality }) {
  const shadows = Boolean(quality?.shadows);
  return (
    <group>
      <hemisphereLight args={["#fff4e0", "#3a2f27", 0.55]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[5, 7, 4]}
        intensity={1.15}
        color={"#ffe9c7"}
        castShadow={shadows}
        shadow-mapSize-width={shadows ? 1024 : undefined}
        shadow-mapSize-height={shadows ? 1024 : undefined}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.4} color={"#cfe0ff"} />
      <pointLight position={[0, 2, 3]} intensity={0.4} color={PALETTE.gold} />
    </group>
  );
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/LightingRig.jsx
git commit -m "feat(register-3d): procedural warm lighting rig"
```

### Task 0.9: Camera rig

**Files:** Create `src/app/register/three/CameraRig.jsx`

- [ ] **Step 1: Implement** (portrait-first framing + gentle idle float; owns the default camera)

```jsx
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";

// Owns the camera. Portrait-first framing; widened on landscape/desktop. Gentle
// idle float when motion is allowed. Scenes are authored to this framing so
// transitions stay continuous (variety comes from scene CONTENT, not camera).
export default function CameraRig({ reducedMotion }) {
  const { camera, size } = useThree();
  const base = useRef([0, 1.1, 6.2]);

  useEffect(() => {
    const portrait = size.height >= size.width;
    base.current = portrait ? [0, 1.1, 6.2] : [0, 1.0, 5.4];
    camera.fov = portrait ? 52 : 40;
    camera.position.set(...base.current);
    camera.lookAt(0, 0.2, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    camera.position.x = base.current[0] + Math.sin(t * 0.25) * 0.25;
    camera.position.y = base.current[1] + Math.sin(t * 0.32) * 0.12;
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/CameraRig.jsx
git commit -m "feat(register-3d): portrait-first camera rig with idle float"
```

### Task 0.10: Tiered effects

**Files:** Create `src/app/register/three/Effects.jsx`

- [ ] **Step 1: Implement** (composer gated by quality; bloom high-only, vignette medium+)

```jsx
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";

// Postprocessing is OFF on low tier (composer not mounted). Vignette on medium+,
// Bloom only on high. Keeps mobile cheap while desktop gets the cinematic look.
export default function Effects({ quality }) {
  if (!quality?.postProcessing) return null;
  return (
    <EffectComposer disableNormalPass multisampling={quality.antialias ? 4 : 0}>
      {quality.bloom ? (
        <Bloom intensity={0.6} luminanceThreshold={0.7} mipmapBlur />
      ) : (
        <></>
      )}
      <Vignette eskil={false} offset={0.25} darkness={0.7} />
    </EffectComposer>
  );
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/Effects.jsx
git commit -m "feat(register-3d): tiered postprocessing (bloom/vignette)"
```

### Task 0.11: Scene director

**Files:** Create `src/app/register/three/SceneDirector.jsx`

- [ ] **Step 1: Implement** (renders the active registered scene under the rigs; Suspense inside canvas)

```jsx
import { Suspense } from "react";
import { resolveSceneComponent } from "@/app/register/three/sceneRegistry";
import LightingRig from "@/app/register/three/LightingRig";
import CameraRig from "@/app/register/three/CameraRig";
import Effects from "@/app/register/three/Effects";

// Renders exactly ONE scene at a time (the DOM veil covers the swap, so we never
// pay for two scenes on mobile). renderedKey comes from useSceneTransition.
export default function SceneDirector({ renderedKey, quality, reducedMotion }) {
  const Scene = resolveSceneComponent(renderedKey);
  return (
    <>
      <LightingRig quality={quality} />
      <CameraRig reducedMotion={reducedMotion} />
      <Suspense fallback={null}>
        <Scene quality={quality} reducedMotion={reducedMotion} />
      </Suspense>
      <Effects quality={quality} />
    </>
  );
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/SceneDirector.jsx
git commit -m "feat(register-3d): scene director rendering active scene under rigs"
```

### Task 0.12: Scene canvas

**Files:** Create `src/app/register/three/SceneCanvas.jsx`

- [ ] **Step 1: Implement** (the single Canvas; dpr/gl/perf from quality; mounts director; demand frameloop unless animating)

```jsx
"use client";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";
import { getQualityProfile } from "@/app/register/three/lib/quality";
import SceneDirector from "@/app/register/three/SceneDirector";

// The ONE persistent canvas. Renders fixed/full-screen behind the DOM UI. Starts
// at the detected tier and steps DOWN under sustained low FPS (PerformanceMonitor).
export default function SceneCanvas({ tier, renderedKey, reducedMotion }) {
  const [quality, setQuality] = useState(() => getQualityProfile(tier));

  return (
    <Canvas
      dpr={quality.dpr}
      shadows={quality.shadows}
      gl={{
        antialias: quality.antialias,
        powerPreference: "high-performance",
        alpha: false,
      }}
      camera={{ position: [0, 1.1, 6.2], fov: 52 }}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#1c1611"]} />
      <PerformanceMonitor
        onDecline={() => setQuality(getQualityProfile("low"))}
      />
      <AdaptiveDpr pixelated={false} />
      <SceneDirector
        renderedKey={renderedKey}
        quality={quality}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/SceneCanvas.jsx
git commit -m "feat(register-3d): single adaptive canvas with perf monitor"
```

### Task 0.13: 2D fallback backdrop

**Files:** Create `src/app/register/three/fallback/Backdrop2D.jsx`

- [ ] **Step 1: Implement** (a brand CSS gradient — used when use3D is false so the funnel still has an on-brand backdrop)

```jsx
"use client";
import { Box } from "@mui/material";
import colors from "@/app/register/theme/colors";

// Shown when WebGL is unavailable / motion is reduced / low-power. Keeps the
// section on-brand without any WebGL cost. The existing DOM flow renders on top.
export default function Backdrop2D() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: `radial-gradient(120% 90% at 50% 10%, ${colors.primaryAlt} 0%, ${colors.bgPrimary} 45%, ${colors.bgTertiary} 100%)`,
      }}
    />
  );
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/app/register/three/fallback/Backdrop2D.jsx
git commit -m "feat(register-3d): on-brand 2D fallback backdrop"
```

### Task 0.14: Context + provider (capability gate, sceneKey state, veil, mounts backdrop)

**Files:** Create `src/app/register/three/Register3DContext.js` and `src/app/register/three/Register3DProvider.jsx`

- [ ] **Step 1: Implement context + stage mapping** (`Register3DContext.js`)

```js
"use client";
import { createContext, useContext } from "react";

// Overlays read capability + drive the active scene through this context.
export const Register3DContext = createContext({
  capability: { use3D: false, tier: "none", reducedMotion: false, webgl: false },
  sceneKey: "intro",
  setSceneKey: () => {},
});

export function useRegister3D() {
  return useContext(Register3DContext);
}

// Map the lead-selection flow stage to a sceneKey. SP-1 overlays call this with
// (step, location, item) from useLeadFlow and pass the result to setSceneKey.
export function leadStageToSceneKey(step, location, item) {
  if (step === "item" && location) return location; // INSIDE_UAE | OUTSIDE_UAE
  if (step === "form" && item) return item; // APARTMENT | CONSTRUCTION_VILLA | PART_OF_HOME
  return "intro"; // designIntro | email | location(unselected)
}
```

- [ ] **Step 2: Implement provider** (`Register3DProvider.jsx`) — detects capability once, holds sceneKey, runs the veil, mounts the lazy canvas (or fallback) as a fixed backdrop, renders children on top

```jsx
"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { detectCapability } from "@/app/register/three/lib/capability";
import { useSceneTransition } from "@/app/register/three/lib/transitions";
import { Register3DContext } from "@/app/register/three/Register3DContext";
import Backdrop2D from "@/app/register/three/fallback/Backdrop2D";
import colors from "@/app/register/theme/colors";

// Heavy 3D bundle is client-only + code-split: never in the SSR/initial payload.
const SceneCanvas = dynamic(
  () => import("@/app/register/three/SceneCanvas"),
  { ssr: false },
);

export default function Register3DProvider({ children }) {
  // Conservative until the client resolves capability (avoids SSR/hydration cost
  // and a flash of canvas on devices that will fall back).
  const [capability, setCapability] = useState({
    use3D: false,
    tier: "none",
    reducedMotion: false,
    webgl: false,
  });
  const [sceneKey, setSceneKey] = useState("intro");

  useEffect(() => {
    setCapability(detectCapability());
  }, []);

  const { rendered, veil, veilMs } = useSceneTransition(sceneKey);
  const ctx = useMemo(
    () => ({ capability, sceneKey, setSceneKey }),
    [capability, sceneKey],
  );

  return (
    <Register3DContext.Provider value={ctx}>
      {capability.use3D ? (
        <>
          <SceneCanvas
            tier={capability.tier}
            renderedKey={rendered}
            reducedMotion={capability.reducedMotion}
          />
          {/* DOM cross-fade veil over the canvas swap */}
          <div
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              background: colors.bgPrimary,
              opacity: veil,
              transition: `opacity ${veilMs}ms ease`,
            }}
          />
        </>
      ) : (
        <Backdrop2D />
      )}
      {children}
    </Register3DContext.Provider>
  );
}
```

- [ ] **Step 3: Lint + commit**

```bash
npm run lint
git add src/app/register/three/Register3DContext.js src/app/register/three/Register3DProvider.jsx
git commit -m "feat(register-3d): capability-gated provider, scene state + veil"
```

### Task 0.15: Mount the provider in the register layout

**Files:** Modify `src/app/register/layout.jsx`

- [ ] **Step 1: Wrap children with the provider** (inside `RegisterProviders`, so it can read theme/language; the backdrop is fixed behind, children render above)

Change the return of `RegisterLayout`:

```jsx
import Register3DProvider from "@/app/register/three/Register3DProvider";
// ...
export default async function RegisterLayout({ children }) {
  const lng = await resolveLng();
  return (
    <RegisterProviders lng={lng}>
      <Register3DProvider>{children}</Register3DProvider>
    </RegisterProviders>
  );
}
```

- [ ] **Step 2: Build + smoke**

Run: `npm run build`
Expected: build succeeds.

Dev smoke: `npm run dev`, open `/register`.
Expected: page loads with no console errors. On a WebGL device you can confirm a `<canvas>` element is present in the DOM behind the flow (the existing photo backdrop may still cover it visually — that is removed in SP-1). With `prefers-reduced-motion` forced on (or WebGL disabled), no canvas mounts and the 2D gradient backdrop renders instead.

- [ ] **Step 3: Commit**

```bash
git add src/app/register/layout.jsx
git commit -m "feat(register-3d): mount 3D backdrop provider in register layout"
```

**SP-0 done when:** `npm run build` + `npm run lint` pass, `/register` mounts the canvas (placeholder scene) on capable devices and the 2D fallback otherwise, and the existing flow still works.

---

## SP-1 — Lead-selection flow in 3D

Each scene below is an **independent agent task** built against the Scene Contract. After a scene file lands, uncomment its line in `sceneRegistry.js`. Then one integration task wires the overlay to drive `setSceneKey` and reveals the canvas.

### Tasks 1.1–1.6: Scene builds (one agent each)

For each: Create `src/app/register/three/scenes/<Name>Scene.jsx` implementing the contract, then `npm run lint` + `npm run build`, then commit `feat(register-3d): <name> scene`.

- [ ] **1.1 `IntroScene`** — golden architectural hero: a low-poly building volume that reads as a blueprint frame transitioning to a furnished mass. Brand gold/cream. Idle: slow turntable + light shimmer (skip when `reducedMotion`). `polyBudget`-scaled detail.
- [ ] **1.2 `InsideUaeScene`** — stylized UAE: low-poly desert dunes (sand/clay palette) + a skyline silhouette of slender towers (one tall Burj-like spire) + a couple of palms; warm sunset gradient sky (large back-facing sphere with vertex-colored gradient, not a texture). Idle: gentle palm sway + slow cloud drift.
- [ ] **1.3 `OutsideUaeScene`** — abstract international: a slowly-rotating low-poly globe (icosphere with raised continent facets via vertex offset) over a cool-to-warm gradient; a faint ring/orbit line. Idle: globe rotation.
- [ ] **1.4 `ApartmentScene`** — a stylized residential tower / single unit: stacked balconies, warm window emissive dots (cheap, no light cost). Idle: subtle parallax.
- [ ] **1.5 `ConstructionVillaScene`** — villa under construction: partial walls, exposed beams, a scaffold lattice (instanced thin boxes — respect `polyBudget`), a simple crane (boom + counterweight). Idle: crane slowly rotates.
- [ ] **1.6 `PartOfHomeScene`** — cutaway home: a house mass with a quarter removed to reveal one lit interior room (floor + two walls + a block of furniture); the highlighted room glows warm. Idle: a soft pulse on the highlighted room.

All scenes: centered on origin within the ~`6×5×6` framing box, texture-free, vertex-color/standard-material flat-shaded, gate effects on `quality`, no motion when `reducedMotion`.

### Task 1.7: Drive scenes from the flow + reveal the canvas

**Files:** Modify `src/app/register/component/leadSelection/LeadSelectionFlow.jsx`, `src/app/register/component/leadSelection/StageBackdrop.jsx` (retire/neutralize), and any step that currently relies on the photo backdrop.

- [ ] **Step 1:** In `LeadSelectionFlow`, read `useRegister3D()`. Add an effect that calls `setSceneKey(leadStageToSceneKey(step, location, item))` whenever `step`/`location`/`leadItem` change (only on the 3D path).
- [ ] **Step 2:** When `capability.use3D` is true, stop rendering the photo `StageBackdrop` (let the WebGL canvas show through); keep `StageBackdrop` only on the 2D fallback path. Make option cards/headers sit on transparent/glassmorphic surfaces over the canvas (they already use frosted panels — keep those).
- [ ] **Step 3:** Build + dev-smoke the full flow on a 3D device: intro → email → location (pick INSIDE/OUTSIDE → scene swaps with veil) → item (pick type → scene swaps) → form. Verify deep-linking (`?leadId`/`?location`/`?item`), back, and reset still work. Verify the 2D fallback path is unchanged.
- [ ] **Step 4:** Commit `feat(register-3d): wire lead-selection flow to the 3D scene director`.

---

## SP-2 — Lead forms over an ambient scene

### Task 2.1: `AmbientFormScene`
Create `src/app/register/three/scenes/AmbientFormScene.jsx` — a quiet, slow ambient backdrop (soft floating low-poly shapes in brand tones, heavy blur-friendly, very low motion) that reads well behind a glass form surface. Respect `quality`/`reducedMotion`. Lint + build + commit.

### Task 2.2: Forms on glass over the canvas
**Files:** Modify `LeadRegisterForm.jsx`, `CompleteRegisterForm.jsx`. On the 3D path, set `setSceneKey("form")` on mount and render the form on a glassmorphic surface (`backdrop-filter: blur`, semi-opaque brand surface) so the ambient scene shows behind. **Inputs stay DOM/MUI** (accessibility, RTL, mui-tel-input unchanged). 2D fallback: render the form exactly as today. Lint + build + dev-smoke (submit path unchanged) + commit.

---

## SP-3 — Booking wizard (9 steps) in 3D

### Task 3.1: `WizardAmbientScene`
Create `src/app/register/three/scenes/WizardAmbientScene.jsx` — a calm environment with a subtle per-step shift (accepts an optional `step` index via a module-level setter or a second context value; simplest: a slow continuous drift, no per-step coupling required for v1). Lint + build + commit.

### Task 3.2: Wizard over the canvas
**Files:** Modify `BookingWizard.jsx` and the step components under `component/booking/steps/`. On the 3D path: `setSceneKey("wizard")`, render each step card on a glass surface over the canvas; keep the existing react-hook-form logic, validation, and step controller untouched. 2D fallback unchanged. Lint + build + dev-smoke (walk all 9 steps) + commit.

---

## SP-4 — Checkout / success / cancel / complete

### Task 4.1: `SuccessScene`
Create `src/app/register/three/scenes/SuccessScene.jsx` — celebratory: a burst/fountain of golden low-poly particles (instanced; `polyBudget`-scaled count) + a calm hero. Idle: gentle particle drift. Lint + build + commit.

### Task 4.2: `CancelScene`
Create `src/app/register/three/scenes/CancelScene.jsx` — muted, desaturated calm scene (brand browns, low light). Lint + build + commit.

### Task 4.3: Wire results + checkout
**Files:** Modify `success/page.jsx`+`SuccessView.jsx` (`setSceneKey("success")`), `cancel/page.jsx`+`CancelView.jsx` (`setSceneKey("cancel")`), `checkout/page.jsx`+`CheckoutView.jsx` and `complete/page.jsx` (`setSceneKey("form")` ambient). Render their content on glass. Keep the payment redirect + `client/payment-status` logic untouched. Lint + build + dev-smoke (success/cancel views) + commit.

> NOTE: these routes use their own `RegisterProviders`/layout already, so the `Register3DProvider` mounted in `register/layout.jsx` covers them automatically — they only need the `setSceneKey` call + glass surface.

---

## Final verification (after all SPs)

- [ ] `npm run build` passes; `npm run lint` clean (only the known pre-existing `DotsLoader` warning).
- [ ] Full funnel completes on: (a) a high-tier desktop, (b) a throttled/low-tier mobile profile (quality auto-drops, stays smooth), (c) WebGL disabled / reduced-motion (2D fallback, fully usable).
- [ ] No regression: backend calls, deep-linking, back/reset, payment redirect, RTL/Arabic default.
- [ ] Bundle: the 3D chunk is code-split (not in the initial `/register` payload) — confirm in the build output.

---

## Self-Review

**Spec coverage:** Every spec section maps to tasks — Mechanic/Architecture → SP-0 (0.6–0.15); Scene Catalogue → SP-1..4 scene tasks; Mobile-first optimization → 0.2/0.3/0.12 (capability, tiers, PerformanceMonitor/AdaptiveDpr) + texture-free contract; Fallback → 0.13/0.14 + each SP's "2D unchanged"; RTL/self-contained → provider mounted inside existing RegisterProviders, DOM overlays only. ✔

**Placeholder scan:** No TBD/TODO; every code step ships real code. Scene tasks (1.1–4.2) are creative builds described by concept + the explicit Scene Contract rather than line-by-line code — intentional, since each is an isolated agent build against a fixed interface (camera framing, props, texture-free, polyBudget). ✔

**Type/name consistency:** `detectCapability()→{use3D,tier,reducedMotion,webgl}` used consistently in provider; `getQualityProfile(tier)→profile` consumed by canvas/director/scenes; `useSceneTransition→{rendered,veil,veilMs}` consumed by provider; `resolveSceneComponent(key)` used by director; `leadStageToSceneKey(step,location,item)` used by SP-1.7; scene prop shape `{quality,reducedMotion}` matches PlaceholderScene + all scene tasks. ✔
