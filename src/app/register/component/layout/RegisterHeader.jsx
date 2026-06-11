"use client";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  Toolbar,
} from "@mui/material";
import { MdRestartAlt } from "react-icons/md";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

/**
 * Fixed top header for the lead-selection pages: logo, language switcher and a
 * reset / start-over control. Back navigation now lives in the flow itself.
 *
 * @param {{
 *   sx?: object,
 *   onReset?: Function,
 *   canReset?: boolean,
 * }} props
 */
export function RegisterHeader({ sx, onReset, canReset }) {
  const { lng, changeLanguage, translate } = useLanguage();
  const isRtl = lng === "ar";

  return (
    <Container
      maxWidth="md"
      sx={{ top: 8, left: 0, right: 0, position: "fixed", zIndex: 4001 }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          bgcolor: "background.paper",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.12)",
          margin: "0 12px",
          backgroundImage: "url('/logo-bg-full.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left",
          overflow: "hidden",
          flexDirection: isRtl ? "row-reverse" : "row",
          ...sx,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src="/main-logo.jpg"
            alt="Dream Studio - Dream Design & Luxurious Home Solutions"
            sx={{ height: 44, width: "auto", display: "block" }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onReset && canReset && (
            <Button
              onClick={() => onReset()}
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<MdRestartAlt size={18} />}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                whiteSpace: "nowrap",
                backgroundColor: "rgba(255,255,255,0.85)",
                ...(isRtl && { "& .MuiButton-startIcon": { ml: 0.5, mr: -0.5 } }),
              }}
            >
              {translate("button.startOver")}
            </Button>
          )}

          <Select
            value={lng}
            onChange={(event) => changeLanguage(event.target.value)}
            variant="outlined"
            size="small"
            sx={{
              color: "primary.main",
              minWidth: 80,
              backgroundColor: "rgba(255,255,255,0.85)",
              borderRadius: "12px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent",
              },
            }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">العربية</MenuItem>
          </Select>
        </Box>
      </Toolbar>
    </Container>
  );
}
