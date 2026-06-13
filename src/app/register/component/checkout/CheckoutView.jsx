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
import { useRegister3D } from "@/app/register/three/Register3DContext";
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

  // Drive the persistent 3D backdrop to the quiet ambient "form" scene while the
  // checkout surface sits on top of it. capability.use3D === false on the 2D
  // fallback path, where the surface keeps its original opaque look.
  const { capability, setSceneKey } = useRegister3D();
  const use3D = capability.use3D;

  useEffect(() => {
    setSceneKey("form");
  }, [setSceneKey]);

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
        borderRadius: 3,
        overflow: "hidden",
        // On the 3D path the surface goes glassmorphic — a semi-opaque brand
        // tint + blur — so the checkout content stays legible over the live
        // scene. On the 2D fallback it keeps its original solid look.
        ...(use3D
          ? {
              bgcolor: "rgba(250, 249, 247, 0.82)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: `1px solid ${colors.primary}33`,
              boxShadow: "0px 18px 50px rgba(0, 0, 0, 0.28)",
            }
          : {
              bgcolor: colors.bgSecondary,
              boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.15)",
            }),
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
            // Match the surface treatment: a translucent tint on the 3D path so
            // the footer blends into the glass; solid white on the 2D fallback.
            backgroundColor: use3D ? "rgba(255, 255, 255, 0.55)" : "white",
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
