"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { gsap } from "gsap";
import { StepCard } from "./StepCard";
import colors from "@/app/register/theme/colors";

/**
 * Renders the image-card grid for a SELECT step.
 *
 * GSAP: cards fade/stagger in on mount (`.step-select-card`), and selecting a
 * card flashes it (`.step-select-flash`) then fades the whole grid out before
 * advancing. The animation runs inside a gsap.context scoped to this container.
 */
export function StepItemGrid({ step, onNext, isSubmitting, formData }) {
  const containerRef = useRef(null);
  const [isAnimatingSelection, setIsAnimatingSelection] = useState(false);
  const selected = formData?.[step.field];

  useLayoutEffect(() => {
    if (!containerRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".step-select-card",
        { opacity: 0, y: 22, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.06,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [step.id]);

  const handleSelect = async (itemValue) => {
    if (isSubmitting || isAnimatingSelection || !containerRef.current) return;

    setIsAnimatingSelection(true);

    const selectedCard = containerRef.current.querySelector(
      `[data-value="${itemValue}"]`,
    );
    const allCards = containerRef.current.querySelectorAll(".step-select-card");

    const tl = gsap.timeline();

    if (selectedCard) {
      tl.to(selectedCard, {
        scale: 1.08,
        duration: 0.28,
        ease: "power2.out",
      })
        .to(
          selectedCard.querySelector(".step-select-flash"),
          { opacity: 0.4, duration: 0.2, ease: "power2.out" },
          "<",
        )
        .to(selectedCard, {
          scale: 1,
          duration: 0.24,
          ease: "power2.inOut",
        })
        .to(
          selectedCard.querySelector(".step-select-flash"),
          { opacity: 0, duration: 0.18, ease: "power2.inOut" },
          "<",
        );
    }

    tl.to(allCards, {
      opacity: 0,
      y: -16,
      scale: 0.98,
      duration: 0.42,
      ease: "power2.inOut",
      stagger: 0.04,
    });

    await new Promise((resolve) => {
      tl.eventCallback("onComplete", resolve);
      tl.play();
    });

    const didAdvance = await onNext(itemValue);

    if (!didAdvance) {
      gsap.to(allCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.04,
      });
      setIsAnimatingSelection(false);
      return;
    }

    setIsAnimatingSelection(false);
  };

  return (
    <Box ref={containerRef} sx={{ position: "relative" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
          gap: 2,
          opacity: isSubmitting || isAnimatingSelection ? 0.5 : 1,
          pointerEvents: isSubmitting || isAnimatingSelection ? "none" : "auto",
          transition: "opacity 0.2s",
        }}
      >
        {step.items.map((item) => (
          <StepCard
            key={item.value}
            item={item}
            onSelect={handleSelect}
            isDisabled={isSubmitting || isAnimatingSelection}
            isActive={selected === item.value}
          />
        ))}
      </Box>

      {/* Loading overlay while awaiting step-1 lead creation. */}
      {isSubmitting && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      )}
    </Box>
  );
}
