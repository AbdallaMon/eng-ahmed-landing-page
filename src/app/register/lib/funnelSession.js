export const FUNNEL_PURPOSES = Object.freeze({
  PUBLIC_REGISTER: "PUBLIC_REGISTER",
  BOOKING_LEAD: "BOOKING_LEAD",
});

const STORAGE_PREFIX = "register:funnel";
const COMPLETION_PREFIX = "register:funnel-completed";
const memoryCapabilities = new Map();
const memoryCompletions = new Map();

function storageKey(purpose, leadId) {
  return `${STORAGE_PREFIX}:${purpose}:${leadId}`;
}

function completionKey(purpose, leadId) {
  return `${COMPLETION_PREFIX}:${purpose}:${leadId}`;
}

export function currentLeadSource() {
  return typeof window === "undefined" ? undefined : window.location.origin;
}

export function saveFunnelCapability({ purpose, leadId, token }) {
  if (typeof window === "undefined" || !purpose || !leadId || !token) return;
  const key = storageKey(purpose, leadId);
  memoryCapabilities.set(key, token);
  try {
    window.sessionStorage.setItem(key, token);
  } catch {
    // The module-scoped fallback keeps this tab working without exposing the token.
  }
}

export function getFunnelCapability(purpose, leadId) {
  if (typeof window === "undefined" || !purpose || !leadId) return null;
  const key = storageKey(purpose, leadId);
  try {
    return window.sessionStorage.getItem(key) || memoryCapabilities.get(key) || null;
  } catch {
    return memoryCapabilities.get(key) || null;
  }
}

export function saveFunnelCompletion({ purpose, leadId, item }) {
  if (typeof window === "undefined" || !purpose || !leadId) return;
  const key = completionKey(purpose, leadId);
  const completion = { item: item || null };
  memoryCompletions.set(key, completion);
  try {
    window.sessionStorage.setItem(key, JSON.stringify(completion));
  } catch {
    // The module-scoped fallback preserves same-tab refresh behavior when possible.
  }
}

export function getFunnelCompletion(purpose, leadId) {
  if (typeof window === "undefined" || !purpose || !leadId) return null;
  const key = completionKey(purpose, leadId);
  try {
    const stored = window.sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : memoryCompletions.get(key) || null;
  } catch {
    return memoryCompletions.get(key) || null;
  }
}

export function clearFunnelCompletion(purpose, leadId) {
  if (typeof window === "undefined" || !purpose || !leadId) return;
  const key = completionKey(purpose, leadId);
  memoryCompletions.delete(key);
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Nothing else to clear when browser storage is unavailable.
  }
}

export function clearFunnelCapability(purpose, leadId) {
  if (typeof window === "undefined" || !purpose || !leadId) return;
  const key = storageKey(purpose, leadId);
  memoryCapabilities.delete(key);
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Nothing else to clear when browser storage is unavailable.
  }
}
