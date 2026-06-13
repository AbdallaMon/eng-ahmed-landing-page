"use client";
import { useEffect, useRef } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import Card3D from "@/app/register/core/cards3d/Card3D";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";
import { flyToFill, scatterSiblings } from "@/app/register/core/cards3d/flyToFill";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * The shared "Living Cards" selection stage for V3's location + item beats
 * (the V1 mechanic, reused via `core/cards3d`). Each option is a photographic
 * `Card3D` panel floating in the depth scene; the heading reveals per-word via
 * `AnimatedText`. On select the chosen card flies toward the viewer and unfolds
 * to fill the screen (`flyToFill`) while the others scatter back in depth
 * (`scatterSiblings`); the flow then advances to the next stage.
 *
 * Generic on purpose — the parent supplies the option list + the per-value
 * image/label/note + the click handler, so one component serves both stages.
 *
 * @param {{
 *   titleKey: string,
 *   subtitleKey: string,
 *   options: Array<{ value: string, labelKey: string, image: string, noteKey?: string }>,
 *   onSelect: (value: string) => void,   // useLeadFlow.handleLocationClick / handleLeadItemClick
 *   isAnimating: boolean,
 *   columns?: number,                    // grid columns on sm+ (default = options.length)
 * }} props
 */
export default function OptionStage({
  titleKey,
  subtitleKey,
  options,
  onSelect,
  isAnimating,
  columns,
}) {
  const theme = useTheme();
  const { translate } = useLanguage();
  // Inner card DOM nodes (Card3D hands these back) keyed by option value.
  const cardEls = useRef({});
  const chosenRef = useRef(false);

  // Reset the "already chosen" guard if the option set changes (location → item).
  useEffect(() => {
    chosenRef.current = false;
    cardEls.current = {};
  }, [titleKey]);

  const handlePick = (value) => {
    if (isAnimating || chosenRef.current) return;
    chosenRef.current = true;

    const chosen = cardEls.current[value];
    const siblings = Object.entries(cardEls.current)
      .filter(([k]) => k !== value)
      .map(([, el]) => el);

    if (!prefersReducedMotion()) {
      scatterSiblings(siblings);
      if (chosen) flyToFill(chosen, { duration: 0.8 });
    }
    // Advance the flow. useLeadFlow locks + sequences the actual step change
    // (item adds a short hold so the fly reads before the form mounts).
    onSelect(value);
  };

  const cols = columns || options.length;

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: 920,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        textAlign: "center",
      }}
    >
      <AnimatedText
        as="h2"
        text={translate(titleKey)}
        stagger={0.06}
        duration={0.7}
        sx={{
          m: 0,
          fontWeight: 800,
          lineHeight: 1.25,
          color: "text.primary",
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      />
      <Typography
        sx={{
          mt: 1,
          mb: { xs: 3, sm: 4 },
          color: "text.secondary",
          fontSize: { xs: "0.95rem", sm: "1.05rem" },
        }}
      >
        {translate(subtitleKey)}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, sm: 3 },
          gridTemplateColumns: {
            xs: "1fr",
            sm: `repeat(${cols}, 1fr)`,
          },
          perspective: "1200px",
        }}
      >
        {options.map((opt) => (
          <Box
            key={opt.value}
            sx={{
              height: { xs: 200, sm: 300 },
              transformStyle: "preserve-3d",
            }}
          >
            <Card3D
              ariaLabel={translate(opt.labelKey)}
              onClick={() => handlePick(opt.value)}
              radius={20}
              cardRef={(el) => {
                if (el) cardEls.current[opt.value] = el;
              }}
              sx={{
                overflow: "hidden",
                boxShadow: `0 16px 44px ${alpha(theme.palette.primary.dark, 0.28)}`,
              }}
            >
              {/* Photographic surface */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${opt.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Legibility gradient */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.62) 100%)",
                }}
              />
              {/* Label + optional note, lifted forward in Z for depth */}
              <Box
                sx={{
                  position: "absolute",
                  insetInline: 0,
                  bottom: 0,
                  p: { xs: 1.5, sm: 2 },
                  textAlign: "center",
                  transform: "translateZ(40px)",
                }}
              >
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: { xs: "1.05rem", sm: "1.25rem" },
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {translate(opt.labelKey)}
                </Typography>
                {opt.noteKey && (
                  <Typography
                    sx={{
                      mt: 0.25,
                      color: "rgba(255,255,255,0.92)",
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      fontWeight: 600,
                      textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {translate(opt.noteKey)}
                  </Typography>
                )}
              </Box>
            </Card3D>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
