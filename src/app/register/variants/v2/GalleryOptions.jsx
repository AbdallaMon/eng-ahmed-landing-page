"use client";
import { useEffect, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import gsap from "gsap";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import AnimatedText from "@/app/register/core/cards3d/AnimatedText";

/**
 * The option chooser for the WebGL gallery path (location / item). Renders a
 * heading (3D word reveal) + a row/grid of glass option tiles that float OVER
 * the live model scene — each tile carries a small photo for context plus its
 * label, and selecting it triggers the parent's camera fly + stage swap.
 *
 * This is the WebGL-path presentation; the capability fallback uses full Card3D
 * panels in `CardFlow`.
 *
 * @param {{
 *   titleKey: string,
 *   subtitleKey?: string,
 *   options: { value: string, labelKey: string, image: string, priceKey?: string }[],
 *   onSelect: (value: string) => void,
 *   selected?: string,        // the value currently being chosen (locks + highlights)
 *   disabled?: boolean,
 * }} props
 */
export default function GalleryOptions({
  titleKey,
  subtitleKey,
  options,
  onSelect,
  selected,
  disabled,
}) {
  const theme = useTheme();
  const { translate } = useLanguage();
  const rowRef = useRef(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const tiles = row.querySelectorAll("[data-tile]");
    if (prefersReducedMotion()) {
      gsap.set(tiles, { opacity: 1, y: 0, z: 0, rotateY: 0 });
      return undefined;
    }
    const tween = gsap.fromTo(
      tiles,
      { opacity: 0, y: 30, z: -120, rotateY: -18 },
      {
        opacity: 1,
        y: 0,
        z: 0,
        rotateY: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.2,
      },
    );
    return () => tween.kill();
  }, [titleKey]);

  return (
    <Box
      sx={{
        width: "min(820px, 94vw)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 2.5, md: 3.5 },
        textAlign: "center",
      }}
    >
      <Box>
        <AnimatedText
          as="h1"
          text={translate(titleKey)}
          duration={0.6}
          sx={{
            m: 0,
            fontWeight: 800,
            fontSize: { xs: "1.55rem", md: "2.1rem" },
            color: theme.palette.text.secondary,
            textShadow: "0 2px 18px rgba(255,255,255,0.5)",
            lineHeight: 1.2,
          }}
        />
        {subtitleKey && (
          <Typography
            sx={{
              mt: 1,
              color: theme.palette.text.primary,
              fontWeight: 500,
              textShadow: "0 1px 10px rgba(255,255,255,0.6)",
            }}
          >
            {translate(subtitleKey)}
          </Typography>
        )}
      </Box>

      <Box
        ref={rowRef}
        sx={{
          width: "100%",
          display: "grid",
          gap: { xs: 1.75, md: 2.5 },
          gridTemplateColumns: {
            xs: "1fr",
            sm: options.length > 2 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
          },
          perspective: "1100px",
        }}
      >
        {options.map((opt) => {
          const isChosen = selected === opt.value;
          return (
            <Box
              key={opt.value}
              data-tile
              component="button"
              type="button"
              onClick={() => !disabled && onSelect(opt.value)}
              disabled={disabled}
              aria-label={translate(opt.labelKey)}
              sx={{
                opacity: 0,
                m: 0,
                p: 0,
                border: "none",
                textAlign: "start",
                cursor: disabled ? "default" : "pointer",
                borderRadius: 4,
                overflow: "hidden",
                position: "relative",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
                background: `${theme.palette.background.paper}e6`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: isChosen
                  ? `0 0 0 3px ${theme.palette.primary.main}, 0 18px 50px rgba(0,0,0,0.28)`
                  : "0 12px 36px rgba(0,0,0,0.20)",
                transition:
                  "box-shadow .3s ease, transform .3s ease",
                "&:hover": {
                  transform: disabled ? "none" : "translateY(-4px)",
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}66, 0 18px 48px rgba(0,0,0,0.26)`,
                },
                "&:focus-visible": {
                  outline: `3px solid ${theme.palette.primary.main}`,
                  outlineOffset: 3,
                },
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Box
                component="img"
                src={opt.image}
                alt=""
                loading="lazy"
                sx={{
                  display: "block",
                  width: "100%",
                  height: { xs: 120, md: 150 },
                  objectFit: "cover",
                }}
              />
              <Box sx={{ p: { xs: 1.75, md: 2 } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.05rem", md: "1.15rem" },
                    color: theme.palette.text.secondary,
                  }}
                >
                  {translate(opt.labelKey)}
                </Typography>
                {opt.priceKey && (
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.primary.dark, fontWeight: 600 }}
                  >
                    {translate(opt.priceKey)}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
