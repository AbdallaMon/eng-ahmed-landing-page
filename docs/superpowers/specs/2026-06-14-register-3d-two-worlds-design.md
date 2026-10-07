# `/register` 3D — Two Distinct Worlds for V2 & V3 (authoritative design)

**Date:** 2026-06-14 · **Status:** approved direction, ready to plan
**Supersedes (for V2/V3 only):** the "one shared journey engine, differ only by item-selector"
decision in `2026-06-13-register-3d-round2-revision.md` (sections B/C). V1 is unchanged and
out of scope. The **backend/flow contract** from round 1 still holds exactly.

> Owner verdict (2026-06-14): V2 and V3 currently feel like the SAME thing because they ARE one
> engine (same house, door, stairs, room) differing only in the item picker (frames vs maquettes).
> Owner wants **two genuinely different immersive 3D worlds**, both continuous (no black screen
> between steps), both with real detail (rooms that look like rooms, real doors), both showing
> motion. Same form result + same step order. Chosen direction: **two different worlds, both
> immersive** → **V2 = THE TOWER** (complex, vertical) · **V3 = THE TRANSFORMING ROOM** (simpler,
> one space). Confirmed defaults: **first-person** perspective, **Kaaba** kept for OUTSIDE_UAE,
> **paper + signing pen** form kept (per [[register-round4-direction]]).

> Hard constraint on the builder side: nobody here has a headless GPU — we CANNOT see the WebGL
> visuals. We verify routes (HTTP 200 with the real `<title>`, not the 404 page), `npx eslint`
> clean, no compile/SSR errors, and a requirement-by-requirement read of the code against this
> doc. Visual "feel" (lighting, proportions, timing) is the owner's call → build modular, expect
> iteration.

---

## 1. Unchanged hard constraints (the immovable contract)

Touch only `src/app/register/**`. Preserve EXACTLY:

- **Flow state machine** (`component/leadSelection/useLeadFlow.js`): ordered steps
  `designIntro → email → location → item → form`, with an **emirate sub-step before the form when
  `location === "INSIDE_UAE"`**.
  - `handleEmailSubmit(email)` → POST `client/new-lead/register?lng={lng}` → `data.id` (leadId).
  - `handleLocationClick(value)` with value ∈ **`"INSIDE_UAE" | "OUTSIDE_UAE"`**.
  - `handleLeadItemClick(value)` with value ∈ **`"APARTMENT" | "CONSTRUCTION_VILLA" | "PART_OF_HOME"`**.
  - `handleBack()` (staged exit-then-swap), `handleReset()` (clear + reload).
  - Deep-linking via `?leadId=`, `?email=`, `?location=`, `?item=`, `?step=` must keep working.
- **Form + payment** (`core/useLeadForm.js`): `formData = { name, phone, emirate, email, file,
  clientDescription, country, discoverySource }`. Two-step submit: (1) `client/new-lead/register?lng=`
  only if no email captured, (2) `client/new-lead/complete-register/{leadId}`. Then `phase="paying"`
  → `client/pay` → `window.location.href = {url}` (Stripe). Emirate is captured in the pre-form
  emirate step via `form.setFormData({ emirate })` (INSIDE_UAE only); OUTSIDE_UAE keeps the
  `country` field in the form.
- **Capability gate** (`core/webgl/capability.js`): `detectCapability()` → use 3D only when
  `use3D && tier !== "low"`; otherwise render the photographic **`JourneyFallback`** (Card3D, no
  WebGL). Honor `prefers-reduced-motion` everywhere.
- **Theme + i18n**: colors from `theme/colors.js`; copy via `useLanguage()` → `translate(key)`,
  `lng`. No new providers.
- **Conventions**: JS/JSX only, no barrels, `@/app/register/...` imports, mobile-first. Dev server
  is **`next dev -p 3003`** — do NOT `next build`. New *module* files hot-reload; the `v2`/`v3`
  route folders already exist. Verify with `npx eslint <folder>` + `curl :3003`.
- **Overlays use inline `style`, never MUI `sx`** for full-screen layers (an emotion class can
  inject a frame late → flash). Per [[register-v1-flash-and-back]].

Everything below changes only the **presentation** (the 3D world + choreography), never the data.

---

## 2. The split: one shell, two worlds

Today `JourneyShell` hardcodes ONE house journey (exterior → interior → item → emirate → desk) and
both variants reuse it, differing only in the plugged selector. We invert that:

- **`JourneyShell` becomes world-agnostic.** It still owns the frozen `useLeadFlow`, the single
  lifted `useLeadForm`, the capability gate, the emirate sub-step, all DOM overlays, loading/error,
  and the single persistent `<Canvas>`. It no longer knows about houses, elevators, or rooms.
