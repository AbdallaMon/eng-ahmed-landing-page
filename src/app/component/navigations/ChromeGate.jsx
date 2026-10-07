"use client";

import { usePathname } from "next/navigation";

/**
 * Decides whether the global site chrome (navbar + footer) is rendered for the
 * current route. The whole /register booking section is shown "bare" (no
 * navbar/footer) — it is a self-contained flow served from its own domain in
 * production; everything else keeps the normal chrome.
 *
 * Two ways a route is "bare":
 *  1. `forceBare` — set server-side by the root layout when the request is on the
 *     booking sub-domain. There the /register tree is REWRITTEN to hide the
 *     prefix (booking.host/cancel → /register/cancel), so `usePathname()` here
 *     only sees "/cancel" and the path check below can't tell it's the booking
 *     section. The whole booking host is bare, so this short-circuits it.
 *  2. The path starts with one of BARE_PATHS (the normal /register/* case in dev
 *     or when the section is reached on the main domain before the redirect).
 *
 * To bring the chrome back for a path, remove it from BARE_PATHS below (or use
 * a more specific subset, e.g. only the payment pages).
 */
const BARE_PATHS = [
  "/register", // the whole booking/register section (lead flow, booking, payment)
];

export default function ChromeGate({ navbar, footer, children, forceBare = false }) {
  const pathname = usePathname();
  const isBare =
    forceBare ||
    BARE_PATHS.some(
      (path) => pathname === path || pathname?.startsWith(`${path}/`),
    );

  return (
    <>
      {!isBare && navbar}
      {children}
      {!isBare && footer}
    </>
  );
}
