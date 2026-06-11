"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { IoMailOutline } from "react-icons/io5";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";

/**
 * Email-capture card — the first step of the lead flow. Plain in-flow card
 * (the wizard handles transitions), real <form> semantics, accessible labels.
 *
 * @param {{ onSubmit: (email: string) => void }} props
 */
export function EmailCaptureCard({ onSubmit }) {
  const theme = useTheme();
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
      sx={{ maxWidth: 480, mx: "auto", width: "100%" }}
    >
      <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            color: "primary.dark",
            backgroundColor: alpha(theme.palette.primary.main, 0.14),
          }}
        >
          <IoMailOutline size={30} />
        </Box>

        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "primary.dark",
              fontSize: { xs: "1.6rem", md: "2rem" },
            }}
          >
            {translate("register.emailWelcomeTitle")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 1, color: "text.secondary" }}
          >
            {translate("register.emailDescription")}
          </Typography>
        </Box>

        <TextField
          fullWidth
          required
          type="email"
          autoComplete="email"
          autoFocus
          label={translate("register.emailLabel")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          slotProps={{ htmlInput: { inputMode: "email" } }}
          sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading || !normalizedEmail}
          sx={{
            minHeight: 52,
            fontWeight: 700,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1.05rem",
          }}
        >
          {loading ? translate("register.loading") : translate("register.next")}
        </Button>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {translate("register.emailPrivacy")}
        </Typography>
      </Stack>
    </Box>
  );
}
