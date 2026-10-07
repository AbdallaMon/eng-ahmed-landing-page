"use client";

import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { StepItemGrid } from "./StepItemGrid";
import { StepForm } from "./StepForm";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import colors from "@/app/register/theme/colors";

export function StepLayout({
  step,
  onNext,
  isSubmitting,
  error,
  infoMessage,
  formData,
  serverFieldErrors,
  totalSteps,
  currentStepIndex,
  isSubmitted,
  submitMessage,
  onResetBooking,
  canJumpToLastSubmittedStep,
  lastSubmittedStepIndex,
  onJumpToLastSubmittedStep,
}) {
  const { translate } = useLanguage();
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  if (isSubmitted) {
    return (
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          textAlign: "center",
          backgroundColor: "#fff",
        }}
      >
        {infoMessage && (
          <Alert severity="info" sx={{ mb: 2, textAlign: "start" }}>
            {infoMessage}
          </Alert>
        )}

        <Alert severity="success" sx={{ mb: 2, textAlign: "start" }}>
          {submitMessage || translate("status.thankYou")}
        </Alert>

        <Button variant="contained" onClick={onResetBooking}>
          {translate("button.resetBooking")}
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mb: 3,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.bgTertiary,
          "& .MuiLinearProgress-bar": {
            backgroundColor: colors.primary,
            borderRadius: 3,
          },
        }}
      />

      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: colors.textColor,
          mb: 0.5,
          opacity: 0.7,
        }}
      >
        {currentStepIndex + 1} / {totalSteps}
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontWeight: 700,
          color: colors.heading,
          textAlign: "center",
        }}
      >
        {translate(step.key)}
      </Typography>

      {canJumpToLastSubmittedStep && (
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Button
            variant="text"
            onClick={onJumpToLastSubmittedStep}
            sx={{
              textTransform: "none",
              color: colors.primary,
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              "&:hover": { textDecoration: "underline", opacity: 0.8 },
            }}
          >
            {translate("button.goToLastStep")} {lastSubmittedStepIndex + 1}
          </Button>
        </Box>
      )}

      {/* Reset control — restart the whole booking from scratch. */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Button
          variant="text"
          onClick={onResetBooking}
          disabled={isSubmitting}
          sx={{
            textTransform: "none",
            color: colors.textColor,
            fontWeight: 500,
            fontSize: "0.8rem",
            opacity: 0.75,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            "&:hover": { textDecoration: "underline", opacity: 1 },
          }}
        >
          {translate("booking.resetAndRestart")}
        </Button>
      </Box>

      {error && (
        <Typography
          color="error"
          variant="body2"
          sx={{ mb: 2, textAlign: "center" }}
        >
          {error}
        </Typography>
      )}

      {infoMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {infoMessage}
        </Alert>
      )}

      {step.type === "SELECT" ? (
        <StepItemGrid
          step={step}
          onNext={onNext}
          isSubmitting={isSubmitting}
          formData={formData}
        />
      ) : (
        <StepForm
          step={step}
          onNext={onNext}
          isSubmitting={isSubmitting}
          formData={formData}
          serverFieldErrors={serverFieldErrors}
        />
      )}
    </Box>
  );
}
