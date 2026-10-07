# `/register` 3D — Round 2 revision (authoritative requirements)

**Date:** 2026-06-13 · **Status:** approved direction, building
**Builds on:** `2026-06-13-register-3d-variants-design.md` (architecture, core APIs, backend
contract — all still hold). This doc captures the owner's round-2 feedback verbatim-in-intent
and is the authoritative checklist. Where this conflicts with round 1, THIS wins.

> Hard limit on the builder's side: nobody here can see WebGL visuals (no headless GPU). We
> verify routes (HTTP 200, not the 404 page), lint, compile, and requirement-by-requirement
> code adherence. Visual polish/"feel" is the owner's call → expect iteration. Build modular.

## Unchanged hard constraints (from round 1)
- Touch only `src/app/register/**`. Preserve the EXACT backend contract & flow state machine
  (`useLeadFlow`: email → location → item → form; `useLeadForm` two-step submit → Stripe).
  JS/JSX only, no barrels, `@/app/register/...`, reuse `theme/colors.js` + `translate`/`t`,
  honor reduced-motion, mobile-first. Dev server runs on **:3003** (do NOT `next build`; new
  *module* files hot-reload — only brand-new *route folders* need a restart, and v1/v2/v3
  route folders already exist). Verify with `npx eslint <your folder>` + `curl :3003`.

## The three variants — NEW definitions (round 2)
- **V1 `/register`** — the photographic CSS-3D "Living Cards" flow. ACCEPTED; needs the 3 fixes
  below. No WebGL journey.
- **V2 `/register/v2`** — the **cinematic journey** (shared) with the **PICTURE-FRAMES** item
  selector.
- **V3 `/register/v3`** — the **same cinematic journey** with the **WINDOWS** item selector.

V2 and V3 share ONE journey engine; they differ ONLY in the item-selection metaphor. Build the
journey once in `src/app/register/journey/` and plug a selector into it.

---

## A. V1 fixes (photographic flow)
1. **Form must NOT be white / boxed.** Remove the frosted light wash AND the per-field
   light backing boxes. The form's background stays **the IMAGE** (the chosen item photo,
   lightly treated only as much as legibility needs — NOT white). Just the **inputs** sit over
   the image (legible: e.g. translucent/glass inputs or a subtle local shade behind text only).
   "يكفي الinputs" — inputs are enough; the photo is the background.
2. **Cleaner, WIDE background images.** Current images are narrow portrait (525×750) and look
   bad full-screen. Source **wide/landscape**, clean, premium interior images (prefer existing
   landscape project photos if any; otherwise free CC0/Unsplash/Pexels, compressed WebP, ~1920w)
   so the backdrop reads full-bleed, not letterboxed.
3. **Rework the animations "quite a lot."** The intro/parallax/card/form motion needs a clear
   step up in polish and naturalness (smoother, more premium easing, better staging). Treat
   this as a real pass, not a tweak.

---

## B. The shared cinematic JOURNEY (V2 + V3) — `src/app/register/journey/`

Overarching feel: **everything is continuous natural movement — like a person actually walking
through a space.** NEVER cut-to-veil-then-show-a-different-scene. Transitions = the camera/the
person moving. (Owner: "الترانسيشن وحش… عاوزه كإن حد بيتحرك عادي، مش يقفل ويظهر ترانسيشن مختلف.")

### B0. Copy / labels
- The current labels are bad ("ادخل الى تصميمك؟" etc.). Write **clean, natural** Arabic + English
  copy. **NEVER float text in space** — every label belongs ON its object (carved/printed on the
  frame, window, door, sign), or as a tasteful anchored caption tied to the object, never drifting.

### B1. Exterior + door (email step)
- A **nice** house exterior — the current one is "ugly and too bright/washed-out." Make it
  beautiful: warmer/richer materials + lighting, and **add context (a garden / landscaping /
  path / plants / sky)** so it reads as a real, inviting home, not a bright blank box.
