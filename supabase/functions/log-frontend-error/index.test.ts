import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

// ── Accept Match: rejects invalid UUID ─────────────────────────────────────

Deno.test("accept-match rejects invalid matchId", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/accept-match`, {
    method: "POST",
    headers,
    body: JSON.stringify({ matchId: "not-a-uuid" }),
  });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertExists(body.error);
});

Deno.test("accept-match rejects missing matchId", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/accept-match`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertExists(body.error);
});

// ── Claim Parcel: rejects invalid input ────────────────────────────────────

Deno.test("claim-parcel rejects invalid parcelId (auth-gated)", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/claim-parcel`, {
    method: "POST",
    headers,
    body: JSON.stringify({ parcelId: "INJECTION'; DROP TABLE--", tripId: "00000000-0000-0000-0000-000000000000" }),
  });
  await res.text(); // consume body
  // Expects 401 (anon key can't authenticate as user) or 400 (validation)
  assertEquals(res.status < 500, true);
});

// ── Cancel Parcel by Sender: rejects invalid UUID ──────────────────────────

Deno.test("cancel-parcel-by-sender rejects invalid parcelId", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/cancel-parcel-by-sender`, {
    method: "POST",
    headers,
    body: JSON.stringify({ parcelId: "<script>alert(1)</script>" }),
  });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertExists(body.error);
});

// ── Delete Parcels: rejects oversized batch ────────────────────────────────

Deno.test("delete-parcels rejects >200 IDs", async () => {
  const ids = Array.from({ length: 201 }, (_, i) =>
    `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`
  );
  const res = await fetch(`${SUPABASE_URL}/functions/v1/delete-parcels`, {
    method: "POST",
    headers,
    body: JSON.stringify({ parcelIds: ids }),
  });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertExists(body.error);
});

// ── Log Frontend Error: accepts valid payload ──────────────────────────────

Deno.test("log-frontend-error accepts valid error", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/log-frontend-error`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      error_message: "Test error from CI",
      stack: "at test:1:1",
      url: "https://parcolo.lovable.app/test",
      user_agent: "vitest",
    }),
  });
  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.received, true);
});

Deno.test("log-frontend-error rejects missing error_message", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/log-frontend-error`, {
    method: "POST",
    headers,
    body: JSON.stringify({ stack: "at test:1:1" }),
  });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertExists(body.error);
});

// ── CORS: all functions respond to OPTIONS ─────────────────────────────────

const FUNCTIONS_TO_TEST_CORS = [
  "accept-match",
  "claim-parcel",
  "cancel-parcel-by-sender",
  "log-frontend-error",
  "find-matching-trips",
  "find-matching-parcels",
];

for (const fn of FUNCTIONS_TO_TEST_CORS) {
  Deno.test(`${fn} responds to OPTIONS (CORS preflight)`, async () => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: "OPTIONS",
      headers,
    });
    await res.text(); // consume body
    assertEquals(res.status, 200);
    assertExists(res.headers.get("access-control-allow-origin"));
  });
}
