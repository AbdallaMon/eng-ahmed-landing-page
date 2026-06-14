"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import { handleRequestSubmit } from "@/app/register/lib/request";
import { designLeadTypes } from "@/app/register/data/constants";
import {
  getUrlSpeed,
  MOTION_SCALE,
  prefersReducedMotion,
} from "@/app/register/lib/animations";

const VALID_LOCATIONS = ["INSIDE_UAE", "OUTSIDE_UAE"];

// The category image used for the expand intro (DESIGN is the only category).
const DESIGN_IMAGE = "/design.jfif";

// Ordered stages of the lead-selection wizard. `designIntro` is the FIRST,
// auto-advancing visual phase: the moment the page loads, the "تصميم/Design"
// word shows inside its image card, the card expands to fill the screen, and
// THEN the email step enters on top of that backdrop. It is collapsed to a
// near-instant transition when deep-linking or under reduced-motion.
export const STEPS = ["designIntro", "email", "location", "item", "form"];

// The four logical stages shown in the progress indicator. `designIntro` is a
// pre-email intro, so it maps to the "email" slot — the counter still reads as
// a clean 4-step flow.
export const PROGRESS_STEPS = ["email", "location", "item", "form"];

/** Map a (possibly transient) step to its progress slot. */
export function progressIndexFor(step) {
  if (step === "designIntro") return PROGRESS_STEPS.indexOf("email");
  const idx = PROGRESS_STEPS.indexOf(step);
  return idx < 0 ? 0 : idx;
}

