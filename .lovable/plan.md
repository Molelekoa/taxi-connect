

# N+1 Query Audit Results

## Architecture Context

This project does not use an ORM. It uses the Supabase JS SDK directly, which means there are no "eager loading" or "include" features to leverage. Instead, fixes involve using Supabase's relational `.select()` syntax, `IN` filters, and batch inserts.

---

## N+1 Issues Found

### 1. `NotificationBell.tsx` — `markAllRead()` (line 64-70)

**Problem:** Loops through each unread notification and issues a separate `UPDATE` query per row.

```typescript
for (const id of unreadIds) {
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}
```

**Fix:** Use a single `.in()` filter:
```typescript
await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
```

**Impact:** If a user has 15 unread notifications, this fires 15 queries instead of 1.

---

### 2. `find-matching-parcels` Edge Function (lines 92-122)

**Problem:** For each matching parcel, issues 2-3 sequential queries inside a loop:
1. Check for existing match (`SELECT` per parcel)
2. Insert new match (`INSERT` per parcel)
3. Insert notification (`INSERT` per parcel)

**Fix — Batch the existence check:**
Before the loop, fetch all existing matches for this trip in one query:
```typescript
const { data: existingMatches } = await supabase
  .from("matches")
  .select("parcel_id")
  .eq("trip_id", tripId)
  .in("parcel_id", parcels.map(p => p.id));
const existingParcelIds = new Set((existingMatches || []).map(m => m.parcel_id));
```
Then skip parcels in the set. The inserts still need to be per-row (since each match ID is needed for the notification), but batch the notifications into a single `.insert([...])` call at the end.

**Impact:** With 20 matching parcels, reduces from ~60 queries to ~25.

---

### 3. `find-matching-trips` Edge Function (lines 101-129)

**Problem:** Same pattern as above — per-trip existence check, insert, and notification inside a loop.

**Fix:** Same approach: batch the existence check with `.in()`, accumulate notifications, and batch-insert them at the end.

---

### 4. `TravelerDashboard.tsx` — `fetchData()` (lines 77-157)

**Problem:** Makes 7+ sequential queries that could be parallelized:
1. `get_profile_id` RPC
2. `traveler_profiles` status query
3. `trips` query
4. `matches` (pending) query
5. `matches` (accepted) query
6. `traveler_profiles` (id) query — **duplicate** of query #2
7. `traveler_routes` query
8. `parcels` (pending) query

**Fixes:**
- Queries 2 and 6 are redundant — the first `traveler_profiles` query should select `id, status` instead of just `status`, eliminating query 6 entirely.
- Queries 3, 4, and 5 are independent and can run with `Promise.all()`.
- Queries 7 and 8 are also independent and can be parallelized.

**Impact:** Reduces from 8 sequential queries to ~4 sequential steps.

---

### 5. `SenderDashboard.tsx` — `fetchData()` (lines 33-75)

**Problem:** 4 sequential queries that are independent after the profile ID is resolved.

**Fix:** After `get_profile_id`, run the remaining 3 queries (`parcels`, `matches`, `notifications`) in parallel with `Promise.all()`.

---

### 6. `reassign-parcel` Edge Function (lines 56-131)

**Problem:** 7 sequential queries, several of which are independent:
1. Fetch new match
2. Fetch old match
3. Fetch parcel
4. Update old match
5. Update new match
6. Update parcel
7. Insert 2 notifications

**Fix:**
- Queries 1, 2, 3 can run in parallel with `Promise.all()`.
- Updates 4, 5, 6 can run in parallel.
- Notifications should be a single batch insert.

**Impact:** Reduces from 7+ sequential round-trips to 3.

---

## Summary Table

| Location | Type | Queries Saved | Severity |
|---|---|---|---|
| `NotificationBell.markAllRead` | Loop UPDATE | N-1 per call | Medium |
| `find-matching-parcels` | Loop SELECT+INSERT | ~2N per run | High |
| `find-matching-trips` | Loop SELECT+INSERT | ~2N per run | High |
| `TravelerDashboard.fetchData` | Sequential + duplicate | 3-4 per load | Medium |
| `SenderDashboard.fetchData` | Sequential | 2 per load | Low |
| `reassign-parcel` | Sequential independent | 4 per call | Medium |

## Plan

1. **Fix `NotificationBell.markAllRead`** — Replace loop with single `.in()` update
2. **Optimize `find-matching-parcels`** — Batch existence check, batch notification inserts
3. **Optimize `find-matching-trips`** — Same batching pattern
4. **Optimize `TravelerDashboard.fetchData`** — Remove duplicate query, parallelize with `Promise.all`
5. **Optimize `SenderDashboard.fetchData`** — Parallelize independent queries
6. **Optimize `reassign-parcel`** — Parallelize independent reads and writes, batch notifications

