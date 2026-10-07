// Self-contained ar/en dictionary for the /register section.
// Flat map of { "key": { ar, en } } merged from domain files.
// Surfaced to components via LanguageProvider's translate(key); use the
// t(key, lng) helper below for server/non-context spots.

import { category } from "./category";
import { leadType } from "./leadType";
import { location } from "./location";
import { price } from "./price";
import { form } from "./form";
import { register } from "./register";
import { button } from "./button";
import { hero } from "./hero";
import { status } from "./status";
import { checkout } from "./checkout";
import { cancel } from "./cancel";
import { success } from "./success";
import { source } from "./source";
import { consultLevels } from "./consultLevels";
import { identity } from "./identity";
import { booking } from "./booking";
import { bookingSteps } from "./bookingSteps";

export const dictionary = {
  ...category,
  ...leadType,
  ...location,
  ...price,
  ...form,
  ...register,
  ...button,
  ...hero,
  ...status,
  ...checkout,
  ...cancel,
  ...success,
  ...source,
  ...consultLevels,
  ...identity,
  ...booking,
  ...bookingSteps,
};

/**
 * Translate a dictionary key for a given language.
 * Falls back to the key itself when missing.
 *
 * @param {string} key - Dictionary key (e.g. "form.name")
 * @param {string} lng - "ar" | "en"
 * @returns {string}
 */
export function t(key, lng) {
  return dictionary[key]?.[lng] ?? key;
}
