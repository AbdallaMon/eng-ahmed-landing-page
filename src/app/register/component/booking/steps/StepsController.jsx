"use client";

import { Box, Fab } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import { useBookingSteps } from "../useBookingSteps";
import { StepLayout } from "./StepLayout";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import colors from "@/app/register/theme/colors";

/**
 * Wires useBookingSteps to StepLayout and renders the floating back button.
 */
export function StepsController({ onDone }) {
  const { lng } = useLanguage();
  const isRtl = lng === "ar";

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    formData,
    isSubmitting,
    error,
    infoMessage,
    serverFieldErrors,
    isSubmitted,
    submitMessage,
    resetBookingFlow,
    onNext,
    onBack,
    onJumpToLastSubmittedStep,
    canJumpToLastSubmittedStep,
    lastSubmittedStepIndex,
    isFirstStep,
  } = useBookingSteps({ onDone });

  return (
    <Box sx={{ position: "relative" }}>
      <StepLayout
        step={currentStep}
        onNext={onNext}
        isSubmitting={isSubmitting}
        error={error}
        infoMessage={infoMessage}
        formData={formData}
        serverFieldErrors={serverFieldErrors}
        totalSteps={totalSteps}
        currentStepIndex={currentStepIndex}
        isSubmitted={isSubmitted}
        submitMessage={submitMessage}
        onResetBooking={resetBookingFlow}
        canJumpToLastSubmittedStep={canJumpToLastSubmittedStep}
        lastSubmittedStepIndex={lastSubmittedStepIndex}
        onJumpToLastSubmittedStep={onJumpToLastSubmittedStep}
      />

      {/* Floating back button — hidden on step 1 and after submit. */}
      {!isFirstStep && !isSubmitted && (
        <Fab
          onClick={onBack}
          disabled={isSubmitting}
          size="small"
          aria-label="go back"
          sx={{
            position: "fixed",
            bottom: 28,
            ...(isRtl ? { right: 24 } : { left: 24 }),
            backgroundColor: colors.primary,
            color: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            "&:hover": { backgroundColor: colors.primaryDark },
            "&.Mui-disabled": { backgroundColor: colors.bgTertiary },
            zIndex: 100,
          }}
        >
          <MdArrowBack size={20} />
        </Fab>
      )}
    </Box>
  );
}
