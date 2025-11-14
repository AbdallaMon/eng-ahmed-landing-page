"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Container, Slider, Typography } from "@mui/material";

import { gsap } from "gsap";

export function HeroBanner({ data, lng }) {
  const middle = 60;
  const initialSplit = 60;
  const containerRef = useRef(null);

  // For mouse direction detection
  const lastMouseXRef = useRef(null);

  // For scroll direction detection
  const lastScrollYRef = useRef(0);

  function handleInitialAnimation() {
    const timeLine = new gsap.timeline();

    // images - give them a bit more time (smoother)
    timeLine.fromTo(
      ".hero-main-box .right-image",
      {
        x: 100,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 1.1, // more time for image
        ease: "power3.out",
      }
    );

    timeLine.fromTo(
      ".hero-main-box .left-image",
      {
        x: -100,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 1.1, // match right image
        ease: "power3.out",
      },
      "<"
    );

    // pattern and floating text – slightly shorter than before
    timeLine.fromTo(
      ".hero-main-box .pattern",
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.75,
        ease: "power2.out",
      }
    );
    timeLine.fromTo(
      ".hero-main-box .floating-text-box",
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.75,
        ease: "power2.out",
      },
      "<"
    );

    // left and right text – less time (snappier)
    timeLine.fromTo(
      ".main-text-box",
      { y: -50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6, // less than before
        ease: "power3.out",
      }
    );
  }

  function handleAnimation(percentage, isMobile) {
    const doubleMiddle = isMobile ? 120 : 120;
    const split = doubleMiddle - percentage;

    // ADD duration to make split smoother
    gsap.to(".hero-main-box .right-image", {
      clipPath: `inset(0 0 0 ${split}%)`,
      duration: 0.45, // smooth split
      ease: "power3.out",
    });
    gsap.to(".hero-main-box .left-image", {
      clipPath: `inset(0 ${100 - split}% 0 0)`,
      duration: 0.45, // smooth split
      ease: "power3.out",
    });

    gsap.to(".hero-main-box", {
      x: (percentage - middle) / 2,
      duration: 0.35, // keep main box as it is
      ease: "power3.out",
    });

    // left & right main texts
    gsap.to(".hero-main-box .main-text-box-left", {
      x: -((percentage - middle) / 2),
      duration: 0.4,
      ease: "power3.out",
    });

    gsap.to(".hero-main-box .main-text-box-right", {
      x: -((percentage - middle) / 2),
      duration: 0.4,
      ease: "power3.out",
    });

    if (isMobile) {
      const opacityValue =
        percentage <= middle ? 1 : (doubleMiddle - percentage) / 100;

      gsap.to(".hero-main-box .left", {
        opacity: opacityValue,
        duration: 0.35,
        ease: "power2.out",
      });

      gsap.to(".hero-main-box .right", {
        opacity: opacityValue,
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.to(".hero-main-box .left", {
        opacity: percentage <= middle ? 1 : (doubleMiddle - percentage) / 100,
        duration: 0.35,
        ease: "power2.out",
      });

      gsap.to(".hero-main-box .right", {
        opacity: percentage >= middle ? 1 : percentage / 100,
        duration: 0.35,
        ease: "power2.out",
      });
    }
  }

  const handleMouseMove = (event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // x relative to container
    const x = event.clientX - rect.left;

    // 0 -> left, 50 -> center, 100 -> right
    const ratio = x / rect.width; // 0–1
    const percentFromLeft = Math.max(0, Math.min(100, ratio * 100));

    handleAnimation(percentFromLeft);

    lastMouseXRef.current = x;
  };

  useEffect(() => {
    if (containerRef.current) {
      handleInitialAnimation();
    }
  }, []);

  const baseScrollYRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // store the initial scroll position as the "center" (50)
    if (baseScrollYRef.current === null) {
      baseScrollYRef.current = window.scrollY;
    }

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const currentY = window.scrollY;

      // ----- PERCENTAGE 50 → 100 BASED ON DISTANCE FROM INITIAL POSITION -----
      const baseY = baseScrollYRef.current ?? currentY;
      const distance = Math.abs(currentY - baseY); // how far from initial

      // choose how far you need to scroll to reach 100 (here: 1 viewport height)
      const maxDistance = window.innerHeight; // you can tweak this

      const normalized = Math.min(distance / maxDistance, 1); // 0 → 1
      const verticalPercent = (currentY + 120) / 2;
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
          }}
        >
          <RightAndLeftText data={data} lng={lng} />
          <HeroFloatingText data={data} />
          <FloatingHeroPattern data={data} />
          <HeroMainImages data={data} split={initialSplit} />
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
        clipPath: clipPath,
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
