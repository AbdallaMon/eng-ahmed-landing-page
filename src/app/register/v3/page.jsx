import { Suspense } from "react";
import V3Flow from "@/app/register/variants/v3/V3Flow";

/**
 * /register/v3 — V3 "Hybrid": a single WebGL hero object on the intro, then
 * V1's Living-Cards mechanic for the rest of the flow.
 *
 * Server component: awaits `searchParams` (Next 16) so the route is dynamic and
 * deep-link params are available; the actual resume-from-deep-link logic lives
 * client-side in `useLeadFlow`. SEO is inherited from `register/layout.jsx`.
 */
export default async function RegisterV3Page({ searchParams }) {
  // Awaited per Next 16's async searchParams contract; the flow reads the live
  // URL (leadId/email/location/item/step) itself on the client.
  await searchParams;

  return (
    <Suspense>
      <V3Flow />
    </Suspense>
  );
}
