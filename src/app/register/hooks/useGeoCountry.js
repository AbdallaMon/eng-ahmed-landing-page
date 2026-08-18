"use client";

import { useEffect, useState } from "react";

const DEFAULT_COUNTRY = "AE";

/**
 * Detect the user's country code via IP geolocation.
 * Falls back to "AE" (UAE) on failure or for inside-UAE leads.
 *
 * @param {string} location - "INSIDE_UAE" or "OUTSIDE_UAE"
 * @returns {{ defaultCountry: string }}
 */
export function useGeoCountry(location) {
  const [detectedCountry, setDetectedCountry] = useState(DEFAULT_COUNTRY);

  useEffect(() => {
    if (location === "INSIDE_UAE") return;
    const controller = new AbortController();

    fetch("https://geolocation-db.com/json/", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const code = data?.country_code;
        if (code && code !== "Not found") {
          setDetectedCountry(code);
        }
      })
      .catch(() => {
        // Silently fall back to AE.
      });

    return () => controller.abort();
  }, [location]);

  const defaultCountry =
    location === "INSIDE_UAE" ? DEFAULT_COUNTRY : detectedCountry;
  return { defaultCountry };
}
