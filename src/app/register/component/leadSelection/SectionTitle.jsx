"use client";
import { Typography, useMediaQuery, useTheme } from "@mui/material";

/**
 * Section title with animated enter/exit via GSAP class names.
 *
 * @param {{ title: string, className: string }} props
 */
export function SectionTitle({ title, className }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isSmallTitle =
    className === "design-title" || className === "item-title";

  return (
    <Typography
      variant="h4"
      className={className}
      sx={{
        textAlign: "center",
        fontWeight: 700,
        color: theme.palette.primary.main,
        mb: 1,
        mt: 4.5,
        opacity: 0,
        minHeight: "80px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...(isMobile && isSmallTitle && { fontSize: "1.75rem" }),
      }}
    >
      {title}
    </Typography>
  );
}
