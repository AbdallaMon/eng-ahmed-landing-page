"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import {
  dur,
  isCoarsePointer,
  prefersReducedMotion,
} from "@/app/register/variants/v1/v1Motion";

/**
 * The "living 3D background" for V1 — pure CSS-3D + GSAP, ZERO WebGL.
 *
 * A full-screen perspective scene with parallax DEPTH layers:
 *   1. a warm brand gradient (deepest, plain CSS),
 *   2. soft blurred floating gold/beige shapes at varied Z that drift forever,
 *   3. the active stage PHOTO pushed back in Z (Ken-Burns + cross-fade on change),
 *   4. a readability scrim,
 *   5. the stage CONTENT (children) at the front (z≈0).
 *
 * GSAP owns the transform matrix of every animated layer (z/scale set once via
 * `gsap.set`, then only x/y/rotation are nudged) so depth is never clobbered.
 * On a fine pointer the photo + scrim parallax toward the cursor (by depth); the
 * shapes keep their own forever-drift (so the two never fight the same `x`). On
 * touch there is no pointer parallax — the drift alone keeps it alive. Reduced
 * motion freezes the drift and cross-fades instantly.
 *
 * @param {{
 *   image?: string|null,   // backdrop photo (pushed back in Z); null = none
 *   children?: React.ReactNode,
 *   dim?: number,          // scrim strength 0..1 (default 0.42)
 * }} props
 */
