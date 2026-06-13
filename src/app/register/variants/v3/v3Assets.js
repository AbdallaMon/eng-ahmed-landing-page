// Asset wiring for V3 "Hybrid".
//
// V3 reuses the shared `core/assets` photography helpers for the card flow
// (locations + items), and adds ONE local WebGL hero model that is unique to
// this variant. The model lives under `public/register/assets/v3/` (per the
// variant-isolation rule — V3 only downloads into its own asset folder).
//
// ── Hero model ───────────────────────────────────────────────────────────────
//   SheenChair.glb — a refined upholstered chair: an elegant "signature piece"
//   for an interior designer's intro.
//   Source : Khronos glTF-Sample-Assets
//            (Models/SheenChair/glTF-Binary/SheenChair.glb)
//   Author : Eric Chadwick
//   © 2020 Wayfair, LLC.
//   License: CC0 1.0 Universal (public domain dedication) —
//            https://creativecommons.org/publicdomain/zero/1.0/legalcode
//   Size   : ~4.1 MB (verified HTTP 200, valid `glTF` GLB magic). Lazily loaded
//            (next/dynamic ssr:false) and ONLY when WebGL is available and the
//            user has not requested reduced motion — otherwise V3 skips the hero
//            entirely and starts straight in the card flow.

import { imageForItem, imageForLocation } from "@/app/register/core/assets";

// The single local hero GLB (served from /public).
export const HERO_MODEL = "/register/assets/v3/SheenChair.glb";

// Re-exported through this module so the V3 components have a single asset
// import surface (photography helpers are unchanged shared core).
export { imageForItem, imageForLocation };

const v3Assets = { HERO_MODEL, imageForItem, imageForLocation };
export default v3Assets;
