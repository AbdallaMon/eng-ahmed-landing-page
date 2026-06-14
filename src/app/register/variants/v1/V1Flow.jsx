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
  DesignLeadPrice,
} from "@/app/register/data/constants";
import { assets, imageForItem, imageForLocation } from "@/app/register/core/assets";

import PerspectiveStage from "@/app/register/variants/v1/PerspectiveStage";
import DesignIntroStage from "@/app/register/variants/v1/DesignIntroStage";
import EmailStage from "@/app/register/variants/v1/EmailStage";
import OptionCardsStage from "@/app/register/variants/v1/OptionCardsStage";
import FormStage from "@/app/register/variants/v1/FormStage";
import PayingOverlay from "@/app/register/variants/v1/PayingOverlay";

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
  const { translate } = useLanguage();

  const {
    step,
    direction,
    hydrated,
    isAnimating,
    backExiting,
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
  }, [step]);

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
        note: translate(DesignLeadPrice[d.value]),
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
          direction={direction}
        />
      );
    }
    if (step === "item") {
      return (
        <OptionCardsStage
          title={translate("register.chooseItemTitle")}
          subtitle={translate("register.chooseItemSubtitle")}
          options={itemOptions}
          onSelect={handleLeadItemClick}
          disabled={isAnimating}
          revealKey="item"
          columns={{ xs: 1, md: 3 }}
          direction={direction}
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
            display: "flex",
            flexDirection: "column",
            pt: { xs: 8.5, md: 9 },
            pb: { xs: 4, md: 6 },
            px: { xs: 1.5, md: 2 },
          }}
        >
          {/* Minimal depth-aware progress dots. Light-on-photo for EVERY stage
              now — the form keeps the (darkened) photo as its background too. */}
          <ProgressDots
            activeIndex={progressIndexFor(step)}
            onDark
            labels={PROGRESS_STEPS.map((s) => stepLabel(translate, s))}
          />

          {/* Stage content. Hidden until hydration resolves the deep-link target
              so there is no flash of the wrong step; pointer events are cut while
              a transition animates so no click fires over a running animation.
              `stageContentRef` is GSAP-receded during the BACK exit beat. */}
          <Box
            ref={stageContentRef}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              visibility: hydrated ? "visible" : "hidden",
              pointerEvents: isAnimating ? "none" : "auto",
              willChange: "transform, opacity",
            }}
          >
            {renderStage()}
          </Box>
        </Box>
      </PerspectiveStage>

      {form.isPaying && <PayingOverlay />}
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
