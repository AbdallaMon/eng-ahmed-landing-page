import { CookiesProvider } from "react-cookie";
import { Footer } from "./component/navigations/Footer";
import { Navbar } from "./component/navigations/Navbar";
import "./globals.css";
import MUIProviders from "./providers/MUIProvider";

import { Rubik } from "next/font/google";
import Navigations from "./component/navigations/Navigations";
import { cookies } from "next/headers";
import ToastProvider from "./providers/ToastLoadingProvider";
import { getTranslation } from "./i18n";
import DotsLoader from "./component/feedback/loaders/DotsLoader";
import { getOrganizationJsonLd, getPersonJsonLd } from "./seo/jsonLdHelpers";
import JsonLd from "./seo/JsonLd";

const rubic = Rubik({
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  // subsets: ["arabic"],,
  subsets: ["latin", "arabic"],
  display: "swap",
});

export async function generateMetadata({ params }) {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const metaData = t("meta", { returnObjects: true });
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com"
    ),
    ...metaData.mainPage,
  };
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";
export default async function RootLayout({ children, params }) {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const personJsonLd = getPersonJsonLd(baseUrl, lng);
  const organizationJsonLd = getOrganizationJsonLd(baseUrl);
  return (
    <html lang={lng} dir={lng === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={rubic.className}>
        <JsonLd
          id="global-schemas"
          data={[personJsonLd, organizationJsonLd]}
        />
        <MUIProviders lng={lng}>
          <ToastProvider>
            <Navbar lng={lng} />
            <DotsLoader />

            {children}
            <Footer lng={lng} />
          </ToastProvider>
        </MUIProviders>
      </body>
    </html>
  );
}
