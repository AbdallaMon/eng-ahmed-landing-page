import { gsap } from "gsap";

// GSAP timelines for the lead-selection flow.
//
// These target DOM elements by className. The class strings below are a
// contract with the component JSX — keep them identical on both sides:
//   .page-container, .form-page, .final-selection-form, .cloned-location-title,
//   .reverse-button, .logo, .location, .design-cards-container, .design-title,
//   .email-lead-card, .lead-card, .lead-item, .item-title, .shadow-lead-card
// plus the lead category class (e.g. .DESIGN) and the location class
// (e.g. .INSIDE_UAE / .OUTSIDE_UAE), and the <h4> title elements within them.

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isMobile() {
  return window.matchMedia("(max-width: 899px)").matches;
}

/**
 * Read an animation-speed multiplier from the URL so a link can fast-forward
 * the flow (handy when resuming via a deep-link):
 *   ?speed=2   → 2x faster   (any positive number, clamped to [0.25, 10])
 *   ?fast      → shortcut for 3x
 * Defaults to 1 (normal speed) when absent/invalid.
 */
function getUrlSpeed() {
  if (typeof window === "undefined") return 1;
  const params = new URLSearchParams(window.location.search);
  if (params.get("fast") !== null) return 3;
  const raw = parseFloat(params.get("speed"));
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.min(10, Math.max(0.25, raw));
}

/**
 * Create a GSAP timeline with the URL-driven speed applied. `baseSpeed` lets a
 * specific animation run faster/slower than normal (multiplied on top of the
 * URL ?speed), e.g. the deep-link direct entry runs snappier by default.
 */
function createTimeline(vars, baseSpeed = 1) {
  const tl = gsap.timeline(vars);
  tl.timeScale(getUrlSpeed() * baseSpeed);
  return tl;
}

/**
 * Snap the selected card to fill the screen and push the others away.
 * Uses tl.set (instant) — suited for the register flow where the card
 * selection happens automatically on mount.
 */
function animateCardToFullScreen(
  tl,
  itemClass,
  animatedElementClass,
  shadowClass = "shadow-lead-card",
) {
  const allOtherItems = document.querySelectorAll(
    `.${itemClass}:not(.${animatedElementClass})`,
  );
  const animatedElement = document.querySelector(`.${animatedElementClass}`);
  const animatedShadow = animatedElement.querySelector(`.${shadowClass}`);
  const { top, left, height, width } = animatedElement.getBoundingClientRect();

  const centerX = window.innerWidth / 2 - width / 2;
  const centerY = window.innerHeight / 2 - height / 2;

  tl.set(`.${itemClass} .${shadowClass}`, {
    boxShadow: "none",
    borderRadius: "0px",
    position: "fixed",
    width,
    height,
  });

  tl.set(animatedShadow, { left: `${left}px`, top: `${top}px` });

  allOtherItems.forEach((el) => {
    const { left: l, top: t } = el.getBoundingClientRect();
    tl.set(el.querySelector(`.${shadowClass}`), {
      left: `${l}px`,
      top: `${t}px`,
    });
  });

  tl.set(
    document.querySelectorAll(
      `.${itemClass}:not(.${animatedElementClass}) .${shadowClass}`,
    ),
    { x: -100, opacity: 0 },
  );

  tl.set(animatedShadow, {
    top: `${centerY}px`,
    left: `${centerX}px`,
    width,
    height,
  });

  const leadText = animatedElement.querySelector("h4");
  tl.set(leadText, {
    top: "80px",
    left: "50%",
    transform: "translate(-50%,0%)",
  });
  tl.set(animatedShadow, { top: 0, left: 0, height: "100vh", width: "100vw" });
  tl.set(leadText, { opacity: 0, top: 0 });
}

// ── Email capture → design category ──────────────────────────────────────────

export function animateEmailLeadIn({ setIsAnimating, setIsEmailLeadAnimated }) {
  setIsAnimating(true);
  const tl = createTimeline();
  animateCardToFullScreen(tl, "lead-card", "DESIGN", "shadow-lead-card");

  tl.fromTo(
    ".email-lead-card",
    { opacity: 0 },
    { opacity: 1, stagger: 0.1, ease: "power3.out" },
    "<",
  );
  tl.fromTo(
    ".email-lead-card h4",
    { opacity: 0, y: -50 },
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
    "<",
  );
  tl.then(() => {
    setIsEmailLeadAnimated(false);
    setIsAnimating(false);
  });
}

function reverseEmailLeadAnimation({ tl }) {
  tl.fromTo(
    ".email-lead-card h4",
    { opacity: 1, y: 0 },
    { opacity: 0, y: 50, duration: 0.6, ease: "power3.inOut" },
  );
  tl.to(".email-lead-card", {
    y: "-100%",
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: "power3.inOut",
  });
  tl.to(".email-lead-card", { display: "none" });
}