export default function PerspectiveStage({ image, children, dim = 0.42 }) {
  const sceneRef = useRef(null);
  const shapesRef = useRef([]);
  const photoARef = useRef(null); // current photo
  const photoBRef = useRef(null); // outgoing photo (cross-fade)
  const prevImage = useRef(null);

  const setShape = (i) => (el) => {
    shapesRef.current[i] = el;
  };

  // ── Establish GSAP-owned depth on every layer, then idle-drift the shapes ───
  useEffect(() => {
    const shapes = shapesRef.current.filter(Boolean);
    const a = photoARef.current;
    const b = photoBRef.current;

    // Base depth/scale set through GSAP so subsequent x/y/rotation tweens keep z.
    [a, b].forEach((el) => {
      if (el) gsap.set(el, { z: -300, scale: 1.06 });
    });
    shapes.forEach((el, i) => gsap.set(el, { z: SHAPES[i].z }));

    if (prefersReducedMotion()) return undefined;

    const tweens = shapes.map((el, i) => {
      const sign = i % 2 === 0 ? 1 : -1;
      // Drift X/Y + a slow scale breath so each blob feels alive (no whole-field
      // rotation — that reads as nausea).
      return gsap.to(el, {
        x: sign * (26 + i * 6),
        y: -sign * (20 + i * 5),
        scale: 1.12,
        duration: 7 + i * 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
    return () => tweens.forEach((t) => t.kill());
  }, []);

  // ── Pointer parallax (fine pointer only): photo + scrim shift by their depth ─
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || prefersReducedMotion() || isCoarsePointer()) return undefined;

    const layers = scene.querySelectorAll("[data-parallax]");
    const setters = Array.from(layers).map((el) => ({
      depth: parseFloat(el.getAttribute("data-parallax")) || 0.2,
      x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
      rx: gsap.quickTo(el, "rotationY", { duration: 1.1, ease: "power3.out" }),
      ry: gsap.quickTo(el, "rotationX", { duration: 1.1, ease: "power3.out" }),
    }));

    const onMove = (e) => {
      const px = e.clientX / window.innerWidth - 0.5; // -0.5..0.5
      const py = e.clientY / window.innerHeight - 0.5;
      setters.forEach((s) => {
        s.x(-px * 60 * s.depth);
        s.y(-py * 60 * s.depth);
        s.rx(px * 5 * s.depth);
        s.ry(-py * 5 * s.depth);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // ── Cross-fade the backdrop photo whenever `image` changes ──────────────────
  useEffect(() => {
    const a = photoARef.current;
    if (!a) return;
    if (prevImage.current === image) return;
    const reduce = prefersReducedMotion();
    const b = photoBRef.current;

    // Old image stays on B for the dissolve; new image paints on A.
    if (b && prevImage.current) {
      b.style.backgroundImage = `url('${prevImage.current}')`;
      gsap.set(b, { opacity: 1 });
    }
    a.style.backgroundImage = image ? `url('${image}')` : "none";

    if (reduce) {
      gsap.set(a, { opacity: image ? 1 : 0 });
      if (b) gsap.set(b, { opacity: 0 });
    } else {
      gsap.fromTo(
        a,
        { opacity: 0, scale: 1.12, z: -360 },
        {
          opacity: image ? 1 : 0,
          scale: 1.06,
          z: -300,
          duration: dur(0.9),
          ease: "expo.out",
        },
      );
      if (b) gsap.to(b, { opacity: 0, duration: dur(0.7), ease: "power2.out" });
      if (image) {
        // Slow Ken-Burns push while the stage lingers.
        gsap.to(a, {
          scale: 1.16,
          duration: dur(16),
          ease: "sine.inOut",
          delay: dur(0.9),
        });
      }
    }
    prevImage.current = image;
  }, [image]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        perspective: "1300px",
        perspectiveOrigin: "50% 45%",
        // Deepest base wash so edges never read flat even before a photo loads.
        background: `radial-gradient(120% 120% at 50% 18%, ${colors.primaryAlt} 0%, ${colors.bgPrimary} 48%, ${colors.bgTertiary} 100%)`,
      }}
    >
      <Box
        ref={sceneRef}
        sx={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Backdrop photo — two stacked layers for the dissolve (depth via GSAP). */}
        <Box
          ref={photoBRef}
          data-parallax="0.45"
          aria-hidden
          sx={photoLayerSx}
        />
        <Box
          ref={photoARef}
          data-parallax="0.45"
          aria-hidden
          sx={photoLayerSx}
        />

        {/* Floating soft shapes at varied depths (the "alive" gold/beige bokeh). */}
        {SHAPES.map((s, i) => (
          <Box
            key={i}
            ref={setShape(i)}
            aria-hidden
            sx={{
              position: "absolute",
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              filter: `blur(${s.blur}px)`,
              opacity: s.opacity,
              background: s.fill,
              willChange: "transform",
            }}
          />
        ))}

        {/* Readability scrim — in front of photo+shapes, behind content. */}
        <Box
          data-parallax="0.2"
          aria-hidden
          sx={{
            position: "absolute",
            inset: "-4%",
            background: `linear-gradient(180deg, rgba(40,32,24,${dim * 0.55}) 0%, rgba(40,32,24,${dim}) 55%, rgba(40,32,24,${dim * 0.8}) 100%)`,
            pointerEvents: "none",
            willChange: "transform",
          }}
        />
      </Box>

      {/* Stage content at the front (z≈0). Scrolls with the page; scene is fixed. */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

const photoLayerSx = {
  position: "absolute",
  inset: "-8%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transformStyle: "preserve-3d",
  opacity: 0,
  willChange: "transform, opacity",
};

// Soft floating shapes. `z` is the depth (px) GSAP sets on mount. Gold/beige
// only — strictly on-brand.
const SHAPES = [
  {
    top: "12%",
    left: "8%",
    size: "42vmin",
    blur: 60,
    opacity: 0.5,
    z: -180,
    fill: `radial-gradient(circle at 35% 35%, ${colors.primary}, rgba(211,172,113,0))`,
  },
  {
    top: "58%",
    left: "70%",
    size: "52vmin",
    blur: 80,
    opacity: 0.42,
    z: -240,
    fill: `radial-gradient(circle at 40% 40%, ${colors.secondary}, rgba(227,183,154,0))`,
  },
  {
    top: "70%",
    left: "10%",
    size: "30vmin",
    blur: 50,
    opacity: 0.4,
    z: -90,
    fill: `radial-gradient(circle at 40% 40%, ${colors.primaryAlt}, rgba(247,238,221,0))`,
  },
  {
    top: "6%",
    left: "62%",
    size: "26vmin",
    blur: 44,
    opacity: 0.45,
    z: -60,
    fill: `radial-gradient(circle at 40% 40%, ${colors.primaryDark}, rgba(190,151,92,0))`,
  },
  {
    top: "38%",
    left: "40%",
    size: "60vmin",
    blur: 100,
    opacity: 0.22,
    z: -300,
    fill: `radial-gradient(circle at 45% 45%, ${colors.secondaryAlt}, rgba(244,235,230,0))`,
  },
];
