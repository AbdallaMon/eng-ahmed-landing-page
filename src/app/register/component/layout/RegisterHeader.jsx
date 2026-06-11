"use client";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdRestartAlt } from "react-icons/md";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

/**
 * Fixed top header for the lead-selection pages: logo, language switcher,
 * the GSAP reverse (back) button, and a reset / start-over control.
 *
 * The `.reverse-button` className is a GSAP hook — keep it verbatim.
 *
 * @param {{
 *   sx?: object,
 *   reverseAnimation?: Function,
 *   onReset?: Function,
 *   canReset?: boolean,
 * }} props
 */
export function RegisterHeader({ sx, reverseAnimation, onReset, canReset }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
          background: theme.palette.background.paper,
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
        {reverseAnimation && (
          <Box
            className="reverse-button"
            onClick={() => reverseAnimation()}
            sx={{
              ...(isRtl ? { right: 0 } : { left: 0 }),
              display: "none",
              zIndex: 2000,
              backgroundColor: "primary.main",
              color: "white",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              cursor: "pointer",
              position: "absolute",
            }}
          >
            <IoArrowBackOutline size={26} />
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src="/main-logo.jpg"
            alt="Dream Studio - Dream Design & Luxurious Home Solutions"
            className="logo"
            style={{ marginLeft: isMobile ? "-20px" : "-24px" }}
            sx={{ height: 0, width: "auto" }}
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
