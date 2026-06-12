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
import { IoArrowBack } from "react-icons/io5";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

/**
 * Fixed top header for the lead-selection pages: a leading Back control plus a
 * language switcher and a reset / start-over control. Back lives INSIDE the
 * header (not in the page flow) so it stays anchored to the top chrome.
 *
 * @param {{
 *   sx?: object,
 *   onReset?: Function,
 *   canReset?: boolean,
 *   onBack?: Function,
 *   canGoBack?: boolean,
 *   disabled?: boolean,
 * }} props
 */
export function RegisterHeader({
  sx,
  onReset,
  canReset,
  onBack,
  canGoBack,
  disabled = false,
}) {
  const { lng, changeLanguage, translate } = useLanguage();
  const isRtl = lng === "ar";

  // One shared "glass pill" recipe so Back / Reset / Language are visually
  // identical: same fixed height, same radius, same translucent surface and
  // soft shadow, no hard borders. Each control then only adds what's unique to
  // it (icon spacing, the Select's inner alignment).
  const PILL_HEIGHT = 36;
  const pillSx = {
    height: PILL_HEIGHT,
    minHeight: PILL_HEIGHT,
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    whiteSpace: "nowrap",
    color: "primary.main",
    backgroundColor: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(6px)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
    "&:hover": { backgroundColor: "rgba(255,255,255,0.95)" },
  };

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
        {/* Leading: Back — anchored in the header chrome, shown once past
            email capture. */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {onBack && canGoBack && (
            <Button
              onClick={() => onBack()}
              disabled={disabled}
              variant="text"
              size="small"
              startIcon={
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    transform: isRtl ? "scaleX(-1)" : "none",
                  }}
                >
                  <IoArrowBack size={18} />
                </Box>
              }
              sx={{
                ...pillSx,
                px: 1.5,
                ...(isRtl && { "& .MuiButton-startIcon": { ml: 0.5, mr: -0.5 } }),
              }}
            >
              {translate("register.back")}
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onReset && canReset && (
            <Button
              onClick={() => onReset()}
              disabled={disabled}
              variant="text"
              size="small"
              startIcon={<MdRestartAlt size={18} />}
              sx={{
                ...pillSx,
                px: 1.5,
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
              ...pillSx,
              minWidth: 96,
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                height: PILL_HEIGHT,
                py: 0,
                boxSizing: "border-box",
              },
              "& .MuiSelect-icon": { color: "primary.main" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
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
