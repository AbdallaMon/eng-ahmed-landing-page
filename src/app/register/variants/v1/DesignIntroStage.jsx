"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import gsap from "gsap";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { liftTitle } from "@/app/register/core/cards3d/titleMorph";
import colors from "@/app/register/theme/colors";
import { dur, prefersReducedMotion } from "@/app/register/variants/v1/v1Motion";

/**
 * The DESIGN intro beat, over the full-screen hero photo (provided by
 * `PerspectiveStage`). A staged, readable word choreography the owner asked for:
 *
 *   1. "تصميم / Design" assembles and HOLDS long enough to read (it no longer
 *      flashes away).
 *   2. "داخلي / Interior" JOINS it → the full term "تصميم داخلي / Interior Design".
 *   3. The qualifier "داخلي / Interior" LEAVES again (slides + dissolves).
 *   4. "تصميم / Design" RISES toward the top of the frame and settles there,
 *      handing the stage to the email step (which `useLeadFlow` auto-advances to
 *      after `introHoldMs`, timed to this rise) — the email form then enters
 *      gently underneath.
 *
 * The two words are rendered in LOGICAL order per language (RTL: main then
 * qualifier → "تصميم داخلي"; LTR: qualifier then main → "Interior Design"), so a
 * row flex with the document direction reads correctly both ways.
 *
 * Self-timed + purely decorative; it never blocks the flow. Reduced motion just
 * shows the word.
 */
export default function DesignIntroStage() {
  const { translate, lng } = useLanguage();
  const isRtl = lng === "ar";
  const groupRef = useRef(null);
  const mainRef = useRef(null);
  const qualRef = useRef(null);

  useEffect(() => {
    const group = groupRef.current;
    const main = mainRef.current;
    const qual = qualRef.current;
    if (!group || !main || !qual) return undefined;

    if (prefersReducedMotion()) {
      gsap.set([main, qual], { opacity: 1, clearProps: "transform,filter" });
      gsap.set(group, { opacity: 1, y: 0, scale: 1 });
      return undefined;
    }

    // The qualifier slides in from the side toward the main word (RTL → it sits
    // to the LEFT of "تصميم", so it arrives from the left).
    const qualFrom = isRtl ? -38 : 38;

    const tl = gsap.timeline();
    // 1) "تصميم داخلي" appears COMPLETE — both words together, a gentle fade + soft
    //    rise (no staggered join, no hard 3D flip; the old one read as harsh).
    tl.fromTo(
      [main, qual],
      { opacity: 0, y: 24, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: dur(0.5), ease: "power3.out" },
      0,
    );
    // 2) Brief hold so it reads, then "داخلي" LEAVES.
    tl.to(
      qual,
      { opacity: 0, x: qualFrom * 0.6, duration: dur(0.3), ease: "power2.in" },
      dur(1.05),
    );
    // 3+4) "تصميم" flies up into the journey breadcrumb's category token at the
    //      SAME size it just read at — the owner wants no grow once "داخلي" leaves
    //      (centerScale: 1 → the word keeps its size, only shrinking later as it
    //      DOCKS into the smaller breadcrumb token via `landTitle`). Hide the
    //      original group so only the clone reads — one continuous move, no second
    //      copy. `useLeadFlow.introHoldMs` advances to email just after this fires.
    tl.call(
      () => {
        liftTitle(main, { color: colors.primary, centerScale: 1 });
        gsap.set(group, { opacity: 0 });
      },
      null,
      dur(1.3),
    );

    return () => tl.kill();
  }, [isRtl]);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1000px",
        px: 3,
      }}
    >
      <Box
        ref={groupRef}
        sx={{
          willChange: "transform, opacity",
          transformStyle: "preserve-3d",
        }}
      >
        <Box
          dir={isRtl ? "rtl" : "ltr"}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "center",
            gap: { xs: 1.4, md: 2 },
          }}
        >
          {isRtl ? (
            <>
              <Word innerRef={mainRef} text={translate("category.design")} />
              <Word innerRef={qualRef} text={translate("register.designQualifier")} />
            </>
          ) : (
            <>
              <Word innerRef={qualRef} text={translate("register.designQualifier")} />
              <Word innerRef={mainRef} text={translate("category.design")} />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/** One word of the intro phrase. Both words ("تصميم" and "داخلي") are rendered at
 *  the SAME size — the owner wants "تصميم" to match "داخلي", no size hierarchy. */
function Word({ innerRef, text }) {
  return (
    <Box
      ref={innerRef}
      component="span"
      sx={{
        display: "inline-block",
        opacity: 0,
        whiteSpace: "pre",
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
        color: "#fff",
        fontWeight: 800,
        lineHeight: 1.02,
        letterSpacing: "-0.02em",
        textShadow: "0 8px 40px rgba(0,0,0,0.55)",
        fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.4rem" },
      }}
    >
      {text}
    </Box>
  );
}
