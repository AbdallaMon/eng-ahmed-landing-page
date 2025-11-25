import { Box } from "@mui/material";

import { getTranslation } from "./i18n";
import { MainPage } from "./component/pages/MainPage";

export default async function Home({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng;
  const { t } = await getTranslation(lng);
  const mainData = t("main", { returnObjects: true });

  return (
    <Box>
      <MainPage lng={lng} mainData={mainData} />
    </Box>
  );
}
