// Which lead-form fields apply, in order, for a given context. Variants map
// over this to lay fields out (and wrap each in their own animated wrapper) so
// the field set stays in ONE place. Pure data — no React.
//
// Field ids returned (map these to the field components in `core/fields/*`):
//   "name" | "phone" | "email" | "emirate" | "description" | "country" |
//   "source" | "file"
//
// Rules (matching the original DesignLeadForm):
//   - email only when no email was captured earlier.
//   - INSIDE_UAE → emirate + optional description; otherwise → country.
//   - source (required) + optional file always last.

/**
 * @param {{ location: string, hasCapturedEmail: boolean }} args
 * @returns {string[]} ordered list of field ids that apply
 */
export function leadFormFieldOrder({ location, hasCapturedEmail }) {
  const isInsideUAE = location === "INSIDE_UAE";

  const fields = ["name", "phone"];
  if (!hasCapturedEmail) fields.push("email");

  if (isInsideUAE) {
    fields.push("emirate", "description");
  } else {
    fields.push("country");
  }

  fields.push("source", "file");
  return fields;
}

export default leadFormFieldOrder;
