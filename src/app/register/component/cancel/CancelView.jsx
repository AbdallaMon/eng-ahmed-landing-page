"use client";

import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { t } from "@/app/register/data/dictionary";
import PayButton from "@/app/register/component/PayButton";

export default function CancelView() {
  const searchParams = useSearchParams();
  const clientLeadId = searchParams.get("clientLeadId");
  const userId = searchParams.get("userId");
  const lng = searchParams.get("lng") || "ar";

  const direction = lng === "en" ? "ltr" : "rtl";

  return (
    <Container maxWidth="sm" dir={direction}>
      <Paper
        elevation={3}
        sx={{ mt: 5, mb: 5, p: 4, borderRadius: 2, textAlign: "center" }}
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
