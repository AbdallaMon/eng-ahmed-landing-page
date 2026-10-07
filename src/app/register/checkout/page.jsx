import { Suspense } from "react";
import CheckoutView from "@/app/register/component/checkout/CheckoutView";

// Transactional payment page — keep it out of search indexes.
export const metadata = { robots: { index: false, follow: false } };

/**
 * Thin, resilient checkout route. The main flow now reaches Stripe straight from
 * the form transition; this page only handles deep-links / direct returns. It
 * renders a minimal full-screen "preparing your secure payment" brand transition
 * that auto-fires the pay redirect (see CheckoutView). No boxed paper island —
 * the view owns the full-screen brand background itself.
 */
export default async function CheckoutPage({ searchParams }) {
  const { lng, leadId, clientId, test } = await searchParams;

  return (
    <Suspense>
      <CheckoutView
        lng={lng}
        clientLeadId={leadId}
        clientId={clientId}
        test={test}
      />
    </Suspense>
  );
}
