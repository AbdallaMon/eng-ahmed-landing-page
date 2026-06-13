"use client";
import { useEffect, useRef } from "react";
import { Box, Chip, Typography, alpha, useTheme } from "@mui/material";
import useLeadForm from "@/app/register/core/useLeadForm";
import { leadFormFieldOrder } from "@/app/register/core/fields/fieldOrder";
import { FIELD_COMPONENTS } from "@/app/register/core/fields/fieldComponents";
import GuaranteeCTA from "@/app/register/core/fields/GuaranteeCTA";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { DesignLeadPrice, LeadType } from "@/app/register/data/constants";
import { depthStaggerIn } from "@/app/register/variants/v3/v3Motion";

/**
 * V3's lead form — part of the 3D space, NOT a boxed Paper. Fields are rendered
 * from the shared `leadFormFieldOrder` → `FIELD_COMPONENTS` and each is wrapped
 * in a depth-stagger wrapper so the form "assembles in 3D" (rises forward out
 * of depth) on mount. The chosen item appears as a small inline chip + its
 * design-fee note (the heading "morphs" into a compact marker rather than a
 * boxed title). Submit fires the shared `GuaranteeCTA`, which runs
 * `useLeadForm.handleSubmit` (two-step backend → Stripe pay).
 *
 * Owns the lead form's `useLeadForm`; it reports the `isPaying` flag UP to the
 * parent (via `onPayingChange`) so the parent can drive the full-screen pay
 * transition without a second hook.
 *
 * @param {{
 *   category: string,
 *   item: string,
 *   location: string,
 *   leadEmail: string,
 *   onPayingChange?: (isPaying: boolean) => void,
 * }} props
 */
export default function FormStage({
  category,
  item,
  location,
  leadEmail,
  onPayingChange,
}) {
  const theme = useTheme();
  const form = useLeadForm({ category, item, location, leadEmail });
  const { translate, hasCapturedEmail, isPaying } = form;

  const fieldIds = leadFormFieldOrder({ location, hasCapturedEmail });
  const fieldsRef = useRef(null);

  // Report only the boolean pay flag up (stable dependency → no render loop).
  useEffect(() => {
    onPayingChange?.(isPaying);
  }, [isPaying, onPayingChange]);

  // Depth-stagger the fields in on mount (query the wrappers from the DOM so we
  // never touch refs during render).
  useEffect(() => {
    const root = fieldsRef.current;
    if (!root) return;
    const wraps = root.querySelectorAll("[data-stagger]");
    depthStaggerIn(Array.from(wraps), { delay: 0.18 });
  }, []);

  const itemLabelKey = LeadType[item];
  const priceKey = DesignLeadPrice[item];

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: 560,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: { xs: 1, sm: 2 },
      }}
    >
      {/* Heading: chosen-item chip + design-fee note (no boxed title). */}
      <Box sx={{ textAlign: "center", mb: { xs: 2.5, sm: 3 } }}>
        <AnimatedText
          as="h2"
          text={translate("register.stepForm")}
          stagger={0.06}
          duration={0.65}
          sx={{
            m: 0,
            fontWeight: 800,
            color: "text.primary",
            fontSize: { xs: "1.4rem", sm: "1.8rem" },
          }}
        />
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {itemLabelKey && (
            <Chip
              label={translate(itemLabelKey)}
              sx={{
                fontWeight: 700,
                color: "primary.dark",
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            />
          )}
          {priceKey && (
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {translate(priceKey)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Fields — each in its own depth-stagger wrapper (preserve-3d), NOT a
          Paper. The wrappers are tagged `data-stagger` so the entrance effect
          can collect them from the DOM. */}
      <Box
        ref={fieldsRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 2.25 },
          perspective: "900px",
        }}
      >
        {fieldIds.map((id) => {
          const Field = FIELD_COMPONENTS[id];
          if (!Field) return null;
          return (
            <Box
              key={id}
              data-stagger
              sx={{
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
                opacity: 0, // depthStaggerIn reveals it (or instantly under RM)
              }}
            >
              <Field form={form} />
            </Box>
          );
        })}

        {/* Guarantee note + submit CTA (its own depth-stagger wrapper). */}
        <Box
          data-stagger
          sx={{
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
            opacity: 0,
            mt: 0.5,
          }}
        >
          <GuaranteeCTA form={form} />
        </Box>
      </Box>
    </Box>
  );
}
