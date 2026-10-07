# `/register` 3D Redesign — Three Variants (V1 / V2 / V3)

**Date:** 2026-06-13
**Status:** Approved (design), incorporating user modifications
**Owner:** Abdalla
**Scope:** `src/app/register/*` only. The main site, root layout, RTL handling, and the
sibling `../ahmed-almobyd` project are NOT touched.

---

## 1. Goal

Replace the current `/register` experience (heavy React-Three-Fiber procedural "box"
scenes + framer-motion layout morphs + GSAP, three engines fighting) with a polished,
**GSAP-driven 3D experience**, built as **three independent style variants** the owner
can compare live and choose between:

- `/register` → **V1 "Living Cards"** — GSAP + CSS-3D, real photography, zero WebGL.
- `/register/v2` → **V2 "WebGL Gallery"** — React-Three-Fiber + real GLB models.
- `/register/v3` → **V3 "Hybrid"** — one WebGL hero object, then V1's card mechanic.

The owner picks the winner; the losing variants + the old code are then removed.

### Signature mechanic (identical intent in all three, different rendering)
- No flat background — the backdrop is part of a 3D space (depth / parallax).
- Cards ARE 3D objects (tilt, depth, layered parallax, sheen).
- Clicking a card → it flies toward the viewer / rotates and **unfolds to fill the
  screen**, becoming the next stage's backdrop.
- New elements (option cards, headings, fields) **enter as 3D objects** (depth + stagger),
  not flat fades.
- Text animates in (per-word / per-line, 3D rotate-in).
- Mobile-first; honors `prefers-reduced-motion`; **all animation is GSAP**.

---

## 2. What MUST be preserved (hard constraints)

Functionality, data, and the backend contract are unchanged. Only presentation/animation
changes.

### Flow (state machine — keep `useLeadFlow` semantics)
`designIntro` → `email` → `location` → `item` → `form` → (transition) → Stripe →
`success` | `cancel`.

- **Category is always `DESIGN`** (hardcoded `leadCategory = "DESIGN"`).
- **Locations:** `INSIDE_UAE`, `OUTSIDE_UAE` (`designLeadTypes`, images `/inside-uae.webp`,
  `/outside-uae.jpg`).
- **Items (design sub-types):** `APARTMENT`, `CONSTRUCTION_VILLA`, `PART_OF_HOME`
  (`designLead`). Prices: 15k / 60k / 30k (`DesignLeadPrice`).
- **Deep-linking** (`?leadId/?email/?location/?item/?step`) and **reset / start-over**
  behavior are preserved.

### Form fields (keep all)
name, phone (`mui-tel-input`, `matchIsValidTel`), email (only if not captured earlier),
emirate (INSIDE_UAE) OR country (else), `clientDescription` (optional, INSIDE_UAE),
`discoverySource` (required), file upload (optional, `uploadInChunks`), refund guarantee
note, submit CTA. Same validation messages (`validation.*`, `form.*`).

### Backend calls (EXACT, unchanged)
- Email capture: `POST client/new-lead/register?lng=` → `{ id }` (leadId). Accept 200/201.
- Complete: `POST client/new-lead/complete-register/{leadId}` with
  `{ ...formData, category, item, lng, location, url? }`. Accept 200/201.
- Pay: `POST client/pay` `{ clientLeadId, clientId, lng, test }` → `{ url } || { data.url }`
  → `window.location.href = url` (Stripe hosted checkout).
- Upload: `uploadInChunks` → `client/upload`.
- Returns to `/register/success` (paid) / `/register/cancel` (cancelled/error).

### Scoped infra (reuse as-is)
`RegisterProviders` (Language → Alert → Theme → Upload → LoadingToast), the gold/beige
theme (`theme/colors.js`), flat-dictionary i18n (`translate(key)` via `useLanguage`,
`t(key, lng)` for server), `lib/request.js`, `lib/upload.js`, `hooks/useGeoCountry`,
`component/forms/inputs/*` (CountrySelectField, FileUploadField). RTL is left exactly as
is (owner considers it correct — do NOT touch direction/RTL code).

---

## 3. User modifications applied (this round)

1. **Drop `/register/complete`** entirely (route, `CompleteRegisterForm`, the
   `mode="complete"` branch). The flow is register-only.
2. **Routes per the redesign:** `register`, `register/success`, `register/checkout`,
   `register/cancel` (cancel == error page).
3. **Checkout = thin transition, not a designed destination.** Since checkout is only a
   redirect to Stripe after the form, the **form submit triggers a smooth full-screen 3D
   "preparing payment" transition in-place, then performs the pay redirect** (no jarring
   route flash). `/register/checkout` is kept as a thin, resilient fallback (deep-links /
   direct hits) that renders the same minimal transition + auto-pay. A shared
   `usePayRedirect` helper holds the `client/pay` logic. Remove its dependency on the old
   `useRegister3D` context.
