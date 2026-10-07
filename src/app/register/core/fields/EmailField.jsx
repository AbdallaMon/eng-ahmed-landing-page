"use client";
import { TextField } from "@mui/material";

/**
 * Email input — only rendered when no email was captured earlier
 * (`form.hasCapturedEmail === false`). Presentation-agnostic: renders ONLY the
 * field. Variants should gate it via `leadFormFieldOrder` / `hasCapturedEmail`.
 *
 * @param {{ form: object }} props  `form` = the object returned by `useLeadForm`.
 */
export default function EmailField({ form }) {
  const { translate, formData, handleChange } = form;
  return (
    <TextField
      fullWidth
      label={translate("form.email")}
      name="email"
      type="email"
      variant="outlined"
      value={formData.email}
      onChange={handleChange}
      InputProps={{ sx: { borderRadius: 2 } }}
    />
  );
}
