"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Box, Button, Container, Paper, useTheme } from "@mui/material";
import { IoArrowBack } from "react-icons/io5";

import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import {
  STEPS,
  useLeadFlow,
} from "@/app/register/component/leadSelection/useLeadFlow";
import { motionTransition, stepVariants } from "@/app/register/lib/animations";
import { RegisterHeader } from "@/app/register/component/layout/RegisterHeader";
import { StepProgress } from "@/app/register/component/leadSelection/StepProgress";
import { LocationSelect } from "@/app/register/component/leadSelection/LocationSelect";
import { ItemSelect } from "@/app/register/component/leadSelection/ItemSelect";
import { EmailCaptureCard } from "@/app/register/component/forms/EmailCaptureCard";
import { LeadRegisterForm } from "@/app/register/component/forms/LeadRegisterForm";
import { CompleteRegisterForm } from "@/app/register/component/forms/CompleteRegisterForm";

const MotionDiv = motion.create("div");

/**
 * Shared lead-selection wizard used by both /register and /register/complete.
 *
 * Rebuilt on framer-motion: a declarative step model (email → location → item
 * → form) with AnimatePresence slide/fade transitions. Honours reduced-motion
 * and the ?speed= / ?fast URL controls, preserves deep-linking (?leadId/?step),
 * the start-over reset, and the exact backend calls + checkout redirect.
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
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  } = useLeadFlow();

  const activeIndex = STEPS.indexOf(step);
  const variants = stepVariants(direction, isRtl);

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

  const renderStep = () => {
    switch (step) {
      case "email":
        return <EmailCaptureCard onSubmit={handleEmailSubmit} />;
      case "location":
        return (
          <LocationSelect onSelect={handleLocationClick} selected={location} />
        );
      case "item":
        return (
          <ItemSelect
            leadCategory={leadCategory}
            onSelect={handleLeadItemClick}
            selected={leadItem}
          />
        );
      case "form":
        return renderForm();
      default:
        return null;
    }
  };

  const isFormStep = step === "form";

  return (
    <>
      <RegisterHeader onReset={handleReset} canReset={canReset} />

      <Container
        maxWidth="md"
        sx={{
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
              color="primary"
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
                ...(isRtl && {
                  "& .MuiButton-startIcon": { ml: 0.5, mr: -0.5 },
                }),
              }}
            >
              {translate("register.back")}
            </Button>
          </Box>
        )}

        <StepProgress activeIndex={activeIndex < 0 ? 0 : activeIndex} />

        <Paper
          elevation={0}
          sx={{
            flex: isFormStep ? "0 0 auto" : "1 1 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: isFormStep ? "flex-start" : "center",
            p: { xs: 2.5, md: 4 },
            borderRadius: 4,
            backgroundColor: isFormStep ? "transparent" : colors.bgSecondary,
            border: isFormStep
              ? "none"
              : `1px solid ${theme.palette.divider}`,
            boxShadow: isFormStep
              ? "none"
              : "0 10px 30px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Avoid a flash of the email step before hydration resolves the
              deep-link target. */}
          <Box sx={{ visibility: hydrated ? "visible" : "hidden" }}>
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
                {renderStep()}
              </MotionDiv>
            </AnimatePresence>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
