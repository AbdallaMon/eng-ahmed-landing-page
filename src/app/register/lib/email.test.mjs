import assert from "node:assert/strict";
import test from "node:test";

import {
  isValidPublicLeadEmail,
  normalizePublicLeadEmail,
} from "./email.mjs";

test("normalizes and accepts emails allowed by the CRM validator", () => {
  assert.equal(normalizePublicLeadEmail("  Client+design@example.com  "), "Client+design@example.com");
  assert.equal(isValidPublicLeadEmail("Client+design@example.com"), true);
  assert.equal(isValidPublicLeadEmail("client@sub.example.co.uk"), true);
});

test("rejects draft IDs and addresses rejected by the CRM validator", () => {
  assert.equal(isValidPublicLeadEmail("77"), false);
  assert.equal(isValidPublicLeadEmail("client@example"), false);
  assert.equal(isValidPublicLeadEmail("client..name@example.com"), false);
});
