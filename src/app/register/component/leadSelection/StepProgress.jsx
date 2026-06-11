"use client";
import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

const STEP_LABELS = [
  "register.stepEmail",
  "register.stepLocation",
  "register.stepItem",
  "register.stepForm",
];

/**
 * Linear step-progress indicator for the lead-selection wizard. Shows a labeled
 * "Step X of Y" counter plus a row of segment bars so users always know where
 * they are and how much is left.
 *
 * @param {{ activeIndex: number, onDark?: boolean }} props
 *   activeIndex - zero-based index of the current step
 *   onDark      - light treatment for use over the full-screen photo backdrop
 */
export function StepProgress({ activeIndex, onDark = false }) {
  const theme = useTheme();
  const { translate } = useLanguage();
  const total = STEP_LABELS.length;
  const current = Math.min(activeIndex + 1, total);

  const counter = translate("register.stepCounter")
    .replace("{{current}}", String(current))
    .replace("{{total}}", String(total));

  const counterColor = onDark ? "primary.main" : "primary.dark";
  const labelColor = onDark ? alpha("#ffffff", 0.85) : "text.secondary";
  const activeBar = theme.palette.primary.main;
  const idleBar = onDark ? alpha("#ffffff", 0.28) : theme.palette.action.hover;

  return (
    <Box sx={{ width: "100%", maxWidth: 520, mx: "auto", mb: { xs: 3, md: 4 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: counterColor,
            letterSpacing: 0.5,
            textShadow: onDark ? "0 1px 6px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {counter}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: labelColor,
            textShadow: onDark ? "0 1px 6px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {translate(STEP_LABELS[Math.min(activeIndex, total - 1)])}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} role="presentation" aria-hidden>
        {STEP_LABELS.map((label, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <Box
              key={label}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 999,
                backgroundColor: done || active ? activeBar : idleBar,
                opacity: done ? 0.7 : 1,
                transition: "background-color .3s ease, opacity .3s ease",
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