/**
 * Instantly select the DESIGN card and reveal the location options.
 * Used by /register and /register/complete (auto-triggered on mount).
 */
export function animateDesignCategorySelection({
  setIsAnimating,
  setIsCatAnimated,
}) {
  setIsAnimating(true);
  const mobile = isMobile();
  const tl = createTimeline();
  reverseEmailLeadAnimation({ tl });

  tl.fromTo(".logo", { marginLeft: mobile ? -20 : -24 }, { marginLeft: 10 }, "<");
  tl.fromTo(".reverse-button", { x: -60 }, { display: "flex", x: 5 }, "<");
  tl.fromTo(".location", { opacity: 0, y: 50 }, { opacity: 1, y: 0 }, "<");
  tl.fromTo(
    ".design-cards-container > h4",
    { opacity: 0, y: -50 },
    { opacity: 1, y: 0 },
    "<",
  );

  tl.then(() => {
    setIsAnimating(false);
    setIsCatAnimated(true);
  });
}

/**
 * Enter the DESIGN category screen DIRECTLY (deep-link entry, e.g. opening a
 * link that already carries a leadId). The email-capture step is skipped, but
 * we still need the setup that `animateEmailLeadIn` normally performs — snapping
 * the DESIGN card to a fullscreen background — otherwise the screen renders
 * broken with no animation. We do that setup, hide the (unused) email card,
 * then play the same category reveal as `animateDesignCategorySelection`.
 */
export function animateEnterDesignDirect({ setIsAnimating, setIsCatAnimated }) {
  setIsAnimating(true);
  const mobile = isMobile();
  // Deep-link entry runs snappier by default (1.8x) so a shared link feels
  // instant, while staying smooth via consistent power3 eases below.
  const tl = createTimeline(undefined, 1.8);

  // Establish the DESIGN card as the fullscreen background (the email step
  // normally does this on mount; on a deep-link we must do it ourselves).
  animateCardToFullScreen(tl, "lead-card", "DESIGN", "shadow-lead-card");

  // The email-capture card is never shown on a deep-link entry.
  tl.set(".email-lead-card", { display: "none", opacity: 0 });

  // Reveal the category UI — same end-state as animateDesignCategorySelection,
  // with smooth eases so the fast entry doesn't feel janky.
  tl.fromTo(
    ".logo",
    { marginLeft: mobile ? -20 : -24 },
    { marginLeft: 10, duration: 0.5, ease: "power3.out" },
  );
  tl.fromTo(
    ".reverse-button",
    { x: -60 },
    { display: "flex", x: 5, duration: 0.5, ease: "power3.out" },
    "<",
  );
  tl.fromTo(
    ".location",
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    "<",
  );
  tl.fromTo(
    ".design-cards-container > h4",
    { opacity: 0, y: -50 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
    "<",
  );

  tl.then(() => {
    setIsAnimating(false);
    setIsCatAnimated(true);
  });
}

// ── Lead items (consultation / design type selection) ────────────────────────

function showLeadItems(tl) {
  tl.fromTo(
    ".lead-item",
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.1, ease: "power3.out" },
    "<",
  );
  tl.fromTo(
    ".item-title",
    { opacity: 0, y: -50 },
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
    "<",
  );
}

function hideLeadItems(tl) {
  tl.fromTo(
    ".item-title",
    { opacity: 1, y: 0 },
    { opacity: 0, y: 50, duration: 0.6, ease: "power3.inOut" },
  );
  tl.to(".lead-item", {
    y: 50,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: "power3.inOut",
  });
}

// ── Form page slide-in / out ──────────────────────────────────────────────────

export function animateFormPage({ setIsAnimating, setIsItemAnimated }) {
  setIsAnimating(true);
  const tl = createTimeline();

  tl.fromTo(
    ".form-page",
    { top: "100%", opacity: 0 },
    { top: 0, opacity: 1, display: "block", duration: 0.8, ease: "power3.out" },
  );

  tl.fromTo(
    ".final-selection-form",
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
  ).then(() => {
    setIsAnimating(false);
    setIsItemAnimated(true);
  });
}

function animateFormPageOut({
  tl,
  setLeadItem,
  setAnimateLeadItem,
  setIsItemAnimated,
  setIsReversing,
}) {
  tl.fromTo(
    ".form-page",
    { top: 0, opacity: 1, display: "block" },
    {
      top: "100%",
      opacity: 0,
      display: "none",
      duration: 0.8,
      ease: "power3.inOut",
    },
  ).then(() => {
    setLeadItem("");
    setAnimateLeadItem("");
    setIsItemAnimated(false);
    setIsReversing(false);
  });
}

// ── Location animation (Inside UAE / Outside UAE) ─────────────────────────────

