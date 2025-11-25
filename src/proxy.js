// proxy.js (project root or src/proxy.js)

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

  // Read lng from cookie
  const lngCookie = request.cookies.get(cookieName);
  if (lngCookie) {
    lng = acceptLanguage.get(lngCookie.value);
  }

  // Optional header detection if you want:
  // if (!lng) lng = acceptLanguage.get(request.headers.get("Accept-Language"));

  if (!lng) lng = fallbackLng;

  const url = request.nextUrl;

  // Static/public assets – just let them pass
  const isPublicAsset =
    url.pathname.startsWith("/public") ||
    url.pathname.startsWith("/assets") ||
    url.pathname.match(
      /\.(jpg|jpeg|png|gif|svg|ico|webmanifest|xml|json)$/ // same as before
    );

  if (isPublicAsset || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // If query already has lng
  if (url.searchParams.has("lng")) {
    const qLng = url.searchParams.get("lng");

    // If it's invalid, normalize to fallback (keep the rest of params)
    if (!languages.includes(qLng)) {
      const fixedUrl = url.clone();
      const rest = new URLSearchParams(fixedUrl.searchParams);
      rest.delete("lng");

      const ordered = new URLSearchParams();
      ordered.set("lng", fallbackLng);
      for (const [k, v] of rest) ordered.append(k, v);

      fixedUrl.search = `?${ordered.toString()}`;
      return NextResponse.redirect(fixedUrl);
    }

    // Valid lng: continue and persist to cookie
    const res = NextResponse.next();
    res.cookies.set(cookieName, qLng, { path: "/" });
    return res;
  }

  // No lng in query: redirect to same URL with lng first
  const target = url.clone();
  const existing = new URLSearchParams(target.search);
  existing.delete("lng");

  const ordered = new URLSearchParams();
  ordered.set("lng", lng);
  for (const [k, v] of existing) ordered.append(k, v);

  target.search = `?${ordered.toString()}`;

  // Safety: avoid infinite loop if URL didn't really change
  if (target.toString() === url.toString()) {
    return NextResponse.next();
  }

  const res = NextResponse.redirect(target);
  res.cookies.set(cookieName, lng, { path: "/" });
  return res;
}
