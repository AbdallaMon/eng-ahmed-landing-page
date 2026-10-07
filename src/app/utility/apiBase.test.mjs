import assert from "node:assert/strict";
import test from "node:test";

import { buildApiUrl, normalizeApiBase } from "./apiBase.mjs";

test("normalizeApiBase adds /v2 to a bare backend origin", () => {
  assert.equal(
    normalizeApiBase("https://api.dreamstudiio.com"),
    "https://api.dreamstudiio.com/v2",
  );
});

test("normalizeApiBase preserves an existing /v2 suffix", () => {
  assert.equal(
    normalizeApiBase("https://api.dreamstudiio.com/v2/"),
    "https://api.dreamstudiio.com/v2",
  );
});

test("buildApiUrl accepts legacy paths with or without a v2 prefix", () => {
  assert.equal(
    buildApiUrl("https://api.dreamstudiio.com", "client/new-lead/register"),
    "https://api.dreamstudiio.com/v2/client/new-lead/register",
  );
  assert.equal(
    buildApiUrl("https://api.dreamstudiio.com/v2", "/v2/client/booking-leads"),
    "https://api.dreamstudiio.com/v2/client/booking-leads",
  );
});