- A **World** module supplies the scene + camera choreography + anchors + its own item selector.
  Two disjoint worlds: `journey/worlds/tower/` (V2) and `journey/worlds/room/` (V3).
- `V2Flow` mounts the Tower world; `V3Flow` mounts the Room world. That one line is the only
  variant-level difference, but now it swaps the ENTIRE experience, not just a picker.

### 2.1 The World interface (new contract — `journey/worldContract.js`)

A world is a plain object the shell consumes:

```
World = {
  key: "tower" | "room",

  // R3F scene graph, mounted inside the shared <Canvas>. Receives a journey context:
  //   { phase, branch, subPhase, armedValue, activeValue, pointer, palette, reduced,
  //     anchorStore, registerAnchor }
  // phase ∈ "email" | "location" | "item" | "emirate" | "form"
  // branch ∈ null | "INSIDE_UAE" | "OUTSIDE_UAE"
  Scene,                       // React component

  // The item selector (per-world): renders 3 option objects + the arm-then-confirm gesture.
  // Follows the EXISTING selectorContract (options, slots, onConfirm, setArmed, ...).
  ItemSelector,                // React component

  // Camera + transition choreography, built on useJourneyCamera primitives (flyTo/flyPath).
  // Called by the shell when phase changes; plays a CONTINUOUS move (never a cut), resolves
  // when settled. The world decides HOW (elevator travel vs in-place dolly).
  choreograph(fromPhase, toPhase, ctx): Promise<void> | void,

  // Named anchor ids the world exposes so DOM overlays sit ON objects (no floating text):
  //   { email, location: {inside, outside}, item: [...], emirate, form, captions: {...} }
  anchors,

  // Optional per-world copy overrides (label keys); defaults come from the shared dictionary.
  copy,
}
```

