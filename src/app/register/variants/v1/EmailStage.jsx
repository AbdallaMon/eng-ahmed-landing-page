"use client";
import { useState } from "react";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { MdEmail, MdArrowForward } from "react-icons/md";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useAlertContext } from "@/app/register/providers/AlertProvider";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { useDepthReveal } from "@/app/register/variants/v1/useDepthReveal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Inline email capture — NO boxed paper. The heading, the single elegant field,
 * the CTA, and the privacy note all enter as DEPTH-STAGGERED 3D objects (via
 * `useDepthReveal`) directly over the living backdrop. Submitting (Enter or the
 * button) validates the address locally, then calls `onSubmit(email)` which is
 * the flow's `handleEmailSubmit` (preserving the backend register call).
 *
 * @param {{ onSubmit: (email: string) => (void|Promise<void>) }} props
 */
export default function EmailStage({ onSubmit }) {
  const { translate, lng } = useLanguage();
  const { setAlertError } = useAlertContext();
  const isRtl = lng === "ar";
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { ref } = useDepthReveal({ baseDelay: 0.15, step: 0.1 }, []);

  const submit = async () => {
    if (busy) return;
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setAlertError(translate("validation.invalidEmail"));
      return;
    }
    try {
      setBusy(true);
      await onSubmit(value);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        perspective: "900px",
        px: 2,
      }}
    >
      <Box
        ref={ref}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        sx={{
          width: "100%",
          maxWidth: 520,
          transformStyle: "preserve-3d",
          textAlign: "center",
        }}
      >
        <AnimatedText
          data-depth
          as="h2"
          text={translate("register.enterEmail")}
          stagger={0.06}
          delay={0.25}
          sx={{
            m: 0,
            mb: 1,
            color: "#fff",
            fontWeight: 800,
            fontSize: { xs: "1.9rem", md: "2.4rem" },
            lineHeight: 1.15,
            textShadow: "0 4px 22px rgba(0,0,0,0.55)",
          }}
        />

        <Typography
          data-depth
          sx={{
            opacity: 0,
            mb: 3,
            color: "rgba(255,255,255,0.88)",
            fontSize: { xs: "0.98rem", md: "1.05rem" },
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {translate("register.emailDescription")}
        </Typography>

        <Box
          data-depth
          sx={{
            opacity: 0,
            borderRadius: 3,
            p: 0.5,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 24px 60px rgba(40,32,24,0.4)",
          }}
        >
          <TextField
            fullWidth
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={translate("register.emailLabel")}
            aria-label={translate("register.emailLabel")}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdEmail size={20} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2.5,
                bgcolor: "transparent",
                "& fieldset": { border: "none" },
              },
            }}
          />
        </Box>

        <Button
          data-depth
          type="submit"
          variant="contained"
          size="large"
          disabled={busy}
          endIcon={
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                transform: isRtl ? "scaleX(-1)" : "none",
              }}
            >
              <MdArrowForward size={20} />
            </Box>
          }
          sx={{
            opacity: 0,
            mt: 2.5,
            px: 5,
            py: 1.5,
            borderRadius: 2.5,
            fontSize: "1.05rem",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 14px 36px rgba(40,32,24,0.45)",
          }}
        >
          {translate("register.next")}
        </Button>

        <Typography
          data-depth
          sx={{
            opacity: 0,
            mt: 2.5,
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.78)",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {translate("register.emailPrivacy")}
        </Typography>
      </Box>
    </Box>
  );
}
