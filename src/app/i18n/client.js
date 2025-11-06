"use client";

import { useEffect } from "react";
import i18next from "i18next";
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from "react-i18next";
import { useCookies } from "react-cookie";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { cookieName, getOptions, languages } from "./locales/settings";

const runsOnServerSide = typeof window === "undefined";

// Init once on the client
if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(
      resourcesToBackend((language, namespace) =>
        import(`@/app/i18n/locales/${language}/${namespace}.js`)
      )
    )
    .init({
      ...getOptions(),
      lng: undefined, // let detector pick it
      detection: { order: ["path", "htmlTag", "cookie", "navigator"] },
      preload: runsOnServerSide ? languages : [],
    });
}

// Client hook
export function useTranslation(lng, ns, options) {
  const [cookies, setCookie] = useCookies([cookieName]);
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;

  // If the URL-provided lng differs, switch i18n
  useEffect(() => {
    if (!lng) return;
    if (i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  // Keep cookie in sync (your detector reads it after "path")
  useEffect(() => {
    if (!lng) return;
    if (cookies.i18next !== lng) {
      setCookie(cookieName, lng, { path: "/" });
    }
  }, [lng, cookies.i18next, setCookie]);

  return ret; // { t, i18n }
}
