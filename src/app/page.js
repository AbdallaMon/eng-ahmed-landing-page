import { Box } from "@mui/material";
import CTASection from "./sections/CTASection";
import About from "./sections/About";
import StagesSection from "./sections/StagesSection";
import CompaniesSection from "./sections/CompaniesSection";

export default async function Home({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng;

  return (
    <Box>
      <CTASection lng={lng} />
      <About lng={lng} />
      <StagesSection lng={lng} />
      <CompaniesSection lng={lng} />
    </Box>
  );
}
