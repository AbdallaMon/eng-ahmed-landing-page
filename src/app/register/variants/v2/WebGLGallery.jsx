"use client";
import { useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Box, Typography, useTheme } from "@mui/material";
import gsap from "gsap";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";

import { v2Models, v2ModelCredit } from "@/app/register/variants/v2/glbModels";
import { locationOptions, itemOptions } from "@/app/register/variants/v2/stageData";
import LitFallback from "@/app/register/variants/v2/LitFallback";
import Veil from "@/app/register/variants/v2/Veil";
import EmailCapture from "@/app/register/variants/v2/EmailCapture";
import GalleryOptions from "@/app/register/variants/v2/GalleryOptions";
import GalleryForm from "@/app/register/variants/v2/GalleryForm";

// ModelStage touches WebGL + window — must be client-only. Per the core contract
// it is imported via next/dynamic with ssr:false by the variant.
const ModelStage = dynamic(
  () => import("@/app/register/core/webgl/ModelStage"),
  { ssr: false, loading: () => null },
);

// Camera framing per stage — the SAME hero model, differentiated by how the
// camera frames it (+ labels + DOM). Closer/lower as the user commits.
const CAMERA = {
  intro: { z: 4.2, y: 0.4 },
  location: { z: 2.9, y: 0.45 },
  item: { z: 2.1, y: 0.15 },
  form: { z: 2.4, y: 0.25 },
};

/**
 * V2 "WebGL Gallery" — the real-3D path. ONE persistent, lazily-loaded R3F stage
 * (core `ModelStage`, a real GLB) sits behind the whole flow as the hero object;
 * the DOM stage (intro → email → location → item → form) forms over it. On each
 * choice the camera flies toward the model (`api.flyIn`) while a DOM cross-fade
 * veil covers the swap, and the next DOM stage assembles. The form is a glass
 * panel over the live scene.
 *
 * Drives off the shared `flow` (useLeadFlow) + `form` (useLeadForm) objects.
 * Resilience: if the GLB fails, ModelStage swaps to `LitFallback`; if WebGL is
 * unusable / low-end / reduced-motion, V2Flow renders CardFlow instead (this
 * component is never mounted in that case).
 */
