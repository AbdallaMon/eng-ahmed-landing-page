"use client";

import { usePathname } from "next/navigation";

/**
 * Decides whether the global site chrome (navbar + footer) is rendered for the
 * current route. The whole /register booking section is shown "bare" (no
 * navbar/footer) — it is a self-contained flow served from its own domain in
 * production; everything else keeps the normal chrome.
 *
 * To bring the chrome back for a path, remove it from BARE_PATHS below (or use
 * a more specific subset, e.g. only the payment pages).
 */
const BARE_PATHS = [
  "/register", // the whole booking/register section (lead flow, booking, payment)
];

export default function ChromeGate({ navbar, footer, children }) {
  const pathname = usePathname();
  const isBare = BARE_PATHS.some(
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