The shell maps `flow.step → phase`, manages the emirate sub-step generically, and on every phase
change calls `world.choreograph(...)`. The world plays its own continuous transition and reports
back; the shell then settles overlays onto the new anchors. **No world ever touches flow/form
state directly** — it only calls the handlers the shell passes (`onEmail`, `onLocation`, the
selector's `onConfirm` → `handleLeadItemClick`, `onEmirate`, form submit).

### 2.2 What is reused vs built new

**Reused as-is (world-agnostic, salvage from current `journey/`):**
- `useJourneyCamera.js` (GSAP flyTo/flyPath), `useProjectedAnchor.js` (3D→DOM bridge),
  `useDeviceMotion.js` (tilt/pointer parallax).
- `<Canvas>` setup + synchronous lighting + tone mapping + the no-async-HDRI fix (E1).
- `overlay/JourneyForm.jsx` (paper + signing pen) + `PenTraceField.jsx`, `DoorEmail.jsx`
  (email input), `CaptionTag.jsx`, `PayingBeat.jsx`, `Breath.jsx`, `EmirateControls.jsx`.
- `EmirateBrowser.jsx` + `objects/EmirateLandmarks.jsx` (the 7 distinct landmarks) — restaged per
  world (tower terrace / room console) but reused.
- `objects/Person.jsx` (used for the fallback + any third-person beat), shared materials helper.
- `SelectorSlot.jsx` + `selectorContract.js` (arm-then-confirm seam).
- `JourneyFallback.jsx` (photographic Card3D) — the shared non-WebGL fallback for BOTH worlds.
- `core/useLeadForm.js`, `useLeadFlow.js`, `core/webgl/capability.js` — untouched.

**Built new:**
- `journey/worldContract.js` (the interface above) + `JourneyShell` refactor to consume a `world`.
- `journey/worlds/tower/**` (V2) and `journey/worlds/room/**` (V3) — scene objects + choreography
  + per-world selector.

**Retired (superseded, after the two worlds work):** the linear-house scene assembly only used by
the old shared journey — `objects/Exterior.jsx`, `objects/Interior.jsx`, `objects/Destinations.jsx`,
`objects/Desk.jsx` as a single walk-through, and the house-specific sub-phase code in `JourneyShell`.
Salvage their reusable primitives (lighting, stair geometry, materials) into the worlds first.

---

## 3. V2 — THE TOWER (complex, vertical, immersive)

**Core metaphor:** a glass elevator that **rises**. Every step transition IS the elevator
traveling — the city slides past the glass, doors open onto the next floor. The vertical motion is
the continuous through-line, so there is never a black load screen. First-person (camera = you).

### Beat-by-beat (mapped to the fixed steps)

| Step | Scene | Continuity / motion |
|---|---|---|
| `designIntro` | Establishing crane shot up a warm glass tower facade at golden hour; settle at the entrance. | ~1s camera crane, then rest. |
| `email` | Building entrance: a glass **intercom panel** by the door. Email input (DOM) sits ON the panel (projected anchor). Submit → glass doors slide open → you step into the glass elevator. | Doors slide; camera dollies in. No cut. |
| `location` | Inside the rising elevator: a brass **floor panel** with two lit destinations — «داخل الإمارات» (a floor opening on a UAE skyline) / «خارج الإمارات» (a floor opening on the Kaaba plaza). Labels etched on the buttons. Deliberate press (no stray select) → `handleLocationClick`. | Elevator **travels** to the chosen floor (vertical camera move, city parallax past glass). |
| `item` | Doors open onto a **showroom floor**: three model units behind glass (APARTMENT / CONSTRUCTION_VILLA / PART_OF_HOME), each fully furnished, with name + image etched on its glass. All three visible down the corridor. Walk up to one; **push its door open / step in** = deliberate confirm → `handleLeadItemClick`. | Walk the corridor (camera flyPath); chosen unit's door opens, camera enters. |
| `emirate` *(INSIDE_UAE only)* | Doors open onto a **panoramic sky-terrace**: the 7 emirate landmarks stand along the horizon as a skyline. Browse + pick (reuse `EmirateBrowser`/`EmirateLandmarks`). | Terrace reveal; turntable/browse. |
| `form` | Doors open onto the **penthouse office**: a desk at a floor-to-ceiling window, city far below. The **paper form** rests on the desk; the pen signs. Submit → paying beat → Stripe. | Settle at desk; paper form overlay over the scene. |

**Selector (V2) = model units.** Three glass-walled furnished mini-apartments on the showroom
floor (replaces "frames"). Arm = approach (camera walks up, siblings dim, BACK affordance appears).
Confirm = push the unit's door / step across the threshold (deliberate gesture). All three are
visible at the overview station.

**How V2 fixes the complaints:** elevator travel = transition (no black); every floor is fully
dressed (lobby, model units, terrace, penthouse) = real detail; real elevator + unit doors that
open; vertical motion + corridor walking = visible movement; a multi-space vertical journey =
nothing like V3.

---

## 4. V3 — THE TRANSFORMING ROOM (simpler, one space, immersive)

**Core metaphor:** ONE room that **builds and furnishes itself around you**. The camera never
leaves the room (gentle orbit/parallax only), so there is literally no opportunity for a cut —
every transition is furniture/walls/light animating in place. Thematically it IS the product:
booking an interior-design service, watching a room get designed in front of you. First-person.

### Beat-by-beat (mapped to the fixed steps)

| Step | Scene | Continuity / motion |
|---|---|---|
| `designIntro` | You open inside a **bare concrete shell** (unfinished room), one work-lamp, dust motes in the light. The entrance door is the focal point. | Slow breathing camera; nothing cuts. |
| `email` | A **drafting/intercom panel** by the door. Email input (DOM) ON the panel. Submit → the room "wakes": lights warm up, a furnishing pulse begins. | Light bloom + first assembly beat. |
| `location` | The room's big **window** is covered/frosted. Choosing location reveals the view: «داخل الإمارات» (UAE skyline beyond) / «خارج الإمارات» (Kaaba plaza beyond). The room's palette shifts to match. Two affordances flank the window; deliberate select → `handleLocationClick`. | Frosted glass dissolves to the view; palette cross-fades in place. |
| `item` | The room **reconfigures** into the chosen type: furniture flies into one of three layouts — APARTMENT (compact modern) / CONSTRUCTION_VILLA (grand, double-height) / PART_OF_HOME (a single feature corner). Browse the three (room morphs between them); confirm one → furniture locks solid. | Furniture assembly animation; deliberate confirm → `handleLeadItemClick`. |
| `emirate` *(INSIDE_UAE only)* | A model landmark on the console / a framed piece on the wall cycles the 7 emirates; pick one. | In-room browse; no travel. |
| `form` | The room is now fully designed & furnished; a writing desk holds the **paper form**; you sign. Submit → paying beat → Stripe. | Settle on the desk; form overlay. |

**Selector (V3) = layout presets.** The room morphs between three furnished arrangements (replaces
"room maquettes/windows"). Arm = the room previews that layout (siblings = ghosted alternatives).
Confirm = a deliberate "choose this layout" gesture → furniture locks. All three are reachable by
browsing.

**How V3 fixes the complaints:** the camera never leaves → impossible to cut to black; the room
goes from bare shell → fully furnished = maximum detail and the most literal "this is a real
room"; the transform IS the movement (plus an optional short walk between zones if owner wants
locomotion); the entrance door + a reveal door/curtain on the type-transition; one transforming
space = a completely different logic from V2's vertical journey.

---

## 5. Cross-cutting requirements (both worlds)

- **Continuous transitions, never a veil cut.** One persistent `<Canvas>`; synchronous lighting on
  frame 0 (no async HDRI/Environment pop — keep the E1 fix); the next phase's meshes **pre-mount**
  behind the moving camera (Tower: behind the closed doors during travel; Room: nothing leaves) so
  the new scene is already there when revealed.
