export const AED_PER_USD_FALLBACK = 3.6725;

export function formatDesignFee(price, location, lng, aedPerUsd, translate) {
  if (!price) return null;
  if (location !== "OUTSIDE_UAE") return translate(price.labelKey);

  const rate =
    Number.isFinite(aedPerUsd) && aedPerUsd > 0
      ? aedPerUsd
      : AED_PER_USD_FALLBACK;
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(price.amountAed / rate);

  return lng === "en"
    ? `Design fees start from approximately $${amount}`
    : `رسوم التصميم تبدأ من حوالي ${amount} دولار أمريكي`;
}
