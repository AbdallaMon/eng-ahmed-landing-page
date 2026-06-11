"use client";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import {
  consultationLead,
  designLead,
  LeadType,
  questions,
} from "@/app/register/data/constants";
import { SectionTitle } from "./SectionTitle";
import { LeadCategoryItem } from "./LeadCategoryItem";

/**
 * Renders the list of lead sub-types (e.g. Room, Plan, Apartment, Villa).
 *
 * @param {{
 *   leadCategory: string,
 *   location: string,
 *   onItemClick: Function,
 * }} props
 */
export function LeadCategoryGrid({ leadCategory, location, onItemClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { translate } = useLanguage();

  const items = leadCategory === "DESIGN" ? designLead : consultationLead;

  const marginTop = isMobile
    ? location
      ? "-550px"
      : "-500px"
    : location
      ? "-350px"
      : "-300px";

  // Items are only clickable after a location has been selected.
  const handleClick = location ? onItemClick : () => null;

  return (
    <Box sx={{ mt: marginTop }}>
      <SectionTitle title={translate(questions.type)} className="item-title" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item) => (
          <LeadCategoryItem
            key={item.value}
            title={translate(LeadType[item.value])}
            value={item.value}
            subtitle={item.subtext}
            onClick={handleClick}
          />
        ))}
      </Box>
    </Box>
  );
}
