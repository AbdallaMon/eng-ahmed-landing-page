"use client";

import { useEffect, useRef } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { MdRefresh, MdArrowForward } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { usePayRedirect } from "@/app/register/core/usePayRedirect";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * "Payment cancelled / something went wrong" end-state.
 *
 * Self-contained, full-screen brand background (no boxed paper island), with a
 * calm GSAP reveal + a softly pulsing "paused" motif. Reassurance copy +
 * clear RETRY back into the flow. All `cancel.*` copy keys preserved.
 *
 * If the route carries a `clientLeadId` (a return from a cancelled Stripe
 * session), the primary CTA retries the SAME pay redirect via `usePayRedirect`
 * (identical `client/pay` behavior the old PayButton used). Otherwise the
 * primary CTA simply sends the user back into `/register` to start again.
 */
export default function CancelView() {
  const searchParams = useSearchParams();
  const clientLeadId = searchParams.get("clientLeadId");
  const userId = searchParams.get("userId");

  const language = useLanguage();
  const lng = searchParams.get("lng") || language?.lng || "ar";
  const translate = language?.translate ?? ((k) => k);
  const direction = lng === "en" ? "ltr" : "rtl";

  const { pay } = usePayRedirect();
  const rootRef = useRef(null);

  // Calm reveal: the paused motif fades/scales in, then heading + CTAs rise.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const motif = root.querySelector("[data-motif]");
    const reveal = root.querySelectorAll("[data-reveal]");

    if (prefersReducedMotion()) {
      gsap.set([motif, ...reveal], { opacity: 1, scale: 1, y: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        motif,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
      );
      tl.fromTo(
        reveal,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.12,
        },
        "-=0.25",
      );
      // Gentle breathing on the motif.
      gsap.to(motif, {
        scale: 1.06,
        duration: 1.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const handleRetry = () => {
    if (clientLeadId) {
      // Re-enter the hosted checkout with the same lead (same pay contract).
      pay({ clientLeadId, clientId: userId, lng });
    } else {
      // No lead context — restart the flow from the beginning.
      window.location.href = "/register";
    }
  };

  return (
    <Box
      ref={rootRef}
      dir={direction}
      sx={{
        position: "fixed",
        inset: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        py: 6,
        overflow: "hidden",
        // Full-screen brand background — calmer, slightly cooler beige depth.
        background: `radial-gradient(120% 120% at 50% 28%, ${colors.bgSecondary} 0%, ${colors.bgPrimary} 50%, ${colors.bgTertiary} 100%)`,
      }}
    >
      {/* Calm "paused" motif: a soft ring with two pause bars. */}
      <Box
        data-motif
        sx={{
          width: { xs: 110, md: 130 },
          height: { xs: 110, md: 130 },
          borderRadius: "50%",
          mb: { xs: 4, md: 5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${colors.primary}1f`,
          border: `2px solid ${colors.primary}`,
          boxShadow: `0 16px 44px ${colors.primary}33`,
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <Box sx={{ display: "flex", gap: { xs: 1.2, md: 1.6 } }}>
          {[0, 1].map((i) => (
            <Box
              key={i}
              sx={{
                width: { xs: 9, md: 11 },
                height: { xs: 38, md: 46 },
                borderRadius: 2,
                background: colors.primaryGradient,
              }}
            />
          ))}
        </Box>
      </Box>

      <Typography
        data-reveal
        variant="h4"
        component="h1"
        fontWeight={700}
        sx={{ color: colors.heading, opacity: 0 }}
      >
        {translate("cancel.title")}
      </Typography>
      <Typography
        data-reveal
        variant="body1"
        sx={{ color: colors.secondaryText, mt: 1.5, maxWidth: 460, opacity: 0 }}
      >
        {translate("cancel.message")}
      </Typography>

      <Stack
        data-reveal
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mt: 4, opacity: 0, width: { xs: "100%", sm: "auto" }, maxWidth: 420 }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleRetry}
          startIcon={<MdRefresh size={20} />}
          sx={{
            bgcolor: colors.primary,
            color: "#fff",
            borderRadius: 2,
            px: 3,
            "&:hover": { bgcolor: colors.primaryDark },
          }}
        >
          {translate("cancel.tryAgain")}
        </Button>
        <Button
          variant="outlined"
          size="large"
          component="a"
          href="/register"
          endIcon={
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                transform: direction === "rtl" ? "scaleX(-1)" : "none",
              }}
            >
              <MdArrowForward size={20} />
            </Box>
          }
          sx={{
            color: colors.primaryDark,
            borderColor: colors.primary,
            borderRadius: 2,
            px: 3,
            "&:hover": {
              borderColor: colors.primaryDark,
              backgroundColor: `${colors.primary}14`,
            },
          }}
        >
          {translate("cancel.backHome")}
        </Button>
      </Stack>
    </Box>
  );
}
