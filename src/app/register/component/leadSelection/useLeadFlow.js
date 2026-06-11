"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import { handleRequestSubmit } from "@/app/register/lib/request";
import { designLeadTypes } from "@/app/register/data/constants";
import {
  getUrlSpeed,
  prefersReducedMotion,
} from "@/app/register/lib/animations";

const VALID_LOCATIONS = ["INSIDE_UAE", "OUTSIDE_UAE"];

// The category image used for the expand intro (DESIGN is the only category).
const DESIGN_IMAGE = "/design.jpg";

// Ordered stages of the lead-selection wizard. `designIntro` is a short,
// auto-advancing visual phase: the DESIGN image card appears and expands to
// fill the screen, then we land on the location options. It is collapsed to a
// near-instant transition when deep-linking or under reduced-motion.
export const STEPS = ["email", "designIntro", "location", "item", "form"];

// The four logical stages shown in the progress indicator. `designIntro` maps
// to the "location" slot so the counter still reads as a clean 4-step flow.
export const PROGRESS_STEPS = ["email", "location", "item", "form"];

/** Map a (possibly transient) step to its progress slot. */
export function progressIndexFor(step) {
  if (step === "designIntro") return PROGRESS_STEPS.indexOf("location");
  const idx = PROGRESS_STEPS.indexOf(step);
  return idx < 0 ? 0 : idx;
}

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

/** Duration (ms) the DESIGN intro card lingers before it expands. */
function introHoldMs() {
  if (prefersReducedMotion()) return 0;
  return 650 / getUrlSpeed();
}

/**
 * Manages all state for the lead-selection wizard (/register and
 * /register/complete). A declarative step model drives framer-motion in the
 * view layer.
 *
 * The DESIGN category is always selected. On a normal first visit the flow
 * starts at email capture; submitting it plays the DESIGN "card expands to
 * fill the screen" intro, then lands on the location options. Selecting a
 * location expands that card to the screen too, then the item options appear.
 * When the URL carries a leadId (deep-link) the intro is skipped and the flow
 * resumes from the matching stage.
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
  // Track the pending intro timer so we can clear it on unmount / fast paths.
  const introTimerRef = useRef(null);

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
      // Deep-links jump straight to the resolved stage — the expand intro is
      // collapsed (instant) so resuming never replays the animation.
      setStep(resolveDeepLinkStep(deepLink));
    }

    setHydrated(true);

    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
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
      // Play the DESIGN "card expands to fullscreen" intro, then reveal the
      // location options. Reduced-motion collapses the hold to 0ms.
      setDirection(1);
      setStep("designIntro");
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      introTimerRef.current = setTimeout(() => {
        setStep("location");
      }, introHoldMs());
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

    if (step === "location" || step === "designIntro") {
      // At the first interactive stage, going back leaves the flow.
      window.location.href = "/";
    }
  }

  function handleReset() {
    // Clear lead state + strip deep-link params, then restart from email
    // capture via a full reload so the flow begins from a clean slate.
    deepLinkRef.current = null;
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    window.localStorage.removeItem("lng");
    window.location.href = `/register?lng=${lng}`;
  }

  // The image that currently fills the full-screen backdrop. The DESIGN photo
  // appears the moment the intro starts and stays until a location is chosen,
  // after which the selected location's photo takes over. No image during the
  // email step or once the form is shown.
  const activeImage = useMemo(() => {
    if (step === "email" || step === "form") return null;
    // During the intro only the small DESIGN card is shown; the backdrop is
    // held back so the card can then MORPH into it (no duplicate layoutId).
    if (step === "designIntro") return null;
    if (step === "location") return DESIGN_IMAGE;
    if (step === "item") {
      const match = designLeadTypes.find((l) => l.value === location);
      return match?.image ?? DESIGN_IMAGE;
    }
    return null;
  }, [step, location]);

  // The shared-layout id the expanding card morphs into. Each expandable card
  // owns a stable id; the backdrop adopts the id of whichever card expanded.
  const backdropLayoutId = useMemo(() => {
    if (step === "designIntro" || step === "location") return "stage-design";
    if (step === "item") return `stage-${location}`;
    return undefined;
  }, [step, location]);

  // Back/reset only make sense once the user is past email capture.
  const canGoBack = step !== "email";
  const canReset = step !== "email";

  const reduceMotion = useMemo(
    () => (hydrated ? prefersReducedMotion() : false),
    [hydrated],
  );

  return {
    step,
    direction,
    hydrated,
    reduceMotion,
    leadCategory,
    leadEmail,
    location,
    leadItem,
    activeImage,
    backdropLayoutId,
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  };
}
