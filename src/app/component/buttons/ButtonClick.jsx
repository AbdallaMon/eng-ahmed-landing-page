"use client";
import { colors } from "@/app/data/constants";
import { handleOpenWhatsApp } from "@/app/utility/redirectToWhatsapp";
import { Box, Button, lighten } from "@mui/material";

export function ButtonClick({
  name,
  icon,
  bgColor = colors.primary,
  textColor = colors.white,
  borderColor,
  sx = {},
  onClick,
  lng = "ar",
  type,
}) {
  return (
    <Button
      variant="contained"
      onClick={type === "WHATSAPP" ? handleOpenWhatsApp : onClick}
      sx={{
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${lighten(borderColor, 0.85)}`,
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: { xs: "0.8rem", md: "1.1rem" },
        flexDirection: lng === "en" ? "row-reverse" : "row",
        paddingX: {
          xs: "14px",
          md: "20px",
        },
        ...sx,
      }}
    >
      {name}
      {icon && <Box component="img" src={icon} sx={{ width: "16px" }} />}
    </Button>
  );
}
