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
import { IoArrowForward } from "react-icons/io5";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { designLeadTypes } from "@/app/register/data/constants";
import {
  listContainerVariants,
  listItemVariants,
} from "@/app/register/lib/animations";

const MotionBox = motion.create(Box);

/**
 * Location selection (Inside UAE / Outside UAE) for the DESIGN flow. Premium
 * image cards with a clear title, an affordance arrow and accessible button
 * semantics. Replaces the old GSAP-hooked DesignLeadGrid + LeadCard combo.
 *
 * @param {{ onSelect: (value: string) => void, selected?: string }} props
 */
export function LocationSelect({ onSelect, selected }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { translate, lng } = useLanguage();
  const isRtl = lng === "ar";

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
              whileHover={isDesktop ? { y: -4 } : undefined}
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
                textAlign: "start",
                borderRadius: 4,
                overflow: "hidden",
                minHeight: { xs: 160, md: 240 },
                display: "flex",
                color: "common.white",
                boxShadow: isSelected
                  ? `0 0 0 3px ${theme.palette.primary.main}, 0 12px 28px ${alpha(
                      theme.palette.primary.dark,
                      0.35,
                    )}`
                  : "0 8px 22px rgba(0,0,0,0.18)",
                transition: "box-shadow .25s ease",
                "&:focus-visible": {
                  outline: `3px solid ${theme.palette.primary.dark}`,
                  outlineOffset: 2,
                },
              }}
            >
              <img
                src={lead.image}
                alt={lead.alt}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(160deg, rgba(45,35,30,0.15) 0%, rgba(45,35,30,0.85) 100%)",
                }}
              />
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  position: "relative",
                  width: "100%",
                  alignSelf: "flex-end",
                  p: { xs: 2, md: 2.5 },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "common.white",
                    textShadow: "0 1px 8px rgba(0,0,0,0.45)",
                  }}
                >
                  {translate(lead.title)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: alpha("#ffffff", 0.92),
                    color: theme.palette.primary.dark,
                    transform: isRtl ? "scaleX(-1)" : "none",
                    flexShrink: 0,
                  }}
                >
                  <IoArrowForward size={18} />
                </Box>
              </Stack>
            </MotionBox>
          );
        })}
      </MotionBox>
    </Box>
  );
}
