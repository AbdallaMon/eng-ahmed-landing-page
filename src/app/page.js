import { Box } from "@mui/material";

import { getTranslation } from "./i18n";
import { MainPage } from "./component/pages/MainPage";
import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";

export async function generateMetadata({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const cookieStore = await cookies();
  // نفضّل لغة الرابط (?lng=) ثم الكوكي حتى يطابق الـ canonical اللغة المعروضة،
  // ويتوحّد كل أشكال الرابط (http/https و ?lng=ar) على نسخة canonical واحدة.
  const lng =
    awaitedSearchParams?.lng || cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const metaData = t("meta", { returnObjects: true });
  return {
    ...metaData.mainPage,
    alternates: {
      canonical: lng === "ar" ? `${baseUrl}/` : `${baseUrl}/?lng=en`,
      languages: {
        ar: `${baseUrl}/`,
        en: `${baseUrl}/?lng=en`,
        "x-default": `${baseUrl}/`,
      },
    },
  };
}

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
