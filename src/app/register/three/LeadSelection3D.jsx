"use client";
import { useEffect, useRef } from "react";
import { Box, Stack, Typography } from "@mui/material";

import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import {
  designLead,
  designLeadTypes,
  DesignLeadPrice,
  LeadType,
} from "@/app/register/data/constants";
import Card3D from "@/app/register/three/cards/Card3D";
import {
  playEntrance,
  playOpen,
} from "@/app/register/three/cards/cardChoreography";
import { EmailCaptureCard } from "@/app/register/component/forms/EmailCaptureCard";

// A glass surface for the cards so titles/forms stay legible over the live scene.
const GLASS = {
  backgroundColor: "rgba(28, 22, 17, 0.42)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 22px 60px rgba(0,0,0,0.45)",
};

/**
 * The WebGL-path lead selection: every step is a deck of real DOM cards that
 * are themselves 3D (perspective + preserve-3d, GSAP). The "next cards appear in
 * 3D" beat is `playEntrance`; selecting a card flies it at the viewer, opens it
 * onto the matching WebGL scene (`onPreviewScene` switches the scene behind the
 * covering card), then advances the flow. The 2D fallback keeps its own view.
 *
 * @param {{
 *   step: "email" | "location" | "item",
 *   location?: string,
 *   leadItem?: string,
 *   onEmailSubmit: (email: string) => void,
 *   onLocationSelect: (value: string) => void,
 *   onItemSelect: (value: string) => void,
 *   onPreviewScene: (sceneKey: string) => void,
 * }} props
 */
