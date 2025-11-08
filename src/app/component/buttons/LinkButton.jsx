import { colors } from "@/app/providers/MUIProvider";
import { Box, Button, lighten } from "@mui/material";

export function LinkButton({
  name,
  icon,
  href,
  bgColor = colors.primary,
  textColor = colors.white,
  borderColor,
  sx = {},
}) {
  return (
    <Button
      component="a"
      href={href}
      variant="contained"
      sx={{
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${lighten(borderColor, 0.85)}`,
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: { xs: "0.8rem", md: "1.1rem" },
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
