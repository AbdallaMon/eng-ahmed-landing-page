"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { FaHome } from "react-icons/fa";
import { MdAppRegistration } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { getData } from "@/app/register/lib/request";
import { t } from "@/app/register/data/dictionary";
import colors from "@/app/register/theme/colors";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * Payment confirmation end-state. Verifies the payment status, then shows a
 * celebratory "payment done + thank you" screen (no navbar/footer — see
 * ChromeGate). Links back to the home page and a new registration.
 *
 * Self-contained, full-screen brand background (no boxed paper island), with a
 * tasteful GSAP gold-burst + check reveal. Honors prefers-reduced-motion. The
 * payment-status verification logic + all copy keys are preserved exactly.
 */
export default function SuccessView() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("checking");
  const sessionId = searchParams.get("session_id");
  const clientLeadId = searchParams.get("clientLeadId");
  const lng = searchParams.get("lng") || "ar";
  const direction = lng === "en" ? "ltr" : "rtl";

  const rootRef = useRef(null);

  // ── Payment-status verification (PRESERVED, unchanged contract) ────────────
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
    // `lng` is derived from the URL and only labels the request — intentionally
    // keyed on sessionId + clientLeadId so the status check fires once per lead
    // (preserves the original behavior exactly).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, clientLeadId]);

  const isPaid = status === "PAID";

  // ── Celebratory reveal once the status resolves to PAID ───────────────────
  useEffect(() => {
    if (loading || !isPaid) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    const badge = root.querySelector("[data-badge]");
    const checkPath = root.querySelector("[data-check]");
    const rays = root.querySelectorAll("[data-ray]");
    const reveal = root.querySelectorAll("[data-reveal]");

    if (prefersReducedMotion()) {
      gsap.set([badge, ...reveal], { opacity: 1, scale: 1, y: 0 });
      gsap.set(rays, { opacity: 0.7, scale: 1 });
      if (checkPath) gsap.set(checkPath, { strokeDashoffset: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      // The gold badge pops in.
      tl.fromTo(
        badge,
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      );
      // The check mark draws itself.
      if (checkPath) {
        tl.fromTo(
          checkPath,
          { strokeDashoffset: 48 },
          { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" },
          "-=0.15",
        );
      }
      // Gold burst rays fan out, then settle.
      tl.fromTo(
        rays,
        { opacity: 0, scale: 0.2 },
        {
          opacity: 0.85,
          scale: 1,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.03,
        },
        "-=0.35",
      );
      tl.to(rays, { opacity: 0.32, duration: 0.6, ease: "sine.out" }, "-=0.1");
      // Headline + CTAs rise in.
      tl.fromTo(
        reveal,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.12,
        },
        "-=0.35",
      );
      // Gentle breathing on the badge afterward.
      gsap.to(badge, {
        scale: 1.05,
        duration: 1.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });
    }, root);

    return () => ctx.revert();
  }, [loading, isPaid]);

  // ── Simple fade-in for the loading + error states ─────────────────────────
  useEffect(() => {
    if (isPaid) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    const reveal = root.querySelectorAll("[data-reveal]");
    if (prefersReducedMotion()) {
      gsap.set(reveal, { opacity: 1, y: 0 });
      return undefined;
    }
    const tween = gsap.fromTo(
      reveal,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 },
    );
    return () => tween.kill();
  }, [loading, isPaid]);

  const NUM_RAYS = 12;

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
        // Full-screen celebratory brand background (warm gold-lit beige).
        background: `radial-gradient(120% 120% at 50% 22%, ${colors.primaryAlt} 0%, ${colors.bgSecondary} 45%, ${colors.bgPrimary} 100%)`,
      }}
    >
      {loading ? (
        // ── Loading: a quiet pulsing brand dot + "processing" copy ──────────
        <>
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              mb: 4,
              background: colors.primaryGradient,
              boxShadow: `0 16px 44px ${colors.primary}55`,
              animation: prefersReducedMotion()
                ? "none"
                : "successPulse 1.3s ease-in-out infinite",
              "@keyframes successPulse": {
                "0%,100%": { transform: "scale(1)", opacity: 0.85 },
                "50%": { transform: "scale(1.12)", opacity: 1 },
              },
            }}
          />
          <Typography
            data-reveal
            variant="h6"
            component="p"
            sx={{ color: colors.heading, opacity: 0 }}
          >
            {t("success.loading", lng)}
          </Typography>
        </>
      ) : isPaid ? (
        // ── PAID: gold burst + drawn check + thank-you + CTAs ───────────────
        <>
          <Box
            sx={{
              position: "relative",
              width: { xs: 150, md: 184 },
              height: { xs: 150, md: 184 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: { xs: 4, md: 5 },
            }}
          >
            {/* Burst rays */}
            {Array.from({ length: NUM_RAYS }).map((_, i) => (
              <Box
                key={i}
                data-ray
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 4,
                  height: { xs: 26, md: 32 },
                  borderRadius: 2,
                  backgroundColor: colors.primary,
                  opacity: 0,
                  transformOrigin: "center bottom",
                  transform: `translate(-50%, -100%) rotate(${(360 / NUM_RAYS) * i}deg) translateY(-58px)`,
                }}
              />
            ))}
            {/* Gold check badge */}
            <Box
              data-badge
              sx={{
                width: "70%",
                height: "70%",
                borderRadius: "50%",
                background: colors.primaryGradient,
                boxShadow: `0 20px 56px ${colors.primary}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                willChange: "transform",
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 52 52"
                sx={{ width: "52%", height: "52%" }}
              >
                <path
                  data-check
                  d="M14 27 L23 36 L40 18"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ strokeDasharray: 48, strokeDashoffset: 48 }}
                />
              </Box>
            </Box>
          </Box>

          <Typography
            data-reveal
            variant="h4"
            component="h1"
            fontWeight={700}
            sx={{ color: colors.heading, opacity: 0 }}
          >
            {t("success.paymentTitle", lng)}
          </Typography>
          <Typography
            data-reveal
            variant="h6"
            sx={{ color: colors.secondaryText, mt: 1.5, maxWidth: 480, opacity: 0 }}
          >
            {t("status.thankYou", lng)}
          </Typography>
        </>
      ) : (
        // ── ERROR: verification issue (kept) ────────────────────────────────
        <>
          <Box
            sx={{
              width: { xs: 96, md: 112 },
              height: { xs: 96, md: 112 },
              borderRadius: "50%",
              mb: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${colors.warning}22`,
              border: `2px solid ${colors.warning}`,
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 52 52"
              sx={{ width: "48%", height: "48%" }}
            >
              <path
                d="M26 12 V32"
                stroke={colors.secondaryDark}
                strokeWidth={5}
                strokeLinecap="round"
              />
              <circle cx="26" cy="42" r="3" fill={colors.secondaryDark} />
            </Box>
          </Box>
          <Typography
            data-reveal
            variant="h4"
            component="h1"
            fontWeight={700}
            sx={{ color: colors.heading, opacity: 0 }}
          >
            {t("success.errorTitle", lng)}
          </Typography>
          <Typography
            data-reveal
            variant="body1"
            sx={{ color: colors.secondaryText, mt: 1.5, maxWidth: 460, opacity: 0 }}
          >
            {t("success.errorMessage", lng)}
          </Typography>
        </>
      )}

      {!loading && (
        <Stack
          data-reveal
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 4, opacity: 0 }}
        >
          <Button
            variant="contained"
            component="a"
            href="/"
            size="large"
            startIcon={<FaHome />}
            sx={{
              bgcolor: colors.primary,
              color: "#fff",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: colors.primaryDark },
            }}
          >
            {t("success.backHome", lng)}
          </Button>
          <Button
            variant="outlined"
            component="a"
            href="/register"
            size="large"
            startIcon={<MdAppRegistration />}
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
            {t("success.goRegister", lng)}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
