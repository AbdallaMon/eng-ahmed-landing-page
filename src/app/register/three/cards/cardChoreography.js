"use client";
import gsap from "gsap";
import {
  getUrlSpeed,
  MOTION_SCALE,
  prefersReducedMotion,
} from "@/app/register/lib/animations";

// Scale a hand-tuned duration by the global slow-mo factor + ?speed= control so
// the GSAP card choreography slows/speeds in lock-step with the rest of /register.
function dur(seconds) {
  if (prefersReducedMotion()) return 0;
  return (seconds * MOTION_SCALE) / getUrlSpeed();
}

/**
 * Cards fly IN from depth (z far → 0) with a slight upward settle, staggered —
 * the "next cards appear in 3D" beat. Reduced-motion just shows them.
 */
export function playEntrance(els) {
  const list = (els || []).filter(Boolean);
  if (!list.length) return;
  if (prefersReducedMotion()) {
    gsap.set(list, { opacity: 1, clearProps: "transform" });
    return;
  }
  gsap.killTweensOf(list);
  gsap.fromTo(
    list,
    { opacity: 0, z: -560, rotateX: -20, y: 70, transformPerspective: 1100 },
    {
      opacity: 1,
      z: 0,
      rotateX: 0,
      y: 0,
      duration: dur(0.9),
      ease: "power3.out",
      stagger: dur(0.12),
      transformOrigin: "center center",
      transformPerspective: 1100,
      clearProps: "transformPerspective",
    },
  );
}

/**
 * The signature "card opens onto the scene": the chosen card flies toward the
 * viewer and grows to fill the view, the others recede in 3D, then — while the
 * chosen card still covers the screen — `onReveal` switches the WebGL scene
 * behind it, an optional brand `flash` blooms, and the card fades to OPEN onto
 * the freshly-revealed scene. `onDone` fires last to advance the flow.
 *
 * @param {{
 *   chosen: HTMLElement,
 *   others?: HTMLElement[],
 *   flash?: HTMLElement | null,
 *   onReveal?: () => void,
 *   onDone?: () => void,
 * }} opts
 */
export function playOpen({ chosen, others = [], flash, onReveal, onDone }) {
  if (!chosen) {
    onReveal?.();
    onDone?.();
    return null;
  }
  if (prefersReducedMotion()) {
    onReveal?.();
    onDone?.();
    return null;
  }

  gsap.killTweensOf([chosen, ...others].filter(Boolean));
  const tl = gsap.timeline({ onComplete: () => onDone?.() });

  if (others.length) {
    tl.to(
      others,
      {
        opacity: 0,
        z: -380,
        rotateY: (i) => (i % 2 ? 38 : -38),
        scale: 0.86,
        duration: dur(0.45),
        ease: "power2.in",
        stagger: dur(0.05),
      },
      0,
    );
  }

  // Fly the chosen card at the viewer and blow it up to cover the screen.
  tl.to(
    chosen,
    {
      z: 560,
      scale: 2.6,
      rotateX: 8,
      duration: dur(0.85),
      ease: "power3.in",
      transformPerspective: 1100,
    },
    0,
  );

  // While the card still covers the view: bloom the brand flash + switch scene.
  if (flash) {
    tl.set(flash, { opacity: 0, display: "block" }, dur(0.32));
    tl.to(flash, { opacity: 1, duration: dur(0.22), ease: "power2.out" }, dur(0.32));
  }
  tl.add(() => onReveal?.(), dur(0.52));

  // Open: the card fades away to reveal the scene; the flash lifts after it.
  tl.to(chosen, { opacity: 0, duration: dur(0.4), ease: "power2.out" }, dur(0.55));
  if (flash) {
    tl.to(
      flash,
      { opacity: 0, duration: dur(0.5), ease: "power2.inOut" },
      dur(0.7),
    );
    tl.set(flash, { display: "none" });
  }

  return tl;
}
