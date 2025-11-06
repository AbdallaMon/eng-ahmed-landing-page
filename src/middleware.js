import { NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { cookieName, fallbackLng, languages } from "./app/i18n/settings";

acceptLanguage.languages(languages);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest|logo.png).*)",
  ],
};

export function middleware(req) {
  let lng;
  if (req.cookies.has(cookieName))
    lng = acceptLanguage.get(req.cookies.get(cookieName).value);

  // If you want header detection, uncomment:
  // if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'));

  if (!lng) lng = fallbackLng;

  // Check if the request is for a static asset in the public directory
  const isPublicAsset =
    req.nextUrl.pathname.startsWith("/public") ||
    req.nextUrl.pathname.startsWith("/assets") ||
    req.nextUrl.pathname.match(
      /\.(jpg|jpeg|png|gif|svg|ico|webmanifest|xml|json)$/
    );

  // If it's a Next or public asset, just continue
  if (isPublicAsset || req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // If query already has lng:
  if (req.nextUrl.searchParams.has("lng")) {
    const qLng = req.nextUrl.searchParams.get("lng");

    // If it's invalid, normalize to fallback (keep the rest of params)
    if (!languages.includes(qLng)) {
      const fixedUrl = req.nextUrl.clone();
      const rest = new URLSearchParams(fixedUrl.searchParams);
      rest.delete("lng");
      const ordered = new URLSearchParams();
      ordered.set("lng", fallbackLng);
      for (const [k, v] of rest) ordered.append(k, v);
      fixedUrl.search = `?${ordered.toString()}`;
      return NextResponse.redirect(fixedUrl);
    }

    // Valid lng in query -> continue and optionally persist it
    const res = NextResponse.next();
    res.cookies.set(cookieName, qLng, { path: "/" });
    return res;
  }

  // No lng in query: redirect to same URL with lng first, then the rest of params
  const target = req.nextUrl.clone();
  const existing = new URLSearchParams(target.search);
  existing.delete("lng");

  const ordered = new URLSearchParams();
  ordered.set("lng", lng);
  for (const [k, v] of existing) ordered.append(k, v);

  target.search = `?${ordered.toString()}`;

  // If something went weird and nothing changed, just continue to avoid loops
  if (target.toString() === req.nextUrl.toString()) {
    return NextResponse.next();
  }

  const res = NextResponse.redirect(target);
  res.cookies.set(cookieName, lng, { path: "/" });
  return res;
}

// todo add protected routes
// export { default } from 'next-auth/middleware';
