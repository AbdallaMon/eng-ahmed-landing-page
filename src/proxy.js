import { NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { cookieName, fallbackLng, languages } from "./app/i18n/settings";

acceptLanguage.languages(languages);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest|logo.png).*)",
  ],
};

export function proxy(request) {
  let lng;

  const lngCookie = request.cookies.get(cookieName);
  if (lngCookie) {
    lng = acceptLanguage.get(lngCookie.value);
  }

  if (!lng) lng = fallbackLng;

  const url = request.nextUrl;

  const isPublicAsset =
    url.pathname.startsWith("/public") ||
    url.pathname.startsWith("/assets") ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webmanifest|xml|json)$/);

  if (isPublicAsset || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // ── Sub-domain mapping (booking.<domain>) ──────────────────────────────────
  // The /register booking flow lives in src/app/register/* but is served from
  // its own domain. NEXT_PUBLIC_BOOKING_DOMAIN = the booking host (e.g.
  // eng-booking.example.com), set at BUILD time in production. Two directions so
  // the booking domain is the single canonical URL:
  //   1. ON the booking host → REWRITE "/x" to "/register/x" internally (clean
  //      URL, no /register prefix in the address bar).
  //   2. On any OTHER host → REDIRECT "/register/x" to the booking host "/x".
  // Gated purely on the env var (NOT NODE_ENV): unset locally → skipped, so
  // /register renders directly on localhost with no rewrites/redirects.
  const BOOKING_DOMAIN = process.env.NEXT_PUBLIC_BOOKING_DOMAIN;
  if (BOOKING_DOMAIN) {
    // Accept either a bare host ("eng-booking.example.com") or a full URL
    // ("https://eng-booking.example.com/..."). Normalize to host + origin.
    let bookingHost;
    let bookingOrigin;
    try {
      const u = new URL(
        BOOKING_DOMAIN.includes("://") ? BOOKING_DOMAIN : `https://${BOOKING_DOMAIN}`,
      );
      bookingHost = u.hostname;
      bookingOrigin = u.origin;
    } catch {
      bookingHost = BOOKING_DOMAIN.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
      bookingOrigin = `https://${bookingHost}`;
    }

    const host = (
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      ""
    ).split(":")[0];
    const isRegisterPath =
      url.pathname === "/register" || url.pathname.startsWith("/register/");

    if (host === bookingHost) {
      // (1) On the booking host: render the /register tree without the prefix.
      if (!isRegisterPath) {
        const rewriteUrl = url.clone();
        rewriteUrl.pathname =
          url.pathname === "/" ? "/register" : `/register${url.pathname}`;
        return NextResponse.rewrite(rewriteUrl);
      }
    } else if (isRegisterPath) {
      // (2) On another host: send /register/* to the booking host, prefix stripped.
      const rest = url.pathname.slice("/register".length) || "/";
      return NextResponse.redirect(`${bookingOrigin}${rest}${url.search}`);
    }
  }

  if (url.searchParams.has("lng")) {
    const qLng = url.searchParams.get("lng");

    if (!languages.includes(qLng)) {
      const proto = request.headers.get("x-forwarded-proto") || "https";
      const host =
        request.headers.get("x-forwarded-host") || request.headers.get("host");

      const rest = new URLSearchParams(url.searchParams);
      rest.delete("lng");

      const ordered = new URLSearchParams();
      ordered.set("lng", fallbackLng);
      for (const [k, v] of rest) ordered.append(k, v);

      const fixedUrl = new URL(
        `${url.pathname}?${ordered.toString()}`,
        `${proto}://${host}`,
      );

      return NextResponse.redirect(fixedUrl);
    }

    const res = NextResponse.next();
    res.cookies.set(cookieName, qLng, { path: "/" });
    return res;
  }

  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  const existing = new URLSearchParams(url.searchParams);
  existing.delete("lng");

  const ordered = new URLSearchParams();
  ordered.set("lng", lng);
  for (const [k, v] of existing) ordered.append(k, v);

  const target = new URL(
    `${url.pathname}?${ordered.toString()}`,
    `${proto}://${host}`,
  );

  const res = NextResponse.redirect(target);
  res.cookies.set(cookieName, lng, { path: "/" });
  return res;
}
