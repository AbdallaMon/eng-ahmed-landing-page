"use client";
import { Box, Typography } from "@mui/material";
import colors from "@/app/register/theme/colors";
import { useLeadForm } from "@/app/register/core/useLeadForm";
import { leadFormFieldOrder } from "@/app/register/core/fields/fieldOrder";
import { FIELD_COMPONENTS } from "@/app/register/core/fields/fieldComponents";
import GuaranteeCTA from "@/app/register/core/fields/GuaranteeCTA";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { DesignLeadPrice } from "@/app/register/data/constants";
import { useDepthReveal } from "@/app/register/variants/v1/useDepthReveal";

/**
 * The form stage — the background stays THE chosen item PHOTO (provided by
 * `PerspectiveStage variant="form"`, which keeps the same image and only deepens
 * its edges for legibility — NO white panel, NO frosted wash). Over that photo we
 * place ONLY the inputs, rendered as legible GLASS controls (translucent dark
 * fill + light text + gold focus) — there are NO per-field backing cards and NO
 * elevated form paper. The chosen item title morphs into a small inline chip;
 * then the fields RISE in as depth-staggered 3D objects.
 *
 * Input legibility is achieved by overriding the (frozen) core MUI fields purely
 * from this wrapper's `sx` (descendant selectors) — the field components are
 * untouched.
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

  // Depth-stagger the chip + every field row + the CTA. A gentler back-in-Z lift
  // with a soft expo settle so rows arrive like cards being placed on a desk.
  const { ref } = useDepthReveal(
    { baseDelay: 0.2, z: 90, y: 26, rotateX: 16, step: 0.08, duration: 0.7 },
    [fieldIds.join(",")],
  );

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
        pt: { xs: 1, md: 2 },
        // Extra bottom padding so the last field/CTA isn't flush against the
        // viewport edge and the form has more room to scroll past.
        pb: { xs: 5, md: 7 },
        // The form can be long (many fields) — let it scroll within the viewport
        // instead of being clipped by the fixed scene. `minHeight: 0` is required
        // so this flex child can shrink and actually scroll. Header + dots reserve
        // the space above.
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        maxHeight: { xs: "calc(100dvh - 120px)", md: "calc(100dvh - 130px)" },
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
        // Hide the scrollbar across engines while keeping scroll behaviour.
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/legacy Edge
        "&::-webkit-scrollbar": { display: "none" }, // WebKit/Blink
      }}
    >
      <Box
        ref={ref}
        dir={isRtl ? "rtl" : "ltr"}
        sx={{
          width: "100%",
          maxWidth: 540,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1.6, md: 1.9 },
          perspective: "1000px",
          py: { xs: 1, md: 1.5 },
          ...GLASS_FIELD_SX,
        }}
      >
        {/* Heading + the item chip the chosen type morphs into. Light text over
            the photo backdrop (no dark-on-light here — the photo is the bg). */}
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
              color: "#fff",
              fontWeight: 800,
              fontSize: { xs: "1.5rem", md: "1.9rem" },
              lineHeight: 1.15,
              textShadow: "0 3px 18px rgba(0,0,0,0.6)",
            }}
          >
            {translate("hero.oneStepAway")}
          </Typography>

          {feeKey && (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 600,
                fontSize: { xs: "0.85rem", md: "0.92rem" },
                textShadow: "0 2px 12px rgba(0,0,0,0.55)",
              }}
            >
              {translate(feeKey)}
            </Typography>
          )}

          {/* The "team will contact you — a $39 fee applies" notice. It was part
              of the original register form and got dropped in the V1 migration;
              the owner wants it back here so the upfront fee is set before the
              fields. */}
          <Typography
            sx={{
              color: "rgba(255,255,255,0.78)",
              fontWeight: 600,
              fontSize: { xs: "0.8rem", md: "0.86rem" },
              textShadow: "0 2px 12px rgba(0,0,0,0.55)",
            }}
          >
            {translate("register.emailAnimatedNotice")}
          </Typography>
        </Box>

        {/* Each field rises in as its OWN depth object — directly over the photo,
            NO backing box. Glass legibility comes from GLASS_FIELD_SX above. */}
        {fieldIds.map((id) => {
          const Field = FIELD_COMPONENTS[id];
          if (!Field) return null;
          return (
            <Box
              key={id}
              data-depth
              // Phone keeps LTR so the country flag + number read correctly; the
              // rest follow the document direction (RTL for Arabic → labels right).
              dir={id === "phone" ? "ltr" : undefined}
              sx={{
                opacity: 0,
                transformStyle: "preserve-3d",
                textAlign: "start",
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

// Glass treatment for the (frozen) core MUI fields, applied from the form
// wrapper via descendant selectors so the inputs read over the photo without any
// per-field box: a translucent dark fill, a soft gold hairline, LIGHT text +
// labels, and a gold focus ring. Covers TextField (outlined), Select, the
// mui-tel-input, helper text, and the GuaranteeCTA note/button.
const GLASS_FIELD_SX = {
  // Field labels + placeholders read light over the photo.
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.82)",
    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: colors.primary },
  "& .MuiInputLabel-root.Mui-error": { color: colors.error },

  // The input shell: translucent dark glass with blur + a faint gold edge.
  "& .MuiOutlinedInput-root, & .MuiInputBase-root": {
    color: "#fff",
    backgroundColor: "rgba(20,15,11,0.42)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: 12,
    transition: "background-color .25s ease, box-shadow .25s ease",
    "& input::placeholder, & textarea::placeholder": {
      color: "rgba(255,255,255,0.6)",
      opacity: 1,
    },
  },
  "& .MuiOutlinedInput-root:hover, & .MuiInputBase-root:hover": {
    backgroundColor: "rgba(20,15,11,0.52)",
  },
  "& .MuiOutlinedInput-root.Mui-focused, & .MuiInputBase-root.Mui-focused": {
    backgroundColor: "rgba(20,15,11,0.6)",
    boxShadow: `0 0 0 1px ${colors.primary}, 0 10px 30px rgba(0,0,0,0.4)`,
  },
  // Outlined border → soft gold hairline (gold on focus, error stays red).
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.28)",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(211,172,113,0.55)",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
    borderColor: colors.error,
  },
  // Select arrow + adornment icons read light.
  "& .MuiSvgIcon-root, & .MuiInputAdornment-root": {
    color: "rgba(255,255,255,0.78)",
  },
  // Helper / error text stays legible over the photo.
  "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.7)" },
  "& .MuiFormHelperText-root.Mui-error": { color: colors.error },

  // The GuaranteeCTA note box uses theme primary alpha (designed for a light
  // surface); over the photo, re-skin its note text to light. The button keeps
  // the gold gradient from the theme contained variant.
  "& .MuiTypography-body2": {
    color: "rgba(255,255,255,0.92)",
    textShadow: "0 2px 12px rgba(0,0,0,0.5)",
  },
};
