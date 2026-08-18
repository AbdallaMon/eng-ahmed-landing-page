export function normalizeApiBase(value) {
  const origin = String(value || "").trim().replace(/\/+$/, "");
  if (!origin) return "";
  return origin.endsWith("/v2") ? origin : `${origin}/v2`;
}

export function buildApiUrl(base, path) {
  const apiBase = normalizeApiBase(base);
  const canonicalPath = String(path || "").replace(/^\/?(?:v2\/)?/, "");
  return `${apiBase}/${canonicalPath}`;
}

export const API_BASE_URL = normalizeApiBase(process.env.NEXT_PUBLIC_URL);

export function apiUrl(path) {
  return buildApiUrl(API_BASE_URL, path);
}
