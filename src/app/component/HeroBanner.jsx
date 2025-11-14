"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { gsap } from "gsap";

export function HeroBanner({ data, lng }) {
  const middle = 50;
  const [split, setSplit] = useState(60);

  const containerRef = useRef(null);
  const baseScrollYRef = useRef(null);

  // smooth setters for movement & opacity (no new tweens on every event)
  const heroX = useRef(null);
  const leftX = useRef(null);
  const rightX = useRef(null);
  const leftOpacity = useRef(null);
  const rightOpacity = useRef(null);

  useEffect(() => {
    heroX.current = gsap.quickTo(".hero-main-box", "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    leftX.current = gsap.quickTo(".hero-main-box .main-text-box-left", "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    rightX.current = gsap.quickTo(".hero-main-box .main-text-box-right", "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    leftOpacity.current = gsap.quickTo(".hero-main-box .left", "opacity", {
      duration: 0.5,
      ease: "power2.out",
    });
    rightOpacity.current = gsap.quickTo(".hero-main-box .right", "opacity", {
      duration: 0.5,
      ease: "power2.out",
    });
  }, []);

  // ---------- INITIAL ANIMATION (FASTER + SMOOTHER) ----------
  function handleInitialAnimation() {
    const timeLine = gsap.timeline({
      defaults: {
        duration: 0.9, // faster than 1.5s
        ease: "power3.out",
      },
    });

    timeLine
      // images
      .fromTo(
        ".hero-main-box .right-image",
        { x: 60, autoAlpha: 0 },
        { x: 0, autoAlpha: 1 }
      )
      .fromTo(
        ".hero-main-box .left-image",
        { x: -60, autoAlpha: 0 },
        { x: 0, autoAlpha: 1 },
        "<"
      )
      // pattern + floating text
      .fromTo(
        ".hero-main-box .pattern",
        { x: 30, autoAlpha: 0 },
        { x: 0, autoAlpha: 1 },
        "-=0.3"
      )
      .fromTo(
        ".hero-main-box .floating-text-box",
        { x: -30, autoAlpha: 0 },
        { x: 0, autoAlpha: 1 },
        "<"
      )
      // main text
      .fromTo(
        ".main-text-box",
        { y: -25, autoAlpha: 0 },
        { y: 0, autoAlpha: 1 },
        "-=0.3"
      );
  }

  // ---------- MAIN ANIMATION (MOUSE + SCROLL) ----------
  function handleAnimation(percentage, isMobile = false) {
    const clamped = Math.max(0, Math.min(100, percentage));

    // round so React doesn't re-render on every tiny move (less jitter)
    const nextSplit = Math.round(100 - clamped);
    setSplit((prev) => (prev === nextSplit ? prev : nextSplit));

    const shift = (clamped - middle) / 2;

    heroX.current?.(shift);
    leftX.current?.(-shift);
    rightX.current?.(-shift);

    const leftOpacityValue = clamped <= middle ? 1 : (100 - clamped) / 100;
    const rightOpacityValue = isMobile
      ? leftOpacityValue
      : clamped >= middle
      ? 1
      : clamped / 100;

    leftOpacity.current?.(leftOpacityValue);
    rightOpacity.current?.(rightOpacityValue);
  }

  // ---------- MOUSE MOVE (DESKTOP) ----------
  const handleMouseMove = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const ratio = x / rect.width;
    const percentFromLeft = Math.max(0, Math.min(100, ratio * 100));

    handleAnimation(percentFromLeft, false);
  };

  // run initial entrance animation
  useEffect(() => {
    if (containerRef.current) {
      handleInitialAnimation();
    }
  }, []);

  // ---------- SCROLL (MOBILE ONLY) ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    // base scroll position = center of hero container
    if (baseScrollYRef.current === null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      baseScrollYRef.current = window.scrollY + rect.top + rect.height / 2;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;

      // only drive scroll animation on mobile/tablet
      if (window.innerWidth > 900) return;

      const currentY = window.scrollY;
      const baseY = baseScrollYRef.current ?? currentY;
      const distance = Math.abs(currentY - baseY);

      // reach max effect a bit earlier so it feels faster
      const maxDistance = window.innerHeight * 0.6;

      const normalized = Math.min(distance / maxDistance, 1); // 0 → 1
      const verticalPercent = 50 + normalized * 50; // 50 → 100

      handleAnimation(verticalPercent, true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box sx={{ py: 0 }}>
      <Container
        ref={containerRef}
        maxWidth="xxl"
        onMouseMove={handleMouseMove}
        sx={{ px: 0, position: "relative", pt: { xs: 2, md: 8 } }}
      >
        {/* Desktop background */}
        <Box
          component="img"
          src={data.images.heroBackground.src}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
            display: { xs: "none", md: "block" },
          }}
          alt={data.images.heroBackground.alt}
        />

        {/* Mobile background */}
        <Box
          component="img"
          src={data.images.heroMobileBackground.src}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
            display: { xs: "block", md: "none" },
          }}
          alt={data.images.heroMobileBackground.alt}
        />

        {/* Main hero box */}
        <Box
          className="hero-main-box"
          sx={{
            position: "relative",
            maxWidth: { xs: "300px", md: "900px" },
            mx: "auto",
            aspectRatio: "16 / 13",
            height: { xs: "240px", md: "600px" },
            willChange: "transform", // GPU hint
          }}
        >
          <RightAndLeftText data={data} lng={lng} />
          <HeroFloatingText data={data} />
          <FloatingHeroPattern data={data} />
          <HeroMainImages data={data} split={split} />
        </Box>
      </Container>
    </Box>
  );
}

