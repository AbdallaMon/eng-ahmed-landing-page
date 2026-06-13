"use client";
import { useCallback } from "react";
import { handleRequestSubmit } from "@/app/register/lib/request";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

/**
 * Encapsulates the `client/pay` → Stripe hosted-checkout redirect.
 *
 * This is the SINGLE source of truth for the pay step (extracted from the old
 * `PayButton.handlePayment`). It is used both by the lead form (so payment is a
 * smooth transition straight from submit) and by the thin `/register/checkout`
 * fallback route. Backend contract is unchanged: POST `client/pay` with
 * `{ clientLeadId, clientId, lng, test }` → response `{ url } || { data.url }`
 * → `window.location.href = url`.
 *
 * `lng` and the loading setter are pulled from context internally, so callers
 * usually just call `pay({ clientLeadId, clientId })`. Any field can still be
 * overridden per-call (e.g. an explicit `lng` on the deep-link checkout route).
 *
 * @returns {{ pay: (args: {
 *   clientLeadId: string,
 *   clientId?: string,
 *   lng?: string,
 *   test?: boolean,
 * }) => Promise<string|undefined> }}
 *   `pay(...)` resolves to the checkout URL it redirected to (or undefined if
 *   none came back).
 */
export function usePayRedirect() {
  const { setLoading } = useToastContext();
  const { translate, lng: contextLng } = useLanguage();

  const pay = useCallback(
    async ({ clientLeadId, clientId, lng, test } = {}) => {
      const resolvedLng = lng || contextLng || "ar";
      const data = await handleRequestSubmit(
        { clientLeadId, clientId, lng: resolvedLng, test },
        setLoading,
        "client/pay",
        false,
        translate("checkout.redirecting"),
      );
      // Old server returned `{ url }`; the migrated server nests it as
      // `{ data: { url } }`. Handle old || new.
      const checkoutUrl = data?.url || data?.data?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
      return checkoutUrl;
    },
    [setLoading, translate, contextLng],
  );

  return { pay };
}

export default usePayRedirect;
