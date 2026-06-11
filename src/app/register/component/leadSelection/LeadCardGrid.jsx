"use client";
import { Box } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { leads, questions } from "@/app/register/data/constants";
import { SectionTitle } from "./SectionTitle";
import { LeadCard } from "./LeadCard";

/**
 * Renders the main service selection cards (Consultation, Interior Design, etc.).
 *
 * @param {{ handleClick: Function, isCatAnimated?: boolean }} props
 */
export function LeadCardGrid({ handleClick, isCatAnimated }) {
  const { translate } = useLanguage();

  return (
    <Box className="leads-cards-container">
      <SectionTitle
        title={translate(questions.category)}
        className="category-title"
      />
      <Box>
        {leads.map((lead) => (
          <LeadCard
            key={lead.value}
            lead={lead}
            handleClick={handleClick}
            isCatAnimated={isCatAnimated}
          />
        ))}
      </Box>
    </Box>
  );
}
