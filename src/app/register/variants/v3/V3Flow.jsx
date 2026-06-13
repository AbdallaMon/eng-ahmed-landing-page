"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";

import { useLeadFlow } from "@/app/register/component/leadSelection/useLeadFlow";
import { RegisterHeader } from "@/app/register/component/layout/RegisterHeader";
import { detectCapability } from "@/app/register/core/webgl/capability";
import { designLead, designLeadTypes, DesignLeadPrice, LeadType } from "@/app/register/data/constants";

import DepthBackground from "@/app/register/variants/v3/DepthBackground";
import HeroStage from "@/app/register/variants/v3/HeroStage";
import EmailStage from "@/app/register/variants/v3/EmailStage";
import OptionStage from "@/app/register/variants/v3/OptionStage";
import FormStage from "@/app/register/variants/v3/FormStage";
import PayingOverlay from "@/app/register/variants/v3/PayingOverlay";
import { imageForItem, imageForLocation } from "@/app/register/variants/v3/v3Assets";

/**
 * V3 "Hybrid" flow shell.
 *
 * INTRO + EMAIL: a single elegant WebGL hero object (SheenChair) auto-rotates
 * over a warm brand wash, with the email-capture panel anchored beneath it. On
 * the first advance (email submit → location) the hero gracefully recedes and
 * unmounts, and the flow continues WITHOUT WebGL.
 *
 * REST (location → item → form): V1's "Living Cards" mechanic via
 * `core/cards3d` (photographic Card3D panels, flyToFill on select,
 * scatterSiblings, AnimatedText headings) over a CSS perspective depth scene
 * (`DepthBackground`) — cheap + reliable after the hero.
 *
 * Capability gate: if WebGL is unavailable / low tier / reduced-motion, the
 * hero is SKIPPED entirely and the flow starts straight in the card flow
 * (pure V1-style). All animation is GSAP; reduced-motion is honoured throughout.
 *
 * All business logic (state machine, backend, deep-linking, reset) comes from
 * the shared, frozen `useLeadFlow` — this shell only decides how each stage
 * looks/animates.
 */
export default function V3Flow() {
  const flow = useLeadFlow();
  const {
    step,
    leadCategory,
    leadEmail,
    location,
    leadItem,
    activeImage,
    isAnimating,
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  } = flow;

  // ── Capability gate (client-only; avoids SSR/hydration mismatch) ────────────
  // The hero only renders on a capable, motion-allowed device. Resolved after
  // mount so the server + first client render agree (no hero), then the hero
  // appears if eligible.
  const [heroEligible, setHeroEligible] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const cap = detectCapability();
    // Real-3D hero only when WebGL works, motion isn't suppressed, and the tier
    // isn't the weakest. Otherwise skip straight to the (WebGL-free) card flow.
    setHeroEligible(cap.use3D && cap.tier !== "low");
    setMounted(true);
  }, []);

  // The hero lives over the intro + email beats; once we advance to `location`
  // (or beyond) it recedes. Tracked separately so the recede can finish before
  // we unmount the heavy WebGL stage.
  const onHeroBeat = step === "designIntro" || step === "email";
  const [heroMounted, setHeroMounted] = useState(false);
  useEffect(() => {
    if (mounted && heroEligible && onHeroBeat && !heroMounted) {
      setHeroMounted(true);
    }
  }, [mounted, heroEligible, onHeroBeat, heroMounted]);

  // The lead form object is lifted from FormStage so we can drive the pay
  // overlay (it owns `useLeadForm`, the single source of submit/pay state).
  const [leadForm, setLeadForm] = useState(null);
  const isPaying = Boolean(leadForm?.isPaying);

  // Option lists for the two card stages.
  const locationOptions = useMemo(
    () =>
      designLeadTypes.map((l) => ({
        value: l.value,
        labelKey: l.title,
        image: imageForLocation(l.value),
      })),
    [],
  );
  const itemOptions = useMemo(
    () =>
      designLead.map((d) => ({
        value: d.value,
        labelKey: LeadType[d.value],
        image: imageForItem(d.value),
        noteKey: DesignLeadPrice[d.value],
      })),
    [],
  );

  const showHero = heroMounted; // already gated by eligibility above

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header chrome: Back + Start-over + language. Disabled mid-animation. */}
      <RegisterHeader
        onBack={handleBack}
        canGoBack={canGoBack}
        onReset={handleReset}
        canReset={canReset}
        disabled={isAnimating || isPaying}
      />

      {/* The CSS perspective depth scene (always present; the back photo follows
          the flow's activeImage). */}
      <DepthBackground image={activeImage} />

      {/* WebGL hero overlay — only over intro/email, only when eligible. It
          recedes itself when `visible` flips false, then unmounts. */}
      {showHero && (
        <HeroStage
          visible={onHeroBeat}
          onRecedeComplete={() => setHeroMounted(false)}
        />
      )}

      {/* Stage content. The email panel renders for designIntro + email; the
          hero (if any) sits behind it and recedes on advance. */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          minHeight: "100dvh",
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "center",
          pt: { xs: 12, sm: 0 },
          pb: { xs: 6, sm: 4 },
        }}
      >
        {(step === "designIntro" || step === "email") && (
          <Box
            sx={{
              width: "100%",
              // When the hero is present, anchor the email panel low over it;
              // otherwise centre it in the depth scene.
              alignSelf: showHero ? "flex-end" : "center",
              pb: showHero ? { xs: 4, sm: 6 } : 0,
              px: { xs: 2, sm: 3 },
            }}
          >
            <EmailStage onSubmit={handleEmailSubmit} disabled={isAnimating} />
          </Box>
        )}

        {step === "location" && (
          <OptionStage
            titleKey="register.chooseLocationTitle"
            subtitleKey="register.chooseLocationSubtitle"
            options={locationOptions}
            onSelect={handleLocationClick}
            isAnimating={isAnimating}
          />
        )}

        {step === "item" && (
          <OptionStage
            titleKey="register.chooseItemTitle"
            subtitleKey="register.chooseItemSubtitle"
            options={itemOptions}
            onSelect={handleLeadItemClick}
            isAnimating={isAnimating}
          />
        )}

        {step === "form" && (
          <FormStage
            category={leadCategory}
            item={leadItem}
            location={location}
            leadEmail={leadEmail}
            onForm={setLeadForm}
          />
        )}
      </Box>

      {/* Full-screen "preparing payment" transition during the Stripe redirect. */}
      {isPaying && <PayingOverlay />}
    </Box>
  );
}
