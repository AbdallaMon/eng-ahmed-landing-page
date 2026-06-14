// The signature "card photo grows edge-to-edge and BECOMES the next room" move,
// rebuilt to kill the hand-off FLASH.
//
// THE BUG IT REPLACES: the old `flyToFill` scaled the whole card (a fixed-aspect
// box) up to cover the viewport, then the flow advanced and `PerspectiveStage`
// cross-faded its OWN full-screen photo in with a push-in. Two things jumped at
// the swap: (1) the card's `cover` crop (card aspect) ≠ the backdrop's `cover`
// crop (viewport aspect), and (2) the backdrop animated its scale in, so the
// image was at a different size than the card the instant it took over. The eye
// reads both as a "flash / the picture resizes after the animation".
//
// THE FIX (what the owner asked for — "animate the background to COVER first,
// THEN grow it"): we lift a FIXED full-screen overlay off the chosen card and
// animate its top/left/width/height from the card's rect to a centred
// `OVERSCAN × viewport` box. Because we animate the box SIZE (not a transform
// scale), the `background-size:cover` re-crops every frame — the framing morphs
// from the card's crop to the viewport's crop AS it grows. The overlay's final
// box is, by construction (shared `PHOTO_OVERSCAN`), the EXACT frame
// `PerspectiveStage` rests its photo at, so when the flow advances behind the
// overlay (the backdrop adopts the same image INSTANTLY at rest) and we drop the
// overlay a frame later, there is nothing to flash — the pixels are identical.
//
// Framework-agnostic (no React). Honours reduced motion (skips straight to the
// callback). SSR-safe (no-ops without `document`).

import gsap from "gsap";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import { PHOTO_OVERSCAN } from "@/app/register/core/cards3d/photoGeometry";

/**
 * Morph a card's photo into the full-screen backdrop, then run `onComplete`
 * (which advances the flow so the real backdrop — same image, same rest frame —
 * is already painted behind the overlay before it is removed).
 *
 * @param {HTMLElement} fromEl   the card's surface node (its on-screen rect is
 *                               the morph's starting box)
 * @param {{
 *   image: string,             // the photo url (identical to the destination backdrop)
 *   duration?: number,         // seconds at normal speed, default 0.85
 *   radius?: number,           // starting corner radius (px), default 24 → 0
 *   onComplete?: () => void,   // fired when the overlay has filled the screen
 * }} opts
 * @returns {gsap.core.Timeline|null}
 */
