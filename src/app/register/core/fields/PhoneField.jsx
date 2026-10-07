"use client";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";

/**
 * Phone input (mui-tel-input) with live `matchIsValidTel` validation. The geo
 * default country comes from the form (resolved via `useGeoCountry`).
 * Presentation-agnostic: renders ONLY the field.
 *
 * @param {{ form: object }} props  `form` = the object returned by `useLeadForm`.
 */
export default function PhoneField({ form }) {
  const { translate, formData, handlePhoneChange, defaultCountry } = form;
  const invalid = formData.phone !== "" && !matchIsValidTel(formData.phone);

  return (
    <MuiTelInput
      defaultCountry={defaultCountry}
      value={formData.phone}
      id="phone"
      name="phone"
      label={translate("form.phone")}
      onChange={handlePhoneChange}
      error={invalid}
      helperText={invalid ? translate("validation.invalidPhone") : ""}
      fullWidth
      sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
    />
  );
}
