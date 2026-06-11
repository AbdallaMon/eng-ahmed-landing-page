"use client";
import { motion } from "framer-motion";
import {
  Box,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
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
 * Project-type selection (Apartment / Villa / Part of home, …). Clean,
 * accessible list rows with title + optional price hint and a clear chevron
 * affordance. Replaces the old GSAP-hooked LeadCategoryGrid + LeadCategoryItem.
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
          {translate("register.chooseItemTitle")}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 460, mx: "auto" }}
        >
          {translate("register.chooseItemSubtitle")}
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
        }}
      >
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
                backgroundColor: "background.paper",
                border: `1.5px solid ${
                  isSelected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.18)
                }`,
                boxShadow: isSelected
                  ? `0 6px 18px ${alpha(theme.palette.primary.dark, 0.25)}`
                  : "0 2px 8px rgba(0,0,0,0.06)",
                transition: "border-color .2s ease, box-shadow .2s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                "&:focus-visible": {
                  outline: `3px solid ${theme.palette.primary.dark}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.3 }}
                >
                  {translate(LeadType[item.value])}
                </Typography>
                {priceHint && (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.25 }}
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
                  color: "primary.dark",
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  transform: isRtl ? "scaleX(-1)" : "none",
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
