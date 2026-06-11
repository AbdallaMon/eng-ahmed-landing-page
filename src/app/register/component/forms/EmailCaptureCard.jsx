"use client";
import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";

/**
 * Email-capture card — the first step of the lead flow.
 * The `.email-lead-card` className (and its `h4`) are GSAP hooks.
 *
 * @param {{ onSubmit: (email: string) => void }} props
 */
export function EmailCaptureCard({ onSubmit }) {
  const [email, setEmail] = useState("");
  const { translate } = useLanguage();
  const { loading } = useToastContext();

  const normalizedEmail = email.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!normalizedEmail || loading) return;
    onSubmit(normalizedEmail);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className="email-lead-card"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        maxWidth: 440,
        mx: "auto",
        px: { xs: 2.5, sm: 4 },
        py: { xs: 3.5, sm: 4.5 },
        bgcolor: "background.default",
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        boxShadow: 3,
        width: "calc(100% - 48px)",
        position: "absolute",
        left: "50%",
        top: "100px",
        transform: "translatex(-50%)",
        zIndex: 100000,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h5"
          component="h4"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          {translate("register.enterEmail")}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          {translate("register.emailDescription")}
        </Typography>
      </Box>

      <TextField
        fullWidth
        required
        type="email"
        autoComplete="email"
        label={translate("register.emailLabel")}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={loading}
        slotProps={{ htmlInput: { inputMode: "email" } }}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={loading || !normalizedEmail}
        sx={{ minHeight: 48, fontWeight: 700, borderRadius: 2 }}
      >
        {loading ? translate("register.loading") : translate("register.next")}
      </Button>
    </Box>
  );
}
