"use client";
import { motion } from "framer-motion";

import colors from "@/app/register/theme/colors";
import { expandTransition } from "@/app/register/lib/animations";

const MotionDiv = motion.create("div");

/**
 * Full-screen panel the SELECTED item row expands into — the "box grows to fill
 * the screen" mechanic, as a calm light surface (no photo, no colour flip).
 *
 * It shares the selected row's `layoutId` (`item-{value}`), so framer morphs the
 * chosen option row up to full-screen. The row is already light (a soft gold
 * HIGHLIGHT, not a gold fill) and the panel is the same calm light tone, so the
 * morph is a pure SIZE growth — the card simply expands to fill the screen and
 * becomes the form's surface, with no jarring gold → light wash.
 *
 * Deliberately NOT wrapped in AnimatePresence: on the way back the panel must
 * SHRINK back into the chosen card, which framer does as a clean `layoutId`
 * transfer (panel unmounts ↔ card mounts in the same commit). An exit fade would
 * keep two elements sharing the id at once and break that reverse morph.
 *
 * Purely the backdrop layer (aria-hidden); the heading + inputs render above it.
 * Renders nothing until an item has been chosen.
 *
 * @param {{ layoutId?: string }} props
 */
export function ItemExpandPanel({ layoutId }) {
  if (!layoutId) return null;
  return (
    <MotionDiv
      key={layoutId}
      layoutId={layoutId}
      aria-hidden
      // No colour flip. The panel grows in ONE calm light tone — the form's own
      // surface — so the chosen card simply EXPANDS to fill the screen (the
      // signature "box grows") instead of flashing gold → light.
      transition={{
        // Grow promptly to cover the dark photo so the form lands on a clean
        // light surface (no dark edges peeking around it). On the way back the
        // CARD owns the reverse (shrink) transition.
        layout: expandTransition(0.1),
      }}
      style={{
        // Above the photo backdrops (incl. a lingering location photo) so the
        // panel grows OVER them and stays clean under the form.
        position: "fixed",
        inset: 0,
        zIndex: 2,
        backgroundColor: colors.bgSecondary,
      }}
    />
  );
}
