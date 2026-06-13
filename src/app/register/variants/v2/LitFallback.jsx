"use client";
import { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";
import gsap from "gsap";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * The clean, lit fallback panel handed to `ModelStage` as its `fallback` for
 * the V2 WebGL path — shown ONLY when WebGL can create a context but the GLB
 * itself fails to load/decode (a narrow case; a fully missing WebGL / low-end /
 * reduced-motion device is caught earlier by the capability gate, which drops to
 * the Card3D flow instead).
 *
 * This is deliberately NOT the old blocky box look: it is a soft, premium brand
 * gradient field with a slow-drifting light bloom + a frosted glass plinth, so a
 * model-load failure still reads as a designed lit stage rather than a crash. It
 * carries no copy of its own — the gallery's DOM stage sits on top of it.
 *
 * Pure CSS/GSAP, no WebGL, reduced-motion safe.
 */
export default function LitFallback() {
  const theme = useTheme();
  const bloomRef = useRef(null);

  useEffect(() => {
    const el = bloomRef.current;
    if (!el || prefersReducedMotion()) return undefined;
    // A slow wandering light bloom so the empty stage still breathes.
    const tween = gsap.to(el, {
      keyframes: [
        { xPercent: -12, yPercent: -8, scale: 1.08 },
        { xPercent: 14, yPercent: 6, scale: 0.96 },
        { xPercent: -6, yPercent: 10, scale: 1.05 },
        { xPercent: 0, yPercent: 0, scale: 1 },
      ],
      duration: 18,
      ease: "sine.inOut",
      repeat: -1,
    });
    return () => tween.kill();
  }, []);

  const gold = theme.palette.primary.main;
  const goldDark = theme.palette.primary.dark;

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        // Warm brand vignette as the "lit room" base.
        background: `radial-gradient(120% 90% at 50% 18%, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 55%, ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* Soft gold light bloom drifting over the stage. */}
      <Box
        ref={bloomRef}
        sx={{
          position: "absolute",
          top: "8%",
          left: "50%",
          width: "70vmin",
          height: "70vmin",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          opacity: 0.55,
          background: `radial-gradient(circle, ${gold} 0%, ${goldDark}55 45%, transparent 70%)`,
        }}
      />
      {/* A frosted "plinth" so the centre reads as a display surface, not a void. */}
      <Box
        sx={{
          position: "absolute",
          bottom: "16%",
          left: "50%",
          width: "min(78vmin, 520px)",
          height: "30vmin",
          maxHeight: 260,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${goldDark}22, transparent 78%)`,
          filter: "blur(8px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          left: "50%",
          width: "min(60vmin, 420px)",
          height: 14,
          transform: "translateX(-50%)",
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${gold}66, transparent)`,
        }}
      />
    </Box>
  );
}