4. **Enhance the form; do NOT box it in a unique card / its own `Paper`.** The form is part
   of the 3D space: fields enter as objects and the form transitions in from the previous
   stage. No standalone elevated paper surface wrapping the whole form. (Individual inputs
   keep their MUI styling; the *wrapper* is not a floating card.)

---

## 4. Architecture — one shared core, three presentation shells

```
src/app/register/
  core/                         # SHARED logic/data — no variant-specific visuals
    useLeadFlow.js              # (reused; already variant-agnostic state machine)
    useLeadForm.js              # NEW: extracted form state + validation + submit→complete→pay
    usePayRedirect.js           # NEW: client/pay → Stripe redirect (used by form + checkout)
    fields/                     # NEW: presentation-agnostic field building blocks reused
                                #      by every variant's form (name/phone/email/emirate/
                                #      country/source/file/guarantee + the field list logic)
    cards3d/                    # NEW: GSAP CSS-3D primitives (used by V1 + V3)
      Card3D.jsx                #   generic tilt/sheen/parallax 3D card
      flyToFill.js             #   choreography: card flies toward viewer → fills screen
      AnimatedText.jsx          #   per-word/line 3D text reveal (GSAP, no extra dep)
    webgl/                      # NEW: R3F helpers (used by V2 + V3)
      capability.js             #   (reuse existing three/lib/capability.js logic)
      ModelStage.jsx            #   lit canvas + GLB loader + GSAP camera + fallback
  variants/
    v1/                         # "Living Cards" shell (route: /register)
    v2/                         # "WebGL Gallery" shell (route: /register/v2)
    v3/                         # "Hybrid" shell (route: /register/v3)
  shared-end/                   # NEW: themed success / checkout / cancel (used by all)
    SuccessView.jsx  CheckoutTransition.jsx  CancelView.jsx
  page.jsx                      # renders <V1Flow/>
  v2/page.jsx                   # renders <V2Flow/>
  v3/page.jsx                   # renders <V3Flow/>
  success/page.jsx  checkout/page.jsx  cancel/page.jsx   # use shared-end
  layout.jsx  providers/  theme/  data/  lib/  hooks/     # reused as-is
```

**Principle:** business logic, data, validation, and the backend contract live in `core/`
and are imported by all variants. A variant only decides *how a stage looks and animates*.
This is what prevents the previous "three-engine mess" and triplicate logic.

### Removal (after the core + V1 land and build is green)
- Delete the procedural WebGL system: `three/scenes/*`, `three/SceneDirector`,
  `three/SceneCanvas`, `three/Register3DProvider`, `three/cards/*`, `three/Effects`,
  `three/LightingRig`, `three/CameraRig`, `three/sceneRegistry`, `three/LeadSelection3D`,
  `three/fallback/*`, `three/Register3DContext`, and `three/lib/*` not reused by `core/webgl`.
- Delete the old framer-motion flow: `component/leadSelection/LeadSelectionFlow.jsx` and the
  framer-motion-only pieces it pulled in (StageBackdrop, ItemExpandPanel, DesignIntroCard,
  LocationSelect, ItemSelect, EmailCaptureCard as needed), plus `CompleteRegisterForm`.
- **framer-motion** dependency removed once no `/register` file imports it (the main site
  does not use it). Verify with a repo-wide grep before removing from `package.json`.
