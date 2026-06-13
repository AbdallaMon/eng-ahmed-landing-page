"use client";
import { useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";

import { useLeadFlow } from "@/app/register/component/leadSelection/useLeadFlow";
import { useLeadForm } from "@/app/register/core/useLeadForm";
import { detectCapability } from "@/app/register/core/webgl/capability";
import { RegisterHeader } from "@/app/register/component/layout/RegisterHeader";

import WebGLGallery from "@/app/register/variants/v2/WebGLGallery";
import CardFlow from "@/app/register/variants/v2/CardFlow";
import PayingOverlay from "@/app/register/variants/v2/PayingOverlay";

/**
 * V2 "WebGL Gallery" shell. Owns the shared flow + form state and decides, on
 * the client, between the real-3D WebGL path (WebGLGallery) and the capability
 * fallback (CardFlow) — both render the SAME flow.
 *
 *  - `useLeadFlow`  : the variant-agnostic state machine (steps, deep-link,
 *                     back/reset, the chosen location/item/email). REUSED as-is.
 *  - `useLeadForm`  : the form state + two-step backend submit + Stripe pay. Its
 *                     `isPaying` drives the full-screen PayingOverlay.
 *  - `detectCapability().use3D` gates WebGL (GPU present AND motion not reduced).
 *
 * Capability is resolved AFTER mount (SSR-safe) to avoid a hydration mismatch;
 * before that a neutral brand field is shown (no flash, no layout jump).
 */
export default function V2Flow() {
  const theme = useTheme();
  const flow = useLeadFlow();
  const form = useLeadForm({
    category: flow.leadCategory, // always "DESIGN"
    item: flow.leadItem,
    location: flow.location,
    leadEmail: flow.leadEmail,
  });

  // Resolve WebGL capability once, on the client, after mount.
  const [decision, setDecision] = useState(null); // null = undecided (pre-mount)
  useEffect(() => {
    setDecision(detectCapability());
  }, []);

  const use3D = decision?.use3D === true;
  const ready = decision !== null && flow.hydrated;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        // Neutral brand backdrop shown before the path is decided (and behind
        // everything after) so there is never a white flash.
        background: `radial-gradient(120% 95% at 50% 16%, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 58%, ${theme.palette.background.default} 100%)`,
      }}
    >
      {ready && (use3D ? (
        <WebGLGallery flow={flow} form={form} />
      ) : (
        <CardFlow flow={flow} form={form} />
      ))}

      {/* Header: language + Back + Start-over (anchored top chrome). */}
      <RegisterHeader
        onBack={flow.handleBack}
        canGoBack={flow.canGoBack}
        onReset={flow.handleReset}
        canReset={flow.canReset}
        disabled={flow.isAnimating || form.submitting}
      />

      {/* Full-screen "preparing your secure payment…" transition. */}
      {form.isPaying && <PayingOverlay />}
    </Box>
  );
}
