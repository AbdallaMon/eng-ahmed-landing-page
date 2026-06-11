"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Box, Button, Container, Paper, alpha, useTheme } from "@mui/material";
import { IoArrowBack } from "react-icons/io5";

import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import {
  progressIndexFor,
  useLeadFlow,
} from "@/app/register/component/leadSelection/useLeadFlow";
import {
  motionTransition,
  overlayRevealVariants,
  stepVariants,
} from "@/app/register/lib/animations";
import { RegisterHeader } from "@/app/register/component/layout/RegisterHeader";
import { StepProgress } from "@/app/register/component/leadSelection/StepProgress";
import { StageBackdrop } from "@/app/register/component/leadSelection/StageBackdrop";
import { DesignIntroCard } from "@/app/register/component/leadSelection/DesignIntroCard";
import { LocationSelect } from "@/app/register/component/leadSelection/LocationSelect";
import { ItemSelect } from "@/app/register/component/leadSelection/ItemSelect";
import { EmailCaptureCard } from "@/app/register/component/forms/EmailCaptureCard";
import { LeadRegisterForm } from "@/app/register/component/forms/LeadRegisterForm";
import { CompleteRegisterForm } from "@/app/register/component/forms/CompleteRegisterForm";

const MotionDiv = motion.create("div");

// Steps rendered over the full-screen photo backdrop (light-on-dark treatment).
const OVERLAY_STEPS = new Set(["designIntro", "location", "item"]);

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
  const { translate, lng } = useLanguage();
  const isRtl = lng === "ar";

  const {
    step,
    direction,
    hydrated,
    leadCategory,
    leadEmail,
    location,
    leadItem,
    activeImage,
    backdropLayoutId,
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  } = useLeadFlow();

  const variants = stepVariants(direction, isRtl);
  const isFormStep = step === "form";
  const isOverlay = OVERLAY_STEPS.has(step);

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
      <RegisterHeader onReset={handleReset} canReset={canReset} />

      {/* Full-screen photo backdrop the active card expands into. Its shared
          `layoutId` follows the active stage so each new step morphs from the
          card the user just selected (design intro card, then location card). */}
      <StageBackdrop image={activeImage} layoutId={backdropLayoutId} />

      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          pt: { xs: 11, md: 12 },
          pb: { xs: 6, md: 8 },
        }}
      >
        {/* Back control (in-flow, accessible) — shown once past email capture. */}
        {canGoBack && (
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={handleBack}
              variant="text"
              startIcon={
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    transform: isRtl ? "scaleX(-1)" : "none",
                  }}
                >
                  <IoArrowBack size={18} />
                </Box>
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: isOverlay ? "common.white" : "primary.main",
                ...(isOverlay && {
                  backgroundColor: alpha("#2d231e", 0.35),
                  borderRadius: 999,
                  px: 1.75,
                  "&:hover": { backgroundColor: alpha("#2d231e", 0.5) },
                }),
                ...(isRtl && {
                  "& .MuiButton-startIcon": { ml: 0.5, mr: -0.5 },
                }),
              }}
            >
              {translate("register.back")}
            </Button>
          </Box>
        )}

        <StepProgress
          activeIndex={progressIndexFor(step)}
          onDark={isOverlay}
        />

        {/* Avoid a flash of the email step before hydration resolves the
            deep-link target. */}
        <Box
          sx={{
            visibility: hydrated ? "visible" : "hidden",
            flex: isFormStep ? "0 0 auto" : "1 1 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: isFormStep ? "flex-start" : "center",
          }}
        >
          {step === "designIntro" ? (
            // The DESIGN card renders bare so its self-driven entrance + the
            // shared layoutId morph aren't disturbed by a wrapping transform.
            renderContent()
          ) : isOverlay ? (
            // Overlay steps live on the backdrop; the shared layoutId morph
            // drives the expand, and the content reveals over it.
            <MotionDiv
              key={step}
              variants={overlayRevealVariants()}
              initial="hidden"
              animate="show"
            >
              {renderContent()}
            </MotionDiv>
          ) : (
            // email + form: light card with the classic slide/fade swap.
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: 4,
                backgroundColor: isFormStep ? "transparent" : colors.bgSecondary,
                border: isFormStep
                  ? "none"
                  : `1px solid ${theme.palette.divider}`,
                boxShadow: isFormStep ? "none" : "0 10px 30px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <MotionDiv
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={motionTransition()}
                >
                  {renderContent()}
                </MotionDiv>
              </AnimatePresence>
            </Paper>
          )}
        </Box>
      </Container>
    </LayoutGroup>
  );
}
