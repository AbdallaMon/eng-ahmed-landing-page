"use client";

import { Box, Typography } from "@mui/material";
import { t } from "@/app/register/data/dictionary";
import colors from "@/app/register/theme/colors";

/**
 * The design-fee notice for the chosen type. Shown only once payment is
 * confirmed. `data-reveal` so it rides the same celebratory stagger.
 */
export default function DesignFeeNotice({ feeNotice, feeTypeLabel, lng }) {
  if (!feeNotice) return null;

  return (
    <Box
      data-reveal
      sx={{
        mt: { xs: 3.5, md: 4 },
        width: "100%",
        maxWidth: 420,
        mx: "auto",
        opacity: 0,
        px: { xs: 2.5, md: 3 },
        py: { xs: 2.5, md: 3 },
        borderRadius: 3,
        textAlign: "center",
        border: `1px solid ${colors.primary}55`,
        background: `linear-gradient(160deg, ${colors.primary}1f 0%, ${colors.primary}08 100%)`,
        boxShadow: `0 12px 34px ${colors.primary}22`,
      }}
    >
      <Typography
        component="p"
        sx={{
          color: colors.primaryDark,
          fontWeight: 700,
          fontSize: "0.78rem",
          letterSpacing: 1,
          textTransform: "uppercase",
          mb: 1.25,
        }}
      >
        {t("success.designFeeHeading", lng)}
      </Typography>

      {feeTypeLabel && (
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1.75,
            py: 0.6,
            mb: 1.5,
            borderRadius: 999,
            background: colors.primaryGradient,
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.92rem",
          }}
        >
          {feeTypeLabel}
        </Box>
      )}

      <Typography
        component="p"
        sx={{
          color: colors.heading,
          fontWeight: 700,
          fontSize: { xs: "1.05rem", md: "1.18rem" },
          lineHeight: 1.4,
        }}
      >
        {feeNotice}
      </Typography>

      <Typography
        component="p"
        sx={{
          color: colors.secondaryText,
          mt: 1.25,
          fontSize: "0.85rem",
          lineHeight: 1.6,
        }}
      >
        {t("success.designFeeNote", lng)}
      </Typography>
    </Box>
  );
}
