// Booking-wizard API client. All paths are relative to the normalized /v2 API base.
//
// These helpers intentionally do NOT use the shared handleRequestSubmit: the
// wizard needs structured errors (status + payload) so useBookingSteps can
// branch on 400 / 404 / 409 and on the "not found" message. handleRequestSubmit
// swallows errors and drives its own toast, which does not fit that contract.

import { apiUrl } from "@/app/utility/apiBase.mjs";

const BOOKING_LEADS_PATH = "client/booking-leads";

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, method, body, funnelToken) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };
  if (funnelToken) options.headers["x-funnel-token"] = funnelToken;

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return fetch(apiUrl(path), options);
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
  const payload = await res.json();
  return payload.data;
}

/**
 * Fetch an existing lead for resume / deep-link hydration.
 */
export async function getLead(leadId, funnelToken) {
  const res = await request(`${BOOKING_LEADS_PATH}/${leadId}`, "GET", undefined, funnelToken);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || "Failed to fetch lead", res.status, err);
  }
  const payload = await res.json();
  return payload.data;
}

/**
 * Steps 2-8 — fire-and-forget single-field update. Never throws.
 */
export function fireUpdateLead(leadId, stepData, funnelToken) {
  request(`${BOOKING_LEADS_PATH}/${leadId}`, "PATCH", stepData, funnelToken).catch(() => {});
}

/**
 * Step 9 — final submit with all accumulated form data. Awaited.
 */
export async function submitFinalLead(leadId, allData, funnelToken) {
  const res = await request(
    `${BOOKING_LEADS_PATH}/${leadId}/actions/submit`,
    "POST",
    allData,
    funnelToken,
  );

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      payload.message || "Failed to submit",
      res.status,
      payload,
    );
  }

  return payload.data;
}
