"use client";
import { TextField } from "@mui/material";

/**
 * Name input. Presentation-agnostic: renders ONLY the MUI field (no Paper, no
 * animation wrapper — variants add their own animated wrapper around it).
 *
 * @param {{ form: import("@/app/register/core/useLeadForm").useLeadForm extends (...a:any)=>infer R ? R : any }} props
 *   `form` is the object returned by `useLeadForm`.
 */
export default function NameField({ form }) {
  const { translate, formData, handleChange } = form;
  return (
    <TextField
      fullWidth
      label={translate("form.name")}
      name="name"
      variant="outlined"
      value={formData.name}
      onChange={handleChange}
      InputProps={{ sx: { borderRadius: 2 } }}
    />
  );
}
