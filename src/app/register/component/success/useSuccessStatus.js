"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getData } from "@/app/register/lib/request";
import { t } from "@/app/register/data/dictionary";
import { DesignLeadPrice, LeadType } from "@/app/register/data/constants";

/**
 * Verifies the payment status for the success page and resolves the copy that
 * depends on the chosen design type. Render logic + animations live in the view.
 */
export function useSuccessStatus() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("checking");
  // The design type the client picked, stashed in localStorage before the pay
  // redirect (see useLeadForm). Read after mount so there's no hydration mismatch.
  const [designItem, setDesignItem] = useState(null);

  const sessionId = searchParams.get("session_id");
  const clientLeadId = searchParams.get("clientLeadId");
  const lng = searchParams.get("lng") || "ar";
  const direction = lng === "en" ? "ltr" : "rtl";

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("register:designItem");
      if (stored && DesignLeadPrice[stored]) setDesignItem(stored);
    } catch {
      // ignore storage failures (private mode / blocked storage)
    }
  }, []);

  useEffect(() => {
    if (!sessionId || !clientLeadId) return;

    const updatePaymentStatus = async () => {
      const request = await getData({
        url: `client/payment-status?sessionId=${sessionId}&clientLeadId=${clientLeadId}&lng=${lng}&`,
        setLoading,
      });
      // Old server returned `paymentStatus` at the top level; the migrated
      // server nests it as `data.paymentStatus`. Handle old || new.
      const paymentStatus =
        request?.paymentStatus || request?.data?.paymentStatus;
      setStatus(
        request?.status === 200 && paymentStatus === "PAID" ? "PAID" : "ERROR",
      );
    };

    updatePaymentStatus();
    // Keyed on sessionId + clientLeadId so the status check fires once per lead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, clientLeadId]);

  // The "back home" CTA must reach the MAIN site (this flow runs on its own
  // sub-domain). Accept a full URL or a bare host; fall back to "/" when unset.
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN;
  const homeHref = mainDomain
    ? mainDomain.includes("://")
      ? mainDomain
      : `https://${mainDomain}`
    : "/";

  return {
    loading,
    status,
    isPaid: status === "PAID",
    lng,
    direction,
    homeHref,
    feeNotice: designItem ? t(DesignLeadPrice[designItem], lng) : null,
    feeTypeLabel: designItem ? t(LeadType[designItem], lng) : null,
  };
}
