"use client";
import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import Card3D from "@/app/register/core/cards3d/Card3D";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { flyToFill, scatterSiblings } from "@/app/register/core/cards3d/flyToFill";
import { useDepthReveal } from "@/app/register/variants/v1/useDepthReveal";

/**
 * The signature card stage, reused for BOTH the location and item steps.
 *
 * Photographic `Card3D` panels float in the scene and enter as depth-staggered
 * 3D objects (the OUTER wrapper carries `data-depth`; `Card3D`'s own inner node
 * stays free for its tilt / idle-float and for `flyToFill`). On select, the
 * chosen card flies toward the viewer and unfolds edge-to-edge (`flyToFill`)
 * while the others scatter back in depth (`scatterSiblings`); only AFTER that
 * choreography lands do we call `onSelect(value)` so the flow advances onto the
 * new backdrop. `disabled` (the flow's `isAnimating`) guards against double-fire.
 *
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   options: Array<{ value: string, image: string, title: string, alt?: string, note?: string, hint?: string }>,
 *   onSelect: (value: string) => void,
 *   disabled?: boolean,
 *   revealKey?: string,   // bump to replay the entrance (e.g. the step name)
 *   columns?: { xs?: number, md?: number },
 * }} props
 */
export default function OptionCardsStage({
  title,
  subtitle,
  options,
  onSelect,
  disabled = false,
  revealKey = "",
  columns = { xs: 1, md: 2 },
}) {
  const { lng } = useLanguage();
  const cardNodes = useRef({}); // value -> inner DOM node (from Card3D.cardRef)
  const firing = useRef(false);

  // Re-reveal the cards whenever the option set / step changes.
  const { ref } = useDepthReveal(
    { baseDelay: 0.2, z: 200, y: 36, step: 0.1, duration: 0.8 },
    [revealKey, options.length],
  );

  const handlePick = (value) => {
    if (disabled || firing.current) return;
    const chosen = cardNodes.current[value];
    if (!chosen) {
      onSelect(value);
      return;
    }
    firing.current = true;
    const others = options
      .filter((o) => o.value !== value)
      .map((o) => cardNodes.current[o.value])
      .filter(Boolean);

    scatterSiblings(others);
    flyToFill(chosen, {
      onComplete: () => {
        firing.current = false;
        onSelect(value);
      },
    });
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: { xs: 1, md: 2 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
        <AnimatedText
          as="h2"
          text={title}
          stagger={0.05}
          delay={0.15}
          sx={{
            m: 0,
            color: "#fff",
            fontWeight: 800,
            fontSize: { xs: "1.7rem", md: "2.3rem" },
            lineHeight: 1.18,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        />
        {subtitle && (
          <Typography
            sx={{
              mt: 1.25,
              color: "rgba(255,255,255,0.86)",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              textShadow: "0 2px 12px rgba(0,0,0,0.55)",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        ref={ref}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: `repeat(${columns.xs || 1}, 1fr)`,
            md: `repeat(${columns.md || 2}, 1fr)`,
          },
          gap: { xs: 2, md: 3 },
          width: "100%",
          maxWidth: 880,
          mx: "auto",
          perspective: "1200px",
        }}
      >
        {options.map((opt) => (
          <Box
            key={opt.value}
            data-depth
            sx={{
              opacity: 0,
              transformStyle: "preserve-3d",
              height: { xs: 200, sm: 240, md: 300 },
            }}
          >
            <Card3D
              ariaLabel={opt.title}
              onClick={() => handlePick(opt.value)}
              radius={24}
              tilt={12}
              cardRef={(el) => {
                cardNodes.current[opt.value] = el;
              }}
              sx={{ overflow: "hidden" }}
            >
              {/* Photo layer, pushed slightly back so the label reads in front. */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${opt.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: "translateZ(-12px) scale(1.06)",
                  borderRadius: "inherit",
                }}
              />
              {/* Bottom gradient for legibility. */}
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(20,15,10,0.72) 100%)",
                }}
              />
              {/* Label group floats in front of the photo (real depth). */}
              <Box
                sx={{
                  position: "absolute",
                  insetInlineStart: 0,
                  insetInlineEnd: 0,
                  bottom: 0,
                  p: { xs: 2, md: 2.5 },
                  transform: "translateZ(34px)",
                  textAlign: lng === "ar" ? "right" : "left",
                }}
              >
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: { xs: "1.2rem", md: "1.45rem" },
                    lineHeight: 1.15,
                    textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                  }}
                >
                  {opt.title}
                </Typography>
                {opt.note && (
                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "rgba(255,255,255,0.92)",
                      fontWeight: 600,
                      fontSize: { xs: "0.82rem", md: "0.9rem" },
                      textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                    }}
                  >
                    {opt.note}
                  </Typography>
                )}
                {opt.hint && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      mt: 1,
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 999,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#3a2f25",
                      background: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {opt.hint}
                  </Box>
                )}
              </Box>
            </Card3D>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
