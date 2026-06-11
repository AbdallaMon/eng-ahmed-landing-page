"use client";

import { usePathname } from "next/navigation";

/**
 * Decides whether the global site chrome (navbar + footer) is rendered for the
 * current route. The booking/payment pages are shown "bare" (no navbar/footer);
 * everything else keeps the normal chrome.
 *
 * To bring the chrome back for any of these pages, just remove its path from
 * BARE_PATHS below (or clear the list to show chrome everywhere).
 */
const BARE_PATHS = [
  "/register/checkout", // payment page / redirect-to-payment
  "/register/success", // payment confirmation
  "/register/cancel", // payment failure
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
