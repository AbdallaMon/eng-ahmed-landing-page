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
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                whiteSpace: "nowrap",
                color: "primary.main",
                backgroundColor: "rgba(255,255,255,0.85)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.95)" },
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
