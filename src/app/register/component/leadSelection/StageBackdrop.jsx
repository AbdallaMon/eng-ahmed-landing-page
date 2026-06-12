"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@mui/material";

import { backdropFade, expandTransition } from "@/app/register/lib/animations";

const MotionDiv = motion.create("div");

// Warm brand gradient — keeps the photo readable while gold titles + option
// cards sit on top of it. Mirrors the original design's identity.
const OVERLAY =
  "linear-gradient(169deg, rgba(45,35,30,0.55) 0%, rgba(45,35,30,0.86) 100%)";

/**
 * The full-screen image backdrop the lead-selection flow lives on.
 *
 * The DESIGN photo simply scales/fades in on load (no card morph). When a
 * location is chosen, its photo grows ON TOP of the design photo via a shared
 * `layoutId` — and the design photo is NOT removed underneath until the new one
 * has fully covered it (no flash/gap between images).
 *
 * Purely decorative (aria-hidden), sits behind the interactive content.
 *
 * @param {{ image: string | null, layoutId?: string, expandDelay?: number }} props
 */
export function StageBackdrop({ image, layoutId, expandDelay = 0 }) {
  // Design steps (no layoutId) share ONE key so the backdrop never remounts as
  // the flow moves designIntro → email → location; the location/item step gets
  // its own keyed element that morphs in on top.
  const key = layoutId || "stage-design";
  // The morphing (location) layer sits ABOVE the design layer so it covers it as
  // it grows; the design layer stays beneath until the cover is complete.
  const zIndex = layoutId ? 1 : 0;

  return (
    <AnimatePresence>
      {image && (
        <MotionDiv
          key={key}
          layoutId={layoutId}
          aria-hidden
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: {
                opacity: backdropFade(),
                layout: expandTransition(expandDelay),
              },
            },
            // Don't fade out early — hold full opacity while the incoming photo
            // (or colour panel) grows to cover, THEN fade out underneath it. No
            // flash/gap: the old photo is never removed before the new covers.
            exit: {
              opacity: [1, 1, 0],
              transition: { duration: 1.5, times: [0, 0.82, 1], ease: "linear" },
            },
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: "fixed",
            inset: 0,
            zIndex,
            overflow: "hidden",
          }}
        >
          <Box
            component={motion.img}
            src={image}
            alt=""
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box style={{ position: "absolute", inset: 0, background: OVERLAY }} />
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
