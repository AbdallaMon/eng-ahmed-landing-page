"use client";
import { motion } from "framer-motion";
import {
  Box,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { designLeadTypes } from "@/app/register/data/constants";
import {
  expandTransition,
  headerRevealVariants,
  listContainerVariants,
  listItemVariants,
  titleMorphTransition,
} from "@/app/register/lib/animations";

const MotionBox = motion.create(Box);
const MotionDiv = motion.create("div");
const MotionTypography = motion.create(Typography);

// Warm overlay gradients applied via INLINE style (not MUI sx) so they paint
// reliably while the card morphs to full-screen.
const OVERLAY_STYLE = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(169deg, rgba(45,35,30,0.30) 0%, rgba(45,35,30,0.85) 100%)",
};
const OVERLAY_SELECTED_STYLE = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(169deg, rgba(45,35,30,0.45) 0%, rgba(45,35,30,0.92) 100%)",
};

/**
 * Location selection (Inside UAE / Outside UAE) for the DESIGN flow.
 *
 * Each card is an image card carrying a shared `layoutId="stage-{value}"`. When
 * the user picks one, that card morphs (expands) into the full-screen
 * `StageBackdrop` of the same id — the signature "card expands to fill the
 * screen" mechanic — and the item options then reveal on top. Cards render over
 * the DESIGN backdrop, so titles use light-on-dark treatment. Accessible: real
 * buttons, alt text, focus-visible, aria-pressed.
 *
 * @param {{ onSelect: (value: string) => void, selected?: string }} props
 */
export function LocationSelect({ onSelect, selected }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { translate } = useLanguage();

  return (
    <Box>
      <MotionDiv variants={headerRevealVariants(0.1)} initial="hidden" animate="show">
        <Stack spacing={1} sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "common.white",
              fontSize: { xs: "1.5rem", md: "2rem" },
              textShadow: "0 2px 14px rgba(0,0,0,0.5)",
            }}
          >
            {translate("form.chooseFromOptions")}
          </Typography>
        </Stack>
      </MotionDiv>

      <MotionBox
        variants={listContainerVariants(0.07, 0.2)}
        initial="hidden"
        animate="show"
        sx={{
          display: "grid",
          gap: { xs: 2, md: 3 },
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        }}
      >
        {designLeadTypes.map((lead) => {
          const isSelected = selected === lead.value;
          return (
            <MotionDiv key={lead.value} variants={listItemVariants()}>
              {/* The card IS the photo now — no light frame/wrapper. A warm
                  gradient OVERLAY sits directly on the image, with the gold
                  title centred on top. The whole card carries the shared
                  `layoutId` so it grows smoothly to fill the screen on select. */}
              <MotionBox
                layoutId={`stage-${lead.value}`}
                transition={expandTransition()}
                whileHover={isDesktop ? { y: -6 } : undefined}
                whileTap={{ scale: 0.985 }}
                component="button"
                type="button"
                onClick={() => onSelect(lead.value)}
                aria-pressed={isSelected}
                sx={{
                  position: "relative",
                  p: 0,
                  m: 0,
                  cursor: "pointer",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "none",
                  display: "block",
                  width: "100%",
                  minHeight: { xs: 188, md: 248 },
                  color: "common.white",
                  boxShadow: isSelected
                    ? `0 0 0 3px ${theme.palette.primary.main}, 0 16px 34px ${alpha(
                        theme.palette.primary.dark,
                        0.4,
                      )}`
                    : "0 10px 28px rgba(0,0,0,0.35)",
                  transition: "box-shadow .25s ease",
                  "& .lead-card-image": {
                    transition: "transform .5s ease",
                  },
                  "&:hover .lead-card-image": {
                    transform: isDesktop ? "scale(1.06)" : "none",
                  },
                  "&:focus-visible": {
                    outline: `3px solid ${theme.palette.primary.main}`,
                    outlineOffset: 3,
                  },
                }}
              >
                <Box
                  component="img"
                  className="lead-card-image"
                  src={lead.image}
                  alt={lead.alt}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {/* Warm brand gradient overlay — inline style so it always
                    paints (and stays painted while the card morphs). */}
                <Box
                  aria-hidden
                  style={isSelected ? OVERLAY_SELECTED_STYLE : OVERLAY_STYLE}
                />

                {/* Big centred gold title — the original's signature treatment.
                    Carries its own `layoutId` so the chosen word RIDES the grow
                    and stays put as the item-step heading (يفضل ثابت). */}
                <Stack
                  spacing={0.75}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <MotionTypography
                    layoutId={`loc-title-${lead.value}`}
                    transition={titleMorphTransition()}
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      letterSpacing: "0.5px",
                      fontSize: { xs: "1.6rem", md: "2rem" },
                      textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                    }}
                  >
                    {translate(lead.title)}
                  </MotionTypography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha("#ffffff", 0.9),
                      fontWeight: 500,
                      textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    {translate("register.locationCardHint")}
                  </Typography>
                </Stack>
              </MotionBox>
            </MotionDiv>
          );
        })}
      </MotionBox>
    </Box>
  );
}
