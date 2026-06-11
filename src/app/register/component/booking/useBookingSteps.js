"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { BOOKING_STEPS } from "./data";
import { Success, Failed } from "@/app/register/lib/toast";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import {
  createLead,
  fireUpdateLead,
  getLead,
  submitFinalLead,
} from "./api";

/**
 * Core multi-step booking logic.
 *
 * Step 1   — awaits `createLead({ name, phone })` to get `leadId`, then advances.
 * Steps 2-8 — fires `fireUpdateLead` (no await), advances immediately.
 * Step 9   — awaits `submitFinalLead` with all accumulated `formData`, then `onDone`.
 *
 * Deep-linking: `?step=N&leadId=X` resumes step N for lead X. When a `leadId`
 * is present the lead is fetched and the form state is hydrated, so an external
 * link drops the user straight back into their saved progress.
 *
 * Reset: `resetBookingFlow` clears step + leadId from the URL and restarts at
 * step 1 with empty state.
 *
 * @param {{ onDone?: Function }} options
 */
export function useBookingSteps({ onDone } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { translate } = useLanguage();
  const translateRef = useRef(translate);
  useEffect(() => {
    translateRef.current = translate;
  });
  const { setLoading } = useToastContext();

  const queryStep = Number(searchParams.get("step") || "1");
  const normalizedStep = Number.isFinite(queryStep)
    ? Math.min(Math.max(queryStep, 1), BOOKING_STEPS.length)
    : 1;
  const queryLeadId = searchParams.get("leadId");

  const [currentStepIndex, setCurrentStepIndex] = useState(normalizedStep - 1);
  const [formData, setFormData] = useState({});
  const [leadId, setLeadId] = useState(queryLeadId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [isHydratingLead, setIsHydratingLead] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);
  const leadClearedRef = useRef(false);
  const currentStep = BOOKING_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === BOOKING_STEPS.length - 1;
  const isSubmitted = submittedLead?.status === "SUBMITTED";

  const isStepCompleted = useCallback((step, data) => {
    if (step?.type === "FORM") {
      return (step.fields || []).every((field) => {
        if (!field.required) return true;
        const value = data?.[field.id];
        if (field.inputType === "checkbox") return value === true;
        return value !== null && value !== undefined && value !== "";
      });
    }

    if (!step?.field) return false;
    const value = data?.[step.field];
    return value !== null && value !== undefined && value !== "";
  }, []);

  const lastSubmittedStepIndex = Math.min(
    BOOKING_STEPS.filter((step) => isStepCompleted(step, formData)).length,
    BOOKING_STEPS.length - 1,
  );
  const canJumpToLastSubmittedStep =
    lastSubmittedStepIndex - currentStepIndex >= 2;

  // Guard against jumping ahead of completed steps (but allow going back).
  useEffect(() => {
    if (isSubmitted) return;

    if (currentStepIndex > 0 && !leadId) {
      setCurrentStepIndex(0);
    }

    const completedStepCount = BOOKING_STEPS.filter((step) =>
      isStepCompleted(step, formData),
    ).length;

    const normalizedIndex = Math.min(
      completedStepCount,
      BOOKING_STEPS.length - 1,
    );

    if (currentStepIndex > normalizedIndex) {
      setCurrentStepIndex(normalizedIndex);
    }
  }, [currentStepIndex, formData, isStepCompleted, isSubmitted, leadId]);

  // Sync leadId from the URL (deep-link or external navigation).
  useEffect(() => {
    const nextLeadId = searchParams.get("leadId");

    // Once the URL no longer carries the cleared leadId, reset the flag.
    if (!nextLeadId && leadClearedRef.current) {
      leadClearedRef.current = false;
      return;
    }

    if (!nextLeadId || isSubmitted) return;

    // Don't re-set a leadId that was just cleared due to a 404.
    if (leadClearedRef.current) return;

    if (nextLeadId !== String(leadId || "")) {
      setLeadId(nextLeadId);
    }
  }, [isSubmitted, leadId, searchParams]);

  // Hydrate saved progress whenever we have a leadId (deep-link resume).
  useEffect(() => {
    if (!leadId) return;

    let mounted = true;

    const clearLeadAndRestart = (message) => {
      setLeadId(null);
      setFormData({});
      setCurrentStepIndex(0);
      setSubmittedLead(null);
      setError(message);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("leadId");
      params.delete("step");
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
      leadClearedRef.current = true;
      window.setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const hydrateLead = async () => {
      setIsHydratingLead(true);
      setError(null);

      try {
        const lead = await getLead(leadId);
        if (!mounted) return;

        if (lead?.status === "SUBMITTED") {
          setSubmittedLead(lead);
          setSubmitMessage(null);
          setInfoMessage(
            translateRef.current("status.bookingAlreadySubmitted"),
          );
          setError(null);
          setServerFieldErrors({});
          return;
        }

        const nextFormData = {};
        for (const step of BOOKING_STEPS) {
          if (!step.field) continue;
          const value = lead?.[step.field];
          if (value !== null && value !== undefined && value !== "") {
            nextFormData[step.field] = value;
          }
        }

        const finalFields = [
          "name",
          "phone",
          "email",
          "contactAgreement",
          "contactInitialPriceAgreement",
        ];
        for (const key of finalFields) {
          const value = lead?.[key];
          if (value !== null && value !== undefined && value !== "") {
            nextFormData[key] = value;
          }
        }

        setFormData(nextFormData);

        const completedStepCount = BOOKING_STEPS.filter((step) =>
          isStepCompleted(step, nextFormData),
        ).length;

        const nextIndex = Math.min(
          completedStepCount,
          BOOKING_STEPS.length - 1,
        );
        setCurrentStepIndex(nextIndex);
        setSubmittedLead(null);
      } catch (err) {
        if (!mounted) return;

        const message = err?.message;
        const isNotFound =
          message === "Booking lead not found" || /not found|404/i.test(message);

        if (isNotFound) {
          clearLeadAndRestart(translateRef.current("booking.progressNotFound"));
        } else {
          setError(message);
        }
      } finally {
        if (mounted) {
          setIsHydratingLead(false);
        }
      }
    };

    hydrateLead();

    return () => {
      mounted = false;
    };
  }, [isStepCompleted, leadId, pathname, searchParams]);

  // Keep the URL in sync with current step + lead (so links are deep-linkable).
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("booking", "true");
    params.set("step", String(currentStepIndex + 1));

    if (leadId) {
      params.set("leadId", String(leadId));
    } else {
      params.delete("leadId");
    }

    const nextQuery = params.toString();
    if (nextQuery !== searchParams.toString()) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [currentStepIndex, leadId, pathname, router, searchParams, isSubmitted]);

  const parseServerFieldError = useCallback((message = "") => {
    const supported = [
      "name",
      "phone",
      "email",
      "contactAgreement",
      "contactInitialPriceAgreement",
      "location",
      "projectType",
      "projectStage",
      "previousWork",
      "hasArchitecturalPlan",
      "serviceType",
      "decisionMaker",
    ];

    const normalized = String(message).toLowerCase();
    const matched = supported.find((field) =>
      normalized.includes(field.toLowerCase()),
    );

    if (!matched) return {};
    return { [matched]: message };
  }, []);

  // Reset control: wipe state + URL params and restart at step 1.
  const resetBookingFlow = useCallback(() => {
    setSubmittedLead(null);
    setSubmitMessage(null);
    setInfoMessage(null);
    setServerFieldErrors({});
    setError(null);
    setFormData({});
    setLeadId(null);
    setCurrentStepIndex(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("booking", "true");
    params.delete("step");
    params.delete("leadId");
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    window.location.reload();
  }, [pathname, searchParams]);

  const onNext = useCallback(
    async (value) => {
      if (isHydratingLead || isSubmitted) {
        return false;
      }

      setError(null);
      setInfoMessage(null);
      setServerFieldErrors({});

      // ── Step 1: create the lead, then advance ───────────────────────────
      if (isFirstStep) {
        setIsSubmitting(true);
        try {
          let nextLeadId = leadId;

          if (!nextLeadId) {
            const result = await createLead(value);
            nextLeadId = result?.id;
            if (!nextLeadId) {
              throw new Error("Lead id is missing from create response");
            }
          }

          setLeadId(String(nextLeadId));
          setFormData({ ...formData, ...value });
          setCurrentStepIndex((i) => i + 1);
          return true;
        } catch (err) {
          setError(err.message);
          return false;
        } finally {
          setIsSubmitting(false);
        }
      }

      // ── Last step: submit ALL accumulated data at once ──────────────────
      if (isLastStep) {
        const allData = { ...formData, ...value };
        setIsSubmitting(true);
        setLoading(true);
        const toastId = toast.loading(translate("loading.submitting"));

        try {
          const response = await submitFinalLead(leadId, allData);
          const lead = response?.lead;

          if (lead?.status === "SUBMITTED") {
            setSubmittedLead(lead);
            setSubmitMessage(translate("booking.successMessage"));
            setInfoMessage(null);
          }

          toast.update(toastId, Success(translate("booking.successMessage")));

          if (onDone) onDone();
          return true;
        } catch (err) {
          const message = err?.message || "Failed to submit";

          if (message === "Booking lead not found") {
            setLeadId(null);
            setFormData({});
            setCurrentStepIndex(0);
            setSubmittedLead(null);
            setError(translate("booking.progressNotFound"));

            const params = new URLSearchParams(searchParams.toString());
            params.delete("leadId");
            params.delete("step");
            window.history.replaceState(
              null,
              "",
              `${pathname}?${params.toString()}`,
            );
            leadClearedRef.current = true;
            window.setTimeout(() => {
              window.location.reload();
            }, 1000);
            return false;
          }

          const status = err?.status;

          if (status === 409) {
            if (err?.payload?.lead?.status === "SUBMITTED") {
              setSubmittedLead(err.payload.lead);
              setSubmitMessage(translate("booking.successMessage"));
            }
          } else if (status === 400) {
            setError(message);
            setServerFieldErrors(parseServerFieldError(message));
          } else {
            setError(message);
          }

          if (message.includes("booking.alreadySubmittedToday")) {
            toast.update(
              toastId,
              Failed(translate("booking.alreadySubmittedToday")),
            );
          } else {
            toast.update(toastId, Failed(message));
          }
          return false;
        } finally {
          setIsSubmitting(false);
          setLoading(false);
        }
      }

      // ── Steps 2-8: save locally + fire single-field update (no await) ───
      if (!leadId) {
        setCurrentStepIndex(0);
        setError("Missing lead id. Restarted from step 1.");
        return false;
      }

      setFormData({ ...formData, [currentStep.field]: value });
      fireUpdateLead(leadId, { [currentStep.field]: value });
      setCurrentStepIndex((i) => i + 1);
      return true;
    },
    [
      currentStep,
      formData,
      isFirstStep,
      isHydratingLead,
      isLastStep,
      isSubmitted,
      leadId,
      onDone,
      parseServerFieldError,
      pathname,
      searchParams,
      setLoading,
      translate,
    ],
  );

  const onBack = useCallback(() => {
    if (isSubmitted) return;
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  }, [currentStepIndex, isSubmitted]);

  const onJumpToLastSubmittedStep = useCallback(() => {
    setCurrentStepIndex(lastSubmittedStepIndex);
  }, [lastSubmittedStepIndex]);

  return {
    currentStep,
    currentStepIndex,
    totalSteps: BOOKING_STEPS.length,
    formData,
    leadId,
    onJumpToLastSubmittedStep,
    canJumpToLastSubmittedStep: !isSubmitted && canJumpToLastSubmittedStep,
    lastSubmittedStepIndex,
    isSubmitting,
    error,
    infoMessage,
    serverFieldErrors,
    isSubmitted,
    submitMessage,
    resetBookingFlow,
    onNext,
    onBack,
    isFirstStep,
    isLastStep,
  };
}
