"use client";

import { useEffect } from "react";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import { FaCreditCard } from "react-icons/fa";
import { handleRequestSubmit } from "@/app/register/lib/request";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import colors from "@/app/register/theme/colors";

/**
 * Payment button that redirects the user to the Stripe/payment URL.
 * When `autoTrigger` is true it fires immediately on mount (used in CheckoutView).
 *
 * @param {{
 *   text?: string,
 *   clientLeadId: string,
 *   clientId?: string,
 *   lng?: string,
 *   autoTrigger?: boolean,
 *   test?: boolean,
 * }} props
 */
export default function PayButton({
  text = "Pay",
  clientLeadId,
  clientId,
  lng = "ar",
  autoTrigger,
  test,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { setLoading } = useToastContext();

  const handlePayment = async () => {
    const data = await handleRequestSubmit(
      { clientLeadId, clientId, lng, test },
      setLoading,
      "client/pay",
      false,
      "Redirecting...",
    );
    // Old server returned `{ url }`; the migrated server nests it as
    // `{ data: { url } }`. Handle old || new.
    const checkoutUrl = data?.url || data?.data?.url;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  // Auto-trigger payment redirect (e.g. immediately after the checkout page loads)
  useEffect(() => {
    if (lng && clientLeadId && autoTrigger) {
      handlePayment();
    }
  }, [lng, clientLeadId]);

  if (autoTrigger) return null;

  return (
    <Button
      size={isMobile ? "large" : "medium"}
      variant="contained"
      onClick={handlePayment}
      startIcon={<FaCreditCard />}
      sx={{
        px: { xs: 3, sm: 4 },
        py: { xs: 1.5, sm: 1 },
        borderRadius: 2,
        bgcolor: colors.primary,
        color: "white",
        width: { xs: "100%", sm: "auto" },
        transition: "all 0.3s ease",
        "&:hover": {
          bgcolor: colors.primary + "dd",
          transform: "translateY(-3px)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        },
        "&:active": { transform: "translateY(0)" },
      }}
    >
      {text}
    </Button>
  );
}
