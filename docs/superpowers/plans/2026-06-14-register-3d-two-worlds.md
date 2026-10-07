# Register 3D — Two Distinct Worlds (V2 Tower / V3 Room) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single shared house-journey (which makes /register/v2 and /register/v3 feel identical) with TWO genuinely different immersive 3D worlds — **V2 = a vertical glass-elevator Tower**, **V3 = one Transforming Room** — behind a world-agnostic shell, preserving the flow/form/payment contract exactly.

**Architecture:** `JourneyShell` becomes world-agnostic: it owns `useLeadFlow` + one `useLeadForm`, the capability gate, the emirate sub-step, the armed-item state, the back/reset/paying/fallback, and builds ONE `ctx` object. A **World** = `{ key, useWorldState?, Scene, Overlays, ItemSelector }`. The shell renders `<JourneyCanvas><world.Scene/></JourneyCanvas>` + `<world.Overlays/>`. Each world owns its own camera choreography (calls `useJourneyCamera`), its own journey-local beats (door/elevator/room-wake), its in-canvas objects, and its DOM step-overlays. The current house becomes a temporary `house` world (behavior-identical) to prove the seam, then V2→Tower and V3→Room.

**Tech Stack:** Next.js 16 / React 19, react-three-fiber 9 + drei 10 + @react-three/postprocessing, three 0.184, GSAP (all camera/timeline motion), MUI 7 (DOM overlays only). JS/JSX only. Dev server `next dev -p 3003`.

**Verification model (read this first):** There is **no GPU here** and **no R3F test harness** — per the spec, visual "feel" is the owner's call on the live `:3003` server. So every task's automated checks are: (1) `npx eslint src/app/register` clean, (2) the route returns HTTP 200 with the real register `<title>` (not the 404 page), (3) no compile/SSR error in the dev server log, and (4) a requirement-by-requirement read that the contract handlers/enums are preserved and the world implements the contract. Refactor tasks add (5) a manual "behavior unchanged" check. These are the project's real tests; treat them as the pass/fail gate.

**Global guardrails (apply to EVERY task):**
- Touch only `src/app/register/**`. JS/JSX only. No barrels. Imports use `@/app/register/...`.
- NEVER change `useLeadFlow.js`, `core/useLeadForm.js`, `core/webgl/capability.js`, or the enum strings `"INSIDE_UAE"|"OUTSIDE_UAE"` / `"APARTMENT"|"CONSTRUCTION_VILLA"|"PART_OF_HOME"`.
- Full-screen DOM overlays use inline `style`, never MUI `sx` (an emotion class can inject a frame late → flash). Per `[[register-v1-flash-and-back]]`.
- Honor `reduce` (prefers-reduced-motion) in every animation: snap/disable.
- Do NOT `next build`. New module files hot-reload; the `v2`/`v3` route folders already exist. If the dev server isn't running, start it: `npm run dev` (port 3003).
- Labels live ON objects/anchored captions — never floating text.
- A backend error must leave the user on the SAME step (E5): never advance the world past a failed call.

---

## File Structure (target)

```
src/app/register/journey/
  worldContract.js          # NEW — JSDoc: the World interface + the ctx shape (the single source of truth both worlds + the shell agree on)
  JourneyShell.jsx          # MODIFY — world-agnostic; builds ctx; renders world.Scene + world.Overlays
  JourneyCanvas.jsx         # NEW — generic <Canvas> + lighting + Projector + effects; renders {children}. (Extracted from JourneyWorld.jsx top.)
  JourneyWorld.jsx          # DELETE after house extraction (its <Canvas> → JourneyCanvas; its SceneContents → HouseScene)
  useJourneyCamera.js       # reused unchanged
  useProjectedAnchor.js     # reused unchanged
  useDeviceMotion.js        # reused unchanged
  SelectorSlot.jsx          # reused unchanged
  selectorContract.js       # reused unchanged
  JourneyFallback.jsx       # reused unchanged (shared non-WebGL fallback)
  overlay/*                 # reused: DoorEmail, JourneyForm, PenTraceField, CaptionTag, PayingBeat, Breath, EmirateControls, LocationWayfinder
  scene/stations.js         # KEEP shared helpers; house-only stations may move under worlds/house later
  scene/EmirateBrowser.jsx  # reused (restaged per world)
  scene/objects/*           # EmirateLandmarks, Person, shared.jsx reused; Exterior/Interior/Destinations/Desk become house-world-local

  worlds/house/             # NEW (Phase 0 shim — behavior-identical to today)
    index.js                #   makeHouseWorld(ItemSelector) -> World
    HouseScene.jsx          #   in-canvas: camera choreography + house objects + SelectorSlot + EmirateBrowser + Desk (moved from SceneContents)
    HouseOverlays.jsx       #   DOM: door plaque, DoorEmail, LocationWayfinder, item caption/back, EmirateControls, JourneyForm (moved from JourneyShell JSX)
    useHouseBeats.js        #   the door approach/knock/enter sub-phase (moved from JourneyShell)

  worlds/tower/             # NEW (Phase 1 — V2)
    index.js                #   towerWorld (bundles ModelUnitsSelector)
    TowerScene.jsx          #   entrance → glass elevator → showroom floor → sky terrace → penthouse; vertical camera travel
    TowerOverlays.jsx       #   intercom email, elevator floor-buttons (location), unit confirm/back, EmirateControls, JourneyForm
    useTowerBeats.js        #   journey-local elevator-travel beat
    objects/                #   Lobby, GlassElevator, CityBackdrop, ShowroomFloor, ModelUnit, SkyTerrace, Penthouse
    ModelUnitsSelector.jsx  #   3 furnished model units behind glass; arm = approach, confirm = step through (selectorContract)
    towerStations.js        #   tower camera stations + waypoints

  worlds/room/              # NEW (Phase 2 — V3)
    index.js                #   roomWorld (bundles LayoutPresetSelector)
    RoomScene.jsx           #   one room; in-place transform; gentle orbit; never leaves
    RoomOverlays.jsx        #   drafting-panel email, window view pick (location), layout confirm/back, EmirateControls, JourneyForm
    useRoomTransform.js     #   the bare-shell → furnished assembly animation driver
    objects/                #   ConcreteShell, ViewWindow, FurnitureSet (3 presets), EmiratePiece, RoomDesk
    LayoutPresetSelector.jsx#   3 layout presets the room morphs between; arm = preview, confirm = lock (selectorContract)
    roomStations.js         #   room camera stations (mostly an in-place dolly/orbit)

src/app/register/variants/v2/V2Flow.jsx   # MODIFY — mount towerWorld
src/app/register/variants/v3/V3Flow.jsx   # MODIFY — mount roomWorld
src/app/register/variants/v2/FramesSelector.jsx        # retire after Phase 1
src/app/register/variants/v3/RoomModelsSelector.jsx    # retire after Phase 2
```