/** The step a BACK from `step` lands on (drives the back exit-then-swap beat). */
function prevStepOf(step) {
  if (step === "form") return "item";
  if (step === "item") return "location";
  if (step === "location") return "email";
  return "email";
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
    return {
      leadId: null,
      email: null,
      location: null,
      item: null,
      step: null,
    };
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

/** Duration (ms) the DESIGN intro card lingers (so "تصميم" is readable inside
 *  the image) before it expands and the email step enters. */
function introHoldMs() {
  if (prefersReducedMotion()) return 0;
  // Timed to the (faster) DesignIntroStage choreography: "تصميم" reads → "داخلي"
  // joins → it leaves → "تصميم" LIFTS off toward the top to become the journey
  // breadcrumb's first token. We advance to email right as that lift starts so
  // the breadcrumb's category token catches the flying word.
  return (1650 * MOTION_SCALE) / getUrlSpeed();
}

/**
 * Manages all state for the lead-selection wizard (/register and
 * /register/complete). A declarative step model drives framer-motion in the
 * view layer.
 *
 * The DESIGN category is always selected. On a normal first visit the flow
 * OPENS on the DESIGN intro: the "تصميم/Design" card appears, expands to fill
 * the screen, and the email step then enters on top of that backdrop.
 * Submitting the email lands on the location options; selecting a location
 * expands that card to the screen too, then the item options appear. When the
 * URL carries a leadId (deep-link) the intro + email are skipped and the flow
 * resumes from the matching stage.
 */
// Roughly how long each step's entrance animation runs (ms, at normal speed).
// While a transition is mid-flight the whole flow is locked so no second action
// (a click or a back) can fire over a running animation.
const LOCK_MS = { email: 800, location: 900, item: 1100, form: 1300 };

export function useLeadFlow() {
  const [step, setStep] = useState("designIntro");
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [leadEmail, setLeadEmail] = useState("");
  const [location, setLocation] = useState("");
  const [leadItem, setLeadItem] = useState("");
  const [hydrated, setHydrated] = useState(false);
  // True while a step transition is animating — gates every user action.
  const [isAnimating, setIsAnimating] = useState(false);
  // True during the BACK "exit" beat (current image shrinks away) BEFORE the step
  // actually swaps — so the reverse reads as image-shrinks-first, then the
  // previous stage builds back in (text → cards).
  const [backExiting, setBackExiting] = useState(false);
  // The item currently being chosen — drives the "other cards fly away" beat
  // BEFORE the flow actually moves to the form.
  const [selectingItem, setSelectingItem] = useState("");
  // The item we're stepping BACK from (form → item). Drives the REVERSE entrance
  // in ItemSelect: the word morphs back, the chosen box shrinks back into its
  // card, THEN the other cards return.
  const [returningItem, setReturningItem] = useState("");
  // The location we're stepping BACK from (item → location). Same idea as
  // returningItem, for V1's reverse-morph: the full-screen location room shrinks
  // back into ITS card, then the other location card returns.
  const [returningLocation, setReturningLocation] = useState("");

  const leadCategory = "DESIGN";

  const { translate, lng } = useLanguage();
  const { setLoading } = useToastContext();

  // Deep-link plan captured once on mount so back-navigation can't replay it.
  const deepLinkRef = useRef(null);
  // Track the pending intro timer so we can clear it on unmount / fast paths.
  const introTimerRef = useRef(null);
  // Animation-lock: a ref mirrors the state so handlers read it synchronously.
  const isAnimatingRef = useRef(false);
  const animTimerRef = useRef(null);
  // Timer that advances item → form after the "other cards fly away" beat.
  const itemAdvanceRef = useRef(null);
  // Timer that drops the reverse flag once the back animation has settled.
  const returningTimerRef = useRef(null);
  // Timer that drops the returning-location flag once its back morph has settled.
  const returningLocationTimerRef = useRef(null);
  // Timer that performs the actual step swap AFTER the back exit beat plays.
  const backTimerRef = useRef(null);

  function setAnimating(value) {
    isAnimatingRef.current = value;
    setIsAnimating(value);
  }

  // Lock the flow for the duration of the transition INTO `targetStep`, then
  // release it. Reduced-motion users aren't locked (their transitions are
  // near-instant).
  function lockAnimation(targetStep) {
    if (prefersReducedMotion()) return;
    const ms = ((LOCK_MS[targetStep] ?? 900) * MOTION_SCALE) / getUrlSpeed();
    setAnimating(true);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => setAnimating(false), ms);
  }

  // ── Mount: play the DESIGN intro → email, or resume from a deep-link ─────────
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
      // Deep-links jump straight to the resolved stage — the intro + email are
      // skipped so resuming never replays the animation.
      setStep(resolveDeepLinkStep(deepLink));
      setHydrated(true);
      return;
    }

    // Normal first visit: the page opens on the DESIGN intro card; after it
    // lingers (so "تصميم" reads inside the image) it expands to fill the screen
    // and the email step enters on top. Reduced-motion makes the hold 0ms.
    setHydrated(true);
    introTimerRef.current = setTimeout(() => {
      setDirection(1);
      // Inline lock for the auto-advance (keeps the mount effect free of
      // component-scope deps); released after the email card has entered.
      if (!prefersReducedMotion()) {
        isAnimatingRef.current = true;
        setIsAnimating(true);
        animTimerRef.current = setTimeout(
          () => {
            isAnimatingRef.current = false;
            setIsAnimating(false);
          },
          (LOCK_MS.email * MOTION_SCALE) / getUrlSpeed(),
        );
      }
      setStep("email");
    }, introHoldMs());

    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (itemAdvanceRef.current) clearTimeout(itemAdvanceRef.current);
      if (returningTimerRef.current) clearTimeout(returningTimerRef.current);
      if (returningLocationTimerRef.current)
        clearTimeout(returningLocationTimerRef.current);
      if (backTimerRef.current) clearTimeout(backTimerRef.current);
    };
  }, []);

  async function handleEmailSubmit(email) {
    if (isAnimatingRef.current) return;
    const response = await handleRequestSubmit(
      { email, lng },
      setLoading,
      `client/new-lead/register?lng=${lng}`,
      false,
      translate("loading.submitting"),
    );

    if (response.status === 200 || response.status === 201) {
      setLeadEmail(email);
      const leadId = response.data?.id;
      if (leadId) patchUrlParam("leadId", leadId);
      // The DESIGN backdrop is already filling the screen (the intro grew into
      // it before the email step), so submitting just reveals the location
      // options on top of it.
      goForward("location");
    }
  }

  function goForward(next) {
    setDirection(1);
    lockAnimation(next);
    setStep(next);
  }

  function goBack(prev) {
    setDirection(-1);
    lockAnimation(prev);
    setStep(prev);
  }

  function handleLocationClick(value) {
    if (isAnimatingRef.current) return;
    deepLinkRef.current = null;
    setLocation(value);
    patchUrlParam("location", value);
    patchUrlParam("step", "item");
    goForward("item");
  }

  function handleLeadItemClick(value) {
    if (isAnimatingRef.current) return;
    deepLinkRef.current = null;
    // A fresh forward selection — drop any pending reverse flag so the chosen
    // card animates the normal "expand into the form" way.
    if (returningTimerRef.current) clearTimeout(returningTimerRef.current);
    setReturningItem("");
    setLeadItem(value);
    setSelectingItem(value);
    patchUrlParam("item", value);
    patchUrlParam("step", "form");
    setDirection(1);

    // Lock the whole choreography. Stage 1: the OTHER cards fly away + the fee
    // text drops (handled in ItemSelect via `selectingItem`). Stage 2: move to
    // the form, where the chosen title morphs into the type chip and the
    // background grows.
    const speed = getUrlSpeed();
    // Hold long enough for: the colour change to be seen, then the other cards to
    // slide away — before the flow moves to the form.
    const cardsOutMs = prefersReducedMotion()
      ? 0
      : (700 * MOTION_SCALE) / speed;
    setAnimating(true);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    if (itemAdvanceRef.current) clearTimeout(itemAdvanceRef.current);
    itemAdvanceRef.current = setTimeout(() => setStep("form"), cardsOutMs);
    animTimerRef.current = setTimeout(
      () => setAnimating(false),
      cardsOutMs +
        (prefersReducedMotion() ? 0 : (LOCK_MS.form * MOTION_SCALE) / speed),
    );
  }

  /**
   * Perform the actual state swap for a BACK from `fromStep`. Called AFTER the
   * exit beat has played (the current image has shrunk away) so the new backdrop
   * + previous-stage content build in cleanly. Keeps direction = -1 so the view
   * layer plays its reverse staging (image settles → title → cards/fields).
   */
  function performBackSwap(fromStep) {
    setDirection(-1);
    if (fromStep === "form") {
      // Remember the chosen item (returningItem) for the reverse entrance, then
      // clear it so the card is no longer marked "selected".
      setReturningItem(leadItem);
      setLeadItem("");
      setSelectingItem("");
      if (itemAdvanceRef.current) clearTimeout(itemAdvanceRef.current);
      patchUrlParam("item", null);
      patchUrlParam("step", "item");
      setStep("item");
      if (returningTimerRef.current) clearTimeout(returningTimerRef.current);
      returningTimerRef.current = setTimeout(
        () => setReturningItem(""),
        prefersReducedMotion() ? 0 : (1300 * MOTION_SCALE) / getUrlSpeed(),
      );
      return;
    }
    if (fromStep === "item") {
      // Remember which location we're returning FROM so the location deck can
      // shrink the full-screen room back into that exact card (reverse-morph),
      // then clear it after the morph has settled.
      setReturningLocation(location);
      setLocation("");
      patchUrlParam("location", null);
      patchUrlParam("step", "location");
      setStep("location");
      if (returningLocationTimerRef.current)
        clearTimeout(returningLocationTimerRef.current);
      returningLocationTimerRef.current = setTimeout(
        () => setReturningLocation(""),
        prefersReducedMotion() ? 0 : (1300 * MOTION_SCALE) / getUrlSpeed(),
      );
      return;
    }
    if (fromStep === "location") {
      patchUrlParam("location", null);
      patchUrlParam("step", null);
      setStep("email");
    }
  }

  /** Step back one stage as a STAGED reverse: the current image shrinks away
   *  first (the exit beat), THEN the previous stage builds back in (image →
   *  title → cards). From email it leaves the flow. */
  function handleBack() {
    if (isAnimatingRef.current) return;
    deepLinkRef.current = null;

    if (step === "email" || step === "designIntro") {
      // At the email capture, going back leaves the flow.
      window.location.href = "/";
      return;
    }

    const fromStep = step;
    const reduce = prefersReducedMotion();
    const speed = getUrlSpeed();
    // Exit beat: long enough to read "the image shrinks away" before the swap.
    const exitMs = reduce ? 0 : (480 * MOTION_SCALE) / speed;
    const enterMs = reduce
      ? 0
      : ((LOCK_MS[prevStepOf(fromStep)] ?? 900) * MOTION_SCALE) / speed;

    // NOTE: direction flips to -1 only at the SWAP (in performBackSwap), not here
    // — so the still-mounted OUTGOING stage doesn't re-trigger its reveal mid-exit.
    setBackExiting(true);
    setAnimating(true);

    if (backTimerRef.current) clearTimeout(backTimerRef.current);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);

    backTimerRef.current = setTimeout(() => {
      setBackExiting(false);
      performBackSwap(fromStep);
    }, exitMs);
    animTimerRef.current = setTimeout(
      () => setAnimating(false),
      exitMs + enterMs,
    );
  }

  function handleReset() {
    if (isAnimatingRef.current) return;
    // Clear lead state + strip deep-link params, then restart from email
    // capture via a full reload so the flow begins from a clean slate.
    deepLinkRef.current = null;
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    window.localStorage.removeItem("lng");
    window.location.href = `/register?lng=${lng}`;
  }

  // The image that currently fills the full-screen backdrop. The DESIGN photo is
  // present from the very first frame (the intro now simply scales it in, no
  // small card to morph) and stays through email + location; once a location is
  // chosen its photo takes over (growing ON TOP of the design photo). No image
  // once the form shows.
  const activeImage = useMemo(() => {
    if (step === "form") return null;
    if (step === "designIntro" || step === "email" || step === "location") {
      return DESIGN_IMAGE;
    }
    if (step === "item") {
      const match = designLeadTypes.find((l) => l.value === location);
      return match?.image ?? DESIGN_IMAGE;
    }
    return null;
  }, [step, location]);

  // The shared-layout id the expanding card morphs into. ONLY the location → item
  // step morphs (the chosen location card grows into the backdrop). The DESIGN
  // backdrop has no layoutId — it just scales/fades in, which reads far cleaner
  // than morphing a tiny card to full-screen.
  const backdropLayoutId = useMemo(() => {
    if (step === "item") return `stage-${location}`;
    return undefined;
  }, [step, location]);

  // On the LAST step the selected item ROW expands (in its own gold colour) into
  // the full-screen form panel — the colour-morph that replaces a photo here.
  // The panel (ItemExpandPanel) adopts the chosen row's `item-{value}` id.
  const formExpandLayoutId = useMemo(() => {
    if (step === "form" && leadItem) return `item-${leadItem}`;
    return undefined;
  }, [step, leadItem]);

  // Back is available from email onward (email → home; location → email; …).
  const canGoBack =
    step === "email" ||
    step === "location" ||
    step === "item" ||
    step === "form";
  // Reset (start over) only once the user is actually into the selection.
  const canReset = step === "location" || step === "item" || step === "form";

  const reduceMotion = useMemo(
    () => (hydrated ? prefersReducedMotion() : false),
    [hydrated],
  );

  return {
    step,
    direction,
    hydrated,
    reduceMotion,
    isAnimating,
    backExiting,
    selectingItem,
    returningItem,
    returningLocation,
    leadCategory,
    leadEmail,
    location,
    leadItem,
    activeImage,
    backdropLayoutId,
    formExpandLayoutId,
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  };
}
