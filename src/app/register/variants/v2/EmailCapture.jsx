"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import gsap from "gsap";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";

/**
 * Email-capture stage for V2 (shared by the WebGL gallery overlay and the card
 * fallback). A compact glass cluster — title (3D word reveal) + a single email
 * field + Next — that submits via the flow's `onSubmit(email)`
 * (`useLeadFlow.handleEmailSubmit`). Not a boxed paper; it's a translucent
 * cluster floating over the scene. Enter submits.
 */
export default function EmailCapture({ onSubmit, disabled }) {
  const theme = useTheme();
  const { translate } = useLanguage();
  const [email, setEmail] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll("[data-rise]");
    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return undefined;
    }
    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: 22, z: -40 },
      {
        opacity: 1,
        y: 0,
        z: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.15,
      },
    );
    return () => tween.kill();
  }, []);

  const submit = (e) => {
    e?.preventDefault?.();
    const value = email.trim();
    if (!value || disabled) return;
    onSubmit(value);
  };

  return (
    <Box
      ref={rootRef}
      component="form"
      onSubmit={submit}
      sx={{
        width: "min(440px, 92vw)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        background: `${theme.palette.background.paper}d9`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        border: `1px solid ${theme.palette.primary.main}26`,
        textAlign: "center",
      }}
    >
      <AnimatedText
        as="h1"
        text={translate("register.emailWelcomeTitle")}
        duration={0.6}
        sx={{
          m: 0,
          fontWeight: 800,
          fontSize: { xs: "1.5rem", md: "1.85rem" },
          color: theme.palette.text.secondary,
          lineHeight: 1.25,
        }}
      />
      <Typography
        data-rise
        variant="body2"
        sx={{ opacity: 0, color: theme.palette.text.primary }}
      >
        {translate("register.emailDescription")}
      </Typography>

      <Box data-rise sx={{ opacity: 0 }}>
        <TextField
          fullWidth
          autoFocus
          type="email"
          label={translate("register.emailLabel")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{ sx: { borderRadius: 2 } }}
        />
      </Box>

      <Box data-rise sx={{ opacity: 0 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={disabled || !email.trim()}
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontWeight: 700,
            fontSize: "1.05rem",
            textTransform: "none",
          }}
        >
          {translate("register.next")}
        </Button>
      </Box>

      <Typography
        data-rise
        variant="caption"
        sx={{ opacity: 0, color: theme.palette.text.primary }}
      >
        {translate("register.emailPrivacy")}
      </Typography>
    </Box>
  );
}
