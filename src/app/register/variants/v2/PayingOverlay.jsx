"use client";
import { useEffect, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import gsap from "gsap";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";

/**
 * Full-screen "preparing your secure payment…" transition for V2, shown while
 * `useLeadForm().isPaying` is true (complete-register succeeded, the Stripe
 * redirect is firing). NOT a boxed paper — it's a calm full-bleed brand field
 * with a slow rotating gold ring + a soft pulsing bloom, then the page navigates
 * away to hosted checkout. Reduced-motion shows the static field + copy.
 */
export default function PayingOverlay() {
  const theme = useTheme();
  const { translate } = useLanguage();
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const bloomRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = prefersReducedMotion();

    gsap.fromTo(
      root,
      { opacity: 0 },
      { opacity: 1, duration: reduce ? 0.01 : 0.45, ease: "power2.out" },
    );
    if (reduce) return undefined;

    const spin = gsap.to(ringRef.current, {
      rotate: 360,
      duration: 2.4,
      ease: "none",
      repeat: -1,
    });
    const pulse = gsap.to(bloomRef.current, {
      scale: 1.18,
      opacity: 0.85,
      duration: 1.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    return () => {
      spin.kill();
      pulse.kill();
    };
  }, []);

  const gold = theme.palette.primary.main;

  return (
    <Box
      ref={rootRef}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        textAlign: "center",
        px: 3,
        background: `radial-gradient(120% 100% at 50% 35%, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 60%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Box sx={{ position: "relative", width: 120, height: 120 }}>
        <Box
          ref={bloomRef}
          aria-hidden
          sx={{
            position: "absolute",
            inset: "-40%",
            borderRadius: "50%",
            filter: "blur(34px)",
            opacity: 0.5,
            background: `radial-gradient(circle, ${gold} 0%, transparent 68%)`,
          }}
        />
        <Box
          ref={ringRef}
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `3px solid ${gold}33`,
            borderTopColor: gold,
            borderRightColor: gold,
          }}
        />
      </Box>

      <AnimatedText
        as="h2"
        text={translate("checkout.redirecting")}
        duration={0.6}
        sx={{
          m: 0,
          fontWeight: 700,
          fontSize: { xs: "1.35rem", md: "1.7rem" },
          color: theme.palette.text.secondary,
          maxWidth: 560,
        }}
      />
      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.primary, opacity: 0.7 }}
      >
        {translate("hero.oneStepAway")}
      </Typography>
    </Box>
  );
}
