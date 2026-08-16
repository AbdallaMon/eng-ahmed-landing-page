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

  const isStaticAsset =
    url.pathname.startsWith("/public") ||
    url.pathname.startsWith("/assets") ||
    /\.(jpe?g|png|gif|svg|ico|webp|avif|jfif|bmp|tiff?|webmanifest|xml|json|txt|pdf|mp4|webm|mov|ogg|mp3|wav|woff2?|ttf|otf|eot)$/i.test(
      url.pathname,
    );

  // ── Booking domains ────────────────────────────────────────────────────────

  const BOOKING_DOMAIN = process.env.NEXT_PUBLIC_BOOKING_DOMAIN;
  const DREAM_BOOKING_DOMAIN = process.env.NEXT_PUBLIC_DREAM_BOOKING_DOMAIN;

  const requestHost = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();

  let bookingHost;
  let bookingOrigin;

  let dreamBookingHost;
  let dreamBookingOrigin;

  if (BOOKING_DOMAIN) {
    try {
      const u = new URL(
        BOOKING_DOMAIN.includes("://")
          ? BOOKING_DOMAIN
          : `https://${BOOKING_DOMAIN}`,
      );

      bookingHost = u.hostname.toLowerCase();
      bookingOrigin = u.origin;
    } catch {
      bookingHost = BOOKING_DOMAIN.replace(/^https?:\/\//, "")
        .split("/")[0]
        .split(":")[0]
        .toLowerCase();

      bookingOrigin = `https://${bookingHost}`;
    }
  }

  if (DREAM_BOOKING_DOMAIN) {
    try {
      const u = new URL(
        DREAM_BOOKING_DOMAIN.includes("://")
          ? DREAM_BOOKING_DOMAIN
          : `https://${DREAM_BOOKING_DOMAIN}`,
      );

      dreamBookingHost = u.hostname.toLowerCase();
      dreamBookingOrigin = u.origin;
    } catch {
      dreamBookingHost = DREAM_BOOKING_DOMAIN.replace(/^https?:\/\//, "")
        .split("/")[0]
        .split(":")[0]
        .toLowerCase();

      dreamBookingOrigin = `https://${dreamBookingHost}`;
    }
  }

  const onMainBookingHost = Boolean(bookingHost) && requestHost === bookingHost;

  const onDreamBookingHost =
    Boolean(dreamBookingHost) && requestHost === dreamBookingHost;

  const onBookingHost = onMainBookingHost || onDreamBookingHost;

  // Determine which booking domain belongs to the current main domain.
  //
  // booking.ahmadmobayed.com -> ahmadmobayed.com
  // booking.dreamstudiio.com -> dreamstudiio.com

  const mainBookingRootDomain = bookingHost
    ? bookingHost.split(".").slice(1).join(".")
    : null;

  const dreamBookingRootDomain = dreamBookingHost
    ? dreamBookingHost.split(".").slice(1).join(".")
    : null;

  const onDreamMainDomain =
    Boolean(dreamBookingRootDomain) &&
    (requestHost === dreamBookingRootDomain ||
      requestHost === `www.${dreamBookingRootDomain}`);

  const onMainMainDomain =
    Boolean(mainBookingRootDomain) &&
    (requestHost === mainBookingRootDomain ||
      requestHost === `www.${mainBookingRootDomain}`);

  const targetBookingOrigin = onDreamMainDomain
    ? dreamBookingOrigin
    : onMainMainDomain
      ? bookingOrigin
      : bookingOrigin || dreamBookingOrigin;

  // ── Static assets ──────────────────────────────────────────────────────────

  if (url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (
    onBookingHost &&
    (url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml")
  ) {
    return NextResponse.next();
  }

  if (isStaticAsset) {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

    if (onBookingHost && SITE_URL) {
      return NextResponse.rewrite(
        new URL(`${url.pathname}${url.search}`, SITE_URL),
      );
    }

    return NextResponse.next();
  }

  // ── Register / booking-domain mapping ─────────────────────────────────────

  if (BOOKING_DOMAIN || DREAM_BOOKING_DOMAIN) {
    const isRegisterPath =
      url.pathname === "/register" || url.pathname.startsWith("/register/");

    if (onBookingHost) {
      // booking.xxx.com/x
      // internally becomes:
      // /register/x

      if (!isRegisterPath) {
        const rewriteUrl = url.clone();

        rewriteUrl.pathname =
          url.pathname === "/" ? "/register" : `/register${url.pathname}`;

        if (
          rewriteUrl.hostname === "localhost" ||
          rewriteUrl.hostname === "127.0.0.1" ||
          rewriteUrl.hostname === "::1"
        ) {
          rewriteUrl.protocol = "http:";
        }

        return NextResponse.rewrite(rewriteUrl);
      }
    } else if (isRegisterPath && targetBookingOrigin) {
      // ahmadmobayed.com/register/x
      // -> booking.ahmadmobayed.com/x
      //
      // dreamstudiio.com/register/x
      // -> booking.dreamstudiio.com/x

      const rest = url.pathname.slice("/register".length) || "/";

      return NextResponse.redirect(
        `${targetBookingOrigin}${rest}${url.search}`,
      );
    }
  }

  // ── /booking redirect ─────────────────────────────────────────────────────

  if (
    !onBookingHost &&
    (url.pathname === "/booking" || url.pathname.startsWith("/booking/"))
  ) {
    const registerUrl = onDreamMainDomain
      ? process.env.NEXT_PUBLIC_DREAM_REGISTER_URL
      : process.env.NEXT_PUBLIC_REGISTER_URL;

    if (registerUrl) {
      return NextResponse.redirect(registerUrl);
    }
  }

  // ── Language ───────────────────────────────────────────────────────────────

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

      for (const [k, v] of rest) {
        ordered.append(k, v);
      }

      const fixedUrl = new URL(
        `${url.pathname}?${ordered.toString()}`,
        `${proto}://${host}`,
      );

      return NextResponse.redirect(fixedUrl);
    }

    const res = NextResponse.next();

    res.cookies.set(cookieName, qLng, {
      path: "/",
    });

    return res;
  }

  const proto = request.headers.get("x-forwarded-proto") || "https";

  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  const existing = new URLSearchParams(url.searchParams);

  existing.delete("lng");

  const ordered = new URLSearchParams();

  ordered.set("lng", lng);

  for (const [k, v] of existing) {
    ordered.append(k, v);
  }

  const target = new URL(
    `${url.pathname}?${ordered.toString()}`,
    `${proto}://${host}`,
  );

  const res = NextResponse.redirect(target);

  res.cookies.set(cookieName, lng, {
    path: "/",
  });

  return res;
}