export default function LeadSelection3D({
  step,
  location,
  leadItem,
  onEmailSubmit,
  onLocationSelect,
  onItemSelect,
  onPreviewScene,
}) {
  const { translate } = useLanguage();
  const cardsRef = useRef([]);
  const flashRef = useRef(null);
  const opening = useRef(false);

  // Each step's deck plays its 3D entrance on mount; the open-guard resets so the
  // new deck is selectable.
  useEffect(() => {
    opening.current = false;
    // Defer one frame so freshly-mounted card refs are attached.
    const id = requestAnimationFrame(() =>
      playEntrance(cardsRef.current.filter(Boolean)),
    );
    return () => cancelAnimationFrame(id);
  }, [step]);

  const select = (index, value, advance) => {
    if (opening.current) return;
    opening.current = true;
    const cards = cardsRef.current.filter(Boolean);
    const chosen = cardsRef.current[index];
    const others = cards.filter((el) => el !== chosen);
    playOpen({
      chosen,
      others,
      flash: flashRef.current,
      onReveal: () => onPreviewScene(value),
      onDone: () => advance(value),
    });
  };

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/* Brand flash bloomed at the peak of a card opening onto its scene. */}
      <Box
        ref={flashRef}
        aria-hidden
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 5,
          display: "none",
          opacity: 0,
          pointerEvents: "none",
          background: `radial-gradient(60% 60% at 50% 45%, ${colors.primaryAlt} 0%, rgba(45,35,30,0.85) 70%, rgba(28,22,17,0.95) 100%)`,
        }}
      />

      {step === "email" && (
        <Box sx={{ maxWidth: 520, mx: "auto" }}>
          <Card3D
            interactive={false}
            cardRef={(el) => (cardsRef.current[0] = el)}
            sx={{ ...GLASS, borderRadius: "24px", p: { xs: 3, md: 4 } }}
          >
            <EmailCaptureCard onSubmit={onEmailSubmit} />
          </Card3D>
        </Box>
      )}

      {step === "location" && (
        <Box>
          <DeckHeading text={translate("form.chooseFromOptions")} />
          <Box
            sx={{
              display: "grid",
              gap: { xs: 2.5, md: 3 },
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              maxWidth: 760,
              mx: "auto",
            }}
          >
            {designLeadTypes.map((lead, i) => (
              <MediaCard
                key={lead.value}
                cardRef={(el) => (cardsRef.current[i] = el)}
                image={lead.image}
                alt={lead.alt}
                title={translate(lead.title)}
                hint={translate("register.locationCardHint")}
                selected={location === lead.value}
                onClick={() => select(i, lead.value, onLocationSelect)}
              />
            ))}
          </Box>
        </Box>
      )}

      {step === "item" && (
        <Box>
          <DeckHeading text={translate("register.chooseItemTitle")} />
          <Box
            sx={{
              display: "grid",
              gap: { xs: 2.5, md: 3 },
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              maxWidth: 920,
              mx: "auto",
            }}
          >
            {designLead.map((lead, i) => (
              <GradientCard
                key={lead.value}
                cardRef={(el) => (cardsRef.current[i] = el)}
                index={i}
                title={translate(LeadType[lead.value])}
                price={
                  DesignLeadPrice[lead.value]
                    ? translate(DesignLeadPrice[lead.value])
                    : null
                }
                selected={leadItem === lead.value}
                onClick={() => select(i, lead.value, onItemSelect)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function DeckHeading({ text }) {
  return (
    <Stack spacing={1} sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 800,
          color: "common.white",
          fontSize: { xs: "1.5rem", md: "2rem" },
          textShadow: "0 2px 18px rgba(0,0,0,0.6)",
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

// A location card: image clipped in its own (flattened) media layer, with the
// gold title popping FORWARD in 3D (translateZ) so the card has real depth.
function MediaCard({ cardRef, image, alt, title, hint, selected, onClick }) {
  return (
    <Card3D
      cardRef={cardRef}
      onClick={onClick}
      ariaLabel={title}
      radius={22}
      sx={{
        minHeight: { xs: 210, md: 280 },
        boxShadow: selected
          ? `0 0 0 3px ${colors.primary}, 0 24px 50px rgba(0,0,0,0.5)`
          : "0 18px 44px rgba(0,0,0,0.45)",
      }}
    >
      {/* media layer (overflow hidden flattens only itself — keeps the card's
          preserve-3d intact) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "22px",
          overflow: "hidden",
          transform: "translateZ(0px)",
        }}
      >
        <Box
          component="img"
          src={image}
          alt={alt}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(169deg, rgba(45,35,30,0.28) 0%, rgba(45,35,30,0.88) 100%)",
          }}
        />
      </Box>
      {/* depth layer: title + hint float forward */}
      <Stack
        spacing={0.75}
        alignItems="center"
        justifyContent="center"
        sx={{
          position: "absolute",
          inset: 0,
          px: 2,
          textAlign: "center",
          transform: "translateZ(48px)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            letterSpacing: "0.5px",
            fontSize: { xs: "1.55rem", md: "2rem" },
            textShadow: "0 2px 14px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: 500,
            textShadow: "0 1px 8px rgba(0,0,0,0.6)",
          }}
        >
          {hint}
        </Typography>
      </Stack>
    </Card3D>
  );
}

// An item card: a brand gradient face with the title + price popping forward.
const ITEM_GRADIENTS = [
  `linear-gradient(155deg, ${colors.primary} 0%, ${colors.secondaryDark} 100%)`,
  `linear-gradient(155deg, ${colors.secondary} 0%, ${colors.primaryDark} 100%)`,
  `linear-gradient(155deg, ${colors.primaryDark} 0%, ${colors.heading} 100%)`,
];

function GradientCard({ cardRef, index, title, price, selected, onClick }) {
  return (
    <Card3D
      cardRef={cardRef}
      onClick={onClick}
      ariaLabel={title}
      radius={22}
      sx={{
        minHeight: { xs: 168, md: 230 },
        boxShadow: selected
          ? `0 0 0 3px ${colors.primaryAlt}, 0 24px 50px rgba(0,0,0,0.5)`
          : "0 18px 44px rgba(0,0,0,0.45)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "22px",
          overflow: "hidden",
          transform: "translateZ(0px)",
          background: ITEM_GRADIENTS[index % ITEM_GRADIENTS.length],
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)",
          }}
        />
      </Box>
      <Stack
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{
          position: "absolute",
          inset: 0,
          px: 2,
          textAlign: "center",
          transform: "translateZ(46px)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.25,
            fontSize: { xs: "1.25rem", md: "1.5rem" },
            textShadow: "0 2px 12px rgba(0,0,0,0.45)",
          }}
        >
          {title}
        </Typography>
        {price && (
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.92)",
              fontWeight: 600,
              textShadow: "0 1px 8px rgba(0,0,0,0.4)",
            }}
          >
            {price}
          </Typography>
        )}
      </Stack>
    </Card3D>
  );
}
