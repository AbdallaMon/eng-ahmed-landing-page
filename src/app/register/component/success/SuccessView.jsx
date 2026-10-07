"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import { useSuccessStatus } from "@/app/register/component/success/useSuccessStatus";
import SuccessLoading from "@/app/register/component/success/states/SuccessLoading";
import SuccessPaid from "@/app/register/component/success/states/SuccessPaid";
import SuccessError from "@/app/register/component/success/states/SuccessError";
import SuccessActions from "@/app/register/component/success/SuccessActions";

/**
 * Payment confirmation end-state. Verifies the payment status (via
 * useSuccessStatus), then renders the loading / paid / error state on a
 * self-contained full-screen brand background, with a GSAP gold-burst reveal.
 * The reveal effects target the rendered DOM by `data-*` under rootRef, so the
 * state components can render those nodes freely.
 */
export default function SuccessView() {
  const { loading, isPaid, lng, direction, homeHref, feeNotice, feeTypeLabel } =
    useSuccessStatus();
  const rootRef = useRef(null);

  // Celebratory reveal once the status resolves to PAID.
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

  // Simple fade-in for the loading + error states.
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
        <SuccessLoading lng={lng} />
      ) : isPaid ? (
        <SuccessPaid lng={lng} feeNotice={feeNotice} feeTypeLabel={feeTypeLabel} />
      ) : (
        <SuccessError lng={lng} />
      )}

      {!loading && <SuccessActions lng={lng} homeHref={homeHref} />}
    </Box>
  );
}
