"use client";
import { motion } from "framer-motion";
import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import { IoChevronForward } from "react-icons/io5";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import {
  consultationLead,
  designLead,
  designLeadTypes,
  DesignLeadPrice,
  LeadType,
} from "@/app/register/data/constants";
import {
  expandTransition,
  headerRevealVariants,
  itemsPanelVariants,
  listItemVariants,
  MOTION_SCALE,
  titleMorphTransition,
} from "@/app/register/lib/animations";

const MotionBox = motion.create(Box);
const MotionDiv = motion.create("div");
const MotionTypography = motion.create(Typography);

const EASE = [0.22, 1, 0.36, 1];
// Stretch the inline beats by the same global slow-mo factor the helpers use, so
// this component's hand-tuned timings slow down in lock-step with everything else.
const slow = (n) => n * MOTION_SCALE;

/**
 * Project-type selection (Apartment / Villa / Part of home, …).
 *
 * Renders ON TOP of the full-screen location backdrop the previous card just
 * expanded into. The frosted options panel fades in WITH its cards (never empty
 * first), and the cards reveal only after the photo has expanded.
 *
 * On select, the OTHER cards slide away (up / down) and vanish, the chosen
 * card's fee text drops out, and the chosen card's title is left to MORPH
 * (shared `layoutId`) into the form's type chip.
 *
 * @param {{
 *   leadCategory: string,
 *   location?: string,
 *   selectingItem?: string,
 *   onSelect: (value: string) => void,
 *   selected?: string,
 * }} props
 */
