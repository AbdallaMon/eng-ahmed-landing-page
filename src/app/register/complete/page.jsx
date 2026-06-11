import { Suspense } from "react";
import { LeadSelectionFlow } from "@/app/register/component/leadSelection/LeadSelectionFlow";

// Transactional (bound to an existing lead) — keep it out of search indexes.
export const metadata = { robots: { index: false, follow: false } };

/**
 * /register/complete — same animated shell as /register, but the final form
 * is the CompleteRegisterForm bound to an existing lead (via ?leadId=).
 */
export default async function CompleteRegisterPage({ searchParams }) {
  const params = await searchParams;
  const leadId = params?.leadId;

  return (
    <Suspense>
      <LeadSelectionFlow mode="complete" leadId={leadId} />
    </Suspense>
  );
}
