"use client";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import colors from "@/app/register/theme/colors";

/**
 * A single selectable item in the lead type list (e.g. Apartment, Villa).
 *
 * @param {{
 *   title: string,
 *   value: string,
 *   subtitle?: string,
 *   onClick: Function,
 * }} props
 */
export function LeadCategoryItem({ title, value, subtitle, onClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      className="lead-item"
      onClick={() => onClick(value)}
      sx={{
        width: "100%",
        padding: isMobile ? "16px" : "24px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: colors.bgPrimary,
        textAlign: "center",
        fontWeight: 500,
        opacity: 0,
        cursor: "pointer",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 400, color: "inherit" }}
        >
          {subtitle} AED
        </Typography>
      )}
    </Box>
  );
}
