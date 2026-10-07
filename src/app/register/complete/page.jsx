import { redirect } from "next/navigation";

// Transactional (bound to an existing lead) — keep it out of search indexes.
export const metadata = { robots: { index: false, follow: false } };

/**
 * /register/complete — DEPRECATED.
 *
 * The old completion flow (LeadSelectionFlow + ItemSelect/LeadSelection3D) is no
 * longer used. The main `/register` flow now handles deep-link resume (?leadId=)
 * on its own, so this route just bounces everything to `/register`, preserving
 * the query params (leadId / clientId / lng) so an in-flight lead keeps resuming.
 */
export default async function CompleteRegisterPage({ searchParams }) {
  const params = await searchParams;

  const qs = new URLSearchParams();
  if (params?.leadId) qs.set("leadId", params.leadId);
  if (params?.clientId) qs.set("clientId", params.clientId);
  if (params?.lng) qs.set("lng", params.lng);

  const query = qs.toString();
  redirect(query ? `/register?${query}` : "/register");
}
