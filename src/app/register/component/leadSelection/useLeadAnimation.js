"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import {
  animateDesignCategorySelection,
  animateEmailLeadIn,
  animateEnterDesignDirect,
  animateFormPage,
  animateLocationItem,
  reverseAnimation,
} from "@/app/register/lib/animations";
import { handleRequestSubmit } from "@/app/register/lib/request";

const VALID_LOCATIONS = ["INSIDE_UAE", "OUTSIDE_UAE"];

/**
 * Read the deep-link intent from the current URL.
 *
 * Supported params: leadId, email, location (INSIDE_UAE | OUTSIDE_UAE),
 * item (a LeadType value), and step (a coarse stage name kept for clarity:
 * "location" | "item" | "form"). When a leadId is present we skip the
 * email-capture step and replay the animation straight to the right stage.
 *
 * @returns {{
 *   leadId: string|null,
 *   email: string|null,
 *   location: string|null,
 *   item: string|null,
 *   step: string|null,
 * }}
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
 * Manages all animation state for the animated lead-selection pages
 * (/register and /register/complete).
 *
 * The DESIGN category is always pre-selected. On a normal first visit the
 * flow starts at email capture; when the URL carries a leadId (deep-link) it
 * resumes from the matching stage instead.
 */
export function useLeadAnimation() {
  const [leadCategory, setLeadCategory] = useState("DESIGN");
  const [leadEmail, setLeadEmail] = useState("");

  const [animateEmailLead, setAnimateEmailLead] = useState("");
  const [isEmailLeadAnimated, setIsEmailLeadAnimated] = useState(false);

  const [animateCategory, setAnimateCategory] = useState("");
  const [isCatAnimated, setIsCatAnimated] = useState(false);

  const [leadItem, setLeadItem] = useState("");
  const [animateLeadItem, setAnimateLeadItem] = useState("");
  const [isItemAnimated, setIsItemAnimated] = useState(false);

  const [location, setLocation] = useState("");
  const [animateLocation, setAnimateLocation] = useState("");
  const [isLocationAnimated, setIsLocationAnimated] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [isReversing, setIsReversing] = useState(false);

  const { translate, lng } = useLanguage();
  const { setLoading } = useToastContext();

  // Deep-link plan captured once on mount; consumed stage by stage below.
  const deepLinkRef = useRef(null);

  // ── Mount: either start at email capture, or resume from a deep-link ────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof window === "undefined") return;

    const deepLink = readDeepLink();
    deepLinkRef.current = deepLink;

    if (deepLink.leadId) {
      // Resume: skip email capture, enter the DESIGN stage DIRECTLY. This uses
      // the dedicated direct-entry animation that performs the fullscreen-card
      // setup the email step would normally do — without it the screen renders
      // broken with no animation.
      if (deepLink.email) setLeadEmail(deepLink.email);
      // A captured leadId implies the email step is done — treat as captured
      // so the location cards become clickable during the resumed flow.
      else setLeadEmail(deepLink.leadId);
      triggerEnterDesignDirect();
      return;
    }

    triggerEmailLeadAnimation();
  }, []);

  // ── Email capture → DESIGN category ─────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (
      animateEmailLead === "animate" &&
      !isEmailLeadAnimated &&
      !isAnimating &&
      !isReversing
    ) {
      animateEmailLeadIn({ setIsAnimating, setIsEmailLeadAnimated });
    }
  }, [animateEmailLead]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isCatAnimated || isAnimating || isReversing) return;
    if (animateCategory === "animate") {
      // Normal path: came from the email-capture step.
      animateDesignCategorySelection({ setIsAnimating, setIsCatAnimated });
    } else if (animateCategory === "direct") {
      // Deep-link path: enter DESIGN directly with the fullscreen-card setup.
      animateEnterDesignDirect({ setIsAnimating, setIsCatAnimated });
    }
  }, [animateCategory]);

  // ── Lead item → form page ───────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (
      animateLeadItem === "animate" &&
      !isItemAnimated &&
      !isAnimating &&
      !isReversing
    ) {
      animateFormPage({ setIsAnimating, setIsItemAnimated });
    }
  }, [animateLeadItem]);

  // ── Location selection → reveal lead items ──────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (
      animateLocation === "animate" &&
      !isLocationAnimated &&
      !isAnimating &&
      !isReversing
    ) {
      animateLocationItem({
        leadCategory,
        location,
        setIsAnimating,
        setIsLocationAnimated,
      });
    }
  }, [animateLocation]);

  // ── Deep-link replay: advance through the stages as each one settles ────────
  // After the category stage finishes, fire the location stage; after the
  // location stage finishes, fire the item stage. Each guarded so it only
  // runs while consuming the original deep-link plan.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const plan = deepLinkRef.current;
    if (!plan?.leadId || isAnimating || isReversing) return;

    if (
      plan.location &&
      isCatAnimated &&
      !isLocationAnimated &&
      !location
    ) {
      handleLocationClick(plan.location);
      return;
    }

    if (
      plan.item &&
      isLocationAnimated &&
      !isItemAnimated &&
      !leadItem
    ) {
      handleLeadItemClick(plan.item);
    }
  }, [isCatAnimated, isLocationAnimated, isAnimating, isReversing]);

  async function handleEmailLeadSubmit(email) {
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
      triggerCategoryAnimation("DESIGN");
    }
  }

  function triggerEmailLeadAnimation() {
    if (isEmailLeadAnimated || isAnimating || isReversing) return;
    setAnimateEmailLead("animate");
  }

  function triggerCategoryAnimation(value) {
    if (value !== "DESIGN") return; // only DESIGN is supported on register pages
    if (isCatAnimated || isAnimating || isReversing) return;
    setLeadCategory(value);
    setAnimateCategory("animate");
    window.sessionStorage.setItem("animated", "done");
  }

  // Deep-link direct entry into DESIGN (no email-capture step). Uses the
  // dedicated direct-entry animation so the fullscreen-card background is set up.
  function triggerEnterDesignDirect() {
    if (isCatAnimated || isAnimating || isReversing) return;
    setLeadCategory("DESIGN");
    setAnimateCategory("direct");
    window.sessionStorage.setItem("animated", "done");
  }

  function handleLocationClick(value) {
    if (isLocationAnimated || isAnimating || isReversing) return;
    setLocation(value);
    setAnimateLocation("animate");
    patchUrlParam("location", value);
    patchUrlParam("step", "location");
  }

  function handleLeadItemClick(value) {
    if (isItemAnimated || isAnimating || isReversing) return;
    setLeadItem(value);
    setAnimateLeadItem("animate");
    patchUrlParam("item", value);
    patchUrlParam("step", "form");
  }

  function handleReverseAnimation() {
    // Stop consuming the deep-link plan once the user starts navigating back.
    deepLinkRef.current = null;
    reverseAnimation({
      location,
      isLocationAnimated,
      setLocation,
      setAnimateLocation,
      setIsLocationAnimated,
      leadItem,
      isItemAnimated,
      isReversing,
      isAnimating,
      setIsReversing,
      setLeadItem,
      setAnimateLeadItem,
      setIsItemAnimated,
      leadCategory,
      isCatAnimated,
    });
  }

  function handleReset() {
    // Clear the lead state + strip deep-link params, then restart from email
    // capture via a full reload so every GSAP timeline begins from scratch.
    deepLinkRef.current = null;
    window.localStorage.removeItem("lng");
    window.sessionStorage.removeItem("animated");
    window.location.href = `/register?lng=${lng}`;
  }

  // The reset control only makes sense once the user is past email capture.
  const canReset = Boolean(leadEmail) || isCatAnimated;

  return {
    leadCategory,
    isCatAnimated,
    isEmailLeadAnimated,
    location,
    leadItem,
    leadEmail,
    canReset,
    handleLocationClick,
    handleLeadItemClick,
    handleReverseAnimation,
    handleReset,
    triggerCategoryAnimation,
    handleEmailLeadSubmit,
    triggerEmailLeadAnimation,
  };
}
