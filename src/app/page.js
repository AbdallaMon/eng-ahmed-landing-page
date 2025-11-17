import { Box } from "@mui/material";

import { MainPage } from "./component/pages/MainPage";
import { getTranslation } from "./i18n";

export default async function Home({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng;
  const { t } = await getTranslation();
  const mainData = t("main", { returnObjects: true });
  return (
    <Box>
      <MainPage lng={lng} mainData={mainData} />
    </Box>
  );
}
