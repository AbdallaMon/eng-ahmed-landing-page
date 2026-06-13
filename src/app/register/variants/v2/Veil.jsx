"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Box, useTheme } from "@mui/material";
import gsap from "gsap";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * A full-screen DOM cross-fade veil used to cover any hard swap in the WebGL
 * gallery (a camera fly + the DOM stage changing under it). The parent calls
 * `ref.current.cross(onMidpoint)` which fades a soft brand wash IN, fires
 * `onMidpoint` at peak opacity (when the parent should swap the stage / kick the
 * camera fly), then fades it back OUT — so the transition never shows a hard cut.
 *
 * Reduced-motion: the wash is skipped and `onMidpoint` fires immediately.
 *
 * Imperative on purpose (one persistent node, no React churn during the flight).
 */
const Veil = forwardRef(function Veil(_props, ref) {
  const theme = useTheme();
  const elRef = useRef(null);

  useImperativeHandle(ref, () => ({
    /**
     * Run the in→(swap)→out cross-fade.
     * @param {() => void} [onMidpoint] called once at peak opacity
     * @param {{ inMs?: number, outMs?: number, hold?: number }} [opts]
     */
    cross(onMidpoint, opts = {}) {
      const el = elRef.current;
      if (!el) {
        onMidpoint?.();
        return;
      }
      if (prefersReducedMotion()) {
        onMidpoint?.();
        return;
      }
      const { inMs = 0.32, outMs = 0.5, hold = 0.04 } = opts;
      gsap.killTweensOf(el);
      el.style.pointerEvents = "auto";
      gsap
        .timeline({
          onComplete: () => {
            el.style.pointerEvents = "none";
          },
        })
        .set(el, { opacity: 0, display: "block" })
        .to(el, {
          opacity: 1,
          duration: inMs,
          ease: "power2.in",
          onComplete: onMidpoint,
        })
        .to(el, { opacity: 0, duration: outMs, delay: hold, ease: "power2.out" });
    },
  }));

  const gold = theme.palette.primary.main;

  return (
    <Box
      ref={elRef}
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        opacity: 0,
        pointerEvents: "none",
        // A soft warm wash (not an opaque black cut) so it reads as light blooming
        // over the scene during the camera flight.
        background: `radial-gradient(120% 120% at 50% 45%, ${theme.palette.background.paper} 0%, ${gold}cc 55%, ${theme.palette.background.default} 100%)`,
      }}
    />
  );
});

export default Veil;
