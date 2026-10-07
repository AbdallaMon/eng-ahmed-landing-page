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
import {
  liftTitle,
  landTitle,
  dissolveFloating,
} from "@/app/register/core/cards3d/titleMorph";
import colors from "@/app/register/theme/colors";
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
  cardHeight = { xs: 160, sm: 220, md: 300 },
  direction = 1,
  returning = "",
}) {
  const { lng } = useLanguage();
  const cardNodes = useRef({}); // value -> inner DOM node (from Card3D.cardRef)
  const titleNodes = useRef({}); // value -> title DOM node (for the title morph)
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
      baseDelay: back ? 0.4 : 0.14,
      z: 200,
      y: 36,
      rotateX: 16,
      step: 0.08,
      duration: 0.6,
      enabled: !backReturn,
    },
    [revealKey, options.length, direction],
  );

  // Reset the header (title + subtitle) on every stage entrance. The location→item
  // step REUSES this same component instance (React keeps it — same type/position,
  // only props change, NO remount), so the "recede on pick" tween that pushed the
  // header back/up on the LOCATION pick would otherwise persist and the ITEM step's
  // title would stay shifted-back and invisible (opacity 0 / translateZ(-120)). We
  // clear it here so the new step's own AnimatedText reveal plays from a clean,
  // visible state. Cheap + idempotent on a fresh mount.
  useEffect(() => {
    const h = headerRef.current;
    if (!h) return;
    gsap.killTweensOf(h);
    gsap.set(h, { opacity: 1, y: 0, z: 0, clearProps: "transform" });
  }, [revealKey, direction]);

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

    // The chosen card lands exactly where the photo shrank to, then the OTHER
    // cards return in depth — the tail of the reverse.
    const revealCards = () => {
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
        { opacity: 1, duration: dur(0.25), ease: "power2.out" },
      );
      if (others.length) {
        gsap.fromTo(
          others,
          {
            opacity: 0,
            z: -200,
            y: 36,
            rotateX: -16,
            scale: 0.94,
          },
          {
            opacity: 1,
            z: 0,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: dur(0.55),
            delay: dur(0.15),
            ease: "back.out(1.05)",
            stagger: stagger(0.08),
            transformOrigin: "50% 100%",
            clearProps: "transform",
          },
        );
      }
    };

    // Then the room photo SHRINKS back into the chosen card slot — and only once
    // the card is revealed do we DISSOLVE the held word into the card's real
    // title (so it hands off seamlessly and never visibly disappears).
    const shrinkPhoto = () =>
      reverseCoverMorph(chosenWrapper, {
        image: chosenOpt.image,
        onComplete: () => {
          revealCards();
          dissolveFloating(0.35);
        },
      });

    // The owner's reverse order: the accumulated WORD flies straight back down
    // from the breadcrumb onto its EXACT card-title spot and STAYS there
    // (`keepClone`); only THEN does the photo shrink in behind it. (Deep-link /
    // no clone → shrink directly.)
    const titleEl = titleNodes.current[returning];
    if (titleEl) landTitle(titleEl, { keepClone: true, onLanded: shrinkPhoto });
    else shrinkPhoto();
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
        duration: dur(0.38),
        ease: "power2.in",
      });
    }

    // The JOURNEY move: lift the chosen NAME off the card — it recolours to gold
    // and rises toward the top while the photo grows; the persistent breadcrumb
    // (`JourneyBreadcrumb`) then flies it into its accumulated slot. Hide the
    // card's own title so only the floating clone reads. Same for BOTH the
    // location and item decks (each contributes one breadcrumb token).
    const titleEl = titleNodes.current[value];
    const willMorphTitle = titleEl && !prefersReducedMotion();
    if (willMorphTitle) {
      // Slide the title to the centre at its OWN size (centerScale: 1) — the owner
      // wants to SEE it travel, not have it balloon/pop into place at the centre.
      liftTitle(titleEl, { color: colors.primary, centerScale: 1 });
      gsap.set(titleEl, { opacity: 0 });
    }

    // Siblings drop back in depth, then the chosen card's PHOTO morphs edge-to-
    // edge to full-screen COVER (the framing re-crops AS it grows — no late
    // "snap to cover"), landing on the EXACT frame the backdrop rests at. The
    // flow advances behind that overlay (the backdrop adopts the same image
    // instantly) so the card "becomes" the next room with zero flash.
    const runGrow = () => {
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

    // Give the name a short beat to recolour + start rising BEFORE the photo grows
    // (the owner's order: colour → up → grow → fly to form), then grow.
    if (willMorphTitle) gsap.delayedCall(dur(0.28), runGrow);
    else runGrow();
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        // Anchor to the TOP on mobile (so all stacked cards — incl. the 3rd item,
        // PART_OF_HOME — are reachable from scrollTop 0 with no centering clip) and
        // centre on desktop where the cards sit in one row and always fit.
        justifyContent: { xs: "flex-start", md: "center" },
        px: { xs: 1, md: 2 },
        py: { xs: 1.5, md: 3 },
      }}
    >
      <Box
        ref={headerRef}
        sx={{
          textAlign: "center",
          mb: { xs: 2, md: 4 },
          flexShrink: 0,
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
              // Per-step height (passed by V1Flow): the ITEM deck is shorter on
              // mobile so all THREE stacked cards fit the viewport; the LOCATION
              // deck (only two cards) stays a bit taller.
              height: cardHeight,
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
              {/* A very light resting overlay (soft corner vignette) so the card
                  reads with a touch more depth/premium BEFORE it grows. Inline
                  `style`, NOT `sx`: an emotion class can inject a frame late, so a
                  card that's about to morph to full-screen would pop; inline style
                  is correct on the first frame. Kept faint — the room photo stays
                  clearly visible through the centre. */}
              <Box
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  pointerEvents: "none",
                  background:
                    "radial-gradient(115% 115% at 50% 35%, rgba(20,15,10,0) 52%, rgba(20,15,10,0.30) 100%)",
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
                  ref={(el) => {
                    titleNodes.current[opt.value] = el;
                  }}
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
