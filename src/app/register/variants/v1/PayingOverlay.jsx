"use client";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { dur, prefersReducedMotion } from "@/app/register/variants/v1/v1Motion";

/**
 * Full-screen "preparing your secure payment…" 3D transition. Mounted by the
 * orchestrator the moment `form.isPaying` flips true; the frozen `useLeadForm`
 * fires the Stripe redirect itself right after, so this overlay simply covers
 * the swap with a premium brand beat (a gold panel sweeps up in Z while three
 * orbiting glyphs spin). No boxed paper. Honours reduced motion (static panel).
 */
export default function PayingOverlay() {
  const { translate } = useLanguage();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const ring = ringRef.current;
    if (!root) return undefined;

    if (prefersReducedMotion()) {
      gsap.set([root, panel], { opacity: 1, clearProps: "transform" });
      return undefined;
    }

    const tl = gsap.timeline();
    tl.fromTo(
      root,
      { opacity: 0 },
      { opacity: 1, duration: dur(0.3), ease: "power1.out" },
    ).fromTo(
      panel,
      { opacity: 0, z: -300, rotateX: 18, y: 40 },
      {
        opacity: 1,
        z: 0,
        rotateX: 0,
        y: 0,
        duration: dur(0.7),
        ease: "expo.out",
      },
      "-=0.1",
    );

    const spin = ring
      ? gsap.to(ring, { rotate: 360, duration: 1.6, ease: "none", repeat: -1 })
      : null;

    return () => {
      tl.kill();
      spin?.kill();
    };
  }, []);

  return (
    <Box
      ref={rootRef}
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        opacity: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1100px",
        background: `radial-gradient(120% 120% at 50% 30%, ${colors.primaryAlt} 0%, ${colors.bgPrimary} 55%, ${colors.bgTertiary} 100%)`,
      }}
    >
      <Box
        ref={panelRef}
        sx={{
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          px: 4,
          textAlign: "center",
        }}
      >
        {/* Orbiting glyph ring. */}
        <Box
          sx={{
            position: "relative",
            width: 88,
            height: 88,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Box
            ref={ringRef}
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `3px solid ${colors.primaryAlt}`,
              borderTopColor: colors.primary,
              borderRightColor: colors.primaryDark,
            }}
          />
          <Box
            aria-hidden
            sx={{
              width: 46,
              height: 46,
              borderRadius: "16px",
              background: colors.primaryGradient,
              boxShadow: "0 12px 28px rgba(190,151,92,0.5)",
            }}
          />
        </Box>

        <Typography
          sx={{
            color: colors.heading,
            fontWeight: 800,
            fontSize: { xs: "1.35rem", md: "1.7rem" },
            maxWidth: 460,
            lineHeight: 1.25,
          }}
        >
          {translate("checkout.redirecting")}
        </Typography>
        <Typography
          sx={{
            color: colors.secondaryText,
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
        >
          {translate("register.loading")}
        </Typography>
      </Box>
    </Box>
  );
}
