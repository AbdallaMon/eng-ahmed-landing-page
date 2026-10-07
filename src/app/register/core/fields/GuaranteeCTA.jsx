"use client";
import { Box, Button, Typography, alpha, useTheme } from "@mui/material";

/**
 * The refund-guarantee note + the submit CTA. Calls the form's `handleSubmit`
 * and is disabled while a request is in flight (`form.loading`). The text and
 * a soft tinted note box are included, but it is NOT a floating elevated paper —
 * variants wrap/position it inside their own scene.
 *
 * @param {{ form: object, ctaLabelKey?: string }} props
 *   `form` = the object returned by `useLeadForm`.
 *   `ctaLabelKey` overrides the button label dictionary key
 *   (default: "form.buttons.proceedToCheckout").
 */
export default function GuaranteeCTA({
  form,
  ctaLabelKey = "form.buttons.proceedToCheckout",
}) {
  const theme = useTheme();
  const { translate, handleSubmit, loading } = form;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        textAlign: "center",
      }}
    >
      {/* <Typography variant="body2" sx={{ fontWeight: 600, mb: 2.5 }}>
         {translate("guarantee.refund")}
        {" "}
      </Typography> */}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
        size="large"
        fullWidth
        sx={{
          borderRadius: 2,
          py: 1.75,
          fontSize: "1.1rem",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: theme.shadows[2],
          "&:hover": { boxShadow: theme.shadows[4] },
        }}
      >
        {translate(ctaLabelKey)}
      </Button>
    </Box>
  );
}
