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

    // The location-title clone is detached from React; re-translate it manually.
    const clonedTitle = document.querySelector(".cloned-location-title");
    if (clonedTitle) {
      const otherLng = value === "ar" ? "en" : "ar";
      const matchedKey = Object.keys(dictionary).find(
        (k) => dictionary[k]?.[otherLng] === clonedTitle.textContent,
      );
      if (matchedKey) {
        clonedTitle.textContent = dictionary[matchedKey][value];
      }
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && !skipLocalStorage) {
      setLng(window.localStorage.getItem("lng") || "ar");
    }
  }, [skipLocalStorage]);

  return (
    <LanguageContext.Provider value={{ translate, changeLanguage, lng }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// Alias kept for components migrated from the source naming.
export const useLanguageContext = useLanguage;
