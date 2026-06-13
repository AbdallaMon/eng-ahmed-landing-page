"use client";

import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { usePayRedirect } from "@/app/register/core/usePayRedirect";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * Minimal full-screen "preparing your secure payment…" transition.
 *
 * This is the thin, resilient checkout fallback (deep-links / direct returns).
 * The primary flow reaches Stripe straight from the form transition; here we
 * simply render a clean animated brand screen (NO boxed paper) and AUTO-FIRE the
 * pay redirect via the shared `usePayRedirect` helper — same `client/pay` call,
 * same `{ url } || { data.url }` handling, same `window.location.href` redirect.
 *
 * If there is no leadId we send the user to `/register/cancel`.
 *
 * @param {{
 *   lng?: string,
 *   clientLeadId?: string,
 *   clientId?: string,
 *   test?: boolean,
 * }} props
 */
export default function CheckoutView({
  lng = "ar",
  clientLeadId,
  clientId,
  test,
}) {
  const language = useLanguage();
  // Prefer the explicit URL lng (deep-link), fall back to live context language.
  const activeLng = lng || language?.lng || "ar";
  const translate = language?.translate ?? ((k) => k);

  const { pay } = usePayRedirect();

  const rootRef = useRef(null);
  // Guard so the auto-pay fires exactly once even under StrictMode double-mount.
  const firedRef = useRef(false);

  // No lead → bounce to cancel (kept identical to the previous behavior).
  useEffect(() => {
    if (!clientLeadId) {
      window.location.href = "/register/cancel";
    }
  }, [clientLeadId]);

  // Auto-fire the Stripe redirect once, through the shared pay helper.
  useEffect(() => {
    if (!clientLeadId || firedRef.current) return;
    firedRef.current = true;
    pay({ clientLeadId, clientId, lng: activeLng, test });
  }, [clientLeadId, clientId, activeLng, test, pay]);

  // Brand transition animation: a soft pulsing gold motif + ring sweep behind
  // the "redirecting" copy. Collapses to a static fade under reduced-motion.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const motif = root.querySelector("[data-motif]");
    const ring = root.querySelector("[data-ring]");
    const copy = root.querySelector("[data-copy]");

    if (prefersReducedMotion()) {
      gsap.set([motif, ring, copy], { opacity: 1, scale: 1 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.set(copy, { opacity: 0, y: 16 });
      gsap.set(ring, { opacity: 0, scale: 0.6 });

      gsap.to(copy, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.15,
        ease: "power3.out",
      });

      // Soft breathing pulse of the central motif.
      gsap.to(motif, {
        scale: 1.12,
        duration: 1.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // A gold ring that expands + fades outward repeatedly (radar sweep).
      gsap.to(ring, {
        opacity: 0.0,
        scale: 1.9,
        duration: 1.8,
        ease: "power1.out",
        repeat: -1,
        repeatDelay: 0.1,
        onRepeat: () => gsap.set(ring, { opacity: 0.55, scale: 0.6 }),
      });
      gsap.set(ring, { opacity: 0.55 });
    }, root);

    return () => ctx.revert();
  }, []);

  if (!clientLeadId) return null;

  return (
    <Box
      ref={rootRef}
      dir={activeLng === "en" ? "ltr" : "rtl"}
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
        overflow: "hidden",
        // Full-screen brand background — warm gold/beige depth, no boxed island.
        background: `radial-gradient(120% 120% at 50% 30%, ${colors.bgSecondary} 0%, ${colors.bgPrimary} 55%, ${colors.bgTertiary} 100%)`,
      }}
    >
      {/* Pulsing brand motif: concentric gold disc + sweeping ring. */}
      <Box
        sx={{
          position: "relative",
          width: { xs: 132, md: 168 },
          height: { xs: 132, md: 168 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: { xs: 4, md: 5 },
        }}
      >
        {/* Expanding ring (radar sweep). */}
        <Box
          data-ring
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${colors.primary}`,
            willChange: "transform, opacity",
          }}
        />
        {/* Solid breathing disc. */}
        <Box
          data-motif
          sx={{
            width: "62%",
            height: "62%",
            borderRadius: "50%",
            background: colors.primaryGradient,
            boxShadow: `0 18px 50px ${colors.primary}66`,
            willChange: "transform",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner highlight dot for a touch of depth. */}
          <Box
            sx={{
              width: "34%",
              height: "34%",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.55)",
              filter: "blur(1px)",
            }}
          />
        </Box>
      </Box>

      <Box data-copy sx={{ maxWidth: 440, willChange: "transform, opacity" }}>
        <Typography
          variant="h5"
          component="p"
          fontWeight={700}
          sx={{ color: colors.heading, mb: 1 }}
        >
          {translate("checkout.redirecting")}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.secondaryText }}>
          {translate("checkout.consultWithAhmed")}
        </Typography>
      </Box>
    </Box>
  );
}
