"use client";
import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { landTitle, registerSlot } from "@/app/register/core/cards3d/titleMorph";
import { dur } from "@/app/register/variants/v1/v1Motion";
import colors from "@/app/register/theme/colors";

/**
 * The persistent JOURNEY title that lives at the top of the V1 flow and
 * ACCUMULATES the user's choices as one continuous breadcrumb — never disappears,
 * only grows:
 *
 *   تصميم  →  تصميم داخل الإمارات  →  (line 2) فيلا
 *
 * Each token is the SAME word that flew up off its card (or the intro): a token
 * mounts HIDDEN and calls `landTitle` so the floating clone lifted on selection
 * lands exactly on its slot, then it reveals (the clone cross-dissolves out).
 * There is no duplicate copy of the word anywhere else — the card label IS this
 * token, mid-flight. On a deep-link (no clone in flight) the token just shows.
 *
 * Line 1 = category + location (the path); line 2 = the chosen item (the focus).
 *
 * @param {{
 *   tokens: Array<{ key: string, text: string, line: 1|2, primary?: boolean }>,
 *   isRtl: boolean,
 * }} props
 */
export default function JourneyBreadcrumb({ tokens, isRtl }) {
  const line1 = tokens.filter((t) => t.line === 1);
  const line2 = tokens.filter((t) => t.line === 2);

  return (
    <Box
      dir={isRtl ? "rtl" : "ltr"}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 0.25, md: 0.5 },
        textAlign: "center",
        pointerEvents: "none",
        minHeight: 1, // reserve a little space so the stage below doesn't jump
      }}
    >
      {line1.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "center",
            gap: { xs: 0.9, md: 1.2 },
            flexWrap: "wrap",
          }}
        >
          {line1.map((t) => (
            <Token key={t.key} token={t} line={1} />
          ))}
        </Box>
      )}
      {line2.map((t) => (
        <Token key={t.key} token={t} line={2} />
      ))}
    </Box>
  );
}

/** One accumulated token: hidden until the flying word lands on it. */
function Token({ token, line }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  // Register this slot so the BACK navigation can lift this exact word back off
  // the breadcrumb toward its card.
  useEffect(() => {
    registerSlot(token.key, ref.current);
    return () => registerSlot(token.key, null);
  }, [token.key]);

  useEffect(() => {
    // The clone was lifted on selection and is holding at the top; let layout
    // settle a frame, then fly it onto this slot. If nothing is in flight (e.g.
    // a deep-link), `landTitle` reveals immediately.
    const id = setTimeout(
      () => landTitle(ref.current, { onLanded: () => setShown(true) }),
      dur(0.18) * 1000,
    );
    return () => clearTimeout(id);
  }, []);

  return (
    <Box
      ref={ref}
      component="span"
      sx={{
        whiteSpace: "nowrap",
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: "-0.01em",
        color: token.primary ? colors.primary : "#fff",
        textShadow: "0 3px 18px rgba(0,0,0,0.55)",
        fontSize:
          line === 2
            ? { xs: "1.25rem", md: "1.6rem" }
            : { xs: "1.15rem", md: "1.5rem" },
        opacity: shown ? 1 : 0,
        transition: "opacity 0.28s ease",
      }}
    >
      {token.text}
    </Box>
  );
}
