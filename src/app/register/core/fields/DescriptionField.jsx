"use client";
import { TextField } from "@mui/material";

/**
 * Optional free-text "additional info" (`clientDescription`) — shown for
 * INSIDE_UAE leads alongside the emirate. Presentation-agnostic: renders ONLY
 * the field.
 *
 * @param {{ form: object }} props  `form` = the object returned by `useLeadForm`.
 */
export default function DescriptionField({ form }) {
  const { translate, formData, handleChange } = form;
  return (
    <TextField
      fullWidth
      label={translate("form.additionalInfo")}
      name="clientDescription"
      variant="outlined"
      multiline
      minRows={2}
      value={formData.clientDescription || ""}
      onChange={handleChange}
      InputProps={{ sx: { borderRadius: 2 } }}
    />
  );
}
