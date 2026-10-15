import { AED_PER_USD_FALLBACK } from "./designPricing.mjs";

const RATE_URL = "https://api.frankfurter.dev/v2/rate/usd/aed";

export async function getAedPerUsdRate(fetchRate = fetch) {
  try {
    const response = await fetchRate(RATE_URL, {
      next: { revalidate: 12 * 60 * 60 },
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return AED_PER_USD_FALLBACK;

    const data = await response.json();
    if (
      data.base !== "USD" ||
      data.quote !== "AED" ||
      typeof data.rate !== "number" ||
      !Number.isFinite(data.rate) ||
      data.rate < 3 ||
      data.rate > 4
    ) {
      return AED_PER_USD_FALLBACK;
    }

    return data.rate;
  } catch {
    return AED_PER_USD_FALLBACK;
  }
}
