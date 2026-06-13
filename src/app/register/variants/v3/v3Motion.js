// GSAP motion helpers specific to V3 "Hybrid".
//
// V3's card-flow choreography is provided by the shared `core/cards3d`
// primitives (Card3D / flyToFill / scatterSiblings / AnimatedText). These
// helpers cover only the two things unique to V3:
//   1. the WebGL hero gracefully RECEDING/dissolving on the first advance, and
//   2. the un-boxed form's fields rising in as depth-staggered 3D objects.
//
// All of them honour `prefers-reduced-motion` (collapse to an instant set /
// quick fade) and apply the flow's URL speed control so the pacing stays in
// sync with `useLeadFlow`.

import gsap from "gsap";
import {
  getUrlSpeed,
  MOTION_SCALE,
  prefersReducedMotion,
} from "@/app/register/lib/animations";

/** Effective tempo (URL speed on the global slow-mo baseline). */
function tempo() {
  return getUrlSpeed() / MOTION_SCALE;
}

/**
 * Recede the hero: it drifts back in Z, lifts slightly, and dissolves — reading
 * as "the signature object steps aside and the flow begins". Returns the GSAP
 * tween so the caller can chain an `onComplete` (e.g. unmount the heavy WebGL
 * stage once it's invisible). Reduced-motion → a short fade.
 *
 * @param {HTMLElement} el  the hero overlay node
 * @param {{ onComplete?: () => void }} [opts]
 * @returns {gsap.core.Tween}
 */
export function recedeHero(el, opts = {}) {
  const { onComplete } = opts;
  if (!el) {
    onComplete?.();
    return gsap.to({}, { duration: 0, onComplete });
  }
  if (prefersReducedMotion()) {
    return gsap.to(el, { opacity: 0, duration: 0.2, ease: "power1.out", onComplete });
  }
  const speed = tempo();
  return gsap.to(el, {
    opacity: 0,
    scale: 0.86,
    z: -260,
    y: -24,
    filter: "blur(8px)",
    transformOrigin: "50% 45%",
    duration: 0.8 / speed,
    ease: "power3.in",
    onComplete,
  });
}

/**
 * Depth-stagger a set of field wrapper nodes INTO view: each rises from below
 * and forward out of depth (translateZ) with a per-item stagger, so the form
 * "assembles in 3D" rather than fading flat. Reduced-motion → instant show.
 *
 * @param {HTMLElement[]} els  the per-field wrapper nodes (in DOM order)
 * @param {{ delay?: number, stagger?: number }} [opts]
 * @returns {gsap.core.Tween}
 */
export function depthStaggerIn(els, opts = {}) {
  const targets = (els || []).filter(Boolean);
  if (!targets.length) return gsap.to({}, { duration: 0 });

  if (prefersReducedMotion()) {
    return gsap.set(targets, { opacity: 1, y: 0, z: 0, rotateX: 0 });
  }
  const speed = tempo();
  const { delay = 0.12, stagger = 0.09 } = opts;
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 34, z: -90, rotateX: -18 },
    {
      opacity: 1,
      y: 0,
      z: 0,
      rotateX: 0,
      duration: 0.6 / speed,
      delay: delay / speed,
      ease: "power3.out",
      stagger: stagger / speed,
      transformOrigin: "50% 100%",
    },
  );
}

/**
 * A gentle "rise + settle" entrance for a single block (heading group, the
 * email card, the form header) — forward out of depth. Reduced-motion → instant.
 *
 * @param {HTMLElement} el
 * @param {{ delay?: number, y?: number, z?: number }} [opts]
 * @returns {gsap.core.Tween}
 */
export function riseIn(el, opts = {}) {
  if (!el) return gsap.to({}, { duration: 0 });
  if (prefersReducedMotion()) {
    return gsap.set(el, { opacity: 1, y: 0, z: 0 });
  }
  const speed = tempo();
  const { delay = 0, y = 26, z = -70 } = opts;
  return gsap.fromTo(
    el,
    { opacity: 0, y, z },
    {
      opacity: 1,
      y: 0,
      z: 0,
      duration: 0.6 / speed,
      delay: delay / speed,
      ease: "power3.out",
    },
  );
}

export default { recedeHero, depthStaggerIn, riseIn };
