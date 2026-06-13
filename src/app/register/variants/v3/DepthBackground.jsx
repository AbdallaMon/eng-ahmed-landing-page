"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * The "3D space" backdrop for V3's card flow (everything after the hero) — a
 * pure-CSS perspective depth scene, zero WebGL:
 *   • a warm gold/beige radial+linear gradient base,
 *   • several soft, blurred gold/beige blobs floating at varied translateZ
 *     depths (parallaxing toward the pointer), and
 *   • the ACTIVE stage photo pushed BACK in Z behind a frosted veil, so the
 *     option cards in front read with real depth.
 *
 * It owns the scene `perspective`; the floating layer is `preserve-3d`. On a
 * fine pointer the depth layers lean toward the cursor (cheap parallax); on
 * touch / reduced-motion they sit still. Decorative only — `aria-hidden`.
 *
 * @param {{ image?: string|null }} props
 *   `image` = the current stage backdrop photo (or null on the form stage).
 */
export default function DepthBackground({ image = null }) {
  const sceneRef = useRef(null);
  const layerRef = useRef(null);
  const photoRef = useRef(null);
  const quick = useRef(null);

  // Pointer parallax: lean the floating layer + the back photo toward the cursor.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;
    if (prefersReducedMotion()) return undefined;
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)")?.matches;
    if (coarse) return undefined;

    quick.current = {
      x: gsap.quickTo(layer, "xPercent", { duration: 0.9, ease: "power2.out" }),
      y: gsap.quickTo(layer, "yPercent", { duration: 0.9, ease: "power2.out" }),
      px: photoRef.current
        ? gsap.quickTo(photoRef.current, "xPercent", {
            duration: 1.1,
            ease: "power2.out",
          })
        : null,
      py: photoRef.current
        ? gsap.quickTo(photoRef.current, "yPercent", {
            duration: 1.1,
            ease: "power2.out",
          })
        : null,
    };

    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      quick.current.x(nx * 2.2);
      quick.current.y(ny * 2.2);
      quick.current.px?.(nx * -1.4);
      quick.current.py?.(ny * -1.4);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      quick.current = null;
    };
  }, []);

  // Soft cross-fade whenever the active backdrop photo changes.
  useEffect(() => {
    const el = photoRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: image ? 0.42 : 0 });
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0, scale: 1.08 },
      { opacity: image ? 0.42 : 0, scale: 1.12, duration: 1.1, ease: "power2.out" },
    );
  }, [image]);

  // Decorative floating shapes — varied size / position / blur / Z-depth so the
  // parallax separates them into clear planes.
  const blobs = [
    { top: "-8%", left: "-6%", size: 360, z: -220, color: colors.primary, o: 0.5 },
    { top: "55%", left: "-10%", size: 300, z: -120, color: colors.secondary, o: 0.45 },
    { top: "8%", left: "70%", size: 420, z: -300, color: colors.primaryDark, o: 0.4 },
    { top: "62%", left: "62%", size: 260, z: -80, color: colors.primaryAlt, o: 0.55 },
    { top: "30%", left: "38%", size: 200, z: -180, color: colors.secondaryAlt, o: 0.5 },
  ];

  return (
    <Box
      ref={sceneRef}
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        perspective: "1000px",
        pointerEvents: "none",
        background: `radial-gradient(120% 120% at 50% 0%, ${colors.bgSecondary} 0%, ${colors.bgPrimary} 55%, ${colors.bgTertiary} 100%)`,
      }}
    >
      {/* The active stage photo, pushed BACK in Z behind a frosted veil. */}
      {image && (
        <Box
          ref={photoRef}
          sx={{
            position: "absolute",
            inset: "-6%",
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(10px) saturate(1.05)",
            opacity: 0,
            transform: "translateZ(-340px) scale(1.1)",
            willChange: "transform, opacity",
          }}
        />
      )}

      {/* Floating depth layer (preserve-3d) carrying the soft blobs. */}
      <Box
        ref={layerRef}
        sx={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {blobs.map((b, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, ${b.color}, transparent 70%)`,
              opacity: b.o,
              filter: "blur(38px)",
              transform: `translateZ(${b.z}px)`,
            }}
          />
        ))}
      </Box>

      {/* A faint top-down wash so foreground cards keep contrast over the scene. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.18) 100%)",
        }}
      />
    </Box>
  );
}
