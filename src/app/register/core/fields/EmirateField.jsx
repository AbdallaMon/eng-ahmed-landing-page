"use client";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

/**
 * Emirate selector (INSIDE_UAE leads). Options come from `form.emiratesOptions`
 * (built from the `Emirate` enum). Presentation-agnostic: renders ONLY the field.
 *
 * @param {{ form: object }} props  `form` = the object returned by `useLeadForm`.
 */
export default function EmirateField({ form }) {
  const { translate, formData, handleEmirateChange, emiratesOptions } = form;
  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="emirate-label">
        {translate("form.selectLocation")}
      </InputLabel>
      <Select
        labelId="emirate-label"
        label={translate("form.selectLocation")}
        value={formData.emirate || ""}
        onChange={handleEmirateChange}
        sx={{ borderRadius: 2 }}
      >
        {emiratesOptions.map((option) => (
          <MenuItem value={option.key} key={option.key}>
            {translate(option.label)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
