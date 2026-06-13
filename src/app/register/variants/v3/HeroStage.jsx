"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { HERO_MODEL } from "@/app/register/variants/v3/v3Assets";
import { recedeHero } from "@/app/register/variants/v3/v3Motion";

// The WebGL stage is heavy + touches window/WebGL → load it client-only.
// It internally falls back to the `fallback` prop on WebGL-missing / GLB-fail.
const ModelStage = dynamic(
  () => import("@/app/register/core/webgl/ModelStage"),
  { ssr: false },
);

/**
 * V3's WebGL hero intro: ONE elegant signature object (the SheenChair GLB) that
 * slowly auto-rotates and leans toward the pointer, over a warm brand wash. It
 * is rendered ABOVE the depth-card scene while the flow sits on the intro/email
 * beats. On the first advance (the email submit → leaving the email step) the
 * parent flips `visible` to false and this component gracefully RECEDES /
 * dissolves (GSAP), then calls `onRecedeComplete` so the parent can unmount it
 * and let the (WebGL-free) card flow take over.
 *
 * Resilience: `ModelStage` swaps to `fallback` automatically if WebGL is
 * unavailable or the GLB fails — here that fallback is a clean lit brand panel
 * (never a blocky box). The parent additionally capability-gates whether to
 * mount the hero at all.
 *
 * @param {{
 *   visible: boolean,                 // true on intro/email; false to recede
 *   onRecedeComplete?: () => void,    // fired once the recede finishes
 * }} props
 */
export default function HeroStage({ visible, onRecedeComplete }) {
  const { translate } = useLanguage();
  const overlayRef = useRef(null);
  const recededRef = useRef(false);

  // When the parent asks the hero to leave, play the recede once.
  useEffect(() => {
    if (visible) return;
    if (recededRef.current) return;
    recededRef.current = true;
    recedeHero(overlayRef.current, { onComplete: onRecedeComplete });
  }, [visible, onRecedeComplete]);

  return (
    <Box
      ref={overlayRef}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 5, // above DepthBackground (0), below the header (4001)
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transformStyle: "preserve-3d",
        willChange: "transform, opacity, filter",
        background: `radial-gradient(120% 110% at 50% 18%, ${colors.bgSecondary} 0%, ${colors.bgPrimary} 60%, ${colors.bgTertiary} 100%)`,
      }}
    >
      {/* The 3D object fills the upper portion; copy sits beneath it. */}
      <Box
        sx={{
          width: "100%",
          flex: 1,
          minHeight: { xs: 280, sm: 360 },
          maxHeight: { xs: 420, sm: 540 },
        }}
      >
        <ModelStage
          src={HERO_MODEL}
          autoRotate
          environmentPreset="apartment"
          modelScale={3.1}
          height="100%"
          fallback={<HeroFallback translate={translate} />}
        />
      </Box>

      {/* Brand caption — animated per-word, RTL-safe (AnimatedText keeps DOM
          order). */}
      <Box
        sx={{
          px: 3,
          pb: { xs: 6, sm: 7 },
          pt: 1,
          textAlign: "center",
          maxWidth: 640,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            letterSpacing: 3,
            color: "primary.dark",
            fontWeight: 700,
            display: "block",
            mb: 1,
          }}
        >
          {translate("register.designBadge")}
        </Typography>
        <AnimatedText
          as="h1"
          text={translate("register.emailWelcomeTitle")}
          stagger={0.07}
          duration={0.8}
          sx={{
            m: 0,
            fontWeight: 800,
            lineHeight: 1.2,
            color: colors.heading,
            fontSize: { xs: "1.6rem", sm: "2.2rem" },
          }}
        />
        <Typography
          sx={{
            mt: 1.5,
            color: colors.textColor,
            fontSize: { xs: "0.95rem", sm: "1.05rem" },
            opacity: 0.9,
          }}
        >
          {translate("hero.oneStepAway")}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Clean, lit brand panel shown when WebGL is unavailable or the GLB fails to
 * load — a soft gold gradient medallion with the brand wordmark, NOT a blocky
 * 3D placeholder. (When the parent's capability gate skips the hero entirely
 * this never mounts; this covers the in-canvas failure path.)
 */
function HeroFallback({ translate }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: { xs: 200, sm: 260 },
          height: { xs: 200, sm: 260 },
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#fff",
          fontWeight: 800,
          letterSpacing: 1,
          background: colors.primaryGradient,
          boxShadow: `0 24px 60px ${colors.primaryDark}55, inset 0 2px 14px rgba(255,255,255,0.35)`,
        }}
      >
        <Box sx={{ px: 2 }}>
          <Box sx={{ fontSize: { xs: "1.4rem", sm: "1.7rem" }, lineHeight: 1.2 }}>
            {translate("register.designLabel")}
          </Box>
          <Box
            sx={{
              mt: 0.5,
              fontSize: "0.7rem",
              fontWeight: 600,
              opacity: 0.9,
              letterSpacing: 2,
            }}
          >
            {translate("register.designBadge")}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
