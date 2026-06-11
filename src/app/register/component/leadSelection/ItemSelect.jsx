"use client";
import { motion } from "framer-motion";
import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import { IoChevronForward } from "react-icons/io5";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import {
  consultationLead,
  designLead,
  DesignLeadPrice,
  LeadType,
} from "@/app/register/data/constants";
import {
  listContainerVariants,
  listItemVariants,
} from "@/app/register/lib/animations";

const MotionBox = motion.create(Box);

/**
 * Project-type selection (Apartment / Villa / Part of home, …).
 *
 * Renders ON TOP of the full-screen location backdrop the previous card just
 * expanded into. The heading uses light-on-dark treatment; the options sit in a
 * frosted panel so they stay legible over the photo. Each option is a real,
 * accessible button (title + price hint + clear selected state) with the
 * framer-motion staggered reveal preserved.
 *
 * @param {{
 *   leadCategory: string,
 *   onSelect: (value: string) => void,
 *   selected?: string,
 * }} props
 */
export function ItemSelect({ leadCategory, onSelect, selected }) {
  const theme = useTheme();
  const { translate, lng } = useLanguage();
  const isRtl = lng === "ar";

  const items = leadCategory === "DESIGN" ? designLead : consultationLead;

  return (
    <Box>
      <Stack spacing={1.25} sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
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
        <Typography
          variant="body2"
          sx={{
            color: alpha("#ffffff", 0.92),
            maxWidth: 520,
            mx: "auto",
            textShadow: "0 1px 8px rgba(0,0,0,0.55)",
          }}
        >
          {translate("register.designIntro")}
        </Typography>
      </Stack>

      <MotionBox
        variants={listContainerVariants()}
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

        {items.map((item) => {
          const isSelected = selected === item.value;
          const priceKey = DesignLeadPrice[item.value];
          const priceHint = priceKey ? translate(priceKey) : null;
          return (
            <MotionBox
              key={item.value}
              variants={listItemVariants()}
              whileHover={{ x: isRtl ? -4 : 4 }}
              whileTap={{ scale: 0.99 }}
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
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: isSelected ? "#2d231e" : "text.primary",
                    lineHeight: 1.3,
                  }}
                >
                  {translate(LeadType[item.value])}
                </Typography>
                {priceHint && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: isSelected
                        ? alpha("#2d231e", 0.78)
                        : "text.secondary",
                      mt: 0.25,
                    }}
                  >
                    {priceHint}
                  </Typography>
                )}
              </Box>
              <Box
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
              </Box>
            </MotionBox>
          );
        })}
      </MotionBox>
    </Box>
  );
}
