"use client";
import { Box, Stack, Typography, useTheme } from "@mui/material";
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
 * @param {{ activeIndex: number }} props - zero-based index of the current step
 */
export function StepProgress({ activeIndex }) {
  const theme = useTheme();
  const { translate } = useLanguage();
  const total = STEP_LABELS.length;
  const current = Math.min(activeIndex + 1, total);

  const counter = translate("register.stepCounter")
    .replace("{{current}}", String(current))
    .replace("{{total}}", String(total));

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
          sx={{ fontWeight: 700, color: "primary.dark", letterSpacing: 0.5 }}
        >
          {counter}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: "text.secondary" }}
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
                backgroundColor:
                  done || active
                    ? theme.palette.primary.main
                    : theme.palette.action.hover,
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
