

## Database Schema for Parcel Buddy

Since you're using Neon (outside of Lovable), I'll provide you with the complete SQL schema to run in your Neon console. This covers all the core entities in your app: users/members, travelers, senders, parcels, and delivery ratings.

---

### Tables Overview

| Table | Purpose |
|-------|---------|
| `members` | All registered users (both travelers and senders) |
| `traveler_profiles` | Extra details for travelers (vehicle, routes, schedule) |
| `traveler_routes` | Routes a traveler covers (primary + additional) |
| `parcels` | Every parcel booking |
| `delivery_ratings` | Mandatory sender ratings after delivery |

---

### Schema Design

**1. `members`** -- shared table for all community members

- `id` (UUID, primary key)
- `role` (text: 'traveler' or 'sender')
- `full_name`, `email`, `phone`, `country`, `physical_address`
- `id_document_url` (text -- stores file path/URL for uploaded ID)
- `legal_declaration_accepted` (boolean)
- `status` (text: 'pending', 'approved', 'suspended') -- for vetting
- `created_at`, `updated_at`

**2. `traveler_profiles`** -- one-to-one with members where role = 'traveler'

- `id` (UUID, primary key)
- `member_id` (FK to members)
- ID number, passport number, license type, years with license
- Vehicle details (type, registration, year, model, colour, capacity, ownership, insurance)
- Schedule info (frequency, schedule type, departure time, advance notice, parcels per trip)
- Emergency contact fields
- `referral_source`

**3. `traveler_routes`** -- one-to-many from traveler_profiles

- `id`, `traveler_profile_id` (FK)
- `origin_city`, `destination_city`
- `is_primary` (boolean)
- `return_trip` (text: 'yes', 'no', 'sometimes')

**4. `parcels`** -- every parcel booking

- `id` (UUID, primary key)
- `sender_id` (FK to members)
- `traveler_id` (FK to members, nullable -- assigned later)
- Origin/destination cities, addresses, recipient info
- Weight, description, price, tracking
- `status` (text: 'pending', 'matched', 'picked_up', 'in_transit', 'delivered', 'cancelled')
- `sender_confirmed_delivery`, `traveler_confirmed_delivery` (booleans -- both must confirm)
- `id_document_url`
- Timestamps

**5. `delivery_ratings`** -- mandatory post-delivery ratings

- `id` (UUID, primary key)
- `parcel_id` (FK to parcels, unique -- one rating per delivery)
- `sender_id` (FK to members)
- `traveler_id` (FK to members)
- `rating` (integer, 1-5)
- `feedback` (text, optional)
- `created_at`

---

### SQL to Run in Neon

You'll receive the full `CREATE TABLE` statements with proper foreign keys, constraints, indexes, and defaults. Key constraints include:

- `members.email` is unique
- `members.role` is checked against 'traveler' and 'sender'
- `parcels.status` is checked against the valid status list
- `delivery_ratings.rating` is checked to be between 1 and 5
- `delivery_ratings.parcel_id` is unique (one rating per parcel)
- Indexes on `parcels.sender_id`, `parcels.traveler_id`, `parcels.status`, and `traveler_routes.traveler_profile_id`

---

### What This Does NOT Include (Yet)

- **Authentication** -- Neon is just a database; you'd need a separate auth solution (e.g., Clerk, Auth0) to manage login
- **File storage** -- ID document uploads need a storage service (e.g., Cloudflare R2, AWS S3)
- **API layer** -- You'll need backend API routes (e.g., on Vercel serverless functions) to connect your React frontend to Neon

---

### Important Note

Since Lovable can't connect to Neon directly, the forms in your app will continue to work as UI-only (no data persistence) until you build an API layer on Vercel to bridge your frontend to the Neon database. If you ever want built-in database integration without extra infrastructure, Supabase via Lovable Cloud is available as an option.

