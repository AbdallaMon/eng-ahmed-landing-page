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
  listContainerVariants,
  listItemVariants,
} from "@/app/register/lib/animations";

const MotionBox = motion.create(Box);

// The original design's warm brand overlay — keeps the image readable while the
// big gold title sits centred on top of it. Strengthened slightly on the
// selected card so the choice reads clearly.
const OVERLAY =
  "linear-gradient(169deg, rgba(45,35,30,0.30) 0%, rgba(45,35,30,0.85) 100%)";
const OVERLAY_SELECTED =
  "linear-gradient(169deg, rgba(45,35,30,0.45) 0%, rgba(45,35,30,0.92) 100%)";

/**
 * Location selection (Inside UAE / Outside UAE) for the DESIGN flow.
 *
 * Restores the ORIGINAL image-card identity — real photography, the warm
 * brand gradient overlay and a big centred gold title — but polished: rounded
 * cards, a clear selected ring, a small hint affordance and smooth
 * framer-motion reveal. Accessible (real buttons, alt text, focus-visible).
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
            fontWeight: 700,
            color: "primary.dark",
            fontSize: { xs: "1.5rem", md: "2rem" },
          }}
        >
          {translate("register.chooseLocationTitle")}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 460, mx: "auto" }}
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
            <MotionBox
              key={lead.value}
              variants={listItemVariants()}
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
                  : "0 6px 18px rgba(0,0,0,0.22)",
                transition: "box-shadow .25s ease",
                "& .lead-card-image": {
                  transition: "transform .5s ease",
                },
                "&:hover .lead-card-image": {
                  transform: isDesktop ? "scale(1.06)" : "none",
                },
                "&:focus-visible": {
                  outline: `3px solid ${theme.palette.primary.dark}`,
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

              {/* Selected check badge */}
              {isSelected && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    insetInlineEnd: 12,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.palette.primary.main,
                    color: "#2d231e",
                    fontWeight: 800,
                    fontSize: "1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                  }}
                  aria-hidden
                >
                  ✓
                </Box>
              )}

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
          );
        })}
      </MotionBox>
    </Box>
  );
}
