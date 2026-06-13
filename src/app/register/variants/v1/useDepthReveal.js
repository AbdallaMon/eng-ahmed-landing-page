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
  } = opts;
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const items = root.querySelectorAll(":scope [data-depth]");
    if (!items.length) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, z: 0, y: 0, rotateX: 0 });
      return undefined;
    }

    const tween = gsap.fromTo(
      items,
      { opacity: 0, z: -z, y, rotateX: -rotateX },
      {
        opacity: 1,
        z: 0,
        y: 0,
        rotateX: 0,
        duration: dur(duration),
        delay: dur(baseDelay),
        ease: "expo.out",
        stagger: stagger(step),
        transformOrigin: "50% 100%",
        // Clear inline transforms once settled so hover/idle effects on the
        // children aren't fighting a leftover translate.
        clearProps: "transform",
      },
    );
    return () => tween.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref };
}

export default useDepthReveal;
