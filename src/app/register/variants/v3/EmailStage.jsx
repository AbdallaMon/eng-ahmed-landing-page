"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Button, TextField, Typography, alpha, useTheme } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { riseIn } from "@/app/register/variants/v3/v3Motion";

/**
 * Email capture for V3. A compact, frosted glass panel (NOT the lead form's
 * Paper — this is the small first-touch capture, like V1's email card) carrying
 * the email field + the Next CTA. It rises in as a 3D object via `riseIn`.
 *
 * Placement is owned by the parent: during the WebGL hero beat it's anchored
 * low over the hero; once the hero recedes (or when the hero is capability-
 * gated off) it's centred over the depth scene. Submitting calls the flow's
 * `handleEmailSubmit` (which fires the backend + advances to `location`).
 *
 * @param {{
 *   onSubmit: (email: string) => void,  // useLeadFlow.handleEmailSubmit
 *   disabled?: boolean,                 // flow is animating
 * }} props
 */
export default function EmailStage({ onSubmit, disabled = false }) {
  const theme = useTheme();
  const { translate } = useLanguage();
  const [email, setEmail] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    riseIn(panelRef.current, { delay: 0.1 });
  }, []);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const submit = (e) => {
    e.preventDefault();
    if (disabled || !valid) return;
    onSubmit(email.trim());
  };

  return (
    <Box
      ref={panelRef}
      component="form"
      onSubmit={submit}
      sx={{
        width: "100%",
        maxWidth: 460,
        mx: "auto",
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        textAlign: "center",
        backgroundColor: alpha(theme.palette.background.paper, 0.82),
        backdropFilter: "blur(12px)",
        boxShadow: `0 18px 50px ${alpha(theme.palette.primary.dark, 0.22)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        willChange: "transform, opacity",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
      >
        {translate("register.enterEmail")}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        {translate("register.emailDescription")}
      </Typography>

      <TextField
        fullWidth
        type="email"
        autoComplete="email"
        label={translate("register.emailLabel")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={disabled}
        InputProps={{ sx: { borderRadius: 2 } }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={disabled || !valid}
        sx={{
          mt: 2,
          py: 1.5,
          borderRadius: 2,
          fontSize: "1.05rem",
          fontWeight: 700,
          textTransform: "none",
        }}
      >
        {translate("register.next")}
      </Button>

      <Typography
        variant="caption"
        sx={{ display: "block", mt: 1.5, color: "text.secondary" }}
      >
        {translate("register.emailPrivacy")}
      </Typography>
    </Box>
  );
}
