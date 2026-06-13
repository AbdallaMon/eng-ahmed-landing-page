import { Suspense } from "react";
import V1Flow from "@/app/register/variants/v1/V1Flow";

/**
 * /register — V1 "Living Cards" lead-selection flow (GSAP + CSS-3D, no WebGL).
 *
 * Reads lng / leadId / step from the (awaited) searchParams. The flow itself
 * resumes from these on the client via deep-linking (handled inside
 * `useLeadFlow`, which reads the live URL); SEO lives in layout.jsx.
 */
export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const leadId = params?.leadId;

  return (
    <Suspense>
      <V1Flow leadId={leadId} />
    </Suspense>
  );
}
