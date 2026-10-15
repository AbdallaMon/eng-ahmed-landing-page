import assert from "node:assert/strict";
import test from "node:test";
import { getAedPerUsdRate } from "./aedUsdRate.mjs";
import { AED_PER_USD_FALLBACK } from "./designPricing.mjs";

test("reads the USD/AED rate from the daily provider response", async () => {
  const rate = await getAedPerUsdRate(async (url, options) => {
    assert.equal(url, "https://api.frankfurter.dev/v2/rate/usd/aed");
    assert.equal(options.next.revalidate, 12 * 60 * 60);
    return {
      ok: true,
      json: async () => ({ base: "USD", quote: "AED", rate: 3.6724 }),
    };
  });
  assert.equal(rate, 3.6724);
});

test("falls back if the provider fails or returns the wrong pair", async () => {
  assert.equal(
    await getAedPerUsdRate(async () => {
      throw new Error("network unavailable");
    }),
    AED_PER_USD_FALLBACK,
  );
  assert.equal(
    await getAedPerUsdRate(async () => ({
      ok: true,
      json: async () => ({ base: "AED", quote: "USD", rate: 0.2723 }),
    })),
    AED_PER_USD_FALLBACK,
  );
});
