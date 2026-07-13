"use client";

import { Box, Typography } from "@mui/material";
import { t } from "@/app/register/data/dictionary";
import colors from "@/app/register/theme/colors";

/** ERROR state: payment-status verification issue. */
export default function SuccessError({ lng }) {
  return (
    <>
      <Box
        sx={{
          width: { xs: 96, md: 112 },
          height: { xs: 96, md: 112 },
          borderRadius: "50%",
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${colors.warning}22`,
          border: `2px solid ${colors.warning}`,
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 52 52"
          sx={{ width: "48%", height: "48%" }}
        >
          <path
            d="M26 12 V32"
            stroke={colors.secondaryDark}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <circle cx="26" cy="42" r="3" fill={colors.secondaryDark} />
        </Box>
      </Box>
      <Typography
        data-reveal
        variant="h4"
        component="h1"
        fontWeight={700}
        sx={{ color: colors.heading, opacity: 0 }}
      >
        {t("success.errorTitle", lng)}
      </Typography>
      <Typography
        data-reveal
        variant="body1"
        sx={{ color: colors.secondaryText, mt: 1.5, maxWidth: 460, opacity: 0 }}
      >
        {t("success.errorMessage", lng)}
      </Typography>
    </>
  );
}
