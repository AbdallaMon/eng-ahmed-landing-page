"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * A premium 3D card. The OUTER element owns the `perspective`; the INNER element
 * is `preserve-3d` and is what actually tilts/scales (so its z-translated child
 * layers read with real depth). On a fine pointer the card tilts toward the
 * cursor with a moving sheen; on touch / reduced-motion it stays calm.
 *
 * The inner DOM node is handed back via `cardRef` so the deck choreography can
 * fly this exact card toward the viewer and open it onto the scene.
 *
 * @param {{
 *   children: React.ReactNode,
 *   onClick?: () => void,
 *   interactive?: boolean,   // pointer tilt + sheen (off for forms)
 *   ariaLabel?: string,
 *   radius?: number,
 *   tilt?: number,           // max tilt degrees
 *   cardRef?: (el: HTMLElement | null) => void,
 *   sx?: object,             // styles for the inner card surface
 * }} props
 */
export default function Card3D({
  children,
  onClick,
  interactive = true,
  ariaLabel,
  radius = 22,
  tilt = 14,
  cardRef,
  sx,
}) {
  const innerRef = useRef(null);
  const glareRef = useRef(null);
  const quick = useRef(null);

  const setInner = (el) => {
    innerRef.current = el;
    if (cardRef) cardRef(el);
  };

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return undefined;
    const reduce = prefersReducedMotion();
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)")?.matches;

    if (reduce) return undefined;

    // Touch devices can't hover — give the card a slow idle breathing tilt so it
    // still reads as a 3D object without needing a pointer.
    if (coarse || !interactive) {
      const idle = gsap.to(el, {
        rotateY: interactive ? 5 : 0,
        rotateX: interactive ? -4 : 0,
        y: -4,
        duration: 3.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      return () => idle.kill();
    }

    // Fine pointer: smooth tilt toward the cursor.
    quick.current = {
      ry: gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3.out" }),
      rx: gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3.out" }),
    };
    return () => {
      quick.current = null;
    };
  }, [interactive]);

  const handleMove = (e) => {
    if (!quick.current || !innerRef.current) return;
    const r = innerRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    quick.current.ry(px * tilt * 2);
    quick.current.rx(-py * tilt * 2);
    const g = glareRef.current;
    if (g) {
      g.style.opacity = "0.4";
      g.style.transform = `translateZ(40px) translate(${px * 55}%, ${py * 55}%)`;
    }
  };

  const handleLeave = () => {
    if (quick.current) {
      quick.current.ry(0);
      quick.current.rx(0);
    }
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <Box sx={{ perspective: "1100px", width: "100%", height: "100%" }}>
      <Box
        ref={setInner}
        component={onClick ? "button" : "div"}
        type={onClick ? "button" : undefined}
        onClick={onClick}
        onPointerMove={interactive ? handleMove : undefined}
        onPointerLeave={interactive ? handleLeave : undefined}
        aria-label={ariaLabel}
        sx={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          m: 0,
          p: 0,
          border: "none",
          background: "transparent",
          textAlign: "inherit",
          transformStyle: "preserve-3d",
          willChange: "transform",
          cursor: onClick ? "pointer" : "default",
          borderRadius: `${radius}px`,
          "&:focus-visible": {
            outline: "3px solid",
            outlineColor: "primary.main",
            outlineOffset: 4,
          },
          ...sx,
        }}
      >
        {children}
        {interactive && (
          <Box
            ref={glareRef}
            aria-hidden
            sx={{
              position: "absolute",
              inset: "-30%",
              pointerEvents: "none",
              borderRadius: "inherit",
              opacity: 0,
              transition: "opacity .3s ease",
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)",
              mixBlendMode: "soft-light",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
