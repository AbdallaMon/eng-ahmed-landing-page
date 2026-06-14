"use client";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import gsap from "gsap";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import Card3D from "@/app/register/core/cards3d/Card3D";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { scatterSiblings } from "@/app/register/core/cards3d/flyToFill";
import {
  coverMorph,
  reverseCoverMorph,
} from "@/app/register/core/cards3d/coverMorph";
import { useDepthReveal } from "@/app/register/variants/v1/useDepthReveal";
import {
  dur,
  stagger,
  prefersReducedMotion,
} from "@/app/register/variants/v1/v1Motion";

/**
 * The signature card stage, reused for BOTH the location and item steps.
 *
 * Photographic `Card3D` panels float in the scene and enter as depth-staggered
 * 3D objects (the OUTER wrapper carries `data-depth`; `Card3D`'s own inner node
 * stays free for its tilt / idle-float and for `flyToFill`). On select, the
 * chosen card flies toward the viewer and unfolds edge-to-edge (`flyToFill`)
 * while the others scatter back in depth (`scatterSiblings`); only AFTER that
 * choreography lands do we call `onSelect(value)` so the flow advances onto the
 * new backdrop. `disabled` (the flow's `isAnimating`) guards against double-fire.
 *
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   options: Array<{ value: string, image: string, title: string, alt?: string, note?: string, hint?: string }>,
 *   onSelect: (value: string) => void,
 *   disabled?: boolean,
 *   revealKey?: string,   // bump to replay the entrance (e.g. the step name)
 *   columns?: { xs?: number, md?: number },
 * }} props
 */
