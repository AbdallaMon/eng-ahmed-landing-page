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
import { useRegister3D } from "@/app/register/three/Register3DContext";
import colors from "@/app/register/theme/colors";

// Readable glass surface used on the WebGL path so step content (progress,
// labels, copy) stays legible over the ambient 3D scene behind it. On the 2D
// fallback the step content stays bare on the opaque brand background.
const glassSurface = {
  borderRadius: 4,
  p: { xs: 2, md: 3 },
  // Semi-opaque brand surface + blur → legible over the live backdrop.
  backgroundColor: "rgba(252, 251, 249, 0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: `1px solid ${colors.primary}33`,
  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
};

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
  const { capability } = useRegister3D();
  const use3D = capability.use3D;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  if (isSubmitted) {
    return (
      <Paper
        elevation={use3D ? 0 : 4}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          textAlign: "center",
          // Glass on the 3D path so the success card reads over the live scene.
          ...(use3D ? glassSurface : { backgroundColor: "#fff" }),
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
    <Box
      sx={{
        pb: 10,
        // Lift the whole step onto a readable glass surface over the ambient
        // 3D scene. Bare on the 2D fallback (opaque background already covers).
        ...(use3D ? glassSurface : null),
      }}
    >
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
