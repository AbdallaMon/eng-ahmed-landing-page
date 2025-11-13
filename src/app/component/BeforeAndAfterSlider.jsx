// components/BeforeAfter/RightSlider.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Box } from "@mui/material";

export default function BeforeAndAfterSlider({
  beforeSrc,
  afterSrc,
  initialPct = 65,
  topImage = "after",
  direction = "ltr", // keeps reveal logic; badges stay left/right as requested
  lng = "en",
  grabIconSrc = "/grap-icon.png", // path to your grab/drag icon
}) {
  const containerRef = useRef(null);
  const [pct, setPct] = useState(Math.max(0, Math.min(100, initialPct)));
  const draggingRef = useRef(false);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const computePctFromX = useCallback(
    (clientX) => {
      const el = containerRef.current;
      if (!el) return pct;
      const rect = el.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const raw = (x / rect.width) * 100;
      return direction === "rtl"
        ? clamp(100 - raw, 0, 100)
        : clamp(raw, 0, 100);
    },
    [pct, direction]
  );

  const onPointerDown = (e) => {
    const el = containerRef.current;
    if (!el) return;
    draggingRef.current = true;
    el.setPointerCapture?.(e.pointerId);
    setPct(computePctFromX(e.clientX));
  };

  const onPointerMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      setPct(() => computePctFromX(e.clientX));
    },
    [computePctFromX]
  );

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove]);

  // Clip-path for top image (keeps full-size; only hides part)
  const clipPath =
    direction === "rtl"
      ? `inset(0 0 0 ${Math.max(0, 100 - pct)}%)`
      : `inset(0 ${Math.max(0, 100 - pct)}% 0 0)`;

  // Handle positions
  const handleLeft =
    direction === "rtl" ? `calc(${100 - pct}% - 10px)` : `calc(${pct}% - 10px)`;
  const handleCenter = direction === "rtl" ? `${100 - pct}%` : `${pct}%`;

  const TopImgSrc = topImage === "after" ? afterSrc : beforeSrc;
  const BottomImgSrc = topImage === "after" ? beforeSrc : afterSrc;

  const beforeLabel = lng === "ar" ? "قبل" : "Before";
  const afterLabel = lng === "ar" ? "بعد" : "After";

  return (
    <Box
      ref={containerRef}
      onPointerDown={onPointerDown}
      role="region"
      aria-label="Before and after comparison slider"
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
        mx: "auto",
        // aspectRatio: "4 / 3",
        height: { xs: 400, md: 500 },
        overflow: "hidden",
        borderRadius: 0.5,
        boxShadow: 3,
        userSelect: "none",
        touchAction: "none",
        "& img": { pointerEvents: "none", userSelect: "none" },
      }}
    >
      <Box
        component="img"
        src={BottomImgSrc}
        alt={topImage === "after" ? beforeLabel : afterLabel}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          clipPath,
          WebkitClipPath: clipPath,
        }}
      >
        <Box
          component="img"
          src={TopImgSrc}
          alt={topImage === "after" ? afterLabel : beforeLabel}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>

      {/* Badges (fixed: left=Before, right=After) */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 2,
          px: 3,
          py: { xs: 1.5, md: 2 },
          borderRadius: 1,
          bgcolor: "#009689",
          color: "white",
          fontWeight: 600,
          fontSize: { xs: 10, md: 13 },
          boxShadow: 1,
          lineHeight: 1,
        }}
      >
        {afterLabel}
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          px: 3,
          py: { xs: 1.5, md: 2 },
          borderRadius: 1,
          bgcolor: "#D4183D",
          color: "white",
          fontWeight: 600,
          fontSize: { xs: 10, md: 13 },
          boxShadow: 1,
          lineHeight: 1,
        }}
      >
        {beforeLabel}
      </Box>

      {/* Divider under knob */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: handleLeft,
          width: { xs: 12, md: 16 },
          bgcolor: "rgba(229,225,222,0.9)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.2)",
          pointerEvents: "none",
        }}
      />

      {/* Draggable knob with grab icon */}
      <Box
        onPointerDown={onPointerDown}
        tabIndex={0}
        aria-label="Drag to compare"
        onKeyDown={(e) => {
          const step = 2;
          if (e.key === "ArrowLeft")
            setPct((p) =>
              clamp(p + (direction === "rtl" ? +step : -step), 0, 100)
            );
          if (e.key === "ArrowRight")
            setPct((p) =>
              clamp(p + (direction === "rtl" ? -step : +step), 0, 100)
            );
        }}
        sx={{
          position: "absolute",
          top: "50%",
          left: handleCenter,
          transform: "translate(-50%, -50%)",
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: "background.paper",
          boxShadow: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "ew-resize",
          border: "1px solid",
          borderColor: "divider",
          zIndex: 3,
        }}
      >
        <Box
          component="img"
          src={grabIconSrc}
          alt=""
          draggable={false}
          sx={{
            width: 32,
            height: 32,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </Box>
    </Box>
  );
}
