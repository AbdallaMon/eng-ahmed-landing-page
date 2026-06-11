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
  listContainerVariants,
  listItemVariants,
} from "@/app/register/lib/animations";

const MotionBox = motion.create(Box);
const MotionDiv = motion.create("div");

// The warm brand overlay — keeps the image readable while the big gold title
// sits centred on top of it. Strengthened slightly on the selected card.
const OVERLAY =
  "linear-gradient(169deg, rgba(45,35,30,0.30) 0%, rgba(45,35,30,0.85) 100%)";
const OVERLAY_SELECTED =
  "linear-gradient(169deg, rgba(45,35,30,0.45) 0%, rgba(45,35,30,0.92) 100%)";

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
          {translate("register.chooseLocationTitle")}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: alpha("#ffffff", 0.92),
            maxWidth: 460,
            mx: "auto",
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}
        >
          {translate("register.chooseLocationSubtitle")}
        </Typography>
      </Stack>

      <MotionBox
        variants={listContainerVariants()}
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
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "16px",
                  overflow: "hidden",
                  minHeight: { xs: 180, md: 240 },
                  display: "block",
                  width: "100%",
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
                {/* Warm brand gradient overlay (original identity). */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: isSelected ? OVERLAY_SELECTED : OVERLAY,
                  }}
                />

                {/* Big centred gold title — the original's signature treatment. */}
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
                  <Typography
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
                  </Typography>
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
