"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { PHOTO_OVERSCAN, PHOTO_KENBURNS } from "@/app/register/core/cards3d/photoGeometry";
import {
  dur,
  isCoarsePointer,
  prefersReducedMotion,
} from "@/app/register/variants/v1/v1Motion";

/**
 * The "living 3D background" for V1 — pure CSS-3D + GSAP, ZERO WebGL.
 *
 * IMPORTANT — every full-screen layer here uses an inline `style` (NOT MUI `sx`).
 * `sx` compiles to an emotion class that can inject a frame LATE, so the photo
 * would paint at the wrong `background-size` and then SNAP to `cover` (a visible
 * "flash / the image resizes after the animation"). Inline `style` is applied on
 * the very first frame, so `cover` (and the rest) are correct from the start.
 *
 * THE PHOTO IS ALWAYS `cover` FROM FRAME 1. The layer is `position:absolute;
 * inset:0; background-size:cover; background-position:center` and only GSAP's
 * `scale`/`opacity`/`x`/`y` ever change — the `cover` framing itself never
 * animates, so there is no "fit → cover" snap. Resting scale = `PHOTO_OVERSCAN`,
 * shared with `coverMorph` so a card growing to fill lands on the IDENTICAL
 * frame the backdrop rests at (no hand-off flash).
 *
 * Transition model (GSAP-owned, React only swaps the `image`/`exiting` props):
 *  • FIRST load → a gentle push-in (scale up to rest) so you "enter the image".
 *  • FORWARD (a card was picked) → `coverMorph` does the visible motion; here we
 *    adopt the SAME image INSTANTLY at rest behind that overlay → zero flash.
 *  • BACK → a staged reverse: the current photo SHRINKS away first (`exiting`),
 *    then the previous photo eases back in (out-then-in cross-fade on two layers).
 *
 * @param {{
 *   image?: string|null, children?: React.ReactNode, dim?: number,
 *   variant?: "photo"|"form", direction?: number,   // -1 = navigating BACK
 *   exiting?: boolean,                               // true during the BACK exit beat
 * }} props
 */
