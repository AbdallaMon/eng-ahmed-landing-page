import { headers } from "next/headers";
import { arInitialProjects } from "./data/projects";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";

function normalizeHost(value) {
  return (value || "")
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}

export default async function sitemap() {
  const lastModified = new Date();

  const bookingDomain = process.env.NEXT_PUBLIC_BOOKING_DOMAIN;
  const bookingHost = bookingDomain ? normalizeHost(bookingDomain) : "";

  let host = "";
  try {
    const h = await headers();
    host = normalizeHost(h.get("x-forwarded-host") || h.get("host") || "");
  } catch {
    // headers() unavailable → fall back to main-domain sitemap
  }

  // ── Booking domain ──────────────────────────────────────────────
  // Served WITHOUT the /register prefix (the proxy strips it). List only the
  // indexable funnel pages (transactional pages are noindex), and link back to
  // the main site so the two domains are associated.
  if (bookingHost && host === bookingHost) {
    const b = `https://${bookingHost}`;
    return [
      { url: `${b}/`, lastModified, changeFrequency: "monthly", priority: 1 },
      {
        url: `${b}/booking`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      // reference the main site (single brand)
      { url: base, lastModified, changeFrequency: "weekly", priority: 0.6 },
    ];
  }

  // ── Main domain ─────────────────────────────────────────────────
  const staticRoutes = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/booking`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8 },
  ].map((route) => ({ ...route, lastModified }));

  const projectRoutes = arInitialProjects.map((project) => ({
    url: `${base}/projects/${project.id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.64,
  }));

  return [...staticRoutes, ...projectRoutes];
}
