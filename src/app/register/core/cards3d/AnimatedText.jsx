"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * A 3D text reveal: splits its text into words (each wrapped in an inline-block
 * span) and animates them in on mount with a GSAP stagger (rotateX +
 * translateZ + opacity) — words rise and rotate into place. No paid SplitText
 * plugin; the splitting is done here.
 *
 * RTL-safe: words are kept in SOURCE/DOM order (Arabic is NOT reversed). Only
 * each word is animated; the container inherits the page's `direction`, so
 * visual ordering stays correct in both ar and en. Spaces are preserved as
 * real whitespace between word spans, and each word keeps `white-space: pre`
 * so multi-glyph words never break internally.
 *
 * Under reduced-motion the text simply appears (no transform animation).
 *
 * @param {{
 *   text: string,
 *   as?: React.ElementType,  // rendered element/component (default "div")
 *   stagger?: number,        // per-word stagger seconds (default 0.06)
 *   delay?: number,          // start delay seconds (default 0)
 *   duration?: number,       // per-word duration seconds (default 0.7)
 *   sx?: object,
 * }} props
 */
export default function AnimatedText({
  text = "",
  as = "div",
  stagger = 0.06,
  delay = 0,
  duration = 0.7,
  sx,
  ...rest
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const words = root.querySelectorAll("[data-word]");
    if (!words.length) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(words, { opacity: 1, rotateX: 0, z: 0, y: 0 });
      return undefined;
    }

    const tween = gsap.fromTo(
      words,
      { opacity: 0, rotateX: -85, z: -60, y: 12 },
      {
        opacity: 1,
        rotateX: 0,
        z: 0,
        y: 0,
        duration,
        delay,
        ease: "power3.out",
        stagger,
        transformOrigin: "50% 100%",
      },
    );
    return () => tween.kill();
  }, [text, stagger, delay, duration]);

  // Split on whitespace but KEEP the separators so spacing is preserved exactly
  // (and DOM order matches source order — critical for RTL correctness).
  const tokens = String(text).split(/(\s+)/);

  return (
    <Box
      ref={rootRef}
      component={as}
      sx={{
        // Perspective on the container so per-word rotateX/translateZ read as 3D.
        perspective: "700px",
        display: "inline-block",
        ...sx,
      }}
      {...rest}
    >
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) {
          // Preserve the whitespace token literally.
          return <span key={`s-${i}`}>{token}</span>;
        }
        if (token === "") return null;
        return (
          <Box
            key={`w-${i}`}
            component="span"
            data-word
            sx={{
              display: "inline-block",
              whiteSpace: "pre",
              transformStyle: "preserve-3d",
              willChange: "transform, opacity",
              // Start hidden so there is no flash before the effect runs (the
              // effect sets the final state for reduced-motion immediately).
              opacity: 0,
            }}
          >
            {token}
          </Box>
        );
      })}
    </Box>
  );
}
