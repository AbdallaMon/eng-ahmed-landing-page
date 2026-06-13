"use client";
import { Box } from "@mui/material";
import colors from "@/app/register/theme/colors";

// Shown when WebGL is unavailable / motion is reduced / low-power. Keeps the
// section on-brand without any WebGL cost. The existing DOM flow renders on top.
export default function Backdrop2D() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: `radial-gradient(120% 90% at 50% 10%, ${colors.primaryAlt} 0%, ${colors.bgPrimary} 45%, ${colors.bgTertiary} 100%)`,
      }}
    />
  );
}
