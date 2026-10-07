"use client";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { LEAD_SOURCE_LABELS } from "@/app/register/data/constants";

/**
 * "Where did you hear about us?" selector (`discoverySource`, required).
 * Options come from `LEAD_SOURCE_LABELS`. Presentation-agnostic: renders ONLY
 * the field.
 *
 * @param {{ form: object }} props  `form` = the object returned by `useLeadForm`.
 */
export default function SourceField({ form }) {
  const { translate, formData, handleChange } = form;
  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="discovery-source-label">
        {translate("form.whereHeard")}
      </InputLabel>
      <Select
        labelId="discovery-source-label"
        label={translate("form.whereHeard")}
        value={formData.discoverySource || ""}
        onChange={handleChange}
        name="discoverySource"
        sx={{ borderRadius: 2 }}
      >
        {Object.entries(LEAD_SOURCE_LABELS).map(([key, labelKey]) => (
          <MenuItem value={key} key={key}>
            {translate(labelKey)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
