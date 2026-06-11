import { Suspense } from "react";
import { LeadSelectionFlow } from "@/app/register/component/leadSelection/LeadSelectionFlow";

/**
 * /register — the lead-selection flow entry.
 *
 * Reads lng / leadId / step from the (awaited) searchParams. The flow itself
 * resumes from these on the client via deep-linking; SEO lives in layout.jsx.
 */
export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const leadId = params?.leadId;

  return (
    <Suspense>
      <LeadSelectionFlow leadId={leadId} />
    </Suspense>
  );
}
