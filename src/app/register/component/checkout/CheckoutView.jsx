"use client";

import { useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Zoom,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import colors from "@/app/register/theme/colors";
import { t } from "@/app/register/data/dictionary";
import { consultLevelsData } from "@/app/register/component/consultLevels/data";
import PayButton from "@/app/register/component/PayButton";

/**
 * Checkout loading shell — shows a redirecting spinner and auto-fires payment.
 * If there is no lead id, it sends the user back to the cancel page.
 *
 * @param {{ lng?: string, clientLead: { id?: string, clientId?: string }, test?: boolean }} props
 */
export default function CheckoutView({ lng = "ar", clientLead, test }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const data = consultLevelsData;

  useEffect(() => {
    if (!clientLead?.id) {
      window.location.href = "/register/cancel";
    }
  }, [clientLead]);

  if (!clientLead?.id) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 150px)",
        bgcolor: colors.bgSecondary,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          padding: { xs: 2, md: 3 },
          paddingBottom: { xs: 1.5, md: 2 },
          textAlign: "center",
          background: `linear-gradient(135deg, ${colors.primary}22, ${colors.bgSecondary})`,
          borderBottom: `1px solid ${colors.primary}33`,
        }}
      >
        <Typography variant="h3" fontSize={isMobile ? 22 : 28} fontWeight={700}>
          {t(data.title.firstLine, lng)}
          {data.title.secondLine && (
            <>
              <br />
              {data.title.secondLine}
            </>
          )}
        </Typography>
        <Typography
          variant="subtitle1"
          color={colors.secondaryText}
          fontSize={isMobile ? 18 : 22}
          fontWeight={600}
          sx={{ mt: 1 }}
        >
          {t("checkout.consultWithAhmed", lng)}
        </Typography>
      </Box>

      {/* Body — loading spinner */}
      <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 300,
            borderRadius: 2,
            p: 4,
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" fontWeight="bold">
            {t("checkout.redirecting", lng)}
          </Typography>
        </Box>
      </Box>

      {/* Footer — payment button (auto-triggers the redirect) */}
      <Zoom in timeout={500}>
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderTop: `1px solid ${colors.primary}33`,
            backgroundColor: "white",
            boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.08)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <PayButton
              text={t(data.paymentData.button, lng)}
              clientLeadId={clientLead.id}
              clientId={clientLead.clientId}
              lng={lng}
              autoTrigger
              test={test}
            />
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {t(data.paymentData.description, lng)}
            </Typography>
          </Box>
        </Box>
      </Zoom>
    </Box>
  );
}
