"use client";
import { useEffect, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import gsap from "gsap";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import Card3D from "@/app/register/core/cards3d/Card3D";
import { flyToFill, scatterSiblings } from "@/app/register/core/cards3d/flyToFill";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { prefersReducedMotion } from "@/app/register/lib/animations";

import { locationOptions, itemOptions } from "@/app/register/variants/v2/stageData";
import EmailCapture from "@/app/register/variants/v2/EmailCapture";
import GalleryForm from "@/app/register/variants/v2/GalleryForm";

/**
 * Capability FALLBACK for V2 — the SAME flow rendered with the shared card
 * mechanic (Card3D + flyToFill + scatterSiblings + AnimatedText + real interior
 * photography) so V2 works on devices without usable WebGL / under reduced
 * motion. No WebGL, no canvas. Drives off the shared `flow` (useLeadFlow) and
 * `form` (useLeadForm) objects passed from V2Flow.
 *
 * Reuses core primitives only — does not duplicate them.
 */
export default function CardFlow({ flow, form }) {
  const theme = useTheme();
  const { translate } = useLanguage();

  const step = flow.step;
  const backdrop = flow.activeImage;
  // Inner card DOM nodes (handed back by Card3D) so we can fly the chosen one.
  const cardEls = useRef({});

  const onPickLocation = (value) => {
    if (flow.isAnimating) return;
    runFlyChoreography(value, locationOptions, () =>
      flow.handleLocationClick(value),
    );
  };
  const onPickItem = (value) => {
    if (flow.isAnimating) return;
    runFlyChoreography(value, itemOptions, () => flow.handleLeadItemClick(value));
  };

  // Fly the chosen card forward to fill the screen + scatter the siblings, then
  // call the flow handler (which advances after its own lock window). The flow
  // unmounts these cards on the step change, so the visual hands off cleanly.
  function runFlyChoreography(value, options, advance) {
    const chosen = cardEls.current[value];
    const others = options
      .filter((o) => o.value !== value)
      .map((o) => cardEls.current[o.value])
      .filter(Boolean);
    scatterSiblings(others);
    if (chosen) flyToFill(chosen, { duration: 0.8 });
    advance();
  }

  return (
    <Box sx={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {/* Full-screen photographic backdrop (depth layer pushed behind). */}
      <Backdrop image={backdrop} />

      {/* Stage content. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          pt: { xs: 9, md: 10 },
          pb: { xs: 3, md: 5 },
        }}
      >
        {(step === "designIntro" || step === "email") && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            {step === "designIntro" ? (
              <AnimatedText
                as="h1"
                text={translate("register.designLabel")}
                duration={0.7}
                sx={{
                  m: 0,
                  fontWeight: 900,
                  fontSize: { xs: "3rem", md: "5rem" },
                  color: "#fff",
                  textShadow: "0 6px 40px rgba(0,0,0,0.5)",
                }}
              />
            ) : (
              <EmailCapture
                onSubmit={flow.handleEmailSubmit}
                disabled={flow.isAnimating}
              />
            )}
          </Box>
        )}

        {step === "location" && (
          <CardOptions
            titleKey="register.chooseLocationTitle"
            subtitleKey="register.chooseLocationSubtitle"
            options={locationOptions}
            onSelect={onPickLocation}
            disabled={flow.isAnimating}
            registerCard={(v, el) => (cardEls.current[v] = el)}
          />
        )}

        {step === "item" && (
          <CardOptions
            titleKey="register.chooseItemTitle"
            subtitleKey="register.chooseItemSubtitle"
            options={itemOptions}
            onSelect={onPickItem}
            disabled={flow.isAnimating}
            registerCard={(v, el) => (cardEls.current[v] = el)}
          />
        )}
      </Box>

      {step === "form" && <GalleryForm form={form} item={flow.leadItem} />}
    </Box>
  );
}

/** A full-screen photo backdrop that cross-fades + parallax-drifts on change. */
function Backdrop({ image }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !image) return undefined;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, scale: 1 });
      return undefined;
    }
    const tween = gsap.fromTo(
      el,
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" },
    );
    return () => tween.kill();
  }, [image]);

  if (!image) {
    return (
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 90% at 50% 20%, #fcfbf9 0%, #eae7e2 60%, #e2dfd9 100%)",
        }}
      />
    );
  }

  return (
    <>
      <Box
        key={image}
        ref={ref}
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          backgroundImage: `url('${image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "translateZ(-1px)",
        }}
      />
      {/* Legibility scrim so headings over the photo always read. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.42) 100%)",
        }}
      />
    </>
  );
}

/** A heading + a deck of photographic Card3D option panels (the card mechanic). */
function CardOptions({
  titleKey,
  subtitleKey,
  options,
  onSelect,
  disabled,
  registerCard,
}) {
  const theme = useTheme();
  const { translate } = useLanguage();

  return (
    <Box
      sx={{
        width: "min(900px, 96vw)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 2.5, md: 4 },
        textAlign: "center",
      }}
    >
      <Box>
        <AnimatedText
          as="h1"
          text={translate(titleKey)}
          duration={0.6}
          sx={{
            m: 0,
            fontWeight: 800,
            fontSize: { xs: "1.6rem", md: "2.2rem" },
            color: "#fff",
            textShadow: "0 4px 28px rgba(0,0,0,0.55)",
            lineHeight: 1.2,
          }}
        />
        {subtitleKey && (
          <Typography
            sx={{
              mt: 1,
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 2px 16px rgba(0,0,0,0.5)",
            }}
          >
            {translate(subtitleKey)}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "grid",
          gap: { xs: 2, md: 3 },
          gridTemplateColumns: {
            xs: "1fr",
            sm: options.length > 2 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
          },
        }}
      >
        {options.map((opt) => (
          <Box key={opt.value} sx={{ height: { xs: 200, md: 280 } }}>
            <Card3D
              ariaLabel={translate(opt.labelKey)}
              onClick={() => onSelect(opt.value)}
              cardRef={(el) => registerCard(opt.value, el)}
              sx={{ pointerEvents: disabled ? "none" : "auto" }}
            >
              {/* Photo surface (pushed slightly back) + label plate (forward). */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  overflow: "hidden",
                  backgroundImage: `url('${opt.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: "translateZ(-20px)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  p: { xs: 2, md: 2.5 },
                  transform: "translateZ(36px)",
                  textAlign: "start",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.15rem", md: "1.35rem" },
                    color: "#fff",
                    textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                  }}
                >
                  {translate(opt.labelKey)}
                </Typography>
                {opt.priceKey && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.light,
                      fontWeight: 700,
                      textShadow: "0 1px 8px rgba(0,0,0,0.7)",
                    }}
                  >
                    {translate(opt.priceKey)}
                  </Typography>
                )}
              </Box>
            </Card3D>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
