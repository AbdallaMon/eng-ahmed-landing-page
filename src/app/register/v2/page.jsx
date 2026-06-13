import { Suspense } from "react";
import V2Flow from "@/app/register/variants/v2/V2Flow";

/**
 * /register/v2 — "WebGL Gallery" variant entry.
 *
 * Server component: awaits searchParams (Next 16) so deep-link params resolve on
 * the server; the flow itself reads leadId/step/etc. on the client via
 * `useLeadFlow`'s deep-linking. SEO/providers come from `register/layout.jsx`.
 *
 * Wrapped in <Suspense> because the client tree uses `useSearchParams`
 * (core `useLeadForm`), which requires a suspense boundary.
 */
export default async function RegisterV2Page({ searchParams }) {
  // Await per Next 16 (and so a deep-link's params are resolved server-side); the
  // flow then reads leadId/step/etc. on the client via `useLeadFlow`.
  await searchParams;

  return (
    <Suspense>
      <V2Flow />
    </Suspense>
  );
}
