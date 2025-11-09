import { Box } from "@mui/material";
import CTASection from "./sections/CTASection";
import About from "./sections/About";
import StagesSection from "./sections/StagesSection";
import CompaniesSection from "./sections/CompaniesSection";
import { OurNumbersSection } from "./sections/OurNumbers";
import { BeforeAndAfterSection } from "./sections/BeforeAndAfterSection";
import { HomeProjects } from "./sections/HomeProjects";
import { TranslatingIdeasSection } from "./sections/TranslatingIdeasSection";
import { SuccessJourney } from "./sections/SuccessJourney";

export default async function Home({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng;

  return (
    <Box>
      <CTASection lng={lng} />
      <About lng={lng} />
      <StagesSection lng={lng} />
      <CompaniesSection lng={lng} />
      <OurNumbersSection lng={lng} />
      <HomeProjects lng={lng} />
      <BeforeAndAfterSection lng={lng} />
      <TranslatingIdeasSection lng={lng} />
      <SuccessJourney lng={lng} />
    </Box>
  );
}
