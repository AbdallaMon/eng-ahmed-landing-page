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
  const [defaultCountry, setDefaultCountry] = useState(DEFAULT_COUNTRY);

  useEffect(() => {
    if (location === "INSIDE_UAE") {
      setDefaultCountry(DEFAULT_COUNTRY);
      return;
    }

    fetch("https://geolocation-db.com/json/")
      .then((res) => res.json())
      .then((data) => {
        const code = data?.country_code;
        if (code && code !== "Not found") {
          setDefaultCountry(code);
        }
      })
      .catch(() => {
        // Silently fall back to AE.
      });
  }, [location]);

  return { defaultCountry };
}