function animateLocationIn({ location, tl, leadCategory }) {
  const isRtl =
    document.documentElement.dir === "rtl" || document.body.dir === "rtl";
  const locationQuestionTitle = document.querySelector(".design-title");
  const animatedElement = document.querySelector(`.${location}`);
  const locationTitle = animatedElement.querySelector("h4");
  const leadTitle = document.querySelector(`.${leadCategory} h4`);

  const clonedTitle = locationTitle.cloneNode(true);
  const rect = locationTitle.getBoundingClientRect();
  const leadTitleRect = leadTitle.getBoundingClientRect();

  // Position via left = center of original text, then xPercent: -50 so the
  // clone's center sits exactly on the original text's center.
  const centerX = rect.left + rect.width / 2;

  Object.assign(clonedTitle.style, {
    position: "fixed",
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    transform: "none",
    zIndex: "16",
  });
  clonedTitle.classList.add("cloned-location-title");
  document.body.appendChild(clonedTitle);

  tl.set(clonedTitle, {
    left: centerX,
    top: rect.top,
    xPercent: -50,
    right: "auto",
  });
  tl.fromTo(
    locationQuestionTitle,
    { y: 0, opacity: 1 },
    { y: -100, opacity: 0, duration: 0.8, ease: "power3.inOut" },
  );
  tl.set(locationTitle, { opacity: 0 });
  // Animate from the original center to the screen center.
  tl.fromTo(
    clonedTitle,
    { top: rect.top, left: centerX, xPercent: -50, right: "auto" },
    {
      top: leadTitleRect.top + 10,
      left: "50%",
      xPercent: -50,
      duration: 1.2,
      ease: "power3.inOut",
    },
  );
  tl.to(leadTitle, { x: isRtl ? -100 : 100 }, "<");
  tl.set(clonedTitle, { opacity: 0 });
  tl.fromTo(
    ".location",
    { opacity: 1, y: 0 },
    { opacity: 0, y: 100, duration: 0.8, zIndex: -15, ease: "power3.inOut" },
    "<-0.5",
  );
}

export function animateLocationItem({
  leadCategory,
  location,
  setIsAnimating,
  setIsLocationAnimated,
}) {
  setIsAnimating(true);
  const tl = createTimeline();

  animateLocationIn({ location, tl, leadCategory });
  showLeadItems(tl);

  tl.then(() => {
    setIsAnimating(false);
    setIsLocationAnimated(true);
  });
}

function reverseLocationAnimation({ tl, location, leadCategory }) {
  const animatedElement = document.querySelector(`.${location}`);
  const locationTitle = animatedElement.querySelector("h4");
  const leadTitle = document.querySelector(`.${leadCategory} h4`);
  const clonedTitle = document.querySelector(".cloned-location-title");
  const locationQuestionTitle = document.querySelector(".design-title");

  const leadTitleRect = leadTitle.getBoundingClientRect();
  const rect = locationTitle.getBoundingClientRect();

  tl.fromTo(
    locationQuestionTitle,
    { y: -100, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power3.inOut" },
  );
  tl.fromTo(
    ".location",
    { opacity: 0, y: 100 },
    { opacity: 1, y: 0, duration: 0.8, zIndex: 15, ease: "power3.inOut" },
    "<",
  );
  tl.to(leadTitle, { x: 0 }, "<");
  tl.set(clonedTitle, { opacity: 1 }, "<");

  // rect was captured while .location is at y:100, so subtract the offset.
  const targetCenterX = rect.left + rect.width / 2;
  const targetTop = rect.top - 100;

  tl.fromTo(
    clonedTitle,
    {
      top: leadTitleRect.top,
      left: "50%",
      xPercent: -50,
    },
    {
      top: targetTop,
      left: targetCenterX,
      xPercent: -50,
      duration: 1.2,
      ease: "power3.inOut",
      onComplete: () => clonedTitle.remove(),
    },
    "<",
  );
  tl.set(locationTitle, { opacity: 1 });
  tl.then(() => clonedTitle.remove());
}

// ── Master reverse animation ──────────────────────────────────────────────────

export function reverseAnimation({
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
}) {
  if (leadItem && isItemAnimated && !isReversing && !isAnimating) {
    setIsReversing(true);
    const tl = createTimeline();
    animateFormPageOut({
      tl,
      setLeadItem,
      setIsReversing,
      setAnimateLeadItem,
      setIsItemAnimated,
    });
    return;
  }

  if (location && isLocationAnimated && !isAnimating && !isReversing) {
    setIsReversing(true);
    const tl = createTimeline();
    hideLeadItems(tl);
    reverseLocationAnimation({ tl, location, leadCategory });
    tl.then(() => {
      setAnimateLocation("");
      setIsLocationAnimated(false);
      setIsReversing(false);
      setLocation("");
    });
    return;
  }

  if (leadCategory && isCatAnimated && !isReversing && !isAnimating) {
    // At the category level, going back returns home.
    window.location.href = "/";
  }
}
