"use client";

import { useEffect } from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { t } from "@/app/register/data/dictionary";
import colors from "@/app/register/theme/colors";
import { useRegister3D } from "@/app/register/three/Register3DContext";
import PayButton from "@/app/register/component/PayButton";

export default function CancelView() {
  const searchParams = useSearchParams();
  const clientLeadId = searchParams.get("clientLeadId");
  const userId = searchParams.get("userId");
  const lng = searchParams.get("lng") || "ar";

  const direction = lng === "en" ? "ltr" : "rtl";

  // Drive the persistent 3D backdrop to the calm "paused / on hold" cancel scene.
  const { capability, setSceneKey } = useRegister3D();
  const use3D = capability.use3D;

  useEffect(() => {
    setSceneKey("cancel");
  }, [setSceneKey]);

  return (
    <Container maxWidth="sm" dir={direction}>
      <Paper
        elevation={use3D ? 0 : 3}
        sx={{
          mt: 5,
          mb: 5,
          p: 4,
          borderRadius: use3D ? 4 : 2,
          textAlign: "center",
          // On the 3D path the live scene shows THROUGH the view, so this
          // surface goes glassmorphic (semi-opaque brand surface + blur) to
          // keep the content legible over the canvas. The 2D fallback keeps the
          // original opaque paper untouched.
          ...(use3D && {
            backgroundColor: "rgba(252, 251, 249, 0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1px solid ${colors.primaryAlt}`,
            boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
          }),
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <FaExclamationTriangle
            style={{ color: "#ff9800", fontSize: "64px", marginBottom: "16px" }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            {t("cancel.title", lng)}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("cancel.message", lng)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="outlined"
            size="large"
            component="a"
            href="/register"
            startIcon={<FaHome />}
          >
            {t("cancel.backHome", lng)}
          </Button>

          {clientLeadId && (
            <PayButton
              text={t("cancel.tryAgain", lng)}
              clientLeadId={clientLeadId}
              clientId={userId}
              lng={lng}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
}
