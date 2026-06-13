"use client";
import { useMemo } from "react";
import { Box } from "@mui/material";

import {
  useLeadFlow,
  PROGRESS_STEPS,
  progressIndexFor,
} from "@/app/register/component/leadSelection/useLeadFlow";
import { useLeadForm } from "@/app/register/core/useLeadForm";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { RegisterHeader } from "@/app/register/component/layout/RegisterHeader";
import colors from "@/app/register/theme/colors";

import {
  designLeadTypes,
  designLead,
  LeadType,
  DesignLeadPrice,
} from "@/app/register/data/constants";
import { imageForItem } from "@/app/register/core/assets";

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
    hydrated,
    isAnimating,
    leadCategory,
    leadEmail,
    location,
    leadItem,
    activeImage,
    canGoBack,
    canReset,
    handleEmailSubmit,
    handleLocationClick,
    handleLeadItemClick,
    handleBack,
    handleReset,
  } = useLeadFlow();

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
  // The form stage sits on the light gradient (no photo), so dim the scrim down
  // there; the photo stages stay richly dimmed for white-text legibility.
  const dim = isForm ? 0.12 : 0.46;

  const renderStage = () => {
    if (step === "designIntro") return <DesignIntroStage />;
    if (step === "email") return <EmailStage onSubmit={handleEmailSubmit} />;
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

      <PerspectiveStage image={activeImage} dim={dim}>
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
          {/* Minimal depth-aware progress dots. */}
          <ProgressDots
            activeIndex={progressIndexFor(step)}
            onDark={!isForm}
            labels={PROGRESS_STEPS.map((s) => stepLabel(translate, s))}
          />

          {/* Stage content. Hidden until hydration resolves the deep-link target
              so there is no flash of the wrong step; pointer events are cut while
              a transition animates so no click fires over a running animation. */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              visibility: hydrated ? "visible" : "hidden",
              pointerEvents: isAnimating ? "none" : "auto",
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
