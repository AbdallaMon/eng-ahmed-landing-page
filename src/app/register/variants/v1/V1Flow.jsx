"use client";
import { useEffect, useMemo, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";

import {
  useLeadFlow,
  PROGRESS_STEPS,
  progressIndexFor,
} from "@/app/register/component/leadSelection/useLeadFlow";
import { useLeadForm } from "@/app/register/core/useLeadForm";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { RegisterHeader } from "@/app/register/component/layout/RegisterHeader";
import { dur, prefersReducedMotion } from "@/app/register/variants/v1/v1Motion";
import colors from "@/app/register/theme/colors";

import {
  designLeadTypes,
  designLead,
  LeadType,
  // DesignLeadPrice, // رسوم التصميم اتشالت من كروت الاختيار — بتظهر بعد تأكيد الدفع في /register/success
} from "@/app/register/data/constants";
import { assets, imageForItem, imageForLocation } from "@/app/register/core/assets";

import { liftSlot } from "@/app/register/core/cards3d/titleMorph";
import PerspectiveStage from "@/app/register/variants/v1/PerspectiveStage";
import JourneyBreadcrumb from "@/app/register/variants/v1/JourneyBreadcrumb";
import DesignIntroStage from "@/app/register/variants/v1/DesignIntroStage";
import EmailStage from "@/app/register/variants/v1/EmailStage";
import OptionCardsStage from "@/app/register/variants/v1/OptionCardsStage";
import FormStage from "@/app/register/variants/v1/FormStage";
// الدفع متوقّف حاليًا — PayingOverlay مش بتتعرض. بنعرض بدلها شاشة "تم استلام طلبك".
// import PayingOverlay from "@/app/register/variants/v1/PayingOverlay";
import LeadSuccessOverlay from "@/app/register/variants/v1/LeadSuccessOverlay";

/**
 * V1 "Living Cards" — the GSAP + CSS-3D `/register` flow.
 *
 * Drives the shared `useLeadFlow` state machine (email → location → item → form,
 * with the auto-advancing designIntro beat, deep-linking, back + reset all
 * preserved) and renders each stage inside a persistent living 3D background
 * (`PerspectiveStage`). The form's `useLeadForm` is lifted HERE so the paying
 * overlay can watch `isPaying` while the same `form` object drives `FormStage`.
 *
 * Nothing here is boxed in a Paper; new elements enter as depth-staggered 3D
 * objects and option cards fly toward the viewer on select (`flyToFill`).
 *
 * `leadId` is accepted for parity with the server page (deep-link entry); the
 * live resume logic reads the URL inside `useLeadFlow`, so it's informational
 * here.
 */
export default function V1Flow({ leadId } = {}) {
  const { translate, lng } = useLanguage();
  const isRtl = lng === "ar";

  const {
    step,
    direction,
    hydrated,
    isAnimating,
    backExiting,
    returningItem,
    returningLocation,
    leadCategory,
    leadEmail,
    location,
    leadItem,
    registrationCompleted,
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  } = useLeadFlow();

  // The stage-content wrapper. During the BACK exit beat it recedes (the content
  // "leaves" just after the image starts shrinking); on a step swap it resets so
  // the next stage's own depth-reveal can build it back in (image → title → cards).
  const stageContentRef = useRef(null);
  useEffect(() => {
    const el = stageContentRef.current;
    if (!el || prefersReducedMotion()) return;
    if (backExiting) {
      gsap.to(el, {
        opacity: 0,
        y: -14,
        scale: 0.96,
        duration: dur(0.4),
        ease: "power2.in",
      });
    }
  }, [backExiting]);
  useEffect(() => {
    const el = stageContentRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { opacity: 1, y: 0, scale: 1, clearProps: "transform" });
    // Each new stage starts at the top — a previous stage may have been scrolled
    // (e.g. the item cards on a short phone), and the scroll container persists
    // across step swaps, so reset it so the new stage isn't mid-scrolled.
    el.scrollTop = 0;
  }, [step]);

  // BACK: the moment the exit beat starts, lift the accumulated word for the step
  // we're leaving back OFF the breadcrumb (it goes centre + grows). The returning
  // card deck then flies it down onto its card and shrinks the room photo in
  // behind it — the exact reverse of the forward journey. item→location lifts the
  // location word; form→item lifts the item word; location→email has no card word.
  useEffect(() => {
    if (!backExiting || prefersReducedMotion()) return;
    const key = step === "item" ? "loc" : step === "form" ? "item" : null;
    if (key) liftSlot(key, { color: colors.primary });
  }, [backExiting, step]);

  // Lifted so the paying overlay reads `isPaying`; also passed to FormStage so
  // there's a single form instance. The values are stable by the time the form
  // stage renders (location + item chosen); earlier they're simply unused.
  const form = useLeadForm({
    category: leadCategory,
    item: leadItem,
    location,
    leadEmail,
  });

  const locationOptions = useMemo(
    () =>
      designLeadTypes.map((l) => ({
        value: l.value,
        image: l.image,
        alt: l.alt,
        title: translate(l.title),
        hint: translate("register.locationCardHint"),
      })),
    [translate],
  );

  const itemOptions = useMemo(
    () =>
      designLead.map((d) => ({
        value: d.value,
        image: imageForItem(d.value),
        title: translate(LeadType[d.value]),
        // رسوم التصميم اتشالت من الكارت أثناء الاختيار — بتظهر دلوقتي بعد تأكيد الدفع
        // في صفحة /register/success (شوف SuccessView). لإرجاعها هنا: فك الكومنت + استيراد DesignLeadPrice.
        // note: translate(DesignLeadPrice[d.value]),
      })),
    [translate],
  );

  const isForm = step === "form";
  // Backdrop photo per stage (all curated + optimized via core/assets — WIDE
  // landscape stills rendered full-bleed/cover by PerspectiveStage):
  //  • designIntro/email/location → the hero room (the "enter the design"
  //    push-in lives here),
  //  • item → the chosen LOCATION photo,
  //  • form → the chosen ITEM photo, kept as the BACKGROUND (PerspectiveStage
  //    `variant="form"` only deepens its edges for legibility — NO white panel,
  //    NO frosted wash) so the card that flew to fill the screen settles into the
  //    same room the form then sits over. Just the glass inputs sit on top.
  // Once an ITEM is chosen the room IS that item's photo immediately — even
  // during the brief item→form beat (before `step` flips to "form"). This makes
  // the `coverMorph` overlay (which grew the item card's photo) hand off to the
  // SAME backdrop image, so removing the overlay never reveals the previous
  // (location) room for a frame. leadItem is cleared on BACK, so the location
  // room correctly returns for the item step.
  const backdropImage = leadItem
    ? imageForItem(leadItem)
    : step === "item"
      ? imageForLocation(location)
      : assets.hero;

  // The accumulating JOURNEY breadcrumb at the top: category (always, once the
  // intro has handed off) → location → item. Each token is the word that flew up
  // off its card / the intro, so it is never shown twice. Line 1 = the path
  // (تصميم + location); line 2 = the chosen item (the focus).
  const journeyTokens = [];
  if (step !== "designIntro") {
    journeyTokens.push({
      key: "cat",
      text: translate("category.design"),
      line: 1,
      primary: true,
    });
  }
  if (location) {
    const locDef = designLeadTypes.find((l) => l.value === location);
    journeyTokens.push({
      key: "loc",
      text: translate(locDef?.title || ""),
      line: 1,
    });
  }
  if (leadItem) {
    journeyTokens.push({
      key: "item",
      text: translate(LeadType[leadItem]),
      line: 2,
    });
  }

  const renderStage = () => {
    if (step === "designIntro") return <DesignIntroStage />;
    if (step === "email")
      return <EmailStage onSubmit={handleEmailSubmit} direction={direction} />;
    if (step === "location") {
      return (
        <OptionCardsStage
          title={translate("register.chooseLocationTitle")}
          subtitle={translate("register.chooseLocationSubtitle")}
          options={locationOptions}
          onSelect={handleLocationClick}
          disabled={isAnimating}
          revealKey="location"
          columns={{ xs: 1, md: 2 }}
          cardHeight={{ xs: 185, sm: 240, md: 300 }}
          direction={direction}
          returning={returningLocation}
        />
      );
    }
    if (step === "item") {
      return (
        <OptionCardsStage
          title={translate("register.chooseItemTitle")}
          options={itemOptions}
          onSelect={handleLeadItemClick}
          disabled={isAnimating}
          revealKey="item"
          columns={{ xs: 1, md: 3 }}
          cardHeight={{ xs: 160, sm: 220, md: 300 }}
          direction={direction}
          returning={returningItem}
        />
      );
    }
    return <FormStage item={leadItem} form={form} />;
  };

  return (
    <>
      <RegisterHeader
        onReset={handleReset}
        canReset={canReset}
        onBack={handleBack}
        canGoBack={canGoBack}
        disabled={isAnimating}
      />

      <PerspectiveStage
        image={backdropImage}
        variant={isForm ? "form" : "photo"}
        direction={direction}
        exiting={backExiting}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0, // bound the inner scroll area instead of growing
            display: "flex",
            flexDirection: "column",
            pt: { xs: 8.5, md: 9 },
            pb: { xs: 1.5, md: 2 },
            px: { xs: 1.5, md: 2 },
          }}
        >
          {/* PINNED top chrome — the accumulating JOURNEY breadcrumb + the progress
              dots stay fixed at the top (they never scroll); only the active stage
              below scrolls. `flexShrink: 0` keeps them at full height. The breadcrumb
              is the single place the chosen words live (they fly up here off the
              cards and stay). */}
          {journeyTokens.length > 0 && (
            <Box sx={{ mb: { xs: 1.5, md: 2 }, flexShrink: 0 }}>
              <JourneyBreadcrumb tokens={journeyTokens} isRtl={isRtl} />
            </Box>
          )}

          {/* Minimal depth-aware progress dots. Light-on-photo for EVERY stage
              now — the form keeps the (darkened) photo as its background too. */}
          <ProgressDots
            activeIndex={progressIndexFor(step)}
            onDark
            labels={PROGRESS_STEPS.map((s) => stepLabel(translate, s))}
          />

          {/* Stage content — the ONLY scroll owner. Tall stages (the 3 item cards
              on mobile, a long form) scroll HERE while the breadcrumb + dots above
              stay pinned. `minHeight: 0` lets this flex child shrink so its own
              `overflowY` actually scrolls instead of pushing the column taller.
              Hidden until hydration resolves the deep-link target so there is no
              flash of the wrong step; pointer events are cut while a transition
              animates so no click fires over a running animation. `stageContentRef`
              is GSAP-receded during the BACK exit beat + reset to scrollTop 0 on
              each step swap. */}
          <Box
            ref={stageContentRef}
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              // Breathing room at the bottom of the scroll so the last card / the
              // final field + CTA never sit flush against the viewport edge.
              pb: { xs: 6, md: 8 },
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/legacy Edge
              "&::-webkit-scrollbar": { display: "none" }, // WebKit/Blink
              visibility: hydrated ? "visible" : "hidden",
              pointerEvents: isAnimating ? "none" : "auto",
              willChange: "transform, opacity",
            }}
          >
            {renderStage()}
          </Box>
        </Box>
      </PerspectiveStage>

      {/* الدفع متوقّف — بدل PayingOverlay بنعرض شاشة "تم استلام طلبك" + رسوم التصميم. */}
      {(registrationCompleted || form.isDone) && (
        <LeadSuccessOverlay item={leadItem} />
      )}
    </>
  );
}

