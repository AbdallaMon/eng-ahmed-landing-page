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