export function ItemSelect({
  leadCategory,
  location,
  selectingItem,
  returningItem,
  onSelect,
  selected,
}) {
  const theme = useTheme();
  const { translate, lng } = useLanguage();
  const isRtl = lng === "ar";

  const items = leadCategory === "DESIGN" ? designLead : consultationLead;
  const locationTitle = designLeadTypes.find((l) => l.value === location)?.title;

  return (
    <Box>
      {/* Header: the persistent location word + the prompt. It fades away the
          moment an item is being selected (after the colour shows), leaving only
          the chosen card. */}
      <MotionDiv
        // On the way BACK (returning) the header re-enters WITH the other cards
        // (beat 3) instead of already sitting there before they return. Forward:
        // no initial (unchanged original behaviour).
        initial={returningItem ? { opacity: 0, y: -8 } : undefined}
        animate={selectingItem ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
        transition={{
          duration: slow(0.3),
          delay: slow(selectingItem ? 0.05 : returningItem ? 0.55 : 0),
          ease: EASE,
        }}
      >
        <Stack
          spacing={1.25}
          alignItems="center"
          sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}
        >
          {locationTitle ? (
            <MotionTypography
              layoutId={`loc-title-${location}`}
              transition={titleMorphTransition()}
              sx={{
                alignSelf: "center",
                fontWeight: 700,
                color: "primary.main",
                fontSize: { xs: "1.05rem", md: "1.25rem" },
                letterSpacing: 0.5,
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              {translate(locationTitle)}
            </MotionTypography>
          ) : (
            <Box
              sx={{
                alignSelf: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.primary.main, 0.95),
                color: "#2d231e",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: 0.5,
              }}
            >
              {translate("register.designBadge")}
            </Box>
          )}
          <MotionDiv
            variants={headerRevealVariants(0.85)}
            initial="hidden"
            animate="show"
            style={{ width: "100%", textAlign: "center" }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "common.white",
                fontSize: { xs: "1.4rem", md: "1.9rem" },
                textShadow: "0 2px 14px rgba(0,0,0,0.55)",
              }}
            >
              {translate("register.chooseItemTitle")}
            </Typography>
          </MotionDiv>
        </Stack>
      </MotionDiv>

      {/* The frosted panel fades in WITH its cards (so it's never visible empty
          before the animation) and is held back until the photo has expanded. */}
      <MotionBox
        variants={itemsPanelVariants(0.9, 0.06)}
        // On the way back the frosted panel is visible immediately so the chosen
        // card (the morph target) is solid at once; each card then controls its
        // own forward-reveal / reverse-return timing below.
        initial={returningItem ? false : "hidden"}
        animate="show"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxWidth: 560,
          mx: "auto",
          p: { xs: 1.5, md: 2 },
          borderRadius: 4,
          backgroundColor: alpha("#ffffff", 0.1),
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: `1px solid ${alpha("#ffffff", 0.18)}`,
        }}
      >
        <MotionTypography
          variant="overline"
          component="p"
          initial={returningItem ? { opacity: 0, y: -6 } : false}
          animate={selectingItem ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }}
          transition={{
            duration: slow(0.25),
            delay: slow(selectingItem ? 0.05 : returningItem ? 0.6 : 0),
            ease: EASE,
          }}
          sx={{
            textAlign: "center",
            color: alpha("#ffffff", 0.85),
            letterSpacing: 1,
            mb: 0.5,
          }}
        >
          {translate("register.chooseFromOptions")}
        </MotionTypography>

        {items.map((item, index) => {
          const isSelected = selected === item.value;
          const isChosen = selectingItem === item.value;
          const isLeaving = Boolean(selectingItem) && !isChosen;
          const isReturning = returningItem === item.value;
          const priceKey = DesignLeadPrice[item.value];
          const priceHint = priceKey ? translate(priceKey) : null;

          // Per-card motion props. Forward (default): pass NOTHING so the card
          // INHERITS the frosted panel's "hidden" → "show" reveal (its
          // delayChildren + stagger). Adding an explicit initial/animate here
          // would break that inheritance and the cards would never reveal.
          // Leaving: the calm clear beat. Returning (back from the form): the
          // REVERSE — the chosen card is the morph TARGET (solid at once so the
          // word + box land on it), the OTHERS come back AFTER it (beat 3).
          const cardMotion = {};
          if (isLeaving) {
            cardMotion.animate = { opacity: 0, y: 10, scale: 0.97 };
            cardMotion.transition = {
              duration: slow(0.35),
              delay: slow(0.06 + index * 0.03),
              ease: EASE,
            };
          } else if (returningItem) {
            if (isReturning) {
              cardMotion.initial = false;
              cardMotion.animate = { opacity: 1, y: 0, scale: 1 };
              cardMotion.transition = { duration: 0.01 };
            } else {
              cardMotion.initial = { opacity: 0, y: 10 };
              cardMotion.animate = { opacity: 1, y: 0 };
              cardMotion.transition = {
                duration: slow(0.4),
                delay: slow(0.5 + index * 0.06),
                ease: EASE,
              };
            }
          }
          return (
            // Outer: the staggered reveal + the slide-away on select. Inner: the
            // shared `layoutId` morph box. Kept separate so the reveal/leave
            // transform never fights the morph.
            <MotionDiv
              key={item.value}
              variants={listItemVariants()}
              // Forward: only `variants` → inherits the panel's staggered reveal.
              // Leaving / returning add their own initial/animate/transition.
              {...cardMotion}
            >
              <MotionBox
                layoutId={`item-${item.value}`}
                transition={expandTransition()}
                // The chosen card lifts slightly — it's about to grow into the
                // form surface, so it rises to become the hero of the morph.
                animate={isChosen ? { scale: 1.02 } : undefined}
                whileHover={selectingItem ? undefined : { x: isRtl ? -4 : 4 }}
                whileTap={selectingItem ? undefined : { scale: 0.99 }}
                component="button"
                type="button"
                onClick={() => onSelect(item.value)}
                aria-pressed={isSelected}
                sx={{
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "start",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  px: { xs: 2, md: 3 },
                  py: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  // Selected = a LIGHT card with a soft gold highlight (border +
                  // glow), NOT a gold fill — so when it expands into the form
                  // panel the tone never changes.
                  backgroundColor: isSelected ? "#ffffff" : alpha("#ffffff", 0.96),
                  border: `1.5px solid ${
                    isSelected
                      ? theme.palette.primary.main
                      : alpha("#ffffff", 0.6)
                  }`,
                  boxShadow: isSelected
                    ? `0 10px 26px ${alpha(theme.palette.primary.dark, 0.32)}`
                    : "0 4px 14px rgba(0,0,0,0.28)",
                  transition:
                    "border-color .2s ease, box-shadow .2s ease, background-color .2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: "#ffffff",
                  },
                  "&:focus-visible": {
                    outline: `3px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Box>
                  <MotionTypography
                    layoutId={`item-title-${item.value}`}
                    transition={titleMorphTransition()}
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      lineHeight: 1.3,
                    }}
                  >
                    {translate(LeadType[item.value])}
                  </MotionTypography>
                  {priceHint && (
                    <MotionTypography
                      variant="body2"
                      // Fades out gently with the rest of the clear beat (no
                      // downward "drop") — the chosen card simplifies to just its
                      // title, which then morphs into the form chip.
                      animate={isChosen ? { opacity: 0 } : undefined}
                      transition={{ duration: slow(0.3), delay: slow(0.12), ease: EASE }}
                      sx={{ color: "text.secondary", mt: 0.25 }}
                    >
                      {priceHint}
                    </MotionTypography>
                  )}
                </Box>
                <MotionBox
                  animate={isChosen ? { opacity: 0 } : undefined}
                  transition={{ duration: slow(0.3), delay: slow(0.12), ease: EASE }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    color: "primary.dark",
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                    transform: isRtl ? "scaleX(-1)" : "none",
                    transition: "background-color .2s ease, color .2s ease",
                  }}
                >
                  <IoChevronForward size={18} />
                </MotionBox>
              </MotionBox>
            </MotionDiv>
          );
        })}
      </MotionBox>
    </Box>
  );
}
