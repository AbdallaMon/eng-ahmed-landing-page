"use client";
import { Box, Typography } from "@mui/material";
import colors from "@/app/register/theme/colors";
import { useLeadForm } from "@/app/register/core/useLeadForm";
import { leadFormFieldOrder } from "@/app/register/core/fields/fieldOrder";
import { FIELD_COMPONENTS } from "@/app/register/core/fields/fieldComponents";
import GuaranteeCTA from "@/app/register/core/fields/GuaranteeCTA";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { LeadType, DesignLeadPrice } from "@/app/register/data/constants";
import { useDepthReveal } from "@/app/register/variants/v1/useDepthReveal";

/**
 * The form stage — NOT a boxed paper. The chosen item title morphs into a small
 * inline chip, then the fields RISE in as depth-staggered 3D objects (each in
 * its own light translucent backing for legibility — the individual MUI inputs
 * keep their styling; there is no floating elevated card wrapping the whole
 * form). `GuaranteeCTA` is the submit row; its `handleSubmit` runs the two-step
 * backend then fires the Stripe pay (the orchestrator watches `form.isPaying`).
 *
 * The field SET + order come straight from the shared `leadFormFieldOrder`, so
 * INSIDE_UAE (emirate + description) vs. abroad (country), and the email field
 * (only when not captured earlier), all stay correct without duplication.
 *
 * @param {{
 *   category: string,
 *   item: string,
 *   location: string,
 *   leadEmail?: string,
 *   form: ReturnType<typeof useLeadForm>,  // lifted so the orchestrator can read isPaying
 * }} props
 */
export default function FormStage({ item, form }) {
  const { translate, lng } = useLanguage();
  const isRtl = lng === "ar";

  const fieldIds = leadFormFieldOrder({
    location: form.isInsideUAE ? "INSIDE_UAE" : "OUTSIDE_UAE",
    hasCapturedEmail: form.hasCapturedEmail,
  });

  // Depth-stagger the chip + every field row + the CTA.
  const { ref } = useDepthReveal(
    { baseDelay: 0.15, z: 120, y: 28, step: 0.09, duration: 0.65 },
    [fieldIds.join(",")],
  );

  const itemLabelKey = item ? LeadType[item] : null;
  const feeKey = item ? DesignLeadPrice[item] : null;

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        px: 2,
        py: { xs: 1, md: 2 },
      }}
    >
      <Box
        ref={ref}
        sx={{
          width: "100%",
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1.75, md: 2 },
          perspective: "900px",
        }}
      >
        {/* Heading + the item chip the chosen type morphs into. */}
        <Box
          data-depth
          sx={{
            opacity: 0,
            textAlign: "center",
            mb: 0.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <Typography
            sx={{
              color: colors.heading,
              fontWeight: 800,
              fontSize: { xs: "1.5rem", md: "1.9rem" },
              lineHeight: 1.15,
            }}
          >
            {translate("hero.oneStepAway")}
          </Typography>

          {itemLabelKey && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 999,
                background: colors.primaryGradient,
                boxShadow: "0 10px 26px rgba(190,151,92,0.4)",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)",
                }}
              />
              <AnimatedText
                text={translate(itemLabelKey)}
                stagger={0.04}
                delay={0.35}
                duration={0.6}
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                }}
              />
            </Box>
          )}

          {feeKey && (
            <Typography
              sx={{
                color: colors.secondaryText,
                fontWeight: 600,
                fontSize: { xs: "0.85rem", md: "0.92rem" },
              }}
            >
              {translate(feeKey)}
            </Typography>
          )}
        </Box>

        {/* Each field rises in as its own depth object on a light backing. */}
        {fieldIds.map((id) => {
          const Field = FIELD_COMPONENTS[id];
          if (!Field) return null;
          return (
            <Box
              key={id}
              data-depth
              sx={{
                opacity: 0,
                p: { xs: 1.25, md: 1.5 },
                borderRadius: 3,
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${colors.primaryAlt}`,
                boxShadow: "0 10px 30px rgba(40,32,24,0.12)",
                transformStyle: "preserve-3d",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              <Field form={form} />
            </Box>
          );
        })}

        {/* Submit row (refund note + CTA) — also a depth object, no Paper. */}
        <Box data-depth sx={{ opacity: 0, mt: 0.5 }}>
          <GuaranteeCTA form={form} />
        </Box>
      </Box>
    </Box>
  );
}
