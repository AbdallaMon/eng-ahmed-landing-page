"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { matchIsValidTel } from "mui-tel-input";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useAlertContext } from "@/app/register/providers/AlertProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import { useUploadContext } from "@/app/register/providers/UploadProgressProvider";
import { useGeoCountry } from "@/app/register/hooks/useGeoCountry";

import { handleRequestSubmit } from "@/app/register/lib/request";
import { uploadInChunks } from "@/app/register/lib/upload";
import { Emirate } from "@/app/register/data/constants";
import { usePayRedirect } from "@/app/register/core/usePayRedirect";

/**
 * Submit phases the UI can drive a transition overlay from:
 *  - "idle":      nothing in flight
 *  - "submitting": registering / uploading / completing the lead
 *  - "paying":    complete-register succeeded → firing the pay redirect (the
 *                 "preparing your payment" full-screen transition)
 *  - "error":     a request failed; the flow stays on the form
 */
export const LEAD_FORM_PHASE = {
  IDLE: "idle",
  SUBMITTING: "submitting",
  PAYING: "paying",
  ERROR: "error",
};

/**
 * All state + validation + the two-step submit for the DESIGN lead form,
 * extracted from the old `DesignLeadForm`. Presentation-agnostic: renders NO
 * JSX — variants build their own animated field layout around the returned
 * handlers/values (see `core/fields/*`).
 *
 * Backend contract is UNCHANGED:
 *   1. (only when no email was captured earlier) POST `client/new-lead/register`
 *      → `{ id }`. Accept 200/201.
 *   2. (optional) `uploadInChunks` → `client/upload`.
 *   3. POST `client/new-lead/complete-register/{leadId}` with
 *      `{ ...formData, category, item, lng, location, url? }`. Accept 200/201.
 *
 * KEY CHANGE (spec 3.3): on a successful complete-register, instead of
 * navigating to `/register/checkout`, we call `usePayRedirect().pay(...)` so
 * payment is a smooth in-place transition straight from the form. `phase` moves
 * to "paying" right before the redirect so the UI can show a transition overlay.
 *
 * @param {{
 *   category: string,
 *   item: string,
 *   location: string,
 *   leadEmail?: string,
 * }} params
 */
export function useLeadForm({ category, item, location, leadEmail }) {
  const { translate, lng } = useLanguage();
  const { setAlertError } = useAlertContext();
  const { loading, setLoading } = useToastContext();
  const { setProgress, setOverlay } = useUploadContext();
  const { defaultCountry } = useGeoCountry(location);
  const { pay } = usePayRedirect();

  const searchParams = useSearchParams();
  const externalLeadId = searchParams.get("leadId");

  const [phase, setPhase] = useState(LEAD_FORM_PHASE.IDLE);
  const [showPriceConfirm, setShowPriceConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    emirate: null,
    email: leadEmail || "",
    file: null,
    clientDescription: null,
    country: null,
    discoverySource: null,
  });

  const isInsideUAE = location === "INSIDE_UAE";
  // True once an email is already captured (deep-link / earlier email step) —
  // the email field is then NOT shown and step-1 register is skipped.
  const hasCapturedEmail = Boolean(leadEmail);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleEmirateChange = (event) => {
    setFormData((prev) => ({ ...prev, emirate: event.target.value }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    let { name, phone, email, emirate } = formData;
    if (leadEmail) email = leadEmail;

    // ── Validation (exact same messages/order as the original) ──────────────
    if (!matchIsValidTel(phone)) {
      setAlertError(translate("validation.invalidPhone"));
      return;
    }
    if (!name || !phone || !email) {
      setAlertError(translate("validation.fillAll"));
      return;
    }
    if (isInsideUAE && !emirate) {
      setAlertError(translate("validation.fillAll"));
      return;
    }
    if (!isInsideUAE && !formData.country) {
      setAlertError(translate("validation.fillAll"));
      return;
    }
    if (!formData.discoverySource) {
      setAlertError(translate("form.tellUsHowFound"));
      return;
    }

    setPhase(LEAD_FORM_PHASE.SUBMITTING);

    // ── Step 1: initial registration (only when no email captured earlier) ──
    const initialRequest =
      !email &&
      (await handleRequestSubmit(
        formData,
        setLoading,
        `client/new-lead/register?lng=${lng}`,
        false,
        translate("loading.submitting"),
      ));
    // Old server: 200. Migrated server: 201 (created). Accept both.
    if (
      !email &&
      initialRequest.status !== 200 &&
      initialRequest.status !== 201
    ) {
      setPhase(LEAD_FORM_PHASE.ERROR);
      return;
    }

    const leadId = externalLeadId || initialRequest.data.id;

    // ── Step 2: complete registration (with or without file) ────────────────
    let completeData = { ...formData, category, item, lng, location };

    if (formData.file) {
      const fileUpload = await uploadInChunks(
        formData.file,
        setProgress,
        setOverlay,
      );
      if (fileUpload.status !== 200) {
        setPhase(LEAD_FORM_PHASE.ERROR);
        return;
      }
      completeData = { ...completeData, url: fileUpload.url };
    }

    const request = await handleRequestSubmit(
      completeData,
      setLoading,
      `client/new-lead/complete-register/${leadId}`,
      false,
      translate("loading.submitting"),
    );

    if (request.status === 200 || request.status === 201) {
      // Old server returned `data.leadId`; the migrated server returns the lead
      // object as `data` (so the id is `data.id`). Handle old || new.
      const completedLeadId = request.data?.leadId || request.data?.id;
      const completedClientId = request.data?.clientId;
      // KEY CHANGE: pay straight from the form (smooth transition) instead of
      // bouncing through /register/checkout. The UI watches `phase === "paying"`
      // to show the "preparing payment" full-screen transition.
      setPhase(LEAD_FORM_PHASE.PAYING);
      // Stash the chosen design type so /register/success can show ITS design-fee
      // notice after payment. Same origin (the booking domain), so it survives the
      // hosted-checkout round-trip. (We dropped the fee hint from the selection
      // cards — this is where it now surfaces, scoped to what the client picked.)
      try {
        if (item) window.localStorage.setItem("register:designItem", item);
      } catch {
        // ignore storage failures (private mode / blocked storage)
      }
      await pay({
        clientLeadId: completedLeadId,
        clientId: completedClientId,
        lng,
      });
    } else {
      setPhase(LEAD_FORM_PHASE.ERROR);
    }
  };

  const emiratesOptions = useMemo(
    () =>
      Object.entries(Emirate).map(([key, value]) => ({ key, label: value })),
    [],
  );

  return {
    // values + setters
    formData,
    setFormData,
    handleChange,
    handlePhoneChange,
    handleEmirateChange,
    handleSubmit,
    // derived data the fields need
    emiratesOptions,
    defaultCountry,
    isInsideUAE,
    hasCapturedEmail,
    externalLeadId,
    // status flags
    loading,
    phase,
    submitting:
      phase === LEAD_FORM_PHASE.SUBMITTING || phase === LEAD_FORM_PHASE.PAYING,
    isPaying: phase === LEAD_FORM_PHASE.PAYING,
    showPriceConfirm,
    setShowPriceConfirm,
    // i18n passthrough (so field components don't each re-grab context)
    translate,
    lng,
  };
}

export default useLeadForm;
