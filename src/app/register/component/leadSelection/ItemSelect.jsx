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

const DESIGN_OVERLAY =
  "linear-gradient(169deg, rgba(45,35,30,0.30) 0%, rgba(45,35,30,0.88) 100%)";

/**
 * Project-type selection (Apartment / Villa / Part of home, …).
 *
 * Restores the original's image-rich, content-rich feel: a real design photo
 * banner (`/design.jpg`) with the warm brand gradient + a category badge and
 * the original "choose from the options" prompt, followed by polished,
 * accessible option rows (title + price hint + clear selected state). Keeps the
 * framer-motion staggered reveal.
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
      {/* ── Design image banner — brings back the original imagery ───────── */}
      <Box
        sx={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          minHeight: { xs: 150, md: 190 },
          mb: { xs: 3, md: 4 },
          boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
        }}
      >
        <Box
          component="img"
          src="/design.jpg"
          alt={translate("category.interiorDesign")}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box
          sx={{ position: "absolute", inset: 0, background: DESIGN_OVERLAY }}
        />
        <Stack
          spacing={1}
          justifyContent="flex-end"
          sx={{ position: "relative", height: "100%", p: { xs: 2.5, md: 3 } }}
        >
          <Box
            sx={{
              alignSelf: "flex-start",
              px: 1.25,
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
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "common.white",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              fontSize: { xs: "1.25rem", md: "1.6rem" },
            }}
          >
            {translate("register.chooseItemTitle")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: alpha("#ffffff", 0.92),
              maxWidth: 520,
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}
          >
            {translate("register.designIntro")}
          </Typography>
        </Stack>
      </Box>

      <Typography
        variant="overline"
        sx={{
          display: "block",
          textAlign: "center",
          color: "text.secondary",
          letterSpacing: 1,
          mb: 1.5,
        }}
      >
        {translate("register.chooseFromOptions")}
      </Typography>

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
                backgroundColor: isSelected
                  ? alpha(theme.palette.primary.main, 0.08)
                  : "background.paper",
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
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    lineHeight: 1.3,
                  }}
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
                  color: isSelected ? "#2d231e" : "primary.dark",
                  backgroundColor: isSelected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.12),
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
