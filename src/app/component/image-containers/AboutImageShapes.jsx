"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";

export default function AboutImagesShapes({ images }) {
  const upLeftRef = useRef(null);
  const lowLeftRef = useRef(null);
  const upRightRef = useRef(null);
  const lowRightRef = useRef(null);

  useEffect(() => {
    // احترام تفضيل تقليل الحركة
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const els = [
      upLeftRef.current,
      lowLeftRef.current,
      upRightRef.current,
      lowRightRef.current,
    ].filter(Boolean);

    // تحسينات أداء
    gsap.set(els, {
      willChange: "transform",
      pointerEvents: "none",
      transformOrigin: "50% 50%",
      force3D: true,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
    });

    // إعدادات متجاوبة عبر matchMedia
    const mm = gsap.matchMedia();

    // helper: حركة عشوائية متجددة لكل عنصر
    const floaty = (el, ranges) => {
      // تذبذب بسيط في الـ scale على مدى أطول
      const pulse = gsap.to(el, {
        scale: () => gsap.utils.random(0.98, 1.03),
        duration: () => gsap.utils.random(2.5, 4),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // انسياب متعدد المحاور مع repeatRefresh لتغيير القيم كل مرّة
      const drift = gsap.to(el, {
        x: () => gsap.utils.random(ranges.x[0], ranges.x[1]),
        y: () => gsap.utils.random(ranges.y[0], ranges.y[1]),
        rotation: () => gsap.utils.random(ranges.rot[0], ranges.rot[1]),
        duration: () => gsap.utils.random(ranges.dur[0], ranges.dur[1]),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        repeatRefresh: true,
        // phase طفيفة لكل عنصر عشان ميبقوش متزامنين
        delay: gsap.utils.random(0, 0.6),
      });

      return () => {
        pulse.kill();
        drift.kill();
      };
    };

    const cleanups = [];

    mm.add(
      {
        // موبايل
        isMobile: "(max-width: 900px)",
        // ديسكتوب
        isDesktop: "(min-width: 901px)",
      },
      (ctx) => {
        const { isMobile } = ctx.conditions;

        // ranges لكل عنصر (قيم مختلفة لتنوع الحركة)
        const R = (m, d) => (isMobile ? m : d);
        const configs = [
          // up-left: يطلع ويميل لليسار سنة
          {
            el: upLeftRef.current,
            ranges: {
              x: [R(-8, -14), R(6, 12)],
              y: [R(-14, -20), R(8, 16)],
              rot: [R(-2, -3), R(1, 2)],
              dur: [R(1.2, 1.6), R(1.8, 2.4)],
            },
          },
          // low-left: يتحرك أفقي أكتر
          {
            el: lowLeftRef.current,
            ranges: {
              x: [R(-14, -22), R(10, 18)],
              y: [R(-8, -12), R(6, 10)],
              rot: [R(-1.2, -2), R(0.8, 1.4)],
              dur: [R(1.2, 1.5), R(1.6, 2.1)],
            },
          },
          // up-right: يطلع لأعلى ويمين شوية
          {
            el: upRightRef.current,
            ranges: {
              x: [R(-10, -14), R(8, 14)],
              y: [R(-18, -26), R(10, 18)],
              rot: [R(-1.5, -2.2), R(1, 1.6)],
              dur: [R(1.1, 1.5), R(1.7, 2.2)],
            },
          },
          // low-right: حركة أخف بس بمدة أطول
          {
            el: lowRightRef.current,
            ranges: {
              x: [R(-8, -12), R(6, 10)],
              y: [R(-10, -14), R(8, 12)],
              rot: [R(-1, -1.6), R(0.8, 1.2)],
              dur: [R(1.4, 1.8), R(2, 2.6)],
            },
          },
        ];

        configs.forEach(({ el, ranges }) => {
          if (!el) return;
          cleanups.push(floaty(el, ranges));
        });

        return () => cleanups.forEach((c) => c && c());
      }
    );

    // إيقاف/استئناف عند تغيّر رؤية التبويب
    const visHandler = () =>
      document.visibilityState === "hidden"
        ? gsap.globalTimeline.pause()
        : gsap.globalTimeline.resume();

    document.addEventListener("visibilitychange", visHandler);

    return () => {
      document.removeEventListener("visibilitychange", visHandler);
      mm.revert();
      gsap.killTweensOf(els);
    };
  }, []);

  return (
    <>
      <Box
        ref={upLeftRef}
        sx={{
          width: { xs: "80px", md: "160px" },
          position: "absolute",
          left: "-14%",
          top: "25%",
          zIndex: -1,
        }}
        src={images.upperLeftDecoration}
        component="img"
        alt=""
      />
      <Box
        ref={lowLeftRef}
        sx={{
          width: { xs: "120px", md: "200px" },
          position: "absolute",
          left: "-25%",
          top: "50%",
          zIndex: -1,
        }}
        src={images.lowerLeftDecoration}
        component="img"
        alt=""
      />
      <Box
        ref={upRightRef}
        sx={{
          width: { xs: "100px", md: "180px" },
          position: "absolute",
          right: "8%",
          top: "25%",
          zIndex: -1,
        }}
        src={images.upperRightDecoration}
        component="img"
        alt=""
      />
      <Box
        ref={lowRightRef}
        sx={{
          width: { xs: "100px", md: "180px" },
          position: "absolute",
          right: { xs: "-13%", md: "-16%" },
          top: "65%",
          zIndex: -1,
        }}
        src={images.lowerRightDecoration}
        component="img"
        alt=""
      />
    </>
  );
}