export default function PerspectiveStage({
  image,
  children,
  dim = 0.46,
  variant = "photo",
  direction = 1,
  exiting = false,
}) {
  const sceneRef = useRef(null);
  const shapesRef = useRef([]);
  const photoARef = useRef(null); // current photo
  const photoBRef = useRef(null); // outgoing photo (back cross-fade only)
  const prevImage = useRef(null); // last image the ENTER effect processed
  const exitImage = useRef(image); // last image the EXIT effect saw
  const firstExitRun = useRef(true);
  const isForm = variant === "form";

  const setShape = (i) => (el) => {
    shapesRef.current[i] = el;
  };

  // ── Mount: GSAP establishes the resting depth + initial (hidden) opacity on the
  // photo layers, then idle-drifts the shapes. opacity/transform stay GSAP-owned. ─
  useEffect(() => {
    const shapes = shapesRef.current.filter(Boolean);
    const a = photoARef.current;
    const b = photoBRef.current;

    // Establish the layers' resting depth + initial HIDDEN opacity — but ONLY on
    // the genuine first mount. React re-invokes effects (StrictMode in dev) and a
    // hydration-mismatch can regenerate this tree; if this block re-ran it would
    // re-zero a layer the ENTER effect has ALREADY brought up (it tracks progress
    // via `prevImage`), leaving the room photo stuck invisible. Once ENTER has run
    // (`prevImage` set) it OWNS opacity/scale, so we must not touch them here.
    if (prevImage.current === null) {
      [a, b].forEach((el) => {
        if (el) gsap.set(el, { opacity: 0, scale: PHOTO_OVERSCAN, x: 0, y: 0 });
      });
    }
    shapes.forEach((el, i) => gsap.set(el, { z: SHAPES[i].z }));

    if (prefersReducedMotion()) return undefined;

    const tweens = shapes.map((el, i) => {
      const sign = i % 2 === 0 ? 1 : -1;
      return gsap.to(el, {
        x: sign * (22 + i * 7),
        y: -sign * (18 + i * 6),
        scale: 1.1,
        duration: 9 + i * 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.6,
      });
    });
    return () => tweens.forEach((t) => t.kill());
  }, []);

  // ── Immersion: fine pointer → parallax + lean toward cursor; TOUCH → drift ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || prefersReducedMotion()) return undefined;

    const coarse = isCoarsePointer();
    const layers = Array.from(scene.querySelectorAll("[data-parallax]"));

    if (coarse) {
      const loops = layers.map((el, i) => {
        const depth = parseFloat(el.getAttribute("data-parallax")) || 0.2;
        const sign = i % 2 === 0 ? 1 : -1;
        return gsap.to(el, {
          x: sign * 34 * depth,
          y: -sign * 26 * depth,
          duration: 12 + i * 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.8,
        });
      });
      return () => loops.forEach((t) => t.kill());
    }

    const setters = layers.map((el) => ({
      depth: parseFloat(el.getAttribute("data-parallax")) || 0.2,
      x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power4.out" }),
      y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power4.out" }),
      rx: gsap.quickTo(el, "rotationY", { duration: 1.3, ease: "power4.out" }),
      ry: gsap.quickTo(el, "rotationX", { duration: 1.3, ease: "power4.out" }),
    }));

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    const apply = () => {
      setters.forEach((s) => {
        // Capped travel: stays inside the OVERSCAN headroom so an edge never peeks.
        s.x(-targetX * 70 * s.depth);
        s.y(-targetY * 70 * s.depth);
        s.rx(targetX * 5 * s.depth);
        s.ry(-targetY * 5 * s.depth);
      });
    };
    const onMove = (e) => {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          apply();
        });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // ── ENTER: bring the new backdrop photo in whenever `image` changes ──────────
  useEffect(() => {
    const a = photoARef.current;
    if (!a) return;
    const b = photoBRef.current;
    const reduce = prefersReducedMotion();
    const imageChanged = prevImage.current !== image;
    if (!imageChanged) return;

    const isFirst = prevImage.current === null;
    const back = direction < 0;

    gsap.killTweensOf(a, "scale,opacity,x,y");
    a.style.backgroundImage = image ? `url('${image}')` : "none";

    if (reduce) {
      gsap.set(a, { opacity: image ? 1 : 0, scale: PHOTO_OVERSCAN, x: 0, y: 0 });
      if (b) gsap.set(b, { opacity: 0 });
      prevImage.current = image;
      return;
    }

    if (isFirst) {
      // First paint — establish the resting frame IMMEDIATELY (photo fully
      // opaque), then a gentle SCALE-only push-IN so you feel you're entering the
      // image. We deliberately NEVER animate opacity UP from 0 here: a long
      // opacity `fromTo` can survive an effect re-run (React StrictMode in dev) or
      // a hydration tree-regeneration and leave the room photo STRANDED invisible
      // — that was the "image disappears / blank wash after the card grows" bug.
      // A scale-only push-in cannot hide the image (any frozen scale is still
      // >1 = full-bleed), so the room is guaranteed visible.
      gsap.set(a, { opacity: image ? 1 : 0, scale: PHOTO_OVERSCAN, x: 0, y: 0 });
      if (image) {
        gsap.from(a, {
          scale: PHOTO_OVERSCAN * 0.92,
          duration: dur(1.6),
          ease: "expo.out",
        });
      }
      kenBurns(a);
    } else if (back) {
      // BACK: the reverse-morph overlay (OptionCardsStage) owns the visible
      // motion — the outgoing room shrinks back into its card. Here we just adopt
      // the new backdrop INSTANTLY at rest BEHIND that overlay, so as the overlay
      // shrinks it reveals a solid, correctly-framed room (nothing to cross-fade
      // against, no jump). Identical handling to the forward branch.
      if (b) gsap.set(b, { opacity: 0 });
      gsap.set(a, { opacity: image ? 1 : 0, scale: PHOTO_OVERSCAN, x: 0, y: 0 });
      kenBurns(a);
    } else {
      // FORWARD: a `coverMorph` overlay just played the visible card → screen
      // motion and ends on the IDENTICAL frame. Adopt the image INSTANTLY at rest
      // behind it — the overlay is then removed revealing this exact image. No flash.
      if (b) gsap.set(b, { opacity: 0 });
      gsap.set(a, { opacity: image ? 1 : 0, scale: PHOTO_OVERSCAN, x: 0, y: 0 });
      kenBurns(a);
    }
    prevImage.current = image;
  }, [image, direction]);

  // ── EXIT: the staged BACK reverse "the image shrinks away first" ─────────────
  // When `exiting` flips true the current photo recedes + shrinks (the leading
  // beat). The ENTER effect above then brings the previous photo back. For a
  // same-image back (no `image` change) the ENTER effect is skipped, so here we
  // also RESTORE the photo to rest once the exit clears.
  useEffect(() => {
    const a = photoARef.current;
    if (!a) return undefined;
    if (firstExitRun.current) {
      firstExitRun.current = false;
      exitImage.current = image;
      return undefined;
    }
    const imageChanged = exitImage.current !== image;
    exitImage.current = image;
    if (prefersReducedMotion()) return undefined;

    // exiting: NO-OP — the reverse-morph overlay (OptionCardsStage) owns the
    // visible "room shrinks back into the card", so the backdrop must STAY at its
    // resting frame (the overlay, same image + full-screen, lifts off it
    // seamlessly before shrinking). Only the same-image back (e.g. location →
    // email, where no reverse-morph runs and the ENTER effect is skipped) settles
    // the photo back to rest here.
    if (!exiting && !imageChanged) {
      gsap.killTweensOf(a, "scale,opacity");
      gsap.to(a, {
        scale: PHOTO_OVERSCAN,
        opacity: 1,
        duration: dur(0.55),
        ease: "power2.out",
      });
      kenBurns(a);
    }
    return undefined;
  }, [exiting, image]);

  return (
    <Box style={CONTAINER_STYLE}>
      <Box ref={sceneRef} style={SCENE_STYLE}>
        {/* Backdrop photo — two stacked layers (A current, B outgoing for the back
            cross-fade). `cover` lives in inline style so the full-bleed fill is
            correct on the FIRST frame (no resize flash). opacity/transform = GSAP. */}
        <Box ref={photoBRef} data-parallax="0.4" aria-hidden style={PHOTO_LAYER_STYLE} />
        <Box ref={photoARef} data-parallax="0.4" aria-hidden style={PHOTO_LAYER_STYLE} />

        {/* Floating soft shapes at varied depths (the "alive" gold/beige bokeh). */}
        {SHAPES.map((s, i) => (
          <Box key={i} ref={setShape(i)} aria-hidden style={shapeStyle(s)} />
        ))}

        {/* Base readability wash (always present). */}
        <Box data-parallax="0.16" aria-hidden style={photoScrimStyle(dim)} />
        {/* Deeper wash for the form stage — opacity is a plain CSS transition
            (React-driven), so it fades in without GSAP and never flashes. */}
        <Box
          data-parallax="0.16"
          aria-hidden
          style={{ ...FORM_SCRIM_STYLE, opacity: isForm ? 1 : 0 }}
        />
      </Box>

      {/* Stage content at the front (z≈0). A FIXED full-height column over the
          fixed photo/parallax scene — it does NOT scroll itself. The scroll lives
          ONE level deeper, in the flow's stage-content box (V1Flow), so the top
          chrome (the journey breadcrumb + progress dots) stays PINNED at the top
          while only the active stage (cards / form) scrolls beneath it. `minHeight:0`
          lets that inner scroll area bound itself; `overflow:hidden` clips any spill. */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100dvh",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** Slow Ken-Burns drift on the resting photo (kills its own previous drift). */
function kenBurns(el) {
  if (!el || prefersReducedMotion()) return;
  gsap.to(el, {
    scale: PHOTO_OVERSCAN + PHOTO_KENBURNS,
    duration: dur(24),
    ease: "sine.inOut",
    delay: dur(1.0),
    yoyo: true,
    repeat: -1,
  });
}

const CONTAINER_STYLE = {
  position: "fixed",
  inset: 0,
  overflow: "hidden",
  perspective: "1300px",
  perspectiveOrigin: "50% 45%",
  background: `radial-gradient(120% 120% at 50% 18%, ${colors.primaryAlt} 0%, ${colors.bgPrimary} 48%, ${colors.bgTertiary} 100%)`,
};

const SCENE_STYLE = {
  position: "absolute",
  inset: 0,
  transformStyle: "preserve-3d",
  willChange: "transform",
};

// inset:0 + cover + center → the photo covers the viewport from the FIRST painted
// frame. Only GSAP scale/opacity/x/y animate; the `cover` framing is constant.
const PHOTO_LAYER_STYLE = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  transformStyle: "preserve-3d",
  willChange: "transform, opacity",
};

/** Base readability wash for PHOTO stages. Deliberately LIGHT and transparent
 *  through the middle so the room photo READS clearly (the owner wants the image
 *  to show, not be buried under a wash). Only a faint top + a soft bottom floor
 *  remain — just enough for the white titles/dots and card labels that float. */
function photoScrimStyle(dim) {
  return {
    position: "absolute",
    inset: "-4%",
    background: `linear-gradient(180deg, rgba(20,15,10,${dim * 0.34}) 0%, rgba(20,15,10,0) 22%, rgba(20,15,10,0) 64%, rgba(20,15,10,${dim * 0.9}) 100%)`,
    pointerEvents: "none",
    willChange: "transform",
  };
}

/** Deeper wash faded IN on the form stage. The owner asked for the FORM to read
 *  clearly, so on this step the photo is pushed back noticeably (a darker centre
 *  radial + a stronger top→bottom gradient) while the strengthened glass fields
 *  sit in front. The photo stays recognisable — just recessive — so it's still
 *  "the room you chose", not a flat black panel. React/CSS-transition (no GSAP,
 *  no flash). */
const FORM_SCRIM_STYLE = {
  position: "absolute",
  inset: "-4%",
  background: [
    "radial-gradient(120% 90% at 50% 45%, rgba(16,12,8,0.18) 0%, rgba(16,12,8,0.46) 100%)",
    "linear-gradient(180deg, rgba(16,12,8,0.30) 0%, rgba(12,9,6,0.50) 100%)",
  ].join(", "),
  pointerEvents: "none",
  willChange: "transform, opacity",
  transition: "opacity 0.8s ease",
};

function shapeStyle(s) {
  return {
    position: "absolute",
    top: s.top,
    left: s.left,
    width: s.size,
    height: s.size,
    borderRadius: "50%",
    filter: `blur(${s.blur}px)`,
    // Kept very faint so the room PHOTO reads clean — the gold bokeh is a hint of
    // warmth, never a haze/blur sitting over the image.
    opacity: s.opacity * 0.3,
    background: s.fill,
    willChange: "transform",
  };
}

// Soft floating shapes. `z` is the depth (px) GSAP sets on mount. Gold/beige only.
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
