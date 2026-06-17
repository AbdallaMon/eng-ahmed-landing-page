import { headers } from "next/headers";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";

function normalizeHost(value) {
  return (value || "")
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}

export default async function robots() {
  const bookingDomain = process.env.NEXT_PUBLIC_BOOKING_DOMAIN;
  const bookingHost = bookingDomain ? normalizeHost(bookingDomain) : "";

  let host = "";
  try {
    const h = await headers();
    host = normalizeHost(h.get("x-forwarded-host") || h.get("host") || "");
  } catch {
    // headers() unavailable (e.g. static analysis) → fall back to main domain
  }

  // Booking domain: allow crawling, point at its OWN sitemap, and declare the
  // main site as the canonical host so search engines associate the two.
  if (bookingHost && host === bookingHost) {
    const bookingBase = `https://${bookingHost}`;
    return {
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${bookingBase}/sitemap.xml`,
      host: base,
    };
  }

  // Main domain
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