function stepLabel(translate, s) {
  const map = {
    email: "register.stepEmail",
    location: "register.stepLocation",
    item: "register.stepItem",
    form: "register.stepForm",
  };
  return translate(map[s] || "register.stepEmail");
}

/**
 * A tiny brand progress indicator: a dot per logical step, the active one
 * widened with the gold gradient. `onDark` flips it to a light-on-photo
 * treatment. Purely presentational.
 */
function ProgressDots({ activeIndex, onDark, labels }) {
  const inactive = onDark ? "rgba(255,255,255,0.45)" : colors.bgTertiary;
  return (
    <Box
      role="list"
      aria-label={labels?.[activeIndex]}
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
        mb: { xs: 2, md: 2.5 },
      }}
    >
      {labels.map((label, i) => {
        const active = i === activeIndex;
        return (
          <Box
            key={label + i}
            role="listitem"
            aria-current={active ? "step" : undefined}
            title={label}
            sx={{
              height: 6,
              width: active ? 28 : 6,
              borderRadius: 999,
              transition: "width .35s ease, background .35s ease",
              background: active ? colors.primaryGradient : inactive,
              boxShadow: active ? "0 2px 8px rgba(190,151,92,0.5)" : "none",
            }}
          />
        );
      })}
    </Box>
  );
}
