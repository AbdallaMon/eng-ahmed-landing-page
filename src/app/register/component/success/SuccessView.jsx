"use client";

import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { FaCheckCircle, FaTimesCircle, FaHome } from "react-icons/fa";
import { MdAppRegistration } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { getData } from "@/app/register/lib/request";
import { t } from "@/app/register/data/dictionary";

/**
 * Payment confirmation page. Verifies the payment status, then shows a simple
 * "payment done + thank you" message (no navbar/footer — see ChromeGate).
 * Provides links back to the home page and the registration flow.
 */
export default function SuccessView() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("checking");
  const sessionId = searchParams.get("session_id");
  const clientLeadId = searchParams.get("clientLeadId");
  const lng = searchParams.get("lng") || "ar";
  const direction = lng === "en" ? "ltr" : "rtl";

  useEffect(() => {
    if (!sessionId || !clientLeadId) return;

    const updatePaymentStatus = async () => {
      const request = await getData({
        url: `client/payment-status?sessionId=${sessionId}&clientLeadId=${clientLeadId}&lng=${lng}&`,
        setLoading,
      });
      // Old server returned `paymentStatus` at the top level; the migrated
      // server nests it as `data.paymentStatus`. Handle old || new.
      const paymentStatus =
        request?.paymentStatus || request?.data?.paymentStatus;
      if (request?.status === 200 && paymentStatus === "PAID") {
        setStatus("PAID");
      } else {
        setStatus("ERROR");
      }
    };

    updatePaymentStatus();
  }, [sessionId, clientLeadId]);

  return (
    <Container
      maxWidth="sm"
      dir={direction}
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 3,
        py: 6,
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={60} />
          <Typography variant="h6">{t("success.loading", lng)}</Typography>
        </>
      ) : status === "PAID" ? (
        <>
          <FaCheckCircle style={{ color: "#4caf50", fontSize: "72px" }} />
          <Typography variant="h4" component="h1" fontWeight={700}>
            {t("success.paymentTitle", lng)}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t("status.thankYou", lng)}
          </Typography>
        </>
      ) : (
        <>
          <FaTimesCircle style={{ color: "#f44336", fontSize: "72px" }} />
          <Typography variant="h4" component="h1" fontWeight={700}>
            {t("success.errorTitle", lng)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("success.errorMessage", lng)}
          </Typography>
        </>
      )}

      {!loading && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Button
            variant="contained"
            component="a"
            href="/"
            startIcon={<FaHome />}
          >
            {t("success.backHome", lng)}
          </Button>
          <Button
            variant="outlined"
            component="a"
            href="/register"
            startIcon={<MdAppRegistration />}
          >
            {t("success.goRegister", lng)}
          </Button>
        </Stack>
      )}
    </Container>
  );
}
