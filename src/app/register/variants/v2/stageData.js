// V2-scoped option data builders. Maps the flow's location / item values to the
// dictionary label keys (constants), the local photography (core assets helpers),
// and the per-item price-fee key — so both the WebGL gallery (GalleryOptions) and
// the capability fallback (CardFlow) render the SAME choices. Pure data.

import {
  designLeadTypes,
  designLead,
  LeadType,
  DesignLeadPrice,
} from "@/app/register/data/constants";
import { imageForLocation, imageForItem } from "@/app/register/core/assets";

/** Location options (INSIDE_UAE / OUTSIDE_UAE) with label + photo. */
export const locationOptions = designLeadTypes.map((l) => ({
  value: l.value,
  labelKey: l.title, // e.g. "location.insideUAE"
  image: imageForLocation(l.value),
}));

/** Design sub-type options (apartment / villa / part-of-home) with label + photo
 *  + the design-fee notice key. */
export const itemOptions = designLead.map((d) => ({
  value: d.value,
  labelKey: LeadType[d.value], // e.g. "leadType.apartment"
  image: imageForItem(d.value),
  priceKey: DesignLeadPrice[d.value], // e.g. "price.designFee.15k"
}));
