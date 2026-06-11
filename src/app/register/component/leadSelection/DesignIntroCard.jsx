"use client";
import { motion } from "framer-motion";
import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";

import { useLanguage } from "@/app/register/providers/LanguageProvider";

const MotionDiv = motion.create("div");

const OVERLAY =
  "linear-gradient(169deg, rgba(45,35,30,0.45) 0%, rgba(45,35,30,0.86) 100%)";

/**
 * The DESIGN category card shown briefly after the email step. It carries the
 * shared `layoutId="stage-design"`; when the flow advances, this card morphs
 * (grows) into the full-screen `StageBackdrop` of the same id — the signature
 * "card expands to fill the screen" intro. A small "تصميم / Design" label sits
 * inside it.
 *
 * Purely presentational + non-interactive (the expansion is automatic).
 */
export function DesignIntroCard() {
  const theme = useTheme();
  const { translate } = useLanguage();

  return (
    <MotionDiv
      layoutId="stage-design"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        margin: "0 auto",
        width: "100%",
        maxWidth: 420,
        borderRadius: 20,
        overflow: "hidden",
        zIndex: 1,
        boxShadow: "0 18px 40px rgba(45,35,30,0.32)",
      }}
    >
      <Box sx={{ position: "relative", aspectRatio: "16 / 10" }}>
        <Box
          component="img"
          src="/design.jpg"
          alt={translate("category.interiorDesign")}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box sx={{ position: "absolute", inset: 0, background: OVERLAY }} />
        <Stack
          spacing={1.25}
          alignItems="center"
          justifyContent="center"
          sx={{ position: "absolute", inset: 0, textAlign: "center", px: 2 }}
        >
          <Box
            sx={{
              px: 2.25,
              py: 0.85,
              borderRadius: 999,
              backgroundColor: alpha(theme.palette.primary.main, 0.95),
              color: "#2d231e",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: 1, lineHeight: 1 }}
            >
              {translate("register.designLabel")}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: alpha("#ffffff", 0.92),
              fontWeight: 500,
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
            }}
          >
            {translate("register.designIntroLoading")}
          </Typography>
        </Stack>
      </Box>
    </MotionDiv>
  );
}