export default function WebGLGallery({ flow, form }) {
  const theme = useTheme();
  const { translate } = useLanguage();
  const apiRef = useRef(null);
  const veilRef = useRef(null);
  const sceneRef = useRef(null);
  const step = flow.step;

  // Receive the camera api from ModelStage (memoised so the stage isn't asked to
  // re-fire onReady — it only calls this once on mount).
  const handleReady = useCallback(
    (api) => {
      apiRef.current = api;
      // Apply the framing for whatever stage we mounted into (deep-link safe).
      const frame =
        CAMERA[step === "designIntro" || step === "email" ? "intro" : step] ||
        CAMERA.intro;
      api.flyIn({ ...frame, duration: 0.001 });
    },
    [step],
  );

  // Fly the camera to match the current stage whenever the step changes (covers
  // back-navigation too). The forward selection handlers also veil + fly for the
  // tighter "commit" feel; this keeps framing correct on every transition.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const key =
      step === "designIntro" || step === "email" ? "intro" : step;
    const frame = CAMERA[key] || CAMERA.intro;
    api.flyIn({ ...frame, duration: prefersReducedMotion() ? 0.001 : 1.0 });
  }, [step]);

  // Dim/blur the canvas slightly behind the glass form so the fields read.
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return undefined;
    const dim = step === "form";
    if (prefersReducedMotion()) {
      gsap.set(el, { filter: dim ? "blur(3px) brightness(0.82)" : "none", opacity: dim ? 0.7 : 1 });
      return undefined;
    }
    const tween = gsap.to(el, {
      opacity: dim ? 0.65 : 1,
      filter: dim ? "blur(3px) brightness(0.8)" : "blur(0px) brightness(1)",
      duration: 0.7,
      ease: "power2.out",
    });
    return () => tween.kill();
  }, [step]);

  // A choice: cross the veil, fly the camera tighter at the veil's peak, advance.
  const commit = (advance, frame) => {
    if (flow.isAnimating) return;
    veilRef.current?.cross(() => {
      apiRef.current?.flyIn({ ...frame, duration: 0.9 });
      advance();
    });
  };

  const onPickLocation = (value) =>
    commit(() => flow.handleLocationClick(value), CAMERA.item);
  const onPickItem = (value) =>
    commit(() => flow.handleLeadItemClick(value), CAMERA.form);

  return (
    <Box sx={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {/* Persistent hero stage (single canvas, behind everything). */}
      <Box
        ref={sceneRef}
        sx={{
          position: "absolute",
          inset: 0,
          // Warm brand wash behind the (alpha) canvas so transparent areas read
          // as a lit room, not white.
          background: `radial-gradient(120% 95% at 50% 16%, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 58%, ${theme.palette.background.default} 100%)`,
        }}
      >
        <ModelStage
          src={v2Models.hero}
          fallback={<LitFallback />}
          autoRotate
          onReady={handleReady}
          environmentPreset="apartment"
          modelScale={1}
          height="100%"
        />
      </Box>

      {/* Tiny on-screen 3D-model attribution (CC-BY requirement). */}
      <Typography
        aria-hidden
        sx={{
          position: "fixed",
          bottom: 6,
          insetInlineEnd: 10,
          zIndex: 11,
          fontSize: "0.62rem",
          letterSpacing: 0.2,
          color: theme.palette.text.primary,
          opacity: 0.45,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {v2ModelCredit}
      </Typography>

      {/* DOM stage over the scene. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: step === "form" ? "block" : "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          pt: { xs: 9, md: 10 },
          pb: { xs: 3, md: 5 },
          pointerEvents: "none",
        }}
      >
        {/* re-enable pointer events on the actual interactive cluster */}
        {step === "designIntro" && (
          <Box sx={{ pointerEvents: "auto", textAlign: "center" }}>
            <AnimatedText
              as="h1"
              text={translate("register.designBadge")}
              duration={0.7}
              sx={{
                m: 0,
                fontWeight: 900,
                fontSize: { xs: "2.6rem", md: "4.2rem" },
                color: theme.palette.text.secondary,
                textShadow: "0 4px 30px rgba(255,255,255,0.6)",
              }}
            />
            <Typography
              sx={{
                mt: 1.5,
                maxWidth: 520,
                mx: "auto",
                color: theme.palette.text.primary,
              }}
            >
              {translate("register.designIntro")}
            </Typography>
          </Box>
        )}

        {step === "email" && (
          <Box sx={{ pointerEvents: "auto" }}>
            <EmailCapture
              onSubmit={flow.handleEmailSubmit}
              disabled={flow.isAnimating}
            />
          </Box>
        )}

        {step === "location" && (
          <Box sx={{ pointerEvents: "auto" }}>
            <GalleryOptions
              titleKey="register.chooseLocationTitle"
              subtitleKey="register.chooseLocationSubtitle"
              options={locationOptions}
              onSelect={onPickLocation}
              selected={flow.location}
              disabled={flow.isAnimating}
            />
          </Box>
        )}

        {step === "item" && (
          <Box sx={{ pointerEvents: "auto" }}>
            <GalleryOptions
              titleKey="register.chooseItemTitle"
              subtitleKey="register.chooseItemSubtitle"
              options={itemOptions}
              onSelect={onPickItem}
              selected={flow.leadItem}
              disabled={flow.isAnimating}
            />
          </Box>
        )}
      </Box>

      {/* Form is a glass panel over the (dimmed) live scene. */}
      {step === "form" && <GalleryForm form={form} item={flow.leadItem} />}

      {/* Cross-fade veil covering camera/stage swaps. */}
      <Veil ref={veilRef} />
    </Box>
  );
}
