"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { dur, prefersReducedMotion } from "@/app/register/variants/v1/v1Motion";

/**
 * Full-screen "preparing your secure payment…" 3D transition. Mounted by the
 * orchestrator the moment `form.isPaying` flips true; the frozen `useLeadForm`
 * fires the Stripe redirect itself right after, so this overlay simply covers
 * the swap with a premium brand beat (a gold panel sweeps up in Z while an
 * orbiting ring spins). No boxed paper. Honours reduced motion (static panel).
 *
 * Every layer here uses inline `style` (NOT MUI `sx`): an emotion class can be
 * injected a frame late, so a full-screen overlay built with `sx` can paint
 * wrong for one frame and flash. Inline style is correct on the first frame.
 */
export default function PayingOverlay() {
  const { translate } = useLanguage();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const ring = ringRef.current;
    if (!root) return undefined;

    if (prefersReducedMotion()) {
      gsap.set([root, panel], { opacity: 1, clearProps: "transform" });
      return undefined;
    }

    const tl = gsap.timeline();
    tl.fromTo(
      root,
      { opacity: 0 },
      { opacity: 1, duration: dur(0.3), ease: "power1.out" },
    ).fromTo(
      panel,
      { opacity: 0, z: -300, rotateX: 18, y: 40 },
      {
        opacity: 1,
        z: 0,
        rotateX: 0,
        y: 0,
        duration: dur(0.7),
        ease: "expo.out",
      },
      "-=0.1",
    );

    const spin = ring
      ? gsap.to(ring, { rotate: 360, duration: 1.6, ease: "none", repeat: -1 })
      : null;

    return () => {
      tl.kill();
      spin?.kill();
    };
  }, []);

  return (
    <div ref={rootRef} role="status" aria-live="polite" style={ROOT_STYLE}>
      <div ref={panelRef} style={PANEL_STYLE}>
        {/* Orbiting glyph ring. */}
        <div style={RING_WRAP_STYLE}>
          <div ref={ringRef} aria-hidden style={RING_STYLE} />
          <div aria-hidden style={RING_CORE_STYLE} />
        </div>

        <p style={TITLE_STYLE}>{translate("checkout.redirecting")}</p>
        <p style={SUB_STYLE}>{translate("register.loading")}</p>
      </div>
    </div>
  );
}

const ROOT_STYLE = {
  position: "fixed",
  inset: 0,
  zIndex: 5000,
  opacity: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  perspective: "1100px",
  background: `radial-gradient(120% 120% at 50% 30%, ${colors.primaryAlt} 0%, ${colors.bgPrimary} 55%, ${colors.bgTertiary} 100%)`,
};

const PANEL_STYLE = {
  transformStyle: "preserve-3d",
  willChange: "transform, opacity",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  padding: "0 32px",
  textAlign: "center",
};

const RING_WRAP_STYLE = {
  position: "relative",
  width: 88,
  height: 88,
  display: "grid",
  placeItems: "center",
};

const RING_STYLE = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  border: `3px solid ${colors.primaryAlt}`,
  borderTopColor: colors.primary,
  borderRightColor: colors.primaryDark,
};

const RING_CORE_STYLE = {
  width: 46,
  height: 46,
  borderRadius: "16px",
  background: colors.primaryGradient,
  boxShadow: "0 12px 28px rgba(190,151,92,0.5)",
};

const TITLE_STYLE = {
  margin: 0,
  color: colors.heading,
  fontWeight: 800,
  fontSize: "clamp(1.35rem, 1rem + 1.6vw, 1.7rem)",
  maxWidth: 460,
  lineHeight: 1.25,
};

const SUB_STYLE = {
  margin: 0,
  color: colors.secondaryText,
  fontSize: "0.95rem",
  fontWeight: 600,
};
