"use client";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme, alpha, darken, lighten } from "@mui/material/styles";

const BASE = {
  primary: "#594534", // اللون الرئيسي
  secondary: "#A4978D", // اللون الثانوي
  highlight: "#D7CCC4", // هايت لايت
  highlightDark: "#C19877", // هايت لايت غامق
  white: "#EBE7DF", // الأبيض (أوف وايت دافئ)
  solidWhite: "#FFFFFF", // الأبيض الصافي
};

function buildTheme({ dir = "ltr", mode = "light" } = {}) {
  const primaryMain = BASE.primary;
  const secondaryMain = BASE.secondary;

  const primaryLight = lighten(primaryMain, 0.18);
  const primaryDark = darken(primaryMain, 0.18);

  const secondaryLight = lighten(secondaryMain, 0.18);
  const secondaryDark = darken(secondaryMain, 0.18);

  const bgDefault = mode === "light" ? BASE.solidWhite : "#1E1A16";
  const paperBg = mode === "light" ? alpha(BASE.white, 0.96) : "#2A241F";
  const textPrimary = mode === "light" ? "#3a3028" : "#f2eee8";
  const textSecondary = mode === "light" ? "#6d6259" : alpha("#f2eee8", 0.7);

  return createTheme({
    direction: dir,
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: secondaryMain,
        light: secondaryLight,
        dark: secondaryDark,
        contrastText: "#FFFFFF",
      },
      info: { main: BASE.highlight },
      warning: { main: BASE.highlightDark },
      background: {
        default: bgDefault,
        paper: paperBg,
      },
      common: {
        white: BASE.white,
        black: "#1a1410",
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: alpha(textSecondary, 0.4),
      },
      action: {
        hover: alpha(primaryMain, 0.08),
        selected: alpha(primaryMain, 0.16),
        disabled: alpha(primaryMain, 0.26),
        disabledBackground: alpha(primaryMain, 0.08),
        focus: alpha(primaryMain, 0.24),
      },
      // متاح للاستخدام في الـ styles: theme.palette.gradients.primary
      gradients: {
        primary: `linear-gradient(135deg, ${BASE.highlightDark} 0%, ${primaryMain} 100%)`,
      },
    },
    shape: { borderRadius: 12 },
    spacing: 8,
    zIndex: { modal: 1300, snackbar: 1500 },
    typography: {
      fontFamily: ["Noto Kufi Arabic", "system-ui", "sans-serif"].join(","),
      h1: { fontWeight: 700, letterSpacing: "-.02em", color: textPrimary },
      h2: { fontWeight: 700, letterSpacing: "-.02em", color: textPrimary },
      h3: { fontWeight: 600, color: textPrimary },
      body1: { color: textPrimary },
      body2: { color: textSecondary },
      button: { textTransform: "none", fontWeight: 600 },
    },
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536, xxl: 1920 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": { colorScheme: mode },
          body: {
            backgroundColor: bgDefault,
            color: textPrimary,
            direction: dir,
          },
          "::selection": { background: BASE.highlight, color: "#1a1410" },
          "::-moz-selection": { background: BASE.highlight, color: "#1a1410" },
          // Scrollbars ألطف
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(primaryMain, 0.3),
            borderRadius: 8,
          },
          "*::-webkit-scrollbar-track": {
            backgroundColor: alpha(primaryMain, 0.06),
          },
        },
      },
      MuiContainer: {
        defaultProps: { maxWidth: "lg" },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: paperBg,
            borderRadius: 16,
            boxShadow:
              mode === "light"
                ? "0 8px 24px rgba(0,0,0,.06)"
                : "0 8px 24px rgba(0,0,0,.40)",
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, paddingInline: 20, paddingBlock: 10 },
          containedPrimary: {
            background: `linear-gradient(135deg, ${BASE.highlightDark}, ${primaryMain})`,
            ":hover": { filter: "brightness(0.95)" },
          },
          outlined: {
            borderColor: alpha(primaryMain, 0.4),
            ":hover": {
              borderColor: alpha(primaryMain, 0.8),
              background: alpha(primaryMain, 0.06),
            },
          },
          textPrimary: { ":hover": { background: alpha(primaryMain, 0.08) } },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: primaryMain,
            textUnderlineOffset: 4,
            ":hover": { textDecorationColor: alpha(primaryMain, 0.4) },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12 },
          notchedOutline: { borderColor: alpha(primaryMain, 0.25) },
          input: { "::placeholder": { opacity: 0.7 } },
        },
      },
      MuiFormLabel: {
        styleOverrides: { root: { color: alpha(textPrimary, 0.7) } },
      },
      MuiSvgIcon: {
        styleOverrides: { root: { color: textSecondary } },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 10 },
          colorPrimary: {
            background: alpha(primaryMain, 0.15),
            color: primaryMain,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#1a1410",
            color: BASE.white,
            borderRadius: 8,
            fontSize: 12,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": {
              color: primaryMain,
              "+ .MuiSwitch-track": {
                backgroundColor: alpha(primaryMain, 0.5),
              },
            },
          },
        },
      },
    },
  });
}

const cacheRtl = createCache({ key: "muirtl", stylisPlugins: [rtlPlugin] });
const cacheLtr = createCache({ key: "muiltr" });

export default function MUIProviders({ children, lng = "ar", mode = "light" }) {
  const dir = lng === "ar" ? "rtl" : "ltr";
  const cache = dir === "rtl" ? cacheRtl : cacheLtr;
  const theme = buildTheme({ dir, mode });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
