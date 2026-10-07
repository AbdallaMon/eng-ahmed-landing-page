"use client";
import { CountrySelectField } from "@/app/register/component/forms/inputs/CountrySelectField";

/**
 * Country selector (non-UAE leads) — thin wrapper over the existing searchable
 * `CountrySelectField`. Presentation-agnostic: renders ONLY the field.
 *
 * @param {{ form: object }} props  `form` = the object returned by `useLeadForm`.
 */
export default function CountryField({ form }) {
  const { translate, formData, handleChange } = form;
  return (
    <CountrySelectField
      label={translate("form.country")}
      name="country"
      onChange={handleChange}
      value={formData.country}
      fullWidth
    />
  );
}
