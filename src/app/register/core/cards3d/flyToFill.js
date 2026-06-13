// GSAP choreography for the signature "card flies toward the viewer and unfolds
// to fill the screen" mechanic (and its companion "other cards scatter back in
// depth"). Framework-agnostic (no React) so any variant can drive it against a
// card's inner DOM node (the one `Card3D` hands back via `cardRef`).
//
// Reduced-motion is honoured: the rich depth flight collapses to a quick fade.

import gsap from "gsap";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * Make `el` appear to fly toward the viewer (translateZ + scale up) and expand
 * to fill the viewport, reading as it "becomes the next screen". The target
 * scale is computed from the element's current rect vs the window, with a small
 * overscan so edges don't peek. The element is also translated so its centre
 * lands at the viewport centre.
 *
 * Returns the GSAP timeline (so the caller can attach callbacks / kill it).
 * Under reduced-motion it collapses to a short fade-out and fires `onComplete`.
 *
 * @param {HTMLElement} el
 * @param {{
 *   duration?: number,        // seconds (full-motion path), default 0.85
 *   overscan?: number,        // extra scale headroom, default 1.08
 *   z?: number,               // translateZ at the start of the flight, default 220
 *   onComplete?: () => void,
 * }} [opts]
 * @returns {gsap.core.Timeline}
 */
export function flyToFill(el, opts = {}) {
  const { duration = 0.85, overscan = 1.08, z = 220, onComplete } = opts;
  const tl = gsap.timeline({ onComplete });

  if (!el) return tl;

  if (prefersReducedMotion()) {
    tl.to(el, { opacity: 0, duration: 0.2, ease: "power1.out" });
    return tl;
  }

  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    // Degenerate (hidden / not laid out) — just fade so we never throw.
    tl.to(el, { opacity: 0, duration: 0.2 });
    return tl;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Scale needed to cover the viewport from the card's current size.
  const scale =
    Math.max(vw / rect.width, vh / rect.height) * Math.max(1, overscan);

  // Move the card's centre to the viewport centre (GSAP x/y are relative to the
  // element's natural position; default transform-origin is its own centre).
  const cardCenterX = rect.left + rect.width / 2;
  const cardCenterY = rect.top + rect.height / 2;
  const dx = vw / 2 - cardCenterX;
  const dy = vh / 2 - cardCenterY;

  // Lift it forward in Z first (the "toward you" beat), then it blooms outward.
  tl.set(el, {
    transformOrigin: "50% 50%",
    transformPerspective: 1200,
    zIndex: 30,
    willChange: "transform",
  })
    .to(el, {
      z,
      duration: duration * 0.32,
      ease: "power2.in",
    })
    .to(
      el,
      {
        x: dx,
        y: dy,
        z: 0,
        scale,
        duration: duration * 0.68,
        ease: "power3.inOut",
      },
      ">-0.05",
    );

  return tl;
}

/**
 * Push the OTHER cards away in depth (translateZ back + fade) as one card flies
 * forward, so the chosen card clearly separates from the deck. Returns the GSAP
 * tween/timeline. Under reduced-motion it collapses to a quick fade.
 *
 * @param {HTMLElement[]} els        // the sibling card nodes (exclude the chosen one)
 * @param {{
 *   duration?: number,  // seconds, default 0.5
 *   z?: number,         // how far back to push (negative), default -380
 *   stagger?: number,   // per-card stagger, default 0.04
 * }} [opts]
 * @returns {gsap.core.Tween}
 */
export function scatterSiblings(els, opts = {}) {
  const { duration = 0.5, z = -380, stagger = 0.04 } = opts;
  const targets = (els || []).filter(Boolean);
  if (!targets.length) return gsap.to({}, { duration: 0 });

  if (prefersReducedMotion()) {
    return gsap.to(targets, { opacity: 0, duration: 0.2, ease: "power1.out" });
  }

  return gsap.to(targets, {
    z,
    opacity: 0,
    scale: 0.82,
    duration,
    ease: "power2.in",
    stagger,
    transformOrigin: "50% 50%",
  });
}

export default flyToFill;
