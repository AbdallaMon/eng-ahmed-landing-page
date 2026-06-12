"use client";
import { motion } from "framer-motion";
import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { MOTION_SCALE } from "@/app/register/lib/animations";

const MotionDiv = motion.create("div");

/**
 * The DESIGN intro beat. The full-screen DESIGN photo is already scaling in
 * behind (see `StageBackdrop`); this simply fades the "تصميم / Design" label in
 * on top of it for a moment before the email step rises. No card, no morph —
 * just a clean label over the photo.
 *
 * Purely presentational + non-interactive (the advance is automatic).
 */
export function DesignIntroCard() {
  const theme = useTheme();
  const { translate } = useLanguage();

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 * MOTION_SCALE, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%" }}
    >
      <Stack
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        sx={{ textAlign: "center", py: { xs: 6, md: 10 } }}
      >
        <Box
          sx={{
            px: 2.75,
            py: 1,
            borderRadius: 999,
            backgroundColor: alpha(theme.palette.primary.main, 0.95),
            color: "#2d231e",
            boxShadow: "0 10px 30px rgba(45,35,30,0.35)",
          }}
        >
          <Typography
            variant="h5"
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
    </MotionDiv>
  );
}
