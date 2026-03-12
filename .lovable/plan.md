

# Plan: Fix Traveler Document Viewing with Server-Side Signed URLs

## Root Cause

The `DocumentPhoto` component calls `supabase.storage.from("documents").createSignedUrl()` using the **anon/client key**. This fails because `createSignedUrl` is a privileged operation that requires the **service role key** — it bypasses RLS but the client SDK doesn't have permission to generate signed URLs for files it doesn't own.

Meanwhile, delivery/collection proof photos work because the `upload-document` edge function generates signed URLs server-side at upload time and stores them directly in the database. The `ProofPhoto` component just renders the already-signed URL — no client-side signing needed.

## Solution

Create a new edge function `get-signed-url` that accepts a storage path, verifies the caller is an admin, and returns a signed URL using the service role key. Then update `DocumentPhoto` to call this function instead of the client-side `createSignedUrl`.

This mirrors the exact pattern used for delivery proofs: server-side URL generation, client-side image rendering.

## Changes

### 1. New Edge Function: `supabase/functions/get-signed-url/index.ts`
- Accepts `{ storagePath: string, bucket?: string }` in the JSON body
- Verifies JWT and checks `has_role(auth.uid(), 'admin')` via RPC
- Uses service role client to call `createSignedUrl` with 1-hour expiry
- Returns `{ signedUrl: string }`

### 2. Update `supabase/config.toml`
- Add `[functions.get-signed-url]` with `verify_jwt = false` (manual verification in code)

### 3. Update `DocumentPhoto` in `src/pages/AdminDashboard.tsx`
- Replace `supabase.storage.from("documents").createSignedUrl(...)` with `supabase.functions.invoke("get-signed-url", { body: { storagePath } })`
- Extract `signedUrl` from the response
- Keep the same thumbnail + fullscreen dialog UI for images, and "View PDF" link for PDFs
- No changes to `ProofPhoto` (already working)

## Files Modified

| File | Change |
|---|---|
| `supabase/functions/get-signed-url/index.ts` | New edge function for admin-only signed URL generation |
| `supabase/config.toml` | Add function config entry |
| `src/pages/AdminDashboard.tsx` | Update `DocumentPhoto` to use edge function instead of client-side signing |

