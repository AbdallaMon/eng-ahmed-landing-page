// Motion helpers for the lead-selection flow.
//
// The flow is built on framer-motion (declarative variants + AnimatePresence +
// shared-layout `layoutId` morphs). These helpers keep the URL-driven speed
// control (?speed= / ?fast) and honour the user's reduced-motion preference,
// exposing both to the view layer as plain numbers / framer-motion objects.
//
// The signature mechanic of this flow is "card expands to fill the screen":
// a selected image card morphs (via a shared `layoutId`) into a full-screen
// backdrop, and the next step's options reveal on top of it. See
// `StageBackdrop.jsx` + `LeadSelectionFlow.jsx`.

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
 * The spring used for the card → full-screen `layoutId` morph (and back). A
 * touch of softness reads as "the card grows to fill the screen" rather than a
 * hard snap. Collapses to an instant transition under reduced-motion.
 */
export function expandTransition() {
  if (prefersReducedMotion()) return { duration: 0.01 };
  const speed = getUrlSpeed();
  return {
    type: "spring",
    stiffness: 260 * speed,
    damping: 32,
    mass: 0.9,
  };
}

/**
 * Cross-fade for the full-screen backdrop image when the active stage image
 * changes (e.g. design intro → selected location photo).
 */
export function backdropFade() {
  if (prefersReducedMotion()) return { duration: 0.01 };
  return { duration: 0.6 / getUrlSpeed(), ease: [0.22, 1, 0.36, 1] };
}

/**
 * Horizontal slide+fade variants for stepping between non-image stages (email,
 * form). `direction` is 1 (forward) or -1 (back). Collapses to a plain fade
 * under reduced-motion. `isRtl` mirrors the slide so "forward" always reads as
 * advancing in the reading direction.
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

/**
 * Reveal variants for the content (title + options) that appears ON TOP of the
 * full-screen backdrop after a card has expanded. Slightly delayed so the
 * expand "lands" first, then the options rise into view.
 */
export function overlayRevealVariants() {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.01 } },
    };
  }
  const speed = getUrlSpeed();
  return {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.18 / speed,
        duration: 0.5 / speed,
        ease: [0.22, 1, 0.36, 1],
        when: "beforeChildren",
        staggerChildren: 0.07 / speed,
      },
    },
  };
}
