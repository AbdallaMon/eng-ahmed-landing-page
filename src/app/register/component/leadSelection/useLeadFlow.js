"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import { handleRequestSubmit } from "@/app/register/lib/request";

const VALID_LOCATIONS = ["INSIDE_UAE", "OUTSIDE_UAE"];

// Ordered stages of the lead-selection wizard. The DESIGN category is always
// implied (only DESIGN is supported on these pages), so it never gets its own
// stage — the user picks a location, then an item, then fills the form.
export const STEPS = ["email", "location", "item", "form"];

/**
 * Read the deep-link intent from the current URL.
 *
 * Supported params: leadId, email, location (INSIDE_UAE | OUTSIDE_UAE),
 * item (a LeadType value), and step (a coarse stage name kept for clarity:
 * "location" | "item" | "form"). When a leadId is present we skip the
 * email-capture step and resume straight at the right stage.
 */
function readDeepLink() {
  if (typeof window === "undefined") {
    return { leadId: null, email: null, location: null, item: null, step: null };
  }
  const params = new URLSearchParams(window.location.search);
  const location = params.get("location");
  return {
    leadId: params.get("leadId"),
    email: params.get("email"),
    location: VALID_LOCATIONS.includes(location) ? location : null,
    item: params.get("item"),
    step: params.get("step"),
  };
}

/** Write/remove a single search param without a navigation (history-only). */
function patchUrlParam(key, value) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (value === null || value === undefined || value === "") {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}`,
  );
}

/**
 * Resolve the stage a deep-link should resume at. The richest known signal
 * wins (item → form, location → item) so a shared link lands exactly where it
 * left off; an explicit `?step=` is honoured when nothing richer is present.
 */
function resolveDeepLinkStep({ item, location, step }) {
  if (item) return "form";
  if (location) return "item";
  if (step === "form" || step === "item" || step === "location") return step;
  return "location";
}

/**
 * Manages all state for the lead-selection wizard (/register and
 * /register/complete). Replaces the old GSAP clone-node state machine with a
 * simple, declarative step model — framer-motion handles the transitions in
 * the view layer.
 *
 * The DESIGN category is always selected. On a normal first visit the flow
 * starts at email capture; when the URL carries a leadId (deep-link) it
 * resumes from the matching stage instead.
 */
export function useLeadFlow() {
  const [step, setStep] = useState("email");
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [leadEmail, setLeadEmail] = useState("");
  const [location, setLocation] = useState("");
  const [leadItem, setLeadItem] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const leadCategory = "DESIGN";

  const { translate, lng } = useLanguage();
  const { setLoading } = useToastContext();

  // Deep-link plan captured once on mount so back-navigation can't replay it.
  const deepLinkRef = useRef(null);

  // ── Mount: start at email capture, or resume from a deep-link ───────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const deepLink = readDeepLink();
    deepLinkRef.current = deepLink;

    if (deepLink.leadId) {
      // A captured leadId implies the email step is done. Keep the captured
      // email when present, otherwise fall back to the leadId as a truthy
      // marker (matches the previous behaviour that unlocked later stages).
      setLeadEmail(deepLink.email || deepLink.leadId);
      if (deepLink.location) setLocation(deepLink.location);
      if (deepLink.item) setLeadItem(deepLink.item);
      setStep(resolveDeepLinkStep(deepLink));
    }

    setHydrated(true);
  }, []);

  async function handleEmailSubmit(email) {
    const response = await handleRequestSubmit(
      { email },
      setLoading,
      `client/new-lead/register?lng=${lng}`,
      false,
      translate("loading.submitting"),
    );

    if (response.status === 200) {
      setLeadEmail(email);
      const leadId = response.data?.id;
      if (leadId) patchUrlParam("leadId", leadId);
      goForward("location");
    }
  }

  function goForward(next) {
    setDirection(1);
    setStep(next);
  }

  function goBack(prev) {
    setDirection(-1);
    setStep(prev);
  }

  function handleLocationClick(value) {
    deepLinkRef.current = null;
    setLocation(value);
    patchUrlParam("location", value);
    patchUrlParam("step", "item");
    goForward("item");
  }

  function handleLeadItemClick(value) {
    deepLinkRef.current = null;
    setLeadItem(value);
    patchUrlParam("item", value);
    patchUrlParam("step", "form");
    goForward("form");
  }

  /** Step back one stage. Returning past the first interactive stage goes home. */
  function handleBack() {
    deepLinkRef.current = null;

    if (step === "form") {
      setLeadItem("");
      patchUrlParam("item", null);
      patchUrlParam("step", "item");
      goBack("item");
      return;
    }

    if (step === "item") {
      setLocation("");
      patchUrlParam("location", null);
      patchUrlParam("step", "location");
      goBack("location");
      return;
    }

    if (step === "location") {
      // At the first interactive stage, going back leaves the flow.
      window.location.href = "/";
    }
  }

  function handleReset() {
    // Clear lead state + strip deep-link params, then restart from email
    // capture via a full reload so the flow begins from a clean slate.
    deepLinkRef.current = null;
    window.localStorage.removeItem("lng");
    window.location.href = `/register?lng=${lng}`;
  }

  // Back/reset only make sense once the user is past email capture.
  const canGoBack = step !== "email";
  const canReset = step !== "email";

  return {
    step,
    direction,
    hydrated,
    leadCategory,
    leadEmail,
    location,
    leadItem,
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  };
}
