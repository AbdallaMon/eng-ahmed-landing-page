"use client";
import { AnimatePresence, motion } from "framer-motion";

import colors from "@/app/register/theme/colors";
import {
  expandTransition,
  panelSettleTransition,
} from "@/app/register/lib/animations";

const MotionDiv = motion.create("div");

/**
 * Full-screen panel the SELECTED item row expands into — the "box grows to fill
 * the screen" mechanic, but in COLOUR instead of a photo.
 *
 * It shares the selected row's `layoutId` (`item-{value}`), so framer morphs the
 * gold option row up to full-screen. It starts in the row's own brand-gold tone
 * (seamless with the row) then eases to a calm light tone so the form that
 * reveals on top of it (see `LeadSelectionFlow`) stays readable.
 *
 * Purely the backdrop layer (aria-hidden); the heading + inputs render above it.
 * Renders nothing until an item has been chosen.
 *
 * @param {{ layoutId?: string }} props
 */
export function ItemExpandPanel({ layoutId }) {
  return (
    <AnimatePresence>
      {layoutId && (
        <MotionDiv
          key={layoutId}
          layoutId={layoutId}
          aria-hidden
          initial={{ backgroundColor: colors.primary }}
          animate={{ backgroundColor: colors.bgSecondary }}
          exit={{ opacity: 0 }}
          transition={{
            // Hold so the item NAME visibly travels to its chip first, THEN the
            // background grows to fill the screen.
            layout: expandTransition(0.55),
            backgroundColor: panelSettleTransition(),
            opacity: { duration: 0.3 },
          }}
          style={{
            // Above the photo backdrops (incl. a lingering location photo) so
            // the colour panel grows OVER them and stays clean under the form.
            position: "fixed",
            inset: 0,
            zIndex: 2,
          }}
        />
      )}
    </AnimatePresence>
  );
}
