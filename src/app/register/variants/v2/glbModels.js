// ─────────────────────────────────────────────────────────────────────────────
// V2 "WebGL Gallery" — local GLB model manifest + ATTRIBUTION.
//
// core/assets.js intentionally leaves `assets.models.*` null (and core is FROZEN,
// so V2 cannot edit it). This V2-scoped manifest points at the real `.glb` files
// downloaded into `public/register/assets/v2/`. Paths are served statically from
// `/public`; there are NO external requests at runtime.
//
// Models (downloaded from the Khronos glTF-Sample-Assets repo, verified HTTP 200):
//
//   • GlamVelvetSofa.glb  (~3.0 MB)  — PRIMARY hero (an interior sofa).
//       License: CC BY 4.0 International.  © 2021 Wayfair, LLC.
//       Credit:  "Eric Chadwick for Everything".  (Attribution REQUIRED — see
//                public/register/assets/v2/ATTRIBUTION.txt and the on-screen
//                credit line rendered by the gallery.)
//
//   • SheenChair.glb      (~4.1 MB)  — SECONDARY piece (a velvet chair).
//       License: CC0 1.0 Universal (public domain).  © 2020 Wayfair, LLC.
//       Credit:  "Eric Chadwick for Everything"  (not required; noted for record).
//
// If a model ever 404s / fails to decode, ModelStage swaps to the V2 LitFallback
// (a clean lit brand gradient panel — never the old blocky boxes), and the flow
// keeps working. The capability gate (detectCapability) drops the whole WebGL
// path to the Card3D fallback on low-end / reduced-motion devices.
// ─────────────────────────────────────────────────────────────────────────────

const V2_ASSET_BASE = "/register/assets/v2";

export const v2Models = {
  // The single persistent hero object the camera flies around as choices are made.
  hero: `${V2_ASSET_BASE}/GlamVelvetSofa.glb`,
  // A secondary model some stages reframe to (kept for variety; the gallery can
  // swap the active model per stage, covered by the DOM cross-fade veil).
  accent: `${V2_ASSET_BASE}/SheenChair.glb`,
};

// Short, human-readable attribution rendered as a tiny on-screen credit so the
// CC-BY requirement (GlamVelvetSofa) is satisfied in the UI itself.
export const v2ModelCredit = "3D: Wayfair / Eric Chadwick · CC BY 4.0 · CC0";

export default v2Models;
