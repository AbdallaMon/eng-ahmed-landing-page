"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { dictionary } from "@/app/register/data/dictionary";

const LanguageContext = createContext(null);

export default function LanguageProvider({
  children,
  initialLng = "ar",
  skipLocalStorage = false,
}) {
  const [lng, setLng] = useState(initialLng);

  const translate = useCallback((key) => dictionary[key]?.[lng] ?? key, [lng]);

  function changeLanguage(value) {
    setLng(value);
    window.localStorage.setItem("lng", value);
  }

  useEffect(() => {
    if (typeof window === "undefined" || skipLocalStorage) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const queryLng = new URLSearchParams(window.location.search).get("lng");
      const nextLng = ["ar", "en"].includes(queryLng)
        ? queryLng
        : window.localStorage.getItem("lng") || initialLng;
      setLng(nextLng);
      if (queryLng) window.localStorage.setItem("lng", nextLng);
    });
    return () => {
      cancelled = true;
    };
  }, [initialLng, skipLocalStorage]);

  return (
    <LanguageContext.Provider value={{ translate, changeLanguage, lng }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// Alias kept for components migrated from the source naming.
export const useLanguageContext = useLanguage;
