"use client";

import {
  createTheme,
  ScopedCssBaseline,
  ThemeProvider,
} from "@mui/material";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";
import { Noto_Kufi_Arabic } from "next/font/google";
import colors from "@/app/register/theme/colors";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

// Register-scoped emotion caches. Keys differ from the root site's caches so
// the two never collide.
const ltrCache = createCache({ key: "register-mui" });
const rtlCache = createCache({
  key: "register-mui-rtl",
  stylisPlugins: [rtlPlugin],
});

const noto = Noto_Kufi_Arabic({
  weight: ["400", "500", "700"],
  style: ["normal"],
  subsets: ["arabic"],
  display: "swap",
});

const themeConfig = {
  palette: {
    primary: {
      main: colors.primary,
      light: colors.primaryAlt,
      dark: colors.primaryDark,
      contrastText: "#ffffff",
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.secondaryText,
    },
    text: {
      primary: colors.textColor,
      secondary: colors.heading,
      white: "#ffffff",
      disabled: colors.textColor,
    },
    background: {
      default: colors.body,
      paper: colors.paperBg,
    },
    common: { white: colors.bgPrimary },
    action: {
      hover: colors.primaryAlt,
      selected: colors.bgSecondary,
    },
    gradient: { primary: colors.primaryGradient },
  },
  zIndex: {
    modal: 1300,
    snackbar: 1500,
  },
  typography: {
    fontFamily: [noto.style.fontFamily, "sans-serif"].join(","),
    h1: { color: colors.heading },
    h2: { color: colors.heading },
    h3: { color: colors.heading },
    body1: { color: colors.textColor },
    body2: { color: colors.secondaryText },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536, xxl: 1920 },
  },
  components: {
    MuiContainer: { defaultProps: { maxWidth: "xxl" } },
    MuiPaper: {
      styleOverrides: { root: { backgroundColor: colors.bgPrimary } },
    },
    MuiSvgIcon: {
      styleOverrides: { root: { color: colors.textColor } },
    },
    // Scoped reset background lives here instead of a global body override.
    MuiScopedCssBaseline: {
      styleOverrides: {
        root: {
          backgroundColor: colors.bgSecondary,
          fontFamily: [noto.style.fontFamily, "sans-serif"].join(","),
        },
      },
    },
  },
};

const theme = createTheme(themeConfig);
const themeRtl = createTheme({ ...themeConfig, direction: "rtl" });

/**
 * Nested MUI theme provider for the /register section.
 * Applies the gold/beige theme and a register-scoped stylis-rtl emotion cache.
 * Does NOT render <html>/<body> and does NOT apply a global CssBaseline — the
 * root layout owns the document. The scoped reset comes from ScopedCssBaseline.
 */
export default function RegisterThemeProvider({ lng = "ar", children }) {
  // Prefer the live language from context (flips theme + RTL cache on change),
  // falling back to the initial prop when rendered outside the provider.
  const language = useLanguage();
  const activeLng = language?.lng ?? lng;
  const isRtl = activeLng === "ar";
  return (
    <CacheProvider value={isRtl ? rtlCache : ltrCache}>
      <ThemeProvider theme={isRtl ? themeRtl : theme}>
        <ScopedCssBaseline
          className={noto.className}
          dir={isRtl ? "rtl" : "ltr"}
          lang={activeLng}
        >
          {children}
        </ScopedCssBaseline>
      </ThemeProvider>
    </CacheProvider>
  );
}