export function coverMorph(fromEl, { image, duration = 0.85, radius = 24, onComplete } = {}) {
  if (typeof document === "undefined" || !fromEl || !image) {
    onComplete?.();
    return null;
  }
  if (prefersReducedMotion()) {
    onComplete?.();
    return null;
  }
  const rect = fromEl.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    onComplete?.();
    return null;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Destination box: a centred OVERSCAN×viewport rectangle. Same aspect as the
  // viewport, so `cover` crops it exactly like the backdrop's inset:0 +
  // scale(OVERSCAN) photo → identical frame, no flash on hand-off.
  const ow = vw * PHOTO_OVERSCAN;
  const oh = vh * PHOTO_OVERSCAN;
  const oLeft = (vw - ow) / 2;
  const oTop = (vh - oh) / 2;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    backgroundImage: `url('${image}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    borderRadius: `${radius}px`,
    zIndex: "45",
    pointerEvents: "none",
    willChange: "top, left, width, height, border-radius",
    boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
  });
  document.body.appendChild(overlay);

  // Readability wash, matching PerspectiveStage's resting `photoScrimStyle`
  // (dim≈0.46). Inline style (never an emotion class, which can inject a frame
  // late and flash). It fades IN as the photo grows so the full-screen image
  // lands at the SAME darkness the backdrop rests at — no brightness jump on
  // hand-off. (The card itself starts un-scrimmed, so the lift reads naturally.)
  const scrim = document.createElement("div");
  Object.assign(scrim.style, {
    position: "absolute",
    inset: "0",
    borderRadius: "inherit",
    pointerEvents: "none",
    opacity: "0",
    background:
      "linear-gradient(180deg, rgba(40,32,24,0.23) 0%, rgba(40,32,24,0.46) 55%, rgba(40,32,24,0.38) 100%)",
  });
  overlay.appendChild(scrim);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onComplete?.();
    // Give the flow one beat to advance + paint the real (identical) backdrop
    // behind the overlay, THEN remove it — so the removal reveals an identical
    // image, never a gap.
    gsap.delayedCall(0.1, () => overlay.remove());
  };

  const tl = gsap.timeline({ onComplete: finish });
  // A short "toward you" lift (a hair larger than the card) reads as the photo
  // lifting off the deck before it blooms to fill — continuity, not a cut.
  tl.to(overlay, {
    top: rect.top - rect.height * 0.04,
    left: rect.left - rect.width * 0.04,
    width: rect.width * 1.08,
    height: rect.height * 1.08,
    duration: duration * 0.26,
    ease: "power2.in",
  });
  tl.to(overlay, {
    top: oTop,
    left: oLeft,
    width: ow,
    height: oh,
    borderRadius: 0,
    duration: duration * 0.74,
    ease: "power3.inOut",
  });
  // Fade the wash in across the grow so the landed full-screen frame matches the
  // backdrop's resting darkness (kills the "image gets darker after it lands").
  tl.to(
    scrim,
    { opacity: 1, duration: duration * 0.74, ease: "power2.out" },
    duration * 0.26,
  );

  // Safety: if GSAP is ever interrupted, never strand the overlay on screen.
  gsap.delayedCall(duration + 1.2, () => {
    if (overlay.isConnected) {
      finish();
      overlay.remove();
    }
  });

  return tl;
}

/**
 * The INVERSE of `coverMorph`, for the BACK navigation: the full-screen room
 * photo SHRINKS back into the card slot it came from, then `onComplete` reveals
 * the real card there. A fixed overlay starts at the backdrop's exact resting
 * frame (centred `OVERSCAN × viewport`, `cover`) — seamless with what is already
 * on screen — and animates its top/left/width/height DOWN to `toEl`'s rect, so
 * `cover` re-crops to the card's framing AS it shrinks (no late snap). The wash
 * fades OUT toward the (brighter) card. Honours reduced motion + SSR.
 *
 * @param {HTMLElement} toEl   the destination card slot (its rect is the end box)
 * @param {{
 *   image: string,            // the room photo (identical to the card's image)
 *   duration?: number,        // seconds at normal speed, default 0.85
 *   radius?: number,          // ending corner radius (px), default 24
 *   onComplete?: () => void,  // fired when the overlay has shrunk to the card
 * }} opts
 * @returns {gsap.core.Timeline|null}
 */
export function reverseCoverMorph(
  toEl,
  { image, duration = 0.85, radius = 24, onComplete } = {},
) {
  if (typeof document === "undefined" || !toEl || !image) {
    onComplete?.();
    return null;
  }
  if (prefersReducedMotion()) {
    onComplete?.();
    return null;
  }
  const rect = toEl.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    onComplete?.();
    return null;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ow = vw * PHOTO_OVERSCAN;
  const oh = vh * PHOTO_OVERSCAN;
  const oLeft = (vw - ow) / 2;
  const oTop = (vh - oh) / 2;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: `${oTop}px`,
    left: `${oLeft}px`,
    width: `${ow}px`,
    height: `${oh}px`,
    backgroundImage: `url('${image}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    borderRadius: "0px",
    zIndex: "45",
    pointerEvents: "none",
    willChange: "top, left, width, height, border-radius",
    boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
  });
  // Starts at the backdrop's resting darkness, fades out toward the card.
  const scrim = document.createElement("div");
  Object.assign(scrim.style, {
    position: "absolute",
    inset: "0",
    borderRadius: "inherit",
    pointerEvents: "none",
    opacity: "1",
    background:
      "linear-gradient(180deg, rgba(40,32,24,0.23) 0%, rgba(40,32,24,0.46) 55%, rgba(40,32,24,0.38) 100%)",
  });
  overlay.appendChild(scrim);
  document.body.appendChild(overlay);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onComplete?.();
    // Give the revealed card one beat to paint, then drop the overlay.
    gsap.delayedCall(0.06, () => overlay.remove());
  };

  const tl = gsap.timeline({ onComplete: finish });
  tl.to(
    overlay,
    {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: radius,
      duration,
      ease: "power3.inOut",
    },
    0,
  );
  tl.to(
    scrim,
    { opacity: 0, duration: duration * 0.7, ease: "power2.in" },
    duration * 0.2,
  );

  gsap.delayedCall(duration + 1.2, () => {
    if (overlay.isConnected) {
      finish();
      overlay.remove();
    }
  });

  return tl;
}

export default coverMorph;