- Keep `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
  (used by V2/V3). Keep `gsap`.

---

## 5. The three variants

All consume `core/`. All: mobile-first, reduced-motion fallback (animations collapse to
simple fades/instant), RTL untouched, i18n via `translate`, brand gold/beige palette.

### V1 — `/register` "Living Cards" (GSAP + CSS-3D, no WebGL)
- A perspective stage (`perspective` + `preserve-3d`) with parallax depth layers
  (gradient + soft floating shapes + the active photo pushed back in Z) — the "3D
  background" with zero WebGL.
- `designIntro`: the word "تصميم/Design" + brand photo assemble in 3D, then recede to
  become the stage backdrop; email field set enters as objects.
- `email` / `location` / `item`: option cards are photographic `Card3D` panels floating in
  the scene; on select the chosen card **flies toward the viewer and unfolds edge-to-edge**
  (via `flyToFill`) into the next stage's backdrop; other cards scatter in depth; headings
  split and rotate in.
- `form`: NOT a boxed paper. The chosen item's surface becomes the field stage; fields rise
  in as depth-staggered objects; the item title morphs into a small inline chip; submit
  triggers the pay transition.
- Imagery: real interior photography (see Assets). Buttery on mobile.

### V2 — `/register/v2` "WebGL Gallery" (R3F + GLB models)
- One persistent, lazily-loaded `<Canvas>` (`core/webgl/ModelStage`). Real GLB models (not
  procedural primitives) represent choices (e.g. a stylized home / room / furniture piece),
  softly lit, slowly turning.
- On select: GSAP flies the camera toward/into the model, the model "opens", and the DOM
  stage (next options / form) forms around it; a DOM cross-fade veil covers any swap.
- Capability-gated: WebGL unsupported / low-end / reduced-motion → falls back to the V1
  Living-Cards rendering of the same stage (shared `core/cards3d`). Low DPR, adaptive perf.
- `form`: rendered as a glass DOM panel over the live scene (still NOT a floating card —
  edge-anchored, scene-integrated), fields stagger in.

### V3 — `/register/v3` "Hybrid"
- Intro: a single elegant WebGL hero object (signature piece, slow auto-rotate, pointer-
  reactive) from `core/webgl/ModelStage`. On first interaction it recedes/dissolves.
- Rest of the flow: identical to V1's `core/cards3d` mechanic (so it is cheap and reliable).
- Best balance of "real 3D object" wow + performance. Hero is capability-gated (skipped →
  pure V1 on weak devices).

---

## 6. Shared end-states (built once, used by all variants)

After Stripe, the browser returns to shared routes regardless of which variant started the
flow:
- **`/register/checkout`** (`CheckoutTransition`): minimal full-screen "preparing your
  secure payment…" 3D transition that auto-fires `usePayRedirect`. No boxed paper. Drives
  brand look. Falls back to `/register/cancel` if no leadId. (Primary path reaches Stripe
  straight from the form transition; this route remains for deep-links/safety.)
- **`/register/success`** (`SuccessView`): celebratory end-state, enhanced/animated, brand
  styling, existing success copy + any payment-status logic preserved.
- **`/register/cancel`** (`CancelView`): "payment cancelled / error" end-state with retry
  CTA back into the flow; existing copy preserved.

These match the brand but need not replicate each variant's specific 3D treatment.

---

## 7. Assets plan

- **Reuse existing real photography** (ideal for an interior designer): `/design.jfif`,
  `/inside-uae.webp`, `/outside-uae.jpg`, and the rich `/projects/project-3/*.jpg` set;
  `/eng/04.jpg` and the luxury interior video `/eng/social_…mp4` are candidates for a hero
  backdrop.
- **Download (CC0 only — Pexels/Pixabay/Khronos/Poly Pizza)** into
  `public/register/assets/` as needed:
  - 3 premium interior stills clearly representing **apartment**, **villa**, **room/part-of-
    home** (item cards currently have no images).
  - 1–3 small CC0 `.glb` models for V2/V3 (e.g. stylized house / room / furniture),
    compressed (target ≤ ~1.5 MB each, Draco if practical).
- **All assets local** under `/public`; no external requests at runtime.
- **Resilience:** if a download fails or a model 404s, fall back to existing photography
  (V1/V3 cards) or a clean single-form lit fallback (V2) — never a hard crash, never the
  old blocky look. Log what was substituted.

---

## 8. Tech & guardrails

- **GSAP** is the only animation engine across all variants (timelines, `quickTo`,
  stagger; a tiny custom word/line splitter for `AnimatedText` — no paid SplitText).
- **framer-motion** removed from the new variants (and from `package.json` once unused).
- **WebGL (R3F)** only in V2/V3; lazy `dynamic(..., { ssr: false })`, capability detection,
  DOM veil over scene swaps, `PerformanceMonitor` step-down, single canvas.
- **Mobile-first**, `prefers-reduced-motion` honored everywhere, **RTL/direction code
  untouched**, i18n preserved (`translate`/`t`), gold/beige theme + Rubik font reused.
- **No TypeScript** (JS/JSX only). No barrels. `@/app/register/...` imports.
- Each variant ends with a green `npm run build` and no new lint errors beyond the known
  pre-existing `DotsLoader` warning.

---

## 9. Build order (delegated to agents; owner reviews on `localhost:3002`)

1. **Core (foundational, done first, verified):** extract `core/useLeadForm`,
   `core/usePayRedirect`, `core/fields/*`, `core/cards3d/*`, `core/webgl/*`; reuse
   `useLeadFlow`. Build stays green. (Old code not deleted yet.)
2. **V1 `/register`** (agent): full Living-Cards flow + enhanced un-boxed form + pay
   transition. → **owner reviews live on :3002**.
3. **V2 `/register/v2`** + **V3 `/register/v3`** (agents, parallel; V3 reuses `core/cards3d`).
4. **Shared end-states** themed (success/checkout/cancel) — can run alongside V1.
5. **Owner picks the winner** → remove losing variants + all old procedural/framer-motion
   code → remove `framer-motion` dep → final green build.

### Agent isolation
Variants live in disjoint folders (`variants/v1|v2|v3`, `v2/page.jsx`, `v3/page.jsx`); the
single shared `/register/page.jsx` is V1-only. Agents must ONLY create/modify files inside
their assigned variant folder + their own route file, and must NOT edit `core/` or other
variants. `core/` is frozen after step 1.

---

## 10. Open risks

- **CC0 GLB sourcing** can be flaky → resilience/fallback above; worst case V2 ships with a
  refined single elegant primitive composition (clean, lit, NOT the old blocky villa) until
  better assets are dropped in.
- **WebGL on low-end mobile** → strict capability gate + automatic fall-through to V1 cards.
- **Removing framer-motion** → must grep the whole repo first; only remove if `/register`
  was its sole consumer.
