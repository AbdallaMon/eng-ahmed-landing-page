// Keep the public registration client aligned with the CRM's practical Zod email
// validator. The previous loose check accepted values that the API correctly
// rejected with a 422 response.
const PUBLIC_LEAD_EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

export function normalizePublicLeadEmail(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isValidPublicLeadEmail(value) {
  return PUBLIC_LEAD_EMAIL_PATTERN.test(normalizePublicLeadEmail(value));
}
