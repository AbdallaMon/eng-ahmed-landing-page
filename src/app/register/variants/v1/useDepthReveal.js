"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { dur, stagger, prefersReducedMotion } from "@/app/register/variants/v1/v1Motion";

/**
 * Reveal a group of children as DEPTH-STAGGERED 3D objects (not flat fades).
 *
 * Attach the returned `ref` to a container; every direct descendant carrying the
 * `data-depth` attribute rises in from back-in-Z with a small rotateX and a
 * per-item stagger. Re-runs whenever `deps` change (e.g. a new stage / field
 * set) so re-entering a stage re-plays the entrance. Honours reduced motion
 * (children simply appear). The container itself must own a `perspective` (the
 * stages render inside `PerspectiveStage`, which provides it) for the Z/rotate
 * to read as real depth.
 *
 * @param {object} [opts]
 * @param {number} [opts.baseDelay=0]   start delay (s, normal speed)
 * @param {number} [opts.z=140]         how far back items start (px)
 * @param {number} [opts.y=26]          how far below items start (px)
 * @param {number} [opts.rotateX=24]    initial tilt (deg)
 * @param {number} [opts.step=0.085]    per-item stagger (s, normal speed)
 * @param {number} [opts.duration=0.7]  per-item duration (s, normal speed)
 * @param {any[]}  [deps=[]]            re-run dependencies
 * @returns {{ ref: React.MutableRefObject<HTMLElement|null> }}
 */
export function useDepthReveal(opts = {}, deps = []) {
  const {
    baseDelay = 0,
    z = 140,
    y = 26,
    rotateX = 24,
    step = 0.085,
    duration = 0.7,
    enabled = true,
  } = opts;
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    // When disabled the caller owns the reveal (e.g. OptionCardsStage's BACK
    // reverse-morph reveals the returning card first, then the rest) — leave the
    // items at their hidden rest (opacity:0 from their own style) and do nothing.
    if (!enabled) return undefined;
    const items = root.querySelectorAll(":scope [data-depth]");
    if (!items.length) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(items, {
        opacity: 1,
        z: 0,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: "blur(0px)",
      });
      return undefined;
    }

    // A premium depth settle: items lift from back-in-Z while slightly under-
    // scaled and softly blurred, then glide forward and snap into focus. The
    // soft blur→sharp + a hair of overshoot ("back.out") reads as a real object
    // arriving rather than a flat fade. transformOrigin at the bottom keeps the
    // rotateX hinging like a card laid down. Per-item stagger keeps it staged,
    // not a single block move.
    const tween = gsap.fromTo(
      items,
      {
        opacity: 0,
        z: -z,
        y,
        rotateX: -rotateX,
        scale: 0.94,
        filter: "blur(6px)",
      },
      {
        opacity: 1,
        z: 0,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: dur(duration),
        delay: dur(baseDelay),
        ease: "back.out(1.05)",
        stagger: stagger(step),
        transformOrigin: "50% 100%",
        // Clear inline transforms + filter once settled so hover/idle effects on
        // the children aren't fighting a leftover transform/blur.
        clearProps: "transform,filter",
      },
    );
    return () => tween.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref };
}

export default useDepthReveal;
