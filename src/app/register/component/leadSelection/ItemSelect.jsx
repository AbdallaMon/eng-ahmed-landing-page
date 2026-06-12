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
  titleMorphTransition,
} from "@/app/register/lib/animations";

const MotionBox = motion.create(Box);
const MotionDiv = motion.create("div");
const MotionTypography = motion.create(Typography);

const EASE = [0.22, 1, 0.36, 1];

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
  onSelect,
  selected,
}) {
  const theme = useTheme();
  const { translate, lng } = useLanguage();
  const isRtl = lng === "ar";

  const items = leadCategory === "DESIGN" ? designLead : consultationLead;
  const locationTitle = designLeadTypes.find((l) => l.value === location)?.title;
  const selectingIndex = items.findIndex((i) => i.value === selectingItem);

  return (
    <Box>
      {/* Header: the persistent location word + the prompt. It fades away the
          moment an item is being selected (after the colour shows), leaving only
          the chosen card. */}
      <MotionDiv
        animate={selectingItem ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: selectingItem ? 0.25 : 0, ease: EASE }}
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
        initial="hidden"
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
        <Typography
          variant="overline"
          component="p"
          sx={{
            textAlign: "center",
            color: alpha("#ffffff", 0.85),
            letterSpacing: 1,
            mb: 0.5,
          }}
        >
          {translate("register.chooseFromOptions")}
        </Typography>

        {items.map((item, index) => {
          const isSelected = selected === item.value;
          const isChosen = selectingItem === item.value;
          const isLeaving = Boolean(selectingItem) && !isChosen;
          const leaveDir = index < selectingIndex ? -1 : 1;
          const priceKey = DesignLeadPrice[item.value];
          const priceHint = priceKey ? translate(priceKey) : null;
          return (
            // Outer: the staggered reveal + the slide-away on select. Inner: the
            // shared `layoutId` morph box. Kept separate so the reveal/leave
            // transform never fights the morph.
            <MotionDiv
              key={item.value}
              variants={listItemVariants()}
              animate={isLeaving ? { opacity: 0, y: leaveDir * 90 } : undefined}
              // Delayed so the chosen card's colour change is SEEN first, then
              // the others slide away.
              transition={
                isLeaving ? { duration: 0.4, delay: 0.35, ease: EASE } : undefined
              }
            >
              <MotionBox
                layoutId={`item-${item.value}`}
                transition={expandTransition()}
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
                  backgroundColor: isSelected
                    ? alpha(theme.palette.primary.main, 0.95)
                    : alpha("#ffffff", 0.96),
                  border: `1.5px solid ${
                    isSelected
                      ? theme.palette.primary.main
                      : alpha("#ffffff", 0.6)
                  }`,
                  boxShadow: isSelected
                    ? `0 8px 22px ${alpha(theme.palette.primary.dark, 0.45)}`
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
                      color: isSelected ? "#2d231e" : "text.primary",
                      lineHeight: 1.3,
                    }}
                  >
                    {translate(LeadType[item.value])}
                  </MotionTypography>
                  {priceHint && (
                    <MotionTypography
                      variant="body2"
                      animate={isChosen ? { opacity: 0, y: 18 } : undefined}
                      transition={{ duration: 0.35, delay: 0.45, ease: EASE }}
                      sx={{
                        color: isSelected
                          ? alpha("#2d231e", 0.78)
                          : "text.secondary",
                        mt: 0.25,
                      }}
                    >
                      {priceHint}
                    </MotionTypography>
                  )}
                </Box>
                <MotionBox
                  animate={isChosen ? { opacity: 0 } : undefined}
                  transition={{ duration: 0.3, ease: EASE }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    color: isSelected ? "#2d231e" : "primary.dark",
                    backgroundColor: isSelected
                      ? alpha("#ffffff", 0.6)
                      : alpha(theme.palette.primary.main, 0.16),
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
