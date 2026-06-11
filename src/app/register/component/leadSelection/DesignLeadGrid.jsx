"use client";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { designLeadTypes, questions } from "@/app/register/data/constants";
import { SectionTitle } from "./SectionTitle";
import { LeadCard } from "./LeadCard";

// Desktop reverses the order so "Inside UAE" appears on the right.
const desktopItems = [
  {
    title: "location.outsideUAE",
    value: "OUTSIDE_UAE",
    image: "/outside-uae.jpg",
    alt: "Dream studio create your dream design inside UAE",
  },
  {
    title: "location.insideUAE",
    value: "INSIDE_UAE",
    image: "/inside-uae.webp",
    alt: "Dream Studio - Dream Design & Luxurious Home Solutions.",
  },
];

/**
 * Renders the UAE / non-UAE location cards for the DESIGN flow.
 *
 * @param {{ handleClick: Function, leadEmail: string }} props
 */
export function DesignLeadGrid({ handleClick, leadEmail }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { translate } = useLanguage();
  const items = isMobile ? designLeadTypes : desktopItems;

  return (
    <Box
      className="design-cards-container"
      sx={{ mt: isMobile ? "-900px" : "-540px" }}
    >
      <SectionTitle
        title={translate(questions.category)}
        className="design-title"
      />
      <Box>
        {items.map((lead) => (
          <LeadCard
            key={lead.value}
            lead={lead}
            handleClick={leadEmail && handleClick}
            className="location"
          />
        ))}
      </Box>
    </Box>
  );
}
