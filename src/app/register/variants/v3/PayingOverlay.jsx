"use client";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * Full-screen "preparing your secure payment…" transition, shown the moment the
 * form's `handleSubmit` succeeds and the Stripe redirect is firing
 * (`form.isPaying`). A warm brand wash blooms in, a gold ring spins, and the
 * copy rises — a smooth in-place hand-off to checkout (no boxed paper, no
 * jarring route flash). Reduced-motion → it simply appears, static.
 */
export default function PayingOverlay() {
  const { translate } = useLanguage();
  const rootRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (prefersReducedMotion()) {
      if (root) gsap.set(root, { opacity: 1 });
      return undefined;
    }
    const tl = gsap.timeline();
    if (root) {
      tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" });
    }
    const spin = ringRef.current
      ? gsap.to(ringRef.current, {
          rotate: 360,
          duration: 1.1,
          ease: "none",
          repeat: -1,
        })
      : null;
    return () => {
      tl.kill();
      spin?.kill();
    };
  }, []);

  return (
    <Box
      ref={rootRef}
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 6000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        background: `radial-gradient(120% 120% at 50% 35%, ${colors.bgSecondary} 0%, ${colors.bgPrimary} 60%, ${colors.bgTertiary} 100%)`,
      }}
    >
      <Box
        ref={ringRef}
        aria-hidden
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          mb: 3,
          border: `4px solid ${colors.primaryAlt}`,
          borderTopColor: colors.primaryDark,
          willChange: "transform",
        }}
      />
      {/* No bespoke "preparing payment" key exists in the dictionary and
          data/* is off-limits, so we reuse the existing checkout.redirecting
          headline (the honest equivalent) + the submitting status line. */}
      <Typography variant="h6" sx={{ fontWeight: 800, color: colors.heading }}>
        {translate("checkout.redirecting")}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, color: colors.textColor, opacity: 0.9 }}>
        {translate("loading.submitting")}
      </Typography>
    </Box>
  );
}
