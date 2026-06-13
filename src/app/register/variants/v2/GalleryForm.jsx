"use client";
import { useEffect, useRef } from "react";
import { Box, Chip, Typography, useTheme } from "@mui/material";
import gsap from "gsap";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { leadFormFieldOrder } from "@/app/register/core/fields/fieldOrder";
import { FIELD_COMPONENTS } from "@/app/register/core/fields/fieldComponents";
import GuaranteeCTA from "@/app/register/core/fields/GuaranteeCTA";
import { LeadType, DesignLeadPrice } from "@/app/register/data/constants";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";

/**
 * V2 form stage — a GLASS DOM panel anchored to the edge of the live WebGL scene
 * (the canvas keeps rendering behind it), NOT a centered floating Paper card.
 *
 * Layout: on mobile it's a bottom sheet (the scene shows above it); on >= md it's
 * a right-anchored column (the model stays visible on the left). Fields are
 * rendered by mapping `leadFormFieldOrder` → `FIELD_COMPONENTS` and wrapping each
 * in a GSAP depth-staggered wrapper so they rise/rotate in as scene objects.
 *
 * `form` is the object returned by core `useLeadForm`. The submit row is the core
 * `GuaranteeCTA` (which calls `form.handleSubmit`).
 */
export default function GalleryForm({ form, item }) {
  const theme = useTheme();
  const { translate } = useLanguage();
  const fieldsRef = useRef(null);
  const panelRef = useRef(null);

  const fieldIds = leadFormFieldOrder({
    location: form.isInsideUAE ? "INSIDE_UAE" : "OUTSIDE_UAE",
    hasCapturedEmail: form.hasCapturedEmail,
  });

  // Stagger the panel + its fields in as depth objects once mounted.
  useEffect(() => {
    const panel = panelRef.current;
    const root = fieldsRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll("[data-field]");
    const reduce = prefersReducedMotion();

    if (reduce) {
      if (panel) gsap.set(panel, { opacity: 1, y: 0 });
      gsap.set(items, { opacity: 1, y: 0, z: 0, rotateX: 0 });
      return undefined;
    }

    const tl = gsap.timeline();
    if (panel) {
      tl.fromTo(
        panel,
        { opacity: 0, y: 40, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" },
      );
    }
    tl.fromTo(
      items,
      { opacity: 0, y: 26, z: -50, rotateX: -28 },
      {
        opacity: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.08,
      },
      panel ? "-=0.25" : 0,
    );
    return () => tl.kill();
  }, [fieldIds.length]);

  const itemTitleKey = item ? LeadType[item] : null;
  const priceKey = item ? DesignLeadPrice[item] : null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 12,
        display: "flex",
        // Mobile: form hugs the bottom; desktop: hugs the trailing edge.
        alignItems: { xs: "flex-end", md: "stretch" },
        justifyContent: { xs: "center", md: "flex-end" },
        pointerEvents: "none",
      }}
    >
      <Box
        ref={panelRef}
        sx={{
          pointerEvents: "auto",
          width: { xs: "100%", md: "min(470px, 42vw)" },
          maxHeight: { xs: "82vh", md: "100vh" },
          overflowY: "auto",
          px: { xs: 2.5, md: 4 },
          pt: { xs: 3, md: 12 },
          pb: { xs: 4, md: 6 },
          // The "glass over the scene" surface — translucent, blurred, soft edge,
          // NOT an opaque elevated card.
          background: `linear-gradient(180deg, ${theme.palette.background.paper}f2 0%, ${theme.palette.background.paper}e6 100%)`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderTopLeftRadius: { xs: 28, md: 32 },
          borderTopRightRadius: { xs: 28, md: 0 },
          borderBottomLeftRadius: { xs: 0, md: 0 },
          boxShadow: { xs: "0 -10px 40px rgba(0,0,0,0.18)", md: "-12px 0 48px rgba(0,0,0,0.16)" },
          borderInlineStart: { md: `1px solid ${theme.palette.primary.main}33` },
          perspective: "900px",
        }}
      >
        {/* Heading + the chosen-item chip (the item title travels here as a chip,
            keeping the choice visible without re-boxing the whole form). */}
        <Box sx={{ mb: 3 }}>
          {item && (
            <Chip
              label={`${itemTitleKey ? translate(itemTitleKey) : ""}`}
              sx={{
                mb: 1.5,
                fontWeight: 700,
                color: theme.palette.primary.contrastText,
                background: theme.palette.gradient?.primary || theme.palette.primary.main,
              }}
            />
          )}
          <AnimatedText
            as="h2"
            text={translate("hero.oneStepAway")}
            duration={0.55}
            sx={{
              m: 0,
              fontWeight: 700,
              fontSize: { xs: "1.3rem", md: "1.5rem" },
              color: theme.palette.text.secondary,
              lineHeight: 1.3,
            }}
          />
          {priceKey && (
            <Typography
              variant="body2"
              sx={{ mt: 1, color: theme.palette.primary.dark, fontWeight: 600 }}
            >
              {translate(priceKey)}
            </Typography>
          )}
        </Box>

        {/* Fields — each wrapped so it rises/rotates in as a scene object. */}
        <Box
          ref={fieldsRef}
          sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
        >
          {fieldIds.map((id) => {
            const Field = FIELD_COMPONENTS[id];
            if (!Field) return null;
            return (
              <Box
                key={id}
                data-field
                sx={{
                  opacity: 0,
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity",
                }}
              >
                <Field form={form} />
              </Box>
            );
          })}

          <Box
            data-field
            sx={{
              opacity: 0,
              mt: 0.5,
              transformStyle: "preserve-3d",
              willChange: "transform, opacity",
            }}
          >
            <GuaranteeCTA form={form} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
