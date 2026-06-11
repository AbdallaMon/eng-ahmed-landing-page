import { cookies } from "next/headers";
import RegisterProviders from "@/app/register/providers/RegisterProviders";
import { t } from "@/app/register/data/dictionary";

// In production this section is served from the booking domain, so its
// canonical/OG URLs resolve against that domain (falls back to the main site
// URL, then a sane default) — keeping it consistent with the main site brand.
const BASE_URL = process.env.NEXT_PUBLIC_BOOKING_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_BOOKING_DOMAIN}`
  : process.env.NEXT_PUBLIC_SITE_URL || "https://booking.ahmadmobayed.com";

async function resolveLng() {
  const cookieStore = await cookies();
  return cookieStore.get("lng")?.value || cookieStore.get("i18next")?.value || "ar";
}

export async function generateMetadata() {
  const lng = await resolveLng();
  const siteName = t("identity.name", lng);
  const title = `${siteName} — ${t("button.bookConsultation", lng)}`;
  const description = t("identity.description", lng);

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    alternates: {
      canonical: "/register",
      languages: {
        ar: "/register?lng=ar",
        en: "/register?lng=en",
      },
    },
    robots: { index: true, follow: true },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
    openGraph: {
      title,
      description,
      url: "/register",
      type: "website",
      siteName,
      locale: lng === "ar" ? "ar_AR" : "en_US",
      images: [{ url: "/main-logo.jpg", alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/main-logo.jpg"],
    },
  };
}

export default async function RegisterLayout({ children }) {
  const lng = await resolveLng();
  return <RegisterProviders lng={lng}>{children}</RegisterProviders>;
}
