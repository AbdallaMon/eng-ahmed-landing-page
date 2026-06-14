// The "chosen item NAME lifts off its card, recolours, rises to the top, then —
// after the photo has grown to full-screen — FLIES into its slot in the form
// (the gold type chip)" move. The owner asked for exactly this beat:
//   1. the word's colour changes,
//   2. it rises to the top of the (growing) image,
//   3. the card photo grows to fill (handled by `coverMorph`),
//   4. the word travels to where the item name sits inside the form.
//
// It is a FLIP-style shared element: a single fixed-position clone of the card's
// title is lifted into `document.body` and animated. Because it lives on the body
// (not in the React tree) it SURVIVES the item→form stage swap, so the same word
// that left the card is the one that lands in the form chip.
//
// Framework-agnostic, inline-style only (never an emotion class — which can inject
// a frame late and flash, the convention the rest of V1 follows). Honours reduced
// motion (no clone at all → the form chip just shows normally). SSR-safe.

import gsap from "gsap";
import { prefersReducedMotion } from "@/app/register/lib/animations";

// Singleton floating clone (only one title is ever in flight at a time).
let floating = null;

function clear() {
  if (floating) {
    gsap.killTweensOf(floating);
    floating.remove();
    floating = null;
  }
}

/**
 * Lift a clone of the card title `fromEl` into a fixed floating word: recolour it
 * (e.g. to gold) and RISE it toward the top of the screen. The clone then waits
 * (through the photo's grow) until `landTitle` flies it into the form chip.
 *
 * @param {HTMLElement} fromEl   the card's title node (its rect = the start box)
 * @param {{ color?: string }} [opts]  colour to morph the word to as it lifts
 */
export function liftTitle(
  fromEl,
  { color, center = true, centerScale = 1.5 } = {},
) {
  clear();
  if (typeof document === "undefined" || !fromEl) return;
  if (prefersReducedMotion()) return; // no clone → form chip shows normally
  const rect = fromEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const cs = getComputedStyle(fromEl);
  const el = document.createElement("div");
  el.textContent = fromEl.textContent;
  Object.assign(el.style, {
    position: "fixed",
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    color: cs.color,
    direction: cs.direction,
    textAlign: "center",
    whiteSpace: "nowrap",
    zIndex: "60", // above the coverMorph overlay (45), below the paying overlay
    pointerEvents: "none",
    textShadow: "0 2px 16px rgba(0,0,0,0.6)",
    willChange: "top, left, transform, color",
  });
  document.body.appendChild(el);
  floating = el;

  // Safety net: if this clone is never landed (e.g. the user navigates back
  // before the form's `landTitle` runs), make sure it can't linger on screen.
  gsap.delayedCall(6, () => {
    if (floating === el) clear();
  });

  // 1) recolour (brand gold) as it lifts.
  if (color) gsap.to(el, { color, duration: 0.3, ease: "power2.out" });
  // 2) FORWARD lift (`center`): move to the CENTRE of the screen and GROW — it
  //    takes presence centre-stage while the photo grows behind it; `landTitle`
  //    then moves it up + shrinks it into the breadcrumb. REVERSE lift
  //    (`center:false`): the clone STAYS at its source (the breadcrumb token) and
  //    waits — the back card-deck flies it DIRECTLY down to its card slot, no
  //    centre detour, and keeps it there while the photo shrinks back in.
  if (center) {
    const cx = window.innerWidth / 2 - rect.width / 2;
    const cy = window.innerHeight * 0.42 - rect.height / 2;
    gsap.to(el, {
      top: cy,
      left: cx,
      scale: centerScale,
      duration: 0.5,
      ease: "power3.out",
    });
  }
}

/**
 * Fly the floating word into `toEl` (the form's item chip slot): match its box +
 * text colour, then reveal the real chip (`onLanded`) and cross-dissolve the
 * clone out. If no clone is in flight (e.g. a deep-link straight to the form, or
 * reduced motion), `onLanded` fires immediately so the chip just shows.
 *
 * @param {HTMLElement} toEl  the chip node the word lands into (its rect = end box)
 * @param {{ onLanded?: () => void, keepClone?: boolean }} [opts]
 *   `keepClone` (BACK): do NOT fade the clone after it lands — it STAYS at the
 *   card-title spot (visible) while the photo shrinks back in; the caller calls
 *   `dissolveFloating` to hand it off to the real title once the card is revealed
 *   (so the word never visibly disappears).
 */
export function landTitle(toEl, { onLanded, keepClone } = {}) {
  if (!floating || !toEl) {
    onLanded?.();
    if (!keepClone) clear();
    return;
  }
  const el = floating;
  const dest = toEl.getBoundingClientRect();
  if (!dest.width || !dest.height || prefersReducedMotion()) {
    onLanded?.();
    if (!keepClone) clear();
    return;
  }
  const destCs = getComputedStyle(toEl);
  gsap.killTweensOf(el);
  gsap.to(el, {
    top: dest.top,
    left: dest.left,
    width: dest.width,
    height: dest.height,
    scale: 1,
    color: destCs.color,
    fontSize: destCs.fontSize,
    duration: 0.6,
    ease: "power3.inOut",
    onComplete: () => {
      onLanded?.(); // reveal the real chip text underneath
      if (!keepClone) {
        gsap.to(el, {
          opacity: 0,
          duration: 0.25,
          ease: "power1.out",
          onComplete: clear,
        });
      }
    },
  });
}

/** Cross-dissolve the held clone out (once the real title is revealed under it),
 *  so a kept word hands off seamlessly instead of vanishing. */
export function dissolveFloating(duration = 0.3) {
  if (!floating) return;
  gsap.to(floating, {
    opacity: 0,
    duration,
    ease: "power1.out",
    onComplete: clear,
  });
}

/** Abort any in-flight title morph (e.g. on BACK / reset / unmount). */
export function cancelTitleMorph() {
  clear();
}

// ── Reverse (BACK) support ───────────────────────────────────────────────────
// The persistent breadcrumb registers each accumulated token here by key so the
// BACK navigation can lift the right word back OFF the breadcrumb and fly it to
// its card (the card deck then shrinks the room photo back in behind it).
const slots = new Map();

/** Register (or, with `el == null`, unregister) a breadcrumb token slot. */
export function registerSlot(key, el) {
  if (el) slots.set(key, el);
  else slots.delete(key);
}

/**
 * Lift the registered breadcrumb token `key` back into a floating clone (centre +
 * grow, same as a card lift) and HIDE the original token, so the BACK card deck
 * can `landTitle` it down onto its card. No-op if nothing is registered.
 */
export function liftSlot(key, opts) {
  const el = slots.get(key);
  if (!el) return;
  // `center:false` → the clone STAYS at the breadcrumb and waits; the back card
  // deck flies it straight down to its card (no centre detour).
  liftTitle(el, { ...opts, center: false });
  if (!prefersReducedMotion()) gsap.set(el, { opacity: 0 });
}
