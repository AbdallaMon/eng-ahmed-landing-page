"use client";
import { Autocomplete, TextField } from "@mui/material";
import { countriesByRegion } from "@/app/register/data/constants";

// Build a flat, region-ordered list once at module level.
const orderedCountries = Object.values(countriesByRegion).flat();

/**
 * Searchable country dropdown.
 *
 * @param {{
 *   value: string | null,
 *   onChange: Function,   // receives a synthetic { target: { name, value } } event
 *   label: string,
 *   name?: string,
 *   fullWidth?: boolean,
 * }} props
 */
export function CountrySelectField({
  value,
  onChange,
  label,
  name = "country",
  fullWidth = true,
}) {
  const handleChange = (_event, newValue) => {
    onChange({ target: { name, value: newValue } });
  };

  return (
    <Autocomplete
      options={orderedCountries}
      value={value || null}
      onChange={handleChange}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          InputProps={{ ...params.InputProps, sx: { borderRadius: 2 } }}
        />
      )}
    />
  );
}
