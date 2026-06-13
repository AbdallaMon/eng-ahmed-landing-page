"use client";

import { useEffect } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Box, Container, Paper, useTheme } from "@mui/material";

import colors from "@/app/register/theme/colors";
import {
  useRegister3D,
  leadStageToSceneKey,
} from "@/app/register/three/Register3DContext";
import LeadSelection3D from "@/app/register/three/LeadSelection3D";
import {
  progressIndexFor,
  useLeadFlow,
} from "@/app/register/component/leadSelection/useLeadFlow";
import { overlayRevealVariants } from "@/app/register/lib/animations";
import { RegisterHeader } from "@/app/register/component/layout/RegisterHeader";
import { StepProgress } from "@/app/register/component/leadSelection/StepProgress";
import { StageBackdrop } from "@/app/register/component/leadSelection/StageBackdrop";
import { ItemExpandPanel } from "@/app/register/component/leadSelection/ItemExpandPanel";
import { DesignIntroCard } from "@/app/register/component/leadSelection/DesignIntroCard";
import { LocationSelect } from "@/app/register/component/leadSelection/LocationSelect";
import { ItemSelect } from "@/app/register/component/leadSelection/ItemSelect";
import { EmailCaptureCard } from "@/app/register/component/forms/EmailCaptureCard";
import { LeadRegisterForm } from "@/app/register/component/forms/LeadRegisterForm";
import { CompleteRegisterForm } from "@/app/register/component/forms/CompleteRegisterForm";

const MotionDiv = motion.create("div");

// Steps shown over the full-screen DARK photo backdrop → progress + back use the
// light-on-dark treatment. (designIntro is the light intro card; form is light.)
const DARK_BACKDROP_STEPS = new Set(["email", "location", "item"]);
// Steps whose content reveals (rises) on top of the backdrop after a card has
// expanded into it. email keeps its own light card; designIntro renders bare.
const REVEAL_STEPS = new Set(["location", "item"]);

/**
 * Shared lead-selection wizard used by both /register and /register/complete.
 *
 * Signature mechanic — "card expands to fill the screen":
 *   email → submit → a small DESIGN card appears, then expands (via a shared
 *   framer-motion `layoutId`) into a full-screen photo backdrop → location
 *   options reveal on top → pick one and THAT card expands to fill the screen
 *   too → item options reveal → form → checkout.
 *
 * The expand is a shared-layout `layoutId` morph (`DesignIntroCard` /
 * `LocationSelect` cards ↔ `StageBackdrop`). Honours reduced-motion (the expand
 * collapses to a fade), the ?speed= / ?fast controls, deep-linking
 * (?leadId/?step jumps straight to the stage with no intro), the start-over
 * reset, and the exact backend calls + checkout redirect.
 *
 * @param {{ mode?: "register" | "complete", leadId?: string }} props
 */