- **Guide the user to click the door to enter.** On click, the camera **moves very close to
  the door** (as if walking up to knock) — a continuous push-in, not a cut.
- A **hand appears and knocks**; an **email input emerges from the door's peephole** (العين
  السحرية). User types email → presses **Next**.
- **Next opens the door** (the hand opens it) and the camera **walks through** into the interior
  — continuous.

### B2. Interior + location pick (location step)
- **Do NOT show a flat project PHOTO as the backdrop** (the current v3 does this — rejected).
  Build a **real 3D interior**: a furnished room (floor, walls, basic furniture/أساس), lit.
- The user can **move around / look around** the space (guided), going here and there.
- **Guidance to pick location by walking:** go **LEFT → a door → "Outside UAE"**; go **RIGHT →
  a staircase up → "Inside UAE."** Choosing = walking that way (continuous camera).
  - **Outside UAE:** through the door, walk outside, arrive at a stylized landmark (the Kaaba —
    black cube + gold band — kept, but integrated continuously + made nicer/contextual).
  - **Inside UAE:** up the stairs into a serene **"dream room" open to the sky.**
- Maps to `handleLocationClick("OUTSIDE_UAE" | "INSIDE_UAE")`.

### B3. Item selection — PLUGGABLE selector (the V2/V3 difference)
Requirements that apply to BOTH selectors:
- Show **all three** options at once (current bug: only ONE shows on mobile AND desktop). Each
  must be at least partially visible and reachable (move/scroll/rotate between them).
- **Label + a related image are ON the object itself** (drawn/printed on the frame or window) —
  NEVER floating text.
- **Deliberate confirmation — no accidental selection.** A stray click must NOT select. Require
  an intentional gesture to confirm.
- On confirm → a **continuous** transition into that choice. Maps to
  `handleLeadItemClick("APARTMENT" | "CONSTRUCTION_VILLA" | "PART_OF_HOME")`.

- **V2 selector = FRAMES:** a hand + **three picture frames**; each frame shows the item's image
  + its name printed on the frame. Picking a frame (a deliberate grab/lift/turn) confirms.
- **V3 selector = WINDOWS:** **three windows**; each has its image/label on it; to confirm a
  choice the user must **lift the window fully up** (a deliberate drag-to-open, so a mis-click
  never selects). Fix the "only one window visible" layout.

