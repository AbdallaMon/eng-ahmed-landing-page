import assert from "node:assert/strict";
import test from "node:test";
import { formatDesignFee } from "./designPricing.mjs";

const apartment = { amountAed: 15000, labelKey: "price.designFee.15k" };
const villa = { amountAed: 60000, labelKey: "price.designFee.60k" };
const partOfHome = { amountAed: 30000, labelKey: "price.designFee.30k" };
const translate = (key) => ({
  "price.designFee.15k": "رسوم التصميم تبدأ من 15,000 درهم إماراتي",
  "price.designFee.60k": "رسوم التصميم تبدأ من 60,000 درهم إماراتي",
})[key];

test("keeps the existing AED text for projects inside the UAE", () => {
  assert.equal(
    formatDesignFee(apartment, "INSIDE_UAE", "ar", 3.6725, translate),
    "رسوم التصميم تبدأ من 15,000 درهم إماراتي",
  );
});

test("rounds outside-UAE design fees down to whole thousands in both languages", () => {
  assert.equal(
    formatDesignFee(apartment, "OUTSIDE_UAE", "en", 3.6725, translate),
    "Design fees start from approximately $4,000",
  );
  assert.equal(
    formatDesignFee(villa, "OUTSIDE_UAE", "ar", 3.6725, translate),
    "رسوم التصميم تبدأ من حوالي 16,000 دولار أمريكي",
  );
  assert.equal(
    formatDesignFee(partOfHome, "OUTSIDE_UAE", "en", 3.6725, translate),
    "Design fees start from approximately $8,000",
  );
});

test("uses the pegged fallback rate when a live rate is unavailable", () => {
  assert.equal(
    formatDesignFee(apartment, "OUTSIDE_UAE", "en", undefined, translate),
    "Design fees start from approximately $4,000",
  );
});
