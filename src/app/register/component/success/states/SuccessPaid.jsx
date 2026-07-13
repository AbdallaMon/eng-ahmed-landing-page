"use client";

import { Box, Typography } from "@mui/material";
import { t } from "@/app/register/data/dictionary";
import colors from "@/app/register/theme/colors";
import DesignFeeNotice from "@/app/register/component/success/DesignFeeNotice";

const NUM_RAYS = 12;

/** PAID state: gold burst + drawn check badge + thank-you + design-fee notice. */
export default function SuccessPaid({ lng, feeNotice, feeTypeLabel }) {
  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: { xs: 150, md: 184 },
          height: { xs: 150, md: 184 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: { xs: 4, md: 5 },
        }}
      >
        {Array.from({ length: NUM_RAYS }).map((_, i) => (
          <Box
            key={i}
            data-ray
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 4,
              height: { xs: 26, md: 32 },
              borderRadius: 2,
              backgroundColor: colors.primary,
              opacity: 0,
              transformOrigin: "center bottom",
              transform: `translate(-50%, -100%) rotate(${(360 / NUM_RAYS) * i}deg) translateY(-58px)`,
            }}
          />
        ))}
        <Box
          data-badge
          sx={{
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            background: colors.primaryGradient,
            boxShadow: `0 20px 56px ${colors.primary}66`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            willChange: "transform",
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 52 52"
            sx={{ width: "52%", height: "52%" }}
          >
            <path
              data-check
              d="M14 27 L23 36 L40 18"
              fill="none"
              stroke="#ffffff"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 48, strokeDashoffset: 48 }}
            />
          </Box>
        </Box>
      </Box>

      <Typography
        data-reveal
        variant="h4"
        component="h1"
        fontWeight={700}
        sx={{ color: colors.heading, opacity: 0 }}
      >
        {t("success.paymentTitle", lng)}
      </Typography>
      <Typography
        data-reveal
        variant="h6"
        sx={{ color: colors.secondaryText, mt: 1.5, maxWidth: 480, opacity: 0 }}
      >
        {t("status.thankYou", lng)}
      </Typography>

      <DesignFeeNotice
        feeNotice={feeNotice}
        feeTypeLabel={feeTypeLabel}
        lng={lng}
      />
    </>
  );
}