- **No floating text.** Every label lives ON its object (etched on the elevator button, the unit
  glass, the window frame, the desk) or as a `CaptionTag` anchored to it via `useProjectedAnchor`.
- **Deliberate confirm.** A stray click/tap never selects a location, item, or emirate — each
  needs an intentional gesture (press, step-through, lock-in). Arm-then-confirm per `selectorContract`.
- **Loading + error returns to the SAME step** (E5). While a backend call runs (email register;
  complete-register/pay), show the flow's loading state; on error, surface the alert and DO NOT let
  the world advance to the next phase. The world only advances when the shell confirms success.
- **Mobile.** Touch-navigable; gentle auto-motion / device-orientation parallax so it feels alive
  (reuse `useDeviceMotion`). All three item options reachable on small screens (pull slots inward).
- **Capability fallback.** WebGL-missing / low tier / reduced-motion → the shared `JourneyFallback`
  (photographic Card3D) for the SAME flow. Never a crash, never a blocky look.
- **Reduced-motion.** Every camera move / assembly / parallax / particle snaps or disables.
- **RTL / bilingual.** Arabic default; clean natural Arabic + English copy; arrows/anchors RTL-aware.

---

## 6. File structure (target)

```
src/app/register/journey/
  JourneyShell.jsx          # world-agnostic orchestrator (refactor)
  worldContract.js          # NEW: the World interface (§2.1)
  JourneyWorld.jsx          # shared <Canvas> + lighting + ProjectorInScene + mounts world.Scene
  useJourneyCamera.js       # reused
  useProjectedAnchor.js     # reused
  useDeviceMotion.js        # reused
  SelectorSlot.jsx          # reused (arm-then-confirm seam)
  selectorContract.js       # reused
  JourneyFallback.jsx       # reused (shared non-WebGL fallback)
  overlay/                  # reused: DoorEmail, JourneyForm, PenTraceField, CaptionTag,
                            #   PayingBeat, Breath, EmirateControls, (LocationWayfinder generalized)
  scene/EmirateBrowser.jsx  # reused (restaged per world)
  scene/objects/            # EmirateLandmarks, Person, shared materials reused;
                            #   Exterior/Interior/Destinations/Desk retired after migration
  worlds/
    tower/                  # NEW (V2): TowerScene, stations/choreography, Lobby, GlassElevator,
                            #   City, ModelUnitsSelector, ShowroomFloor, SkyTerrace, Penthouse
    room/                   # NEW (V3): RoomScene, in-place choreography, ConcreteShell,
                            #   FurnitureSets (3 presets), ViewWindow, EmiratePiece, RoomDesk

src/app/register/variants/v2/V2Flow.jsx   # mounts Tower world
src/app/register/variants/v3/V3Flow.jsx   # mounts Room world
src/app/register/{v2,v3}/page.jsx          # unchanged route entries (Suspense wrapper)
```

---

## 7. Build plan (phased, each phase leaves routes green)

0. **Shared toolkit extraction.** Add `worldContract.js`; refactor `JourneyShell` to take a `world`
   prop; keep the current house as a temporary default world so `/register/v2` and `/register/v3`
   still 200. Verify (eslint + curl + title).
1. **V2 Tower world.** Build `worlds/tower/**`; wire `V2Flow`. Verify `/register/v2`.
2. **V3 Room world.** Build `worlds/room/**`; wire `V3Flow`. Verify `/register/v3`.
3. **Retire + polish.** Remove the superseded house assembly; cross-cutting pass (mobile,
   reduced-motion, loading/error-returns-to-step, copy/labels, RTL). Verify both routes.

Each phase: `npx eslint src/app/register` clean, no compile/SSR errors, route returns 200 with the
real register `<title>`. Visual polish iterates with the owner (no GPU here).

---

## 8. Verification (what we CAN check)

Per route (`/register/v2`, `/register/v3`): HTTP 200 on `:3003` with the real title (not
"404: This page could not be found"), `npx eslint src/app/register` clean, no compile/SSR errors,
and a requirement-by-requirement read of the built code against this doc (contract preserved,
continuity mechanism present, deliberate confirm, error-returns-to-step, labels-on-objects,
fallback intact). Visual/feel verification is the owner's.

## 9. Confirmed decisions & deferred items

- **Confirmed:** first-person perspective; OUTSIDE_UAE = Kaaba (kept); paper + signing-pen form
  (kept) in both worlds.
- **Deferred / owner's call (iterate):** exact lighting, proportions, and timing; whether V3 gets a
  short locomotion beat; precise model-unit / furniture-set dressing; final Arabic/English copy
  strings. None block the build.
