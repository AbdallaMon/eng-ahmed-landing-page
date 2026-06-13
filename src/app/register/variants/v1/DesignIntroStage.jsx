"use client";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { assets } from "@/app/register/core/assets";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { dur, prefersReducedMotion } from "@/app/register/variants/v1/v1Motion";

/**
 * The DESIGN intro beat: the brand word "تصميم / Design" assembles in 3D next to
 * a small framed hero tile that builds toward the viewer, holds for a readable
 * beat, then the whole group RECEDES into depth — handing the stage to the email
 * step (which `useLeadFlow` auto-advances to). The full-screen design photo is
 * already the backdrop (provided by `PerspectiveStage`), so this stage only
 * renders the assembling foreground.
 *
 * Purely decorative + self-timed; it never blocks the flow. Under reduced motion
 * everything simply appears (no recede).
 */
export default function DesignIntroStage() {
  const { translate } = useLanguage();
  const groupRef = useRef(null);
  const tileRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const group = groupRef.current;
    const tile = tileRef.current;
    const badge = badgeRef.current;
    if (!group) return undefined;

    if (prefersReducedMotion()) {
      gsap.set([group, tile, badge], { opacity: 1, clearProps: "transform" });
      return undefined;
    }

    const tl = gsap.timeline();
    if (tile) {
      // Tile builds toward the viewer.
      tl.fromTo(
        tile,
        { opacity: 0, z: -220, rotateY: -28, y: 30 },
        {
          opacity: 1,
          z: 60,
          rotateY: 0,
          y: 0,
          duration: dur(0.7),
          ease: "expo.out",
        },
      );
    }
    if (badge) {
      tl.fromTo(
        badge,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: dur(0.45), ease: "power3.out" },
        "-=0.3",
      );
    }
    // Hold, then the whole group recedes into depth as email takes over.
    tl.to(group, {
      z: -260,
      opacity: 0,
      scale: 0.92,
      duration: dur(0.6),
      ease: "power2.in",
      delay: dur(0.55),
    });

    return () => tl.kill();
  }, []);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1000px",
        px: 3,
      }}
    >
      <Box
        ref={groupRef}
        sx={{
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 2.5, md: 3 },
          textAlign: "center",
        }}
      >
        {/* Small framed hero tile that builds toward the viewer. */}
        <Box
          ref={tileRef}
          aria-hidden
          sx={{
            width: { xs: 150, md: 200 },
            height: { xs: 150, md: 200 },
            borderRadius: "26px",
            backgroundImage: `url('${assets.hero}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
            boxShadow: "0 30px 70px rgba(40,32,24,0.45)",
            border: "3px solid rgba(255,255,255,0.5)",
          }}
        />

        {/* The brand word assembles per-word in 3D. */}
        <AnimatedText
          as="h1"
          text={translate("category.design")}
          stagger={0.08}
          duration={0.8}
          delay={0.15}
          sx={{
            m: 0,
            color: "#fff",
            fontWeight: 800,
            lineHeight: 1.05,
            fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
            letterSpacing: "-0.02em",
            textShadow: "0 6px 30px rgba(0,0,0,0.5)",
          }}
        />

        <Typography
          ref={badgeRef}
          sx={{
            opacity: 0,
            px: 2.25,
            py: 0.75,
            borderRadius: 999,
            fontWeight: 700,
            fontSize: "0.85rem",
            letterSpacing: "0.04em",
            color: colors.heading,
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          }}
        >
          {translate("register.designBadge")}
        </Typography>
      </Box>
    </Box>
  );
}