export default function OptionCardsStage({
  title,
  subtitle,
  options,
  onSelect,
  disabled = false,
  revealKey = "",
  columns = { xs: 1, md: 2 },
  direction = 1,
  returning = "",
}) {
  const { lng } = useLanguage();
  const cardNodes = useRef({}); // value -> inner DOM node (from Card3D.cardRef)
  const headerRef = useRef(null); // title + subtitle (recede on pick)
  const firing = useRef(false);
  const back = direction < 0;
  // BACK from a step we picked a card on: the full-screen room shrinks back INTO
  // that card (reverse-morph), the card returns, THEN the others. We own those
  // reveals here, so the generic depth-reveal is disabled for this entrance.
  const backReturn =
    back && !!returning && options.some((o) => o.value === returning);

  // Re-reveal the cards whenever the option set / step changes. A slightly
  // deeper, softer lift than the form rows (these are big hero cards). On BACK,
  // the cards arrive LAST — after the previous image has eased in and the title
  // has returned — so going back reads as a staged reverse (image → text → cards).
  // (The image already shrank away in the flow's exit beat before this swap.)
  const { ref } = useDepthReveal(
    {
      baseDelay: back ? 0.55 : 0.22,
      z: 220,
      y: 40,
      rotateX: 18,
      step: 0.11,
      duration: 0.85,
      enabled: !backReturn,
    },
    [revealKey, options.length, direction],
  );

  // BACK reverse-morph: the full-screen room photo shrinks back into the card we
  // came from, that card reveals where it lands, THEN the other cards return in
  // depth. Runs effect-time (post-paint): the first painted frame still shows the
  // outgoing room (the previous backdrop, not yet swapped) so the overlay — same
  // image, full-screen — lifts off it seamlessly before it shrinks.
  useEffect(() => {
    if (!backReturn) return undefined;
    const root = ref.current;
    if (!root) return undefined;
    const wrappers = Array.from(root.querySelectorAll(":scope [data-depth]"));
    if (!wrappers.length) return undefined;

    const chosenIndex = options.findIndex((o) => o.value === returning);
    const chosenOpt = options[chosenIndex];
    const chosenWrapper = wrappers[chosenIndex];
    if (!chosenOpt || !chosenWrapper) return undefined;
    const others = wrappers.filter((_, i) => i !== chosenIndex);

    if (prefersReducedMotion()) {
      gsap.set(wrappers, {
        opacity: 1,
        z: 0,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: "blur(0px)",
      });
      return undefined;
    }

    // Hold every card hidden; the shrinking photo IS the chosen card arriving.
    gsap.set(wrappers, { opacity: 0 });

    reverseCoverMorph(chosenWrapper, {
      image: chosenOpt.image,
      onComplete: () => {
        // The chosen card lands exactly where the photo shrank to.
        gsap.set(chosenWrapper, {
          z: 0,
          y: 0,
          rotateX: 0,
          scale: 1,
          clearProps: "transform",
        });
        gsap.fromTo(
          chosenWrapper,
          { opacity: 0 },
          { opacity: 1, duration: dur(0.3), ease: "power2.out" },
        );
        // Then the OTHER cards return in depth, after the chosen one settles.
        if (others.length) {
          gsap.fromTo(
            others,
            {
              opacity: 0,
              z: -220,
              y: 40,
              rotateX: -18,
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
              duration: dur(0.7),
              delay: dur(0.2),
              ease: "back.out(1.05)",
              stagger: stagger(0.1),
              transformOrigin: "50% 100%",
              clearProps: "transform,filter",
            },
          );
        }
      },
    });
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backReturn, returning, revealKey]);

  const handlePick = (opt) => {
    const value = opt.value;
    if (disabled || firing.current) return;
    const chosen = cardNodes.current[value];
    if (!chosen) {
      onSelect(value);
      return;
    }
    firing.current = true;
    const others = options
      .filter((o) => o.value !== value)
      .map((o) => cardNodes.current[o.value])
      .filter(Boolean);

    // The title/subtitle gently recede so the eye stays on the chosen card as it
    // takes over the frame — part of the "one continuous move" feel, not a cut.
    if (headerRef.current && !prefersReducedMotion()) {
      gsap.to(headerRef.current, {
        opacity: 0,
        y: -18,
        z: -120,
        duration: dur(0.45),
        ease: "power2.in",
      });
    }

    // Siblings drop back in depth, then the chosen card's PHOTO morphs edge-to-
    // edge to full-screen COVER (the framing re-crops AS it grows — no late
    // "snap to cover"), landing on the EXACT frame the backdrop rests at. The
    // flow advances behind that overlay (the backdrop adopts the same image
    // instantly) so the card "becomes" the next room with zero flash.
    scatterSiblings(others);
    coverMorph(chosen, {
      image: opt.image,
      onComplete: () => {
        firing.current = false;
        onSelect(value);
      },
    });
    // Hide the chosen card so it never peeks from behind the growing overlay.
    if (!prefersReducedMotion()) gsap.set(chosen, { autoAlpha: 0 });
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: { xs: 1, md: 2 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box
        ref={headerRef}
        sx={{
          textAlign: "center",
          mb: { xs: 3, md: 4 },
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
      >
        <AnimatedText
          as="h2"
          text={title}
          stagger={0.05}
          delay={back ? 0.3 : 0.15}
          sx={{
            m: 0,
            color: "#fff",
            fontWeight: 800,
            fontSize: { xs: "1.7rem", md: "2.3rem" },
            lineHeight: 1.18,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        />
        {subtitle && (
          <Typography
            sx={{
              mt: 1.25,
              color: "rgba(255,255,255,0.86)",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              textShadow: "0 2px 12px rgba(0,0,0,0.55)",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        ref={ref}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: `repeat(${columns.xs || 1}, 1fr)`,
            md: `repeat(${columns.md || 2}, 1fr)`,
          },
          gap: { xs: 2, md: 3 },
          width: "100%",
          maxWidth: 880,
          mx: "auto",
          perspective: "1200px",
        }}
      >
        {options.map((opt) => (
          <Box
            key={opt.value}
            data-depth
            sx={{
              opacity: 0,
              transformStyle: "preserve-3d",
              height: { xs: 200, sm: 240, md: 300 },
            }}
          >
            <Card3D
              ariaLabel={opt.title}
              onClick={() => handlePick(opt)}
              radius={24}
              tilt={12}
              cardRef={(el) => {
                cardNodes.current[opt.value] = el;
              }}
              sx={{ overflow: "hidden" }}
            >
              {/* Photo layer, pushed slightly back so the label reads in front. */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${opt.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: "translateZ(-12px) scale(1.06)",
                  borderRadius: "inherit",
                }}
              />
              {/* Bottom gradient for legibility. */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(20,15,10,0.72) 100%)",
                }}
              />
              {/* Label group floats in front of the photo (real depth). */}
              <Box
                sx={{
                  position: "absolute",
                  insetInlineStart: 0,
                  insetInlineEnd: 0,
                  bottom: 0,
                  p: { xs: 2, md: 2.5 },
                  transform: "translateZ(34px)",
                  textAlign: lng === "ar" ? "right" : "left",
                }}
              >
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: { xs: "1.2rem", md: "1.45rem" },
                    lineHeight: 1.15,
                    textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                  }}
                >
                  {opt.title}
                </Typography>
                {opt.note && (
                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "rgba(255,255,255,0.92)",
                      fontWeight: 600,
                      fontSize: { xs: "0.82rem", md: "0.9rem" },
                      textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                    }}
                  >
                    {opt.note}
                  </Typography>
                )}
                {opt.hint && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      mt: 1,
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 999,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#3a2f25",
                      background: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {opt.hint}
                  </Box>
                )}
              </Box>
            </Card3D>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
