// V1 "Living Cards" — local motion helpers.
//
// Thin layer over the shared `lib/animations` controls so the whole variant
// reads its tempo + reduced-motion preference from ONE place. We deliberately do
// NOT touch framer-motion here — V1 is pure GSAP + CSS-3D.
//
// `dur(base)` scales a base (normal-speed) duration by the global slow-mo factor
// and the URL `?speed=`/`?fast` control, and collapses to ~0 under reduced
// motion so rich timelines become instant settles.

import {
  getUrlSpeed,
  MOTION_SCALE,
  prefersReducedMotion,
} from "@/app/register/lib/animations";

/** Effective tempo: URL speed on the calmer global baseline. Higher → faster. */
export function tempo() {
  return getUrlSpeed() / MOTION_SCALE;
}

/**
 * Scale a base duration (seconds, normal speed) by the current tempo. Under
 * reduced motion it returns a tiny value so GSAP tweens resolve near-instantly
 * (no visible movement) while still firing their onComplete callbacks.
 */
export function dur(base) {
  if (prefersReducedMotion()) return 0.001;
  return base / tempo();
}

/**
 * Scale a base stagger (seconds) by the current tempo; 0 under reduced motion so
 * grouped reveals appear together rather than cascading.
 */
export function stagger(base) {
  if (prefersReducedMotion()) return 0;
  return base / tempo();
}

/** True when this is a touch / coarse-pointer device (no hover). */
export function isCoarsePointer() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(pointer: coarse)")?.matches
  );
}

// A premium expo-out settle reused across the variant (matches the brand's
// existing "grows gently into place" feel).
export const EASE_OUT = "expo.out";
export const EASE_IN_OUT = "power3.inOut";

// re-export the shared predicate so call sites import motion helpers from one
// module.
export { prefersReducedMotion };
