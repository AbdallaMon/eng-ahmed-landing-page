import { CookiesProvider } from "react-cookie";
import { Footer } from "./component/navigations/Footer";
import { Navbar } from "./component/navigations/Navbar";
import "./globals.css";
import MUIProviders from "./providers/MUIProvider";

import { Rubik } from "next/font/google";
import Navigations from "./component/navigations/Navigations";
import { cookies, headers } from "next/headers";
import ToastProvider from "./providers/ToastLoadingProvider";
import { getTranslation } from "./i18n";
import DotsLoader from "./component/feedback/loaders/DotsLoader";
import { getOrganizationJsonLd, getPersonJsonLd } from "./seo/jsonLdHelpers";
import JsonLd from "./seo/JsonLd";
import ChromeGate from "./component/navigations/ChromeGate";

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

/** Hostname of the booking sub-domain (NEXT_PUBLIC_BOOKING_DOMAIN), or null. */
function bookingHostFromEnv() {
  const raw = process.env.NEXT_PUBLIC_BOOKING_DOMAIN;
  if (!raw) return null;
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname;
  } catch {
    return raw.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  }
}

export default async function RootLayout({ children, params }) {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const personJsonLd = getPersonJsonLd(baseUrl, lng);
  const organizationJsonLd = getOrganizationJsonLd(baseUrl);

  // On the booking sub-domain the /register tree is served with its prefix hidden
  // (proxy rewrites booking.host/cancel → /register/cancel), so ChromeGate's
  // usePathname only sees "/cancel" and can't recognise the bare booking section.
  // Detect that host here (server-side, from the request) and force the section
  // bare — no global navbar/footer anywhere on the booking domain.
  const headerStore = await headers();
  const reqHost = (
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    ""
  )
    .split(":")[0]
    .trim();
  const bookingHost = bookingHostFromEnv();
  const onBookingHost = Boolean(bookingHost) && reqHost === bookingHost;
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
            <DotsLoader />
            <ChromeGate
              forceBare={onBookingHost}
              navbar={<Navbar lng={lng} />}
              footer={<Footer lng={lng} />}
            >
              {children}
            </ChromeGate>
          </ToastProvider>
        </MUIProviders>
      </body>
    </html>
  );
}