function HeroMainImages({ data, split }) {
  return (
    <>
      <HeroImage
        src={data.images.hero.src}
        alt={data.images.hero.alt}
        clipPath={`inset(0 0 0 ${split}%)`}
        name={"right-image"}
      />
      <HeroImage
        src={data.images.heroSkitch.src}
        alt={data.images.heroSkitch.alt}
        clipPath={`inset(0 ${100 - split}% 0 0)`}
        name={"left-image"}
      />
    </>
  );
}

function HeroImage({ name, src, alt, clipPath }) {
  return (
    <Box
      className={name}
      sx={{
        position: "absolute",
        inset: 0,
        height: "100%",
        clipPath,
        opacity: 0,
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </Box>
  );
}

function RightAndLeftText({ data, lng }) {
  return (
    <>
      <HeroMainText data={data} position="left" lng={lng} />
      <HeroMainText data={data} position="right" lng={lng} />
    </>
  );
}

function HeroMainText({ data, position, lng }) {
  return (
    <Box
      className={`${position}  main-text-box main-text-box-${position}`}
      sx={{
        position: "absolute",
        opacity: 0,
        maxWidth: {
          xs: "100px",
          md: "300px",
        },
        top: { xs: 60, md: 130 },
        ...(position === "left"
          ? {
              left: {
                xs: lng === "ar" ? -30 : -20,
                md: lng === "ar" ? -120 : -90,
              },
            }
          : {
              right: {
                xs: lng === "ar" ? -25 : -35,
                md: lng === "ar" ? -120 : -150,
              },
            }),
      }}
    >
      <Typography
        variant="h3"
        sx={{ fontSize: { xs: 12, md: 40 }, fontWeight: "bold", mb: 1 }}
      >
        {position === "left" ? data.leftText?.title : data.rightText?.title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: 7, md: 14 },
          lineHeight: 1.5,
          opacity: 0.85,
          //   display: { xs: "none", md: "block" },
        }}
      >
        {position === "left"
          ? data.leftText?.description
          : data.rightText?.description}
      </Typography>
    </Box>
  );
}

function HeroFloatingText({ data }) {
  return (
    <Box
      className="left floating-text-box"
      sx={{
        position: "absolute",
        bottom: { xs: 30, md: 100 },
        left: { xs: 30, md: 60 },
        rotate: "-28deg",
        opacity: 0,
      }}
    >
      <FloatingText data={data} position="top" />
      <FloatingText data={data} position="left" />
      <FloatingText data={data} position="center" />
      <FloatingText data={data} position="right" />
    </Box>
  );
}

function FloatingText({ data, position }) {
  return (
    <Typography
      variant="body2"
      sx={{
        fontSize: { xs: 7, md: 16 },
        mx: 2,
        position: "absolute",
        bottom:
          position === "top"
            ? { xs: 50, md: 100 }
            : position === "center"
            ? { xs: 25, md: 40 }
            : 20,
        left:
          position === "left"
            ? "auto"
            : position === "center"
            ? "50%"
            : position === "right"
            ? 60
            : { xs: -25, md: -50 },
        right:
          position === "right"
            ? "auto"
            : position === "center"
            ? "auto"
            : position === "left"
            ? { xs: 0, md: 60 }
            : "auto",
        transform:
          position === "center"
            ? { xs: "translateX(5%)", md: "translateX(-50%)" }
            : "none",
      }}
    >
      {data.floatingText?.[position]}
    </Typography>
  );
}

function FloatingHeroPattern({ data }) {
  return (
    <Box
      className="right pattern"
      sx={{
        position: "absolute",
        bottom: { xs: 20, md: 120 },
        right: 0,
        width: { xs: "100px", md: "220px" },
        rotate: "28deg",
        opacity: 0,
      }}
    >
      <Box
        component="img"
        src={data.images.heroPattern.src}
        sx={{
          width: "100%",
        }}
      />
    </Box>
  );
}