---

## The `ctx` object (canonical — every task references these exact names)

`JourneyShell` builds this once and passes it to `world.useWorldState(ctx)`, `world.Scene`, and `world.Overlays`. **Do not rename these keys in later tasks.**

```js
// ctx shape — defined in worldContract.js as JSDoc; built in JourneyShell.
const ctx = {
  // i18n + motion
  translate, lng, isRtl, reduce,
  // flow state (read-only)
  step, hydrated, isAnimating,
  leadEmail, location, leadItem, selectingItem, activeImage,
  logicalPhase,            // 'email' | 'location' | 'item' | 'emirate' | 'form'  (world-agnostic, from flow only)
  branch,                  // location || null
  onEmirate,               // boolean: emirate sub-step is active (INSIDE_UAE, pre-form)
  // frozen handlers (the contract — never reimplement)
  onEmailSubmit, emailBusy,// E5-wrapped: awaits register, exposes busy, stays on error
  onLocationClick,         // = flow.handleLocationClick(value)  value ∈ INSIDE_UAE|OUTSIDE_UAE
  onItemAdvance,           // = guarded flow.handleLeadItemClick(value)  value ∈ APARTMENT|CONSTRUCTION_VILLA|PART_OF_HOME
  onBack, canGoBack, onReset, canReset,
  // item beat (selector seam)
  ItemSelector, itemOptions, itemSlots, itemScale, itemDisabled,
  armedItem, setArmedItem, onItemBack, itemStage,   // itemStage: 'overview'|'approach'
  // emirate beat
  emirateOptions, emirateIndex, setEmirateIndex, confirmEmirate, registerEmirateToken,
  // form + payment
  form,                    // the single lifted useLeadForm instance
  // shared 3D plumbing
  pointer, anchorStore, hovered, setHovered,
  // curated textures (house uses; generic worlds may ignore or supply their own)
  interiorArtSrc, deskRoomSrc,
};
```

---

# PHASE 0 — The world seam (behavior-identical house world)

Goal: introduce the World abstraction and move the house into `worlds/house/`, with **zero behavior change**. Both `/register/v2` and `/register/v3` keep working exactly as today (V2=frames, V3=maquettes), now routed through the seam. This unlocks Phases 1–2 and is fully verifiable.

### Task 0.1: Define the World contract + ctx JSDoc

**Files:**
- Create: `src/app/register/journey/worldContract.js`

- [ ] **Step 1: Write the contract module (JSDoc only — no runtime).**

```js
/**
 * The World interface consumed by <RegisterJourney> (JourneyShell). A world is a
 * plain object. The shell owns the flow/form/capability/emirate/back/paying and
 * builds ONE ctx (see the @typedef below); each world supplies its in-canvas
 * Scene, its DOM Overlays, an optional world-local state hook, and its item
 * selector. Worlds are disjoint: house / tower / room never import each other.
 *
 * @typedef {Object} JourneyCtx
 *  (… copy the exact ctx shape from the plan's "ctx object" section …)
 *
 * @typedef {Object} World
 * @property {'house'|'tower'|'room'} key
 * @property {(ctx: JourneyCtx) => any} [useWorldState]  // optional React hook: world-local beats (door/elevator/wake). Returns wstate passed to Scene+Overlays.
 * @property {React.ComponentType<{ctx: JourneyCtx, wstate: any}>} Scene      // mounted INSIDE the shared <Canvas>; owns its own useJourneyCamera + objects
 * @property {React.ComponentType<{ctx: JourneyCtx, wstate: any}>} Overlays   // DOM step-overlays, positioned at the world's projected anchors
 * @property {React.ComponentType} ItemSelector                              // per-world selector (selectorContract.js)
 */
export {};
```