### B4. Emirate step (NEW dedicated step — INSIDE_UAE only, BEFORE the form)
- Owner: the emirate选择 must come **before** the form, **after** the item selection, as its own
  step (currently it's just a dropdown in the form — wrong).
- Show **3D objects, one per emirate**, that the user can **flip/browse through**, pick one →
  **continuous transition**. Labels ON the objects.
- Capture the choice into the form state (`form.setFormData`/emirate) so the form no longer needs
  to ask for the emirate. (OUTSIDE_UAE keeps the country field in the form as today.)

### B5. Form (journey) — over the scene, NOT boxed
- Same rule as V1: **no white, no paper, no per-field boxes — just inputs over the scene.** The
  background is the 3D space the user arrived in (e.g. seated at a desk). Sectioned (Contact /
  Project), a tasteful **page-turn / "Next"** between sections, pen-trace on focus (keep — it's
  liked), and **auto-overflow scroll** for long forms.
- Submit → `form.handleSubmit` (unchanged two-step backend) → watch `isPaying` → continuous
  "preparing payment" beat → Stripe → `/register/checkout|success|cancel` (shared, already built).

### B6. Cross-cutting
- **Continuous transitions everywhere** (no hard veil cuts).
- **Mobile:** device-orientation / gentle auto-motion so it feels alive + navigable on touch.
- **Capability fallback:** WebGL-missing / low-end / reduced-motion → a graceful non-WebGL
  fallback of the SAME flow (reuse the photographic card mechanic). Never a crash, never the old
  blocky look.
- Builder has **full latitude** to change everything, use other images, and create new objects.

---

## C. Build plan (architecture)
- `src/app/register/journey/` — the shared journey engine: exterior+garden, door/knock/peephole
  email, door-open + walk-in, furnished interior with movement, LEFT/RIGHT location pick, Kaaba /
  dream-room, emirate 3D step, form-over-scene, continuous camera choreography. Exposes a clean
  **item-selector slot** (a prop/render-slot) + a documented interface contract.
- `src/app/register/variants/v2/` — provides **FramesSelector** + assembles the journey;
  `/register/v2/page.jsx` renders it.
- `src/app/register/variants/v3/` — provides **WindowsSelector** (lift-to-confirm) + assembles
  the journey; `/register/v3/page.jsx` renders it.
- Salvage/refactor the existing procedural work in `src/app/register/variants/v3/*` (JourneyWorld,
  Objects, DeskForm, PenTraceField, etc.) into `journey/` as the starting point — improve per the
  fixes above; don't reinvent what's reusable.
- `journey/` is frozen once built; v2/v3 only supply their selector + route + assembly (disjoint).

## D. Verification (what we CAN check)
Per route (`/register`, `/register/v2`, `/register/v3`): HTTP 200 on :3003 (and the `<title>` is
the real register title, NOT "404: This page could not be found"), `npx eslint` clean, no
compile/SSR errors, and a requirement-by-requirement read of the built code against this doc.
Visual/feel verification is the owner's (no GPU here) — deliver modular + iterate.

---

## E. Round 3 — V2/V3 refinements (owner feedback on the first journey build)

V1 is DONE (do not touch). These apply to the SHARED journey (`src/app/register/journey/`)
and the two selectors (`variants/v2` frames, `variants/v3` windows).

### E1. Lighting (HIGH PRIORITY — looks unprofessional now)
- The 3D lighting is **too white/washed — details aren't visible.** Make it **professional:
  warmer, more contrast, visible detail/shadow**, gallery-grade. Not a flat bright wash.
- **There is a FLASH bug:** on first load the scene looks nice WITHOUT the bright lighting,
  then the bright lighting **appears suddenly** a moment later. Diagnose the root cause
  (async `Environment`/HDRI load, Bloom/postprocessing kicking in late, the capability gate
  swapping the 2D fallback → WebGL after detection, or a light intensity ramp) and fix it so
  the FINAL good lighting is present from the first painted frame — no pop/flash.

### E2. Item selector — size + "approach" interaction (both V2 frames & V3 windows)
- The frames/windows are **WAY too big.** Make them **smaller** and present all THREE **at a
  distance** so the user sees all of them at once.
- On selecting one: the camera/figure **walks UP and approaches** that object (continuous,
  natural movement), it enlarges/opens, and a **BACK affordance** appears to return to the
  three. (This camera/approach + back behavior is journey-level; the selector supplies the
  object meshes + a deliberate confirm.)
- This is mostly the journey's job (positioning the 3 selector objects far + the approach/back
  camera). The selector defines the OBJECT look + the deliberate-confirm gesture.

### E3. V3 windows = real WINDOWS (no images)
- **Remove the photo from the V3 windows** so each reads as an actual window (frame + glass +
  light through it), label only. (V2 frames KEEP image + name printed on the frame — a picture
  frame naturally holds an image.)

### E4. Continuous, fully-detailed entry (no flush/sudden cuts) + arrows
- Entering must be a **complete continuous movement**, never a cut that suddenly reveals the
  next scene:
  - **Door:** the hand OPENS the door → you SEE yourself walking in → the room gradually
    APPEARS. Same for the second (outside) door.
  - **Stairs:** it feels like you are CLIMBING the stairs → arrive at a room that OPENS → you
    enter → the space reveals.
- **Directional ARROWS** above each path (the door, the stairs) indicating where each leads,
  for wayfinding.

### E5. Loading + error on backend calls
- During the backend calls (email register; complete-register/pay) show a **loading state**
  (something is happening). **On error, return the user to the SAME step** — they must NOT be
  able to advance to the next step when a call errors. (Reuse the flow's existing loading/alert;
  ensure the journey does not optimistically advance past a failed call.)
