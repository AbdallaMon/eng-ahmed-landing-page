"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { BsCheckCircleFill } from "react-icons/bs";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import colors from "@/app/register/theme/colors";

/**
 * A single selectable image card in a SELECT step.
 * `.step-select-card` / `.step-select-flash` classNames are GSAP hooks —
 * keep them in sync with StepItemGrid's timeline.
 */
export function StepCard({ item, onSelect, isActive, isDisabled = false }) {
  const { translate } = useLanguage();

  return (
    <Box
      className="step-select-card"
      data-value={item.value}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-pressed={isActive}
      aria-disabled={isDisabled}
      onClick={() => !isDisabled && onSelect(item.value)}
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(item.value);
        }
      }}
      sx={{
        position: "relative",
        width: "100%",
        height: "180px",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: isDisabled ? "not-allowed" : "pointer",
        border: "2px solid",
        borderColor: isActive ? colors.primary : "transparent",
        boxShadow: isActive
          ? `0 0 0 3px ${colors.primary}55, 0 4px 16px rgba(0,0,0,0.28)`
          : "0px 3px 10px rgba(0,0,0,0.22)",
        transition: "border-color 0.24s, box-shadow 0.24s",
        transformOrigin: "center center",
        "&:hover .step-card-hover": isDisabled ? {} : { opacity: 1 },
        "&:focus-visible": {
          outline: `3px solid ${colors.primary}`,
          outlineOffset: "2px",
        },
        "&:hover": isDisabled
          ? {}
          : {
              borderColor: isActive ? colors.primary : `${colors.primary}80`,
              boxShadow: isActive
                ? `0 0 0 3px ${colors.primary}55, 0 6px 20px rgba(0,0,0,0.32)`
                : `0 0 0 2px ${colors.primary}40, 0 6px 18px rgba(0,0,0,0.28)`,
            },
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, bgcolor: "grey.900" }}>
        <Image
          src={item.image?.src}
          alt={translate(item.image?.altKey)}
          fill
          quality={70}
          sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 280px"
          style={{ objectFit: "cover" }}
        />
      </Box>

      {/* Gradient overlay — strongest at the bottom where the label sits. */}
      <Box
        sx={{ position: "absolute", inset: 0, zIndex: 1 }}
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.12) 70%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Hover tint — CSS only, no GSAP conflict. */}
      <Box
        className="step-card-hover"
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(255,255,255,0.06)",
          opacity: 0,
          zIndex: 2,
          transition: "opacity 0.18s",
          pointerEvents: "none",
        }}
      />

      {/* Click flash overlay — animated by GSAP. */}
      <Box
        className="step-select-flash"
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: colors.primary,
          opacity: 0,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {isActive && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: colors.primary,
            opacity: 0.12,
            zIndex: 2,
          }}
        />
      )}

      <Typography
        variant="body2"
        sx={{
          position: "absolute",
          bottom: 8,
          left: 8,
          right: 8,
          zIndex: 4,
          color: "#fff",
          fontWeight: 700,
          textAlign: "center",
          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          fontSize: { xs: "0.72rem", sm: "0.8rem" },
          lineHeight: 1.25,
        }}
      >
        {translate(item.key)}
      </Typography>

      {isActive && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 5,
            color: colors.primary,
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
            display: "flex",
          }}
        >
          <BsCheckCircleFill size={20} />
        </Box>
      )}
    </Box>
  );
}
