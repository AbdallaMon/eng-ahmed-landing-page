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
 * The transition for the card → full-screen `layoutId` morph (and back). A slow,
 * smooth expo-out tween reads as "the card grows GENTLY to fill the screen"
 * (براحه) — no bouncy spring snap, which felt harsh on the first open. Collapses
 * to an instant transition under reduced-motion.
 */
export function expandTransition(delay = 0) {
  if (prefersReducedMotion()) return { duration: 0.01 };
  const speed = getUrlSpeed();
  return {
    type: "tween",
    duration: 0.6 / speed,
    delay: delay / speed, // hold the image still, THEN grow (text moves first)
    ease: [0.22, 1, 0.36, 1], // expo-out: smooth, premium settle
  };
}

/**
 * The frosted options PANEL itself fades in (so it isn't visible empty before
 * its cards), then staggers its children. `delay` holds it back until the photo
 * behind has expanded.
 */
export function itemsPanelVariants(delay = 0, stagger = 0.06) {
  if (prefersReducedMotion()) {
    return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
  const speed = getUrlSpeed();
  return {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        delay: delay / speed,
        duration: 0.4 / speed,
        delayChildren: delay / speed,
        staggerChildren: stagger / speed,
      },
    },
  };
}

/**
 * A persistent title (the chosen location / item word) morphing from its card
 * position to its heading position. It moves FIRST (no delay) while the image
 * stays put, so the word travels to its new home before the picture grows
 * (النص يتحرك الأول، الصورة ثابتة، بعدين الصورة تتحرك).
 */
export function titleMorphTransition(delay = 0, duration = 0.5) {
  if (prefersReducedMotion()) return { duration: 0.01 };
  const speed = getUrlSpeed();
  return {
    type: "tween",
    duration: duration / speed,
    delay: delay / speed,
    ease: [0.22, 1, 0.36, 1],
  };
}

/**
 * Fade/rise-in for headings + helper text that should appear AFTER the image has
 * expanded (a distinct beat from the morph). `delay` sequences it behind the
 * grow.
 */
export function headerRevealVariants(delay = 0) {
  if (prefersReducedMotion()) {
    return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
  const speed = getUrlSpeed();
  return {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: delay / speed, duration: 0.45 / speed, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

/**
 * The form's own card background appearing as its own step — after the colour
 * panel has grown and the heading settled, the paper fades/rises in, and only
 * THEN do its inputs cascade.
 */
export function paperRevealVariants(delay = 0) {
  if (prefersReducedMotion()) {
    return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
  const speed = getUrlSpeed();
  return {
    hidden: { opacity: 0, scale: 0.97, y: 14 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: delay / speed, duration: 0.5 / speed, ease: [0.22, 1, 0.36, 1] },
    },
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
 * The colour "settle" of the item-expand panel: the selected item row grows to
 * fill the screen in its own brand-gold colour (the `layoutId` morph), then this
 * eases the panel from gold → a calm light tone so the form that lands on top
 * stays readable. Slightly delayed so the grow "reads" as gold first. Honours
 * reduced-motion + the ?speed control.
 */
export function panelSettleTransition() {
  if (prefersReducedMotion()) return { duration: 0.01 };
  const speed = getUrlSpeed();
  return {
    duration: 0.55 / speed,
    delay: 0.15 / speed,
    ease: [0.22, 1, 0.36, 1],
  };
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

/**
 * Staggered list container/child variants for revealing option cards. `delay`
 * holds the whole reveal back so the cards rise in only after the backdrop has
 * expanded.
 */
export function listContainerVariants(stagger = 0.07, delay = 0) {
  if (prefersReducedMotion()) {
    return { hidden: {}, show: {} };
  }
  const speed = getUrlSpeed();
  return {
    hidden: {},
    show: {
      transition: {
        delayChildren: delay / speed,
        staggerChildren: stagger / speed,
      },
    },
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

/**
 * Form-fields reveal: after the chosen item row has grown into the full-screen
 * panel (the colour morph) and the heading has settled, the inputs rise into
 * view ONE BY ONE (واحده واحده). The container's extra delay lets the grow land
 * first; the children stagger in from below.
 */
export function formFieldsContainerVariants(delay = 1.25) {
  if (prefersReducedMotion()) {
    return { hidden: {}, show: { transition: { staggerChildren: 0 } } };
  }
  const speed = getUrlSpeed();
  return {
    hidden: {},
    show: {
      transition: {
        delayChildren: delay / speed,
        staggerChildren: 0.12 / speed,
      },
    },
  };
}

/**
 * A nested group (e.g. the fields inside one form section). No extra start
 * delay — it just staggers its own children once the section itself reveals, so
 * the cascade keeps flowing one field at a time within each section.
 */
export function formGroupVariants() {
  if (prefersReducedMotion()) {
    return { hidden: {}, show: { transition: { staggerChildren: 0 } } };
  }
  return {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 / getUrlSpeed() } },
  };
}

/** A single form field rising into view. Inherits the container's stagger. */
export function formFieldVariants() {
  if (prefersReducedMotion()) {
    return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };
}
