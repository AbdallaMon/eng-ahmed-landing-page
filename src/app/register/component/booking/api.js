// Booking-wizard API client. All paths are relative to NEXT_PUBLIC_URL.
//
// These helpers intentionally do NOT use the shared handleRequestSubmit: the
// wizard needs structured errors (status + payload) so useBookingSteps can
// branch on 400 / 404 / 409 and on the "not found" message. handleRequestSubmit
// swallows errors and drives its own toast, which does not fit that contract.

const BASE_URL = process.env.NEXT_PUBLIC_URL;
const BOOKING_LEADS_PATH = "v2/client/booking-leads";

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, method, body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return fetch(`${BASE_URL}/${path}`, options);
}

/**
 * Step 1 — create a lead with the initial customer fields (name / phone).
 * @returns {Promise<object>} the created lead (must include `id`).
 */
export async function createLead(initialData) {
  const res = await request(BOOKING_LEADS_PATH, "POST", initialData);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || "Failed to create lead", res.status, err);
  }
  return res.json();
}

/**
 * Fetch an existing lead for resume / deep-link hydration.
 */
export async function getLead(leadId) {
  const res = await request(`${BOOKING_LEADS_PATH}/${leadId}`, "GET");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || "Failed to fetch lead", res.status, err);
  }
  return res.json();
}

/**
 * Steps 2-8 — fire-and-forget single-field update. Never throws.
 */
export function fireUpdateLead(leadId, stepData) {
  request(`${BOOKING_LEADS_PATH}/${leadId}`, "PATCH", stepData).catch(() => {});
}

/**
 * Step 9 — final submit with all accumulated form data. Awaited.
 */
export async function submitFinalLead(leadId, allData) {
  const res = await request(
    `${BOOKING_LEADS_PATH}/${leadId}/submit`,
    "PUT",
    allData,
  );

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      payload.message || "Failed to submit",
      res.status,
      payload,
    );
  }

  return payload;
}
