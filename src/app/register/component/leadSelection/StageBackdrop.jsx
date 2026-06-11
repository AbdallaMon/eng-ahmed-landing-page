"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@mui/material";

import { backdropFade } from "@/app/register/lib/animations";

const MotionDiv = motion.create("div");

// Warm brand gradient — keeps the photo readable while gold titles + option
// cards sit on top of it. Mirrors the original design's identity.
const OVERLAY =
  "linear-gradient(169deg, rgba(45,35,30,0.55) 0%, rgba(45,35,30,0.86) 100%)";

/**
 * The full-screen image backdrop that the lead-selection flow expands into.
 *
 * This is the persistent "what fills the screen" layer. A selected image card
 * morphs into it via a shared `layoutId` (see `LeadSelectionFlow`); once
 * expanded, this component simply holds the active photo (design intro, then
 * the chosen location) and cross-fades when that photo changes.
 *
 * It is purely decorative (aria-hidden) and sits behind the interactive
 * content. When no image is active it renders nothing.
 *
 * @param {{ image: string | null, layoutId?: string }} props
 */
export function StageBackdrop({ image, layoutId }) {
  return (
    // Key by layoutId so each stage mounts a FRESH backdrop element: framer then
    // morphs it from the just-unmounted card sharing that same layoutId (the
    // DESIGN intro card, then the selected location card) — i.e. the card grows
    // to fill the screen on EVERY step, not just the first.
    <AnimatePresence>
      {image && (
        <MotionDiv
          key={layoutId || "stage-backdrop"}
          layoutId={layoutId}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropFade()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          {/* Cross-fade the photo itself when the active image changes. */}
          <AnimatePresence>
            <Box
              component={motion.img}
              key={image}
              src={image}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropFade()}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </AnimatePresence>
          <Box sx={{ position: "absolute", inset: 0, background: OVERLAY }} />
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
