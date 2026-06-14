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
export default function EmailStage({ onSubmit, direction = 1 }) {
  const { translate, lng } = useLanguage();
  const { setAlertError } = useAlertContext();
  const isRtl = lng === "ar";
  const back = direction < 0;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  // On BACK the email group arrives AFTER the image has eased back (staged reverse).
  const { ref } = useDepthReveal(
    { baseDelay: back ? 0.4 : 0.15, step: 0.1 },
    [direction],
  );

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
      <Box sx={{ position: "relative", width: "100%", maxWidth: 560 }}>
        {/* A slight frosted backing behind the email group so the white copy +
            field stay readable over ANY backdrop photo — soft blur + a faint
            warm-dark tint, NOT a hard white box. */}
        <Box
          aria-hidden
          style={{
            position: "absolute",
            inset: "-20px -16px",
            borderRadius: "26px",
            background:
              "linear-gradient(180deg, rgba(20,15,11,0.32) 0%, rgba(20,15,11,0.46) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        />
        <Box
          ref={ref}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            transformStyle: "preserve-3d",
            textAlign: "center",
          }}
        >
        <AnimatedText
          data-depth
          as="h2"
          text={translate("register.enterEmail")}
          stagger={0.06}
          delay={back ? 0.35 : 0.25}
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

        {/* A single GLASS input over the photo — no white box. Translucent dark
            fill + light text + a gold focus ring, matching the form stage. */}
        <Box data-depth sx={{ opacity: 0 }}>
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
                  <MdEmail size={20} color="rgba(255,255,255,0.8)" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                borderRadius: 3,
                backgroundColor: "rgba(16,12,8,0.62)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                transition: "background-color .25s ease, box-shadow .25s ease",
                "& input::placeholder": {
                  color: "rgba(255,255,255,0.72)",
                  opacity: 1,
                },
              },
              "& .MuiOutlinedInput-root:hover": {
                backgroundColor: "rgba(16,12,8,0.7)",
              },
              "& .MuiOutlinedInput-root.Mui-focused": {
                backgroundColor: "rgba(16,12,8,0.78)",
                boxShadow: "0 0 0 1px #d3ac71, 0 12px 34px rgba(0,0,0,0.45)",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.42)",
              },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(211,172,113,0.55)",
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "#d3ac71",
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
    </Box>
  );
}
