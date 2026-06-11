// Motion helpers for the lead-selection flow.
//
// The flow was rebuilt on framer-motion (declarative variants + AnimatePresence)
// to replace the previous brittle GSAP clone-node timelines. These helpers keep
// the old URL-driven speed control (?speed= / ?fast) and honour the user's
// reduced-motion preference, exposing both to the view layer as plain numbers /
// framer-motion variant objects.

/**
 * Read an animation-speed multiplier from the URL so a link can fast-forward
 * the flow (handy when resuming via a deep-link):
 *   ?speed=2   → 2x faster   (any positive number, clamped to [0.25, 10])
 *   ?fast      → shortcut for 3x
 * Defaults to 1 (normal speed) when absent/invalid.
 */
export function getUrlSpeed() {
  if (typeof window === "undefined") return 1;
  const params = new URLSearchParams(window.location.search);
  if (params.get("fast") !== null) return 3;
  const raw = parseFloat(params.get("speed"));
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.min(10, Math.max(0.25, raw));
}

/** Whether the user has asked the OS to minimise motion. */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A framer-motion transition with the URL speed applied. Honours reduced-motion
 * by collapsing to a near-instant fade. `base` is the normal-speed duration.
 */
export function motionTransition(base = 0.45) {
  if (prefersReducedMotion()) return { duration: 0.01 };
  return {
    duration: base / getUrlSpeed(),
    ease: [0.22, 1, 0.36, 1], // expo-out: smooth, premium settle
  };
}

/**
 * Horizontal slide+fade variants for stepping between wizard stages.
 * `direction` is 1 (forward) or -1 (back). Collapses to a plain fade when the
 * user prefers reduced motion. `isRtl` mirrors the slide so "forward" always
 * reads as advancing in the reading direction.
 */
export function stepVariants(direction, isRtl = false) {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  const sign = isRtl ? -1 : 1;
  const offset = 48 * sign * direction;
  return {
    initial: { opacity: 0, x: offset },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -offset },
  };
}

/** Staggered list container/child variants for revealing option cards. */
export function listContainerVariants(stagger = 0.07) {
  if (prefersReducedMotion()) {
    return { hidden: {}, show: {} };
  }
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger / getUrlSpeed() } },
  };
}

export function listItemVariants() {
  if (prefersReducedMotion()) {
    return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };
}
