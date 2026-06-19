import { headers } from "next/headers";
import { arInitialProjects } from "./data/projects";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";

// Stable site-wide last-modified. Bump this on a major content refresh.
// (A per-request `new Date()` tells Google the page changed on every crawl,
// which makes it distrust the lastmod signal — a fixed date is better.)
const SITE_LAST_MODIFIED = "2026-06-19";

function normalizeHost(value) {
  return (value || "")
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}

// hreflang alternates for a path: Arabic = bare URL, English = ?lng=en.
function altLanguages(base, path) {
  return {
    ar: `${base}${path}`,
    en: `${base}${path}?lng=en`,
  };
}

export default async function sitemap() {
  const lastModified = SITE_LAST_MODIFIED;

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
  // Every public page, each with its ar/en hreflang alternates.
  const staticRoutes = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/booking", changeFrequency: "monthly", priority: 0.8 },
    { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ].map(({ path, ...rest }) => ({
    url: `${base}${path}`,
    lastModified,
    ...rest,
    alternates: { languages: altLanguages(base, path) },
  }));

  const projectRoutes = arInitialProjects.map((project) => {
    const path = `/projects/${project.id}`;
    // Per-project stable date from the project year, when available.
    const projectLastModified =
      project.year && String(project.year).length === 4
        ? `${project.year}-01-01`
        : lastModified;
    return {
      url: `${base}${path}`,
      lastModified: projectLastModified,
      changeFrequency: "monthly",
      priority: 0.64,
      alternates: { languages: altLanguages(base, path) },
    };
  });

  return [...staticRoutes, ...projectRoutes];
}