export function LeadSelectionFlow({ mode = "register", leadId }) {
  const theme = useTheme();

  const {
    step,
    hydrated,
    isAnimating,
    selectingItem,
    returningItem,
    leadCategory,
    leadEmail,
    location,
    leadItem,
    activeImage,
    backdropLayoutId,
    formExpandLayoutId,
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  } = useLeadFlow();

  // On the WebGL path the persistent 3D canvas IS the backdrop, so the flat
  // photo StageBackdrop / colour ItemExpandPanel are suppressed and the active
  // 3D scene is driven from the flow stage. The 2D fallback keeps the original
  // photo-morph experience untouched.
  const { capability, setSceneKey } = useRegister3D();
  const use3D = capability.use3D;

  useEffect(() => {
    if (!use3D) return;
    setSceneKey(leadStageToSceneKey(step, location, leadItem));
  }, [use3D, step, location, leadItem, setSceneKey]);

  const isFormStep = step === "form";
  const onDark = DARK_BACKDROP_STEPS.has(step);
  const isReveal = REVEAL_STEPS.has(step);

  const renderForm = () =>
    mode === "complete" ? (
      <CompleteRegisterForm
        category={leadCategory}
        item={leadItem}
        location={location}
        leadId={leadId}
      />
    ) : (
      <LeadRegisterForm
        category={leadCategory}
        item={leadItem}
        location={location}
        email={leadEmail}
      />
    );

  // Steps that morph cards into the backdrop are rendered OUTSIDE the
  // AnimatePresence "wait" swap, so the shared `layoutId` survives the step
  // change (designIntro card → location card → backdrop never unmount/remount
  // around the morph). email + form use the plain slide/fade swap.
  const renderContent = () => {
    if (step === "designIntro") {
      return <DesignIntroCard />;
    }
    if (step === "location") {
      return (
        <LocationSelect onSelect={handleLocationClick} selected={location} />
      );
    }
    if (step === "item") {
      return (
        <ItemSelect
          leadCategory={leadCategory}
          location={location}
          selectingItem={selectingItem}
          returningItem={returningItem}
          onSelect={handleLeadItemClick}
          selected={leadItem}
        />
      );
    }
    if (step === "email") {
      return <EmailCaptureCard onSubmit={handleEmailSubmit} />;
    }
    return renderForm();
  };

  return (
    <LayoutGroup>
      <RegisterHeader
        onReset={handleReset}
        canReset={canReset}
        onBack={handleBack}
        canGoBack={canGoBack}
        disabled={isAnimating}
      />

      {/* Full-screen photo backdrop the active card expands into. Its shared
          `layoutId` follows the active stage so each new step morphs from the
          card the user just selected (design intro card, then location card).
          Suppressed on the 3D path — the WebGL canvas is the backdrop there. */}
      {!use3D && (
        <StageBackdrop
          image={activeImage}
          layoutId={backdropLayoutId}
          expandDelay={step === "item" ? 0.3 : 0}
        />
      )}

      {/* Colour-expand panel for the LAST step: the chosen item row grows (in
          its own gold) to fill the screen, then settles light under the form.
          Suppressed on the 3D path. */}
      {!use3D && <ItemExpandPanel layoutId={formExpandLayoutId} />}

      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          // Above every backdrop layer (photos z0/1, colour panel z2).
          zIndex: 3,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          // Sit close under the fixed header so the stepper reads right beneath
          // it (back now lives IN the header, freeing this space).
          pt: { xs: 9, md: 9.5 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <StepProgress
          activeIndex={progressIndexFor(step)}
          onDark={onDark}
        />

        {/* Avoid a flash of the email step before hydration resolves the
            deep-link target. Pointer events are cut while a transition is
            animating so no click can fire over a running animation. */}
        <Box
          sx={{
            visibility: hydrated ? "visible" : "hidden",
            pointerEvents: isAnimating ? "none" : "auto",
            flex: isFormStep ? "0 0 auto" : "1 1 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            // Keep the option cards sitting just under the stepper.
            pt: isFormStep ? 0 : { xs: 0.5, md: 1 },
          }}
        >
          {use3D && step !== "designIntro" ? (
            // 3D path: the selection steps are decks of real 3D GSAP cards that
            // fly in, then open onto the matching WebGL scene on select. The form
            // step keeps its DOM form (over the chosen item's scene).
            isFormStep ? (
              <Box key="form">{renderForm()}</Box>
            ) : (
              <LeadSelection3D
                step={step}
                location={location}
                leadItem={leadItem}
                onEmailSubmit={handleEmailSubmit}
                onLocationSelect={handleLocationClick}
                onItemSelect={handleLeadItemClick}
                onPreviewScene={setSceneKey}
              />
            )
          ) : step === "designIntro" ? (
            // The DESIGN card renders bare so its self-driven entrance + the
            // shared layoutId morph aren't disturbed by a wrapping transform.
            // This is the FIRST thing shown; it then grows into the backdrop.
            // On the 3D path the IntroScene is the hero, so the DOM intro card
            // is suppressed (it would duplicate/clash with the live scene).
            use3D ? null : renderContent()
          ) : isReveal ? (
            // location / item render BARE — each component self-animates (the
            // persistent word MORPHS without fading, while its header + option
            // cards reveal on their own delayed beat after the image expands).
            // A wrapping opacity layer here would fade the morphing word too.
            renderContent()
          ) : isFormStep ? (
            // The chosen item row has just expanded (gold → settling light) into
            // the full-screen ItemExpandPanel behind. The item NAME morphs (shared
            // `layoutId`) straight into the form's TYPE CHIP — it shrinks into its
            // place inside the form rather than sitting as a heading above it.
            <Box key="form">{renderForm()}</Box>
          ) : (
            // email: a light card that RISES in on the DESIGN backdrop AFTER the
            // intro card has grown to fill the screen ("design grows → email
            // enters"). Reveal is delayed so the expand lands first.
            <MotionDiv
              key="email"
              variants={overlayRevealVariants()}
              initial="hidden"
              animate="show"
            >
              <Paper
                elevation={0}
                sx={{
                  maxWidth: 520,
                  mx: "auto",
                  p: { xs: 2.5, md: 4 },
                  borderRadius: 4,
                  backgroundColor: colors.bgSecondary,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
                  overflow: "hidden",
                }}
              >
                {renderContent()}
              </Paper>
            </MotionDiv>
          )}
        </Box>
      </Container>
    </LayoutGroup>
  );
}