- [ ] **Step 2: Verify lint.** Run: `npx eslint src/app/register/journey/worldContract.js` — Expected: clean (no errors).

- [ ] **Step 3: Commit.**
```bash
git add src/app/register/journey/worldContract.js
git commit -m "feat(register-3d): add World interface + ctx contract (seam for two worlds)"
```

### Task 0.2: Extract the generic `JourneyCanvas`

**Files:**
- Create: `src/app/register/journey/JourneyCanvas.jsx`

- [ ] **Step 1: Create the generic canvas.** Move the `<Canvas>` wrapper + fog + `<Suspense>` + lighting note + `PerformanceMonitorGuard` + `<EffectComposer>` (Bloom+Vignette) out of `JourneyWorld.jsx` (lines 50–92) into this file. It renders `{children}` instead of `<SceneContents>`. Keep the exact gl/tone-mapping/camera/dpr settings (lines 53–66). The LIGHTING (the `hemisphereLight` + 3 directionals + ambient currently at lines 340–358 inside SceneContents) MOVES UP into `JourneyCanvas` so it is shared by all worlds and present on frame 0 (keep the E1 no-async-HDRI rule). The `ProjectorInScene` also moves here (it is world-agnostic). The `ContactShadows` stays world-side (house only).

```jsx
"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { PALETTE, STATIONS } from "@/app/register/journey/scene/stations";
import { ProjectorInScene } from "@/app/register/journey/useProjectedAnchor";

// Generic persistent canvas: ONE <Canvas>, shared lighting present on frame 0
// (E1 — no async HDRI), shared anchor projector, shared effects. Worlds render
// their own objects as {children}; they NEVER create a second Canvas.
export default function JourneyCanvas({ reduce, anchorStore, children }) {
  return (
    <Canvas
      dpr={[1, reduce ? 1.25 : 1.6]}
      shadows={reduce ? false : "soft"}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ position: STATIONS.exterior.pos, fov: 46, near: 0.1, far: 80 }}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    >
      <fog attach="fog" args={[PALETTE.cream, 16, 42]} />
      {/* Shared gallery lighting, synchronous on frame 0 (E1 flash-fix). */}
      <hemisphereLight args={[PALETTE.duskTop, PALETTE.cocoa, 0.35]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[6, 9, 7]} intensity={1.1} color={PALETTE.duskTop}
        castShadow={!reduce}
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={1} shadow-camera-far={40}
        shadow-camera-left={-14} shadow-camera-right={14}
        shadow-camera-top={14} shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.25} color={PALETTE.skyDeep} />
      <directionalLight position={[0, 3, -10]} intensity={0.22} color={PALETTE.gold} />
      {anchorStore && <ProjectorInScene store={anchorStore} />}
      {!reduce && <PerformanceMonitor />}
      <Suspense fallback={null}>{children}</Suspense>
      {!reduce && (
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.28} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.3} darkness={0.62} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify lint.** Run: `npx eslint src/app/register/journey/JourneyCanvas.jsx` — Expected: clean. (Note: `JourneyWorld.jsx` is still present and unused for now; we delete it in Task 0.5.)

- [ ] **Step 3: Commit.**
```bash
git add src/app/register/journey/JourneyCanvas.jsx
git commit -m "feat(register-3d): extract generic JourneyCanvas (shared canvas/lighting/projector/effects)"
```

### Task 0.3: Move the house into `worlds/house/`

**Files:**
- Create: `src/app/register/journey/worlds/house/HouseScene.jsx`
- Create: `src/app/register/journey/worlds/house/HouseOverlays.jsx`
- Create: `src/app/register/journey/worlds/house/useHouseBeats.js`
- Create: `src/app/register/journey/worlds/house/index.js`

- [ ] **Step 1: `useHouseBeats.js` — the door sub-phase.** Move the door sub-phase out of `JourneyShell` (lines 114–178, 222–246: `doorPhase`, `knockTimers`, `clearKnockTimers`, `onDoorClick`, `showEmail`, the email→entering effect, and the `entering`→idle timer). It becomes a hook taking `ctx` and returning `{ doorPhase, onDoorClick, showEmail, scenePhase }` where `scenePhase` reproduces today's mapping: `email/designIntro → 'exterior'`; `location → (doorPhase==='entering' ? 'exterior' : 'interior')`; `item → 'item'`; `form → (ctx.onEmirate ? 'emirate' : 'desk')`. Read `ctx.step`, `ctx.isAnimating`, `ctx.reduce`, `ctx.onEmailSubmit` (already E5-wrapped). Keep all timing constants (1500ms approach, 600ms knock, 1500ms walk-through) and the E5 gate (door opens only when `ctx.step` flips to `location`).

```js
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// House journey-local door beat: idle → approaching → knocking/atDoor →
// (email submit, awaited) → entering (door opens, walk through) → flow advances.
// Reproduces the exact behavior previously inlined in JourneyShell.
export function useHouseBeats(ctx) {
  const { step, isAnimating, reduce, hydrated } = ctx;
  const [doorPhase, setDoorPhase] = useState("idle");
  const timers = useRef([]);
  const clear = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  useEffect(() => clear, [clear]);

  const onDoorClick = useCallback(() => {
    if (isAnimating || doorPhase !== "idle") return;
    setDoorPhase("approaching");
    clear();
    const a = reduce ? 0 : 1500, k = reduce ? 0 : 600;
    timers.current.push(
      setTimeout(() => setDoorPhase("knocking"), a),
      setTimeout(() => setDoorPhase("atDoor"), a + k),
    );
  }, [isAnimating, doorPhase, reduce, clear]);

  // Door opens ONLY on the real success transition email → location (E5).
  useEffect(() => {
    if (step === "location" && (doorPhase === "knocking" || doorPhase === "atDoor")) setDoorPhase("entering");
  }, [step, doorPhase]);
  // After the walk-through, drop 'entering' so the interior settles.
  useEffect(() => {
    if (step === "location" && doorPhase === "entering") {
      const id = setTimeout(() => setDoorPhase("idle"), reduce ? 0 : 1500);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [step, doorPhase, reduce]);
  // Returning to email/intro resets the door (called by the shell's back via ctx).
  useEffect(() => {
    if (step === "email" || step === "designIntro") {
      // only reset if we somehow left it open
      if (doorPhase === "entering") setDoorPhase("idle");
    }
  }, [step, doorPhase]);

  const showEmail = hydrated && (step === "email" || step === "designIntro") &&
    (doorPhase === "knocking" || doorPhase === "atDoor");

  const scenePhase = useMemo(() => {
    if (step === "designIntro" || step === "email") return "exterior";
    if (step === "location") return doorPhase === "entering" ? "exterior" : "interior";
    if (step === "item") return "item";
    if (step === "form") return ctx.onEmirate ? "emirate" : "desk";
    return "exterior";
  }, [step, doorPhase, ctx.onEmirate]);

  return { doorPhase, onDoorClick, showEmail, scenePhase };
}
```

- [ ] **Step 2: `HouseScene.jsx` — the in-canvas house.** Move the BODY of `SceneContents` from `JourneyWorld.jsx` (lines 121–512) here, MINUS the lighting/projector (now in JourneyCanvas). Signature `function HouseScene({ ctx, wstate })`. Replace every `props.X` read with `ctx.X`, and use `wstate.doorPhase` for `subPhase` and `wstate.scenePhase` for `phase`. Keep: the `useJourneyCamera` call, the `overlapPhase` cross-reveal effect, the camera choreography effect (lines 201–255), `flyInto` (261–267), the door-swing effect (275–286), the `personPose`, and the full JSX (`PhaseGroup`s for exterior/interior/item/emirate/desk + `SelectorSlot` + `EmirateBrowser` + `Desk` + `ContactShadows`). Keep importing the house objects (Exterior/Interior/Destinations/Desk/Person). `ItemSelector` comes from `ctx.ItemSelector`. Re-export nothing.

- [ ] **Step 3: `HouseOverlays.jsx` — the DOM step overlays.** Move the overlay JSX from `JourneyShell` (lines 350–464) here: the door plaque `CaptionTag`, `DoorEmail`, `LocationWayfinder`, the item arrival caption + the armed BACK chip, `EmirateControls`, and `JourneyForm`. Signature `function HouseOverlays({ ctx, wstate })`. Use `wstate.showEmail`/`wstate.onDoorClick`/`wstate.doorPhase`/`wstate.scenePhase` and `ctx.*`. The `selectorKind`→hint copy (`framesHint`/`windowsHint`, JourneyShell line 401–403) becomes a prop the house world carries (default `'frames'`); pass it through `makeHouseWorld`. Keep the inline-style discipline.

- [ ] **Step 4: `index.js` — the house world factory.**
```js
import HouseScene from "@/app/register/journey/worlds/house/HouseScene";
import HouseOverlays from "@/app/register/journey/worlds/house/HouseOverlays";
import { useHouseBeats } from "@/app/register/journey/worlds/house/useHouseBeats";

// makeHouseWorld(ItemSelector, opts?) -> World. Behavior-identical to the old
// shared journey; kept ONLY as the Phase-0 seam proof + the low-end reference.
export function makeHouseWorld(ItemSelector, { hintKind = "frames" } = {}) {
  const SceneWrap = (p) => <HouseScene {...p} />;
  const OverlaysWrap = (p) => <HouseOverlays {...p} hintKind={hintKind} />;
  return { key: "house", useWorldState: useHouseBeats, Scene: SceneWrap, Overlays: OverlaysWrap, ItemSelector };
}
```

- [ ] **Step 5: Verify lint.** Run: `npx eslint src/app/register/journey/worlds/house` — Expected: clean. Fix any unused-import/missing-dep warnings introduced by the move.

- [ ] **Step 6: Commit.**
```bash
git add src/app/register/journey/worlds/house
git commit -m "feat(register-3d): move the house journey into worlds/house (Scene + Overlays + beats)"
```

### Task 0.4: Make `JourneyShell` world-agnostic

**Files:**
- Modify: `src/app/register/journey/JourneyShell.jsx`

- [ ] **Step 1: Change the signature + render.** `RegisterJourney({ world })` instead of `({ ItemSelector, selectorKind })`. Keep ALL the generic state (flow, form, capability, mounted, pointer, anchorStore, armedItem/itemStage/onItemBack, emirate state/confirmEmirate/registerEmirateToken, onBack, paying/fallback, itemOptions/itemSlots/textures, the E5 email-busy wrapper). Compute the world-agnostic `logicalPhase` and `onEmirate`. Build the `ctx` object (exact keys from the plan). Then:

```jsx
const ctx = { /* …all keys from the canonical ctx section… */ ItemSelector: world.ItemSelector };
const wstate = world.useWorldState ? world.useWorldState(ctx) : null;
const World = world; // for JSX

return (
  <Box sx={{ position: "relative", minHeight: "100dvh", width: "100%", overflowX: "hidden" }}>
    <RegisterHeader onBack={ctx.onBack} canGoBack={ctx.canGoBack} onReset={ctx.onReset} canReset={ctx.canReset} disabled={isAnimating || isPaying} />
    {showWorld && (
      <>
        <JourneyCanvas reduce={reduce} anchorStore={anchorStore}>
          <World.Scene ctx={ctx} wstate={wstate} />
        </JourneyCanvas>
        <Breath triggerKey={`${ctx.logicalPhase}-${branch}`} />
        <World.Overlays ctx={ctx} wstate={wstate} />
      </>
    )}
    {showFallback && (/* unchanged JourneyFallback block */)}
    {isPaying && <PayingBeat />}
  </Box>
);
```

- [ ] **Step 2: Move the door/phase logic OUT.** Delete the door sub-phase block (now in `useHouseBeats`) and the old `phase` memo. The shell's `onBack` must still reset the house door when returning to email — but that now lives in the house beat hook (Step 1 of 0.3 added the email/intro reset effect), so the shell's `onBack` keeps only the generic parts: the emirate-rewind (`step==='form' && insideUAE && emiratePicked → setFormData emirate:null`) and `handleBack()`. Remove the `setDoorPhase('idle')` lines.

- [ ] **Step 3: Update imports.** Remove the now-unused house imports (Breath stays; remove DoorEmail/LocationWayfinder/JourneyForm/EmirateControls/CaptionTag/DoorArrow/etc. that moved to HouseOverlays; remove the `JourneyWorld` dynamic import). Add `import JourneyCanvas from "@/app/register/journey/JourneyCanvas"`. `JourneyCanvas` does NOT need `ssr:false` itself, but the shell already guards mounting with `mounted && capable`; keep `JourneyCanvas` import static (it only renders inside `showWorld`, which is false during SSR because `capable` is window-gated). Verify no SSR error (Task 0.6).

- [ ] **Step 4: Verify lint.** Run: `npx eslint src/app/register/journey/JourneyShell.jsx` — Expected: clean.

- [ ] **Step 5: Commit.**
```bash
git add src/app/register/journey/JourneyShell.jsx
git commit -m "feat(register-3d): make JourneyShell world-agnostic (ctx + world.Scene/Overlays)"
```

### Task 0.5: Re-wire V2/V3 to the house world (still behavior-identical) + delete old JourneyWorld

**Files:**
- Modify: `src/app/register/variants/v2/V2Flow.jsx`
- Modify: `src/app/register/variants/v3/V3Flow.jsx`
- Delete: `src/app/register/journey/JourneyWorld.jsx`

- [ ] **Step 1: V2Flow → house world with frames.**
```jsx
"use client";
import RegisterJourney from "@/app/register/journey/JourneyShell";
import FramesSelector from "@/app/register/variants/v2/FramesSelector";
import { makeHouseWorld } from "@/app/register/journey/worlds/house";
const world = makeHouseWorld(FramesSelector, { hintKind: "frames" });
export default function V2Flow() { return <RegisterJourney world={world} />; }
```

- [ ] **Step 2: V3Flow → house world with maquettes.**
```jsx
"use client";
import RegisterJourney from "@/app/register/journey/JourneyShell";
import RoomModelsSelector from "@/app/register/variants/v3/RoomModelsSelector";
import { makeHouseWorld } from "@/app/register/journey/worlds/house";
const world = makeHouseWorld(RoomModelsSelector, { hintKind: "windows" });
export default function V3Flow() { return <RegisterJourney world={world} />; }
```

- [ ] **Step 3: Delete the old monolith.** Remove `src/app/register/journey/JourneyWorld.jsx` (its canvas → JourneyCanvas, its SceneContents → HouseScene). `git grep JourneyWorld src/app/register` must return nothing.

- [ ] **Step 4: Verify lint.** Run: `npx eslint src/app/register` — Expected: clean.

- [ ] **Step 5: Commit.**
```bash
git add -A src/app/register
git commit -m "refactor(register-3d): route V2/V3 through the world seam; remove old JourneyWorld"
```

### Task 0.6: Verify Phase 0 (behavior unchanged)

- [ ] **Step 1: Routes compile + 200.** With `npm run dev` running, run:
  `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3003/register/v2` and `…/register/v3` — Expected: `200` for both. Then `curl -s http://localhost:3003/register/v2 | grep -i "<title>"` — Expected: the real register title, NOT "404: This page could not be found".
- [ ] **Step 2: No SSR/compile errors.** Check the `npm run dev` terminal log after loading both routes — Expected: no red compile/runtime errors, no "window is not defined".
- [ ] **Step 3: Manual behavior check (owner, on :3003).** /register/v2 still shows the picture-frames item selector; /register/v3 still shows the maquette selector; the email→door→interior→location→item→emirate→form→pay flow behaves exactly as before. (Visual feel is owner's; this is a "nothing regressed" check.)
- [ ] **Step 4: Commit (only if fixes were needed).**

---

# PHASE 1 — V2 THE TOWER (vertical glass-elevator world)

Goal: build `worlds/tower/` and point `V2Flow` at it. Continuous through-line = the elevator traveling (no cut). First-person. Each task is a focused file; geometry is built then visually iterated with the owner on :3003 (per the verification model). After EACH task: `npx eslint src/app/register/journey/worlds/tower` clean + `/register/v2` still 200.

**Beat → logicalPhase map (tower):** `email → entrance/intercom`; `location → inside the rising elevator (floor buttons)`; `item → showroom floor (3 model units)`; `emirate → sky terrace`; `form → penthouse desk`. The elevator-travel beat between phases is owned by `useTowerBeats`.

### Task 1.1: Tower stations + camera scaffold
**Files:** Create `worlds/tower/towerStations.js`, `worlds/tower/useTowerBeats.js`
- [ ] Define camera STATIONS for: `entrance`, `elevatorInterior`, `showroomOverview`, a per-unit `approach`, `terrace`, `penthouse`, plus vertical WAYPOINTS for the elevator travel (so the rise curves). Mirror the shape of `scene/stations.js` (pos/look arrays). Export `towerApproachStationFor(slot)`.
- [ ] `useTowerBeats(ctx)` returns `{ beat, scenePhase, onPrimary }` where `beat` covers the journey-local elevator travel (`idle → calling → riding → arriving`) and `scenePhase` maps `ctx.logicalPhase` to the tower beat-aware phase (hold `entrance` while the doors open, etc.), reproducing the E5 gate: the elevator only departs after the relevant handler's success. `onPrimary` = the entrance "call elevator" trigger (analog of `onDoorClick`).
- [ ] Verify lint + commit: `feat(register-3d): tower stations + elevator-travel beat`.

### Task 1.2: Tower objects — entrance + glass elevator + city
**Files:** Create `worlds/tower/objects/Lobby.jsx`, `GlassElevator.jsx`, `CityBackdrop.jsx`
- [ ] `CityBackdrop` — a warm dusk skyline (instanced boxes / billboards) that parallax-slides vertically while `beat==='riding'` (the visible motion that sells the travel). Reduced-motion = static.
- [ ] `GlassElevator` — a glass cab (transparent panels + brass frame + emissive ceiling) the camera sits inside; a brass floor-button panel group with a `registerAnchor`-able point for the DOM buttons. Doors that open/close (GSAP), reusing the door-swing pattern from the old house door effect.
- [ ] `Lobby` — the building entrance: glass doors + an intercom panel (anchor point for the email DOM) + warm landscaping context. Reuse materials/Garden bits salvaged from `objects/Exterior.jsx`.
- [ ] Verify lint + commit: `feat(register-3d): tower entrance, glass elevator, city backdrop`.

### Task 1.3: Tower objects — showroom + model units (the V2 selector) + terrace + penthouse
**Files:** Create `worlds/tower/objects/ShowroomFloor.jsx`, `ModelUnit.jsx`, `SkyTerrace.jsx`, `Penthouse.jsx`, `worlds/tower/ModelUnitsSelector.jsx`
- [ ] `ModelUnit` — a furnished glass-walled mini-apartment; name + image etched on its glass (label-on-object). Three of them along the showroom corridor at `itemSlots`.
- [ ] `ModelUnitsSelector` — implements `selectorContract`: renders 3 `ModelUnit`s at `ctx.itemSlots * ctx.itemScale`; tap = `setArmed(value)` (arm → journey approaches); confirm = a deliberate "step through the unit door" gesture → `onConfirm(value)` (→ `handleLeadItemClick`). All three visible at the overview. No stray-click select.
- [ ] `SkyTerrace` — a panoramic terrace staging the reused `EmirateBrowser`/`EmirateLandmarks` along the horizon.
- [ ] `Penthouse` — desk at a floor-to-ceiling window over the city; staging for the shared `JourneyForm`.
- [ ] Verify lint + commit: `feat(register-3d): tower showroom/model-units selector, sky terrace, penthouse`.

### Task 1.4: TowerScene — assemble + choreograph
**Files:** Create `worlds/tower/TowerScene.jsx`
- [ ] `function TowerScene({ ctx, wstate })`: call `useJourneyCamera`; drive camera by `wstate.scenePhase`/`wstate.beat` (vertical flyPath for the rise). Mount objects per phase with the same pre-mount/overlap discipline as the house (next floor mounts behind the closed doors during `riding` so the reveal is by motion, never a cut). Mount `SelectorSlot` with `ctx.ItemSelector` (= ModelUnitsSelector) for the item phase, and `EmirateBrowser` for the emirate phase. Honor `reduce`.
- [ ] Verify lint + `/register/v2` 200 (after Task 1.6 wiring) + commit: `feat(register-3d): TowerScene assembly + elevator choreography`.

### Task 1.5: TowerOverlays — DOM step layer
**Files:** Create `worlds/tower/TowerOverlays.jsx`
- [ ] `function TowerOverlays({ ctx, wstate })`: render `DoorEmail` anchored to the intercom (use `ctx.onEmailSubmit`/`ctx.emailBusy`, E5 stay-on-error); location = two floor-button affordances anchored to the elevator panel calling `ctx.onLocationClick('INSIDE_UAE'|'OUTSIDE_UAE')` with a deliberate press; the item arrival caption + the armed `onItemBack` chip; `EmirateControls`; `JourneyForm` at the penthouse. Inline-style discipline. Labels on objects/anchored.
- [ ] Verify lint + commit: `feat(register-3d): TowerOverlays (intercom email, floor-button location, unit confirm, form)`.

### Task 1.6: Wire V2 → tower
**Files:** Create `worlds/tower/index.js`; Modify `variants/v2/V2Flow.jsx`
- [ ] `index.js`: `export const towerWorld = { key:'tower', useWorldState: useTowerBeats, Scene: TowerScene, Overlays: TowerOverlays, ItemSelector: ModelUnitsSelector };`
- [ ] `V2Flow.jsx`: `import { towerWorld } from "@/app/register/journey/worlds/tower"; export default () => <RegisterJourney world={towerWorld} />;`
- [ ] Verify: `npx eslint src/app/register` clean; `/register/v2` → 200 + real title; dev log clean; owner reviews on :3003. Commit: `feat(register-3d): V2 now renders the Tower world`.

---

# PHASE 2 — V3 THE TRANSFORMING ROOM (one space, in-place transform)

Goal: build `worlds/room/` and point `V3Flow` at it. Continuous because the camera never leaves the room; transitions = furniture/walls/light animating. First-person. Same per-task verification as Phase 1. Same `ctx`/World contract.

**Beat → logicalPhase map (room):** `email → bare shell + drafting panel`; `location → reveal the window view`; `item → room reconfigures into the chosen layout`; `emirate → console/wall piece`; `form → fully furnished room + desk`. The bare-shell → furnished assembly is owned by `useRoomTransform`.

### Task 2.1: Room stations + transform driver
**Files:** Create `worlds/room/roomStations.js`, `worlds/room/useRoomTransform.js`
- [ ] `roomStations.js` — a small set of nearly-in-place camera stations (gentle dolly/orbit toward whatever's active: the door, the window, the room center, the desk). No big travel.
- [ ] `useRoomTransform(ctx)` returns `{ scenePhase, wake, onPrimary }`: tracks the furnishing progress (bare → woken → furnished), reproducing the E5 gate (the room only "wakes"/advances after the relevant call succeeds). `onPrimary` = the entrance email trigger.
- [ ] Verify lint + commit: `feat(register-3d): room stations + transform driver`.

### Task 2.2: Room objects — shell, window, furniture sets, emirate piece, desk
**Files:** Create `worlds/room/objects/ConcreteShell.jsx`, `ViewWindow.jsx`, `FurnitureSet.jsx`, `EmiratePiece.jsx`, `RoomDesk.jsx`
- [ ] `ConcreteShell` — the bare unfinished room (concrete walls/floor, one work-lamp, dust motes); the entrance door is a real openable door (reuse the door-swing pattern).
- [ ] `ViewWindow` — a large window whose view swaps between the UAE skyline and the Kaaba plaza (frosted → clears), with the room palette cross-fading to match. Two affordances flank it (anchor points).
- [ ] `FurnitureSet` — three layout presets (`APARTMENT` compact-modern, `CONSTRUCTION_VILLA` grand double-height, `PART_OF_HOME` a feature corner); furniture flies into place via GSAP. Each preset is a self-contained group toggled/animated by progress.
- [ ] `EmiratePiece` — a console model / framed piece staging the reused `EmirateLandmarks` (cycle the 7).
- [ ] `RoomDesk` — the writing desk staging the shared `JourneyForm` once furnished.
- [ ] Verify lint + commit: `feat(register-3d): room shell, view-window, furniture presets, emirate piece, desk`.

### Task 2.3: LayoutPresetSelector (the V3 selector)
**Files:** Create `worlds/room/LayoutPresetSelector.jsx`
- [ ] Implements `selectorContract`: browsing previews each `FurnitureSet` preset in-place (arm = preview that layout, siblings ghosted); confirm = a deliberate "choose this layout" gesture → `onConfirm(value)` (→ `handleLeadItemClick`) → furniture locks solid. All three reachable; no stray select.
- [ ] Verify lint + commit: `feat(register-3d): V3 LayoutPresetSelector (in-place layout morph)`.

### Task 2.4: RoomScene + RoomOverlays
**Files:** Create `worlds/room/RoomScene.jsx`, `worlds/room/RoomOverlays.jsx`
- [ ] `RoomScene({ ctx, wstate })`: `useJourneyCamera` for the gentle in-place dolly; render the shell + window + furniture + emirate piece + desk gated by `wstate.scenePhase`; mount `SelectorSlot` with `ctx.ItemSelector` (= LayoutPresetSelector). Nothing ever fully unmounts mid-flow (no cut). Honor `reduce` (snap the transforms).
- [ ] `RoomOverlays({ ctx, wstate })`: `DoorEmail` at the drafting panel (E5); location = the two window-view affordances calling `ctx.onLocationClick(...)`; item caption + `onItemBack` chip; `EmirateControls`; `JourneyForm` at the desk. Inline-style.
- [ ] Verify lint + commit: `feat(register-3d): RoomScene + RoomOverlays (one transforming space)`.

### Task 2.5: Wire V3 → room
**Files:** Create `worlds/room/index.js`; Modify `variants/v3/V3Flow.jsx`
- [ ] `index.js`: `export const roomWorld = { key:'room', useWorldState: useRoomTransform, Scene: RoomScene, Overlays: RoomOverlays, ItemSelector: LayoutPresetSelector };`
- [ ] `V3Flow.jsx`: `import { roomWorld } from "@/app/register/journey/worlds/room"; export default () => <RegisterJourney world={roomWorld} />;`
- [ ] Verify: `npx eslint src/app/register` clean; `/register/v3` → 200 + real title; dev log clean; owner reviews on :3003. Commit: `feat(register-3d): V3 now renders the Transforming Room world`.

---

# PHASE 3 — Retire + cross-cutting polish

### Task 3.1: Retire the dead house-shim + old selectors
- [ ] Once V2=tower and V3=room are owner-approved, delete `worlds/house/**`, `variants/v2/FramesSelector.jsx`, `variants/v3/RoomModelsSelector.jsx`, and any `scene/objects/*` only the house used (Exterior/Interior/Destinations/Desk) IF unused by the new worlds (`git grep` each before deleting; keep `Person`, `EmirateLandmarks`, `EmirateBrowser`, `shared.jsx`, salvaged materials). Keep `JourneyFallback` (shared). Verify both routes still 200. Commit.
- [ ] (If the owner wants to keep the house as a third reference world, SKIP this task and just leave it unwired.)

### Task 3.2: Cross-cutting pass (both worlds)
- [ ] Mobile: confirm all 3 item options reachable on a 360px viewport (pull `itemSlots` inward); device-orientation parallax alive (reuse `useDeviceMotion`).
- [ ] Reduced-motion: every elevator/transform/orbit/parallax snaps; verify with the OS flag.
- [ ] E5: force a backend error (offline) at email + at form and confirm the world stays on the same step with the alert (no advance) in BOTH worlds.
- [ ] Copy: clean natural Arabic + English for every label (`translate(...)`); no floating text; labels on objects. Add any new dictionary keys under `register/data/dictionary/`.
- [ ] Capability fallback: force low-tier/reduced-motion and confirm `JourneyFallback` renders the same flow for both routes.
- [ ] Verify lint + both routes 200 + commit: `polish(register-3d): mobile, reduced-motion, E5, copy, fallback pass`.

---

## Self-Review (completed against the spec)

- **Spec coverage:** §2 split (world-agnostic shell + two worlds) → Phase 0 + worldContract + Phases 1/2. §3 Tower beats → Tasks 1.1–1.6. §4 Room beats → Tasks 2.1–2.5. §5 cross-cutting (continuity, no-floating-text, deliberate-confirm, E5 error-returns-to-step, mobile, fallback, reduced-motion, RTL) → guardrails + Task 3.2. §6 file structure → File Structure section. §7 phased build → Phases 0–3. §9 confirmed decisions (first-person, Kaaba, paper form) → reflected in Tower/Room beats + reused `JourneyForm`.
- **Placeholder scan:** no "TBD/TODO/handle edge cases". The 3D geometry tasks intentionally specify responsibility + contract + beats rather than full final Three.js source, because (per the spec + verification model) there is no GPU here and the visual dressing is owner-iterated on :3003 — this is the project's reality, not a deferred decision. The engineering seams (worldContract, ctx, shell refactor, handler/enum preservation, continuity mechanism) ARE fully specified.
- **Type consistency:** the `ctx` keys are defined once (canonical section) and referenced verbatim in 0.1, 0.3, 0.4, and Phases 1–2. World members are `{ key, useWorldState?, Scene, Overlays, ItemSelector }` everywhere. `scenePhase`/`beat` are the world-local names; `logicalPhase` is the shell's. Selector uses the existing `selectorContract` (`setArmed`/`onConfirm`/`slots`/`baseScale`).

## Execution note (visual iteration)
Phase 0 is a mechanical, verifiable refactor — fully gated by lint + routes-200 + behavior-unchanged. Phases 1–2 build 3D scene graphs whose proportions, lighting, and timing the owner tunes live on `:3003` (no GPU here). Build each world's structure to the contract first (routes green), then iterate the look with the owner.
