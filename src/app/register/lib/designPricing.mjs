export const AED_PER_USD_FALLBACK = 3.6725;

export function formatDesignFee(price, location, lng, aedPerUsd, translate) {
  if (!price) return null;
  if (location !== "OUTSIDE_UAE") return translate(price.labelKey);

  const rate =
    Number.isFinite(aedPerUsd) && aedPerUsd > 0
      ? aedPerUsd
      : AED_PER_USD_FALLBACK;
  // Starting prices are displayed at the previous whole thousand dollars.
  const roundedUsd = Math.floor(price.amountAed / rate / 1000) * 1000;
  const amount = new Intl.NumberFormat("en-US").format(roundedUsd);

  return lng === "en"
    ? `Design fees start from approximately $${amount}`
    : `رسوم التصميم تبدأ من حوالي ${amount} دولار أمريكي`;
}
