"use client";

import { Box, Typography } from "@mui/material";
import { t } from "@/app/register/data/dictionary";
import colors from "@/app/register/theme/colors";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/** Loading state: a quiet pulsing brand dot + "processing" copy. */
export default function SuccessLoading({ lng }) {
  return (
    <>
      <Box
        sx={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          mb: 4,
          background: colors.primaryGradient,
          boxShadow: `0 16px 44px ${colors.primary}55`,
          animation: prefersReducedMotion()
            ? "none"
            : "successPulse 1.3s ease-in-out infinite",
          "@keyframes successPulse": {
            "0%,100%": { transform: "scale(1)", opacity: 0.85 },
            "50%": { transform: "scale(1.12)", opacity: 1 },
          },
        }}
      />
      <Typography
        data-reveal
        variant="h6"
        component="p"
        sx={{ color: colors.heading, opacity: 0 }}
      >
        {t("success.loading", lng)}
      </Typography>
    </>
  );
}
