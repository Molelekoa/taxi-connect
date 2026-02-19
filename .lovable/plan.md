

# Full Backend Setup: Authentication, Tables, RLS, Storage, and Edge Functions

## Overview
This plan sets up the complete Supabase backend for ParcelBuddy: authentication (email/password), database tables, Row Level Security policies, file storage for document uploads, and edge functions to handle registration.

---

## Phase 1: Authentication

### 1.1 Auth Pages
- Create `/auth` page with Login and Signup tabs (email + password)
- Create `/reset-password` page for password reset flow
- Add `AuthProvider` context wrapping the app to manage session state via `onAuthStateChange`
- Add protected route wrapper for future authenticated pages

### 1.2 Auth UI Components
- `AuthPage.tsx` -- Login/Signup form with email + password
- `AuthProvider.tsx` -- Context providing `user`, `session`, `signOut`, `loading`
- Login redirects to home; signup triggers profile creation via database trigger

### 1.3 Navbar Updates
- Show "Login" button when logged out
- Show user avatar/email + "Sign Out" when logged in

---

## Phase 2: Database Tables (Migration)

### 2.1 Roles System
```text
Table: user_roles
- id (uuid, PK)
- user_id (uuid, FK -> auth.users, CASCADE)
- role (app_role enum: 'admin', 'user')
- UNIQUE(user_id, role)
```

### 2.2 Profiles
```text
Table: profiles
- id (uuid, PK, default gen_random_uuid())
- auth_id (uuid, FK -> auth.users, CASCADE, NOT NULL, UNIQUE)
- full_name (text)
- email (text)
- phone (text)
- country (text)
- physical_address (text)
- role (text, CHECK: 'traveler' or 'sender')
- id_document_url (text, nullable)
- legal_declaration_accepted (boolean, default false)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
```

### 2.3 Traveler Profiles
```text
Table: traveler_profiles
- id (uuid, PK)
- profile_id (uuid, FK -> profiles, CASCADE, UNIQUE)
- license_type (text)
- years_with_license (text)
- no_criminal_record (boolean)
- id_copy_url (text)
- license_copy_url (text)
- vehicle_ownership (text)
- vehicle_type (text)
- vehicle_registration (text)
- vehicle_year (text)
- vehicle_model (text)
- vehicle_colour (text)
- min_load_capacity (text)
- max_load_capacity (text)
- has_valid_insurance (boolean)
- travel_frequency (text)
- schedule_type (text)
- available_days (text[])
- departure_time (text)
- advance_notice (text)
- parcels_per_trip (text)
- storage_type (text)
- cargo_types (text[])
- emergency_contact_name (text)
- emergency_contact_relation (text)
- emergency_contact_phone (text)
- referral_source (text)
- created_at (timestamptz)
```

### 2.4 Traveler Routes
```text
Table: traveler_routes
- id (uuid, PK)
- traveler_profile_id (uuid, FK -> traveler_profiles, CASCADE)
- route_from (text)
- route_to (text)
- return_trip (text)
- is_primary (boolean, default false)
- created_at (timestamptz)
```

### 2.5 Parcels
```text
Table: parcels
- id (uuid, PK)
- sender_id (uuid, FK -> profiles)
- traveler_id (uuid, FK -> profiles, nullable)
- pickup_location (text)
- dropoff_location (text)
- weight_kg (numeric)
- description (text)
- status (text, CHECK: pending/collected/in-transit/delivered)
- price (numeric)
- created_at / updated_at (timestamptz)
```

### 2.6 Delivery Ratings
```text
Table: delivery_ratings
- id (uuid, PK)
- parcel_id (uuid, FK -> parcels, UNIQUE)
- rated_by (uuid, FK -> profiles)
- rating (integer, CHECK 1-5)
- review (text)
- created_at (timestamptz)
```

### 2.7 Auto-create Profile Trigger
A database trigger on `auth.users` INSERT that auto-creates a row in `profiles` with the user's `auth_id` and email.

---

## Phase 3: Row Level Security

### 3.1 Helper Functions (SECURITY DEFINER)
- `has_role(user_id, role)` -- checks `user_roles` table
- `get_profile_id(auth_uid)` -- returns profile id for an auth user
- `owns_profile(profile_id)` -- checks if current user owns profile
- `owns_traveler_profile(tp_id)` -- checks ownership via profile chain

### 3.2 RLS Policies
- **profiles**: Users read/update own; admins read all
- **traveler_profiles**: Owner read/update; admins full access
- **traveler_routes**: Owner CRUD; admins full access
- **parcels**: Sender or assigned traveler can read; admins full access
- **delivery_ratings**: Related parties can read; creator can insert; admins full access

---

## Phase 4: Storage Buckets

### 4.1 Create Buckets
- `documents` -- private bucket for ID copies, license copies
- Files stored under path `{user_id}/{file_name}`

### 4.2 Storage RLS
- Users can upload to their own folder
- Users can read their own files
- Admins can read all files

---

## Phase 5: Edge Functions

### 5.1 `register-sender`
- Receives sender form data + uploaded file
- Updates the caller's profile with sender info (role, phone, country, address, legal declaration)
- Uploads ID document to storage bucket
- Returns success/failure

### 5.2 `register-traveler`
- Receives full traveler form data + uploaded files
- Updates caller's profile with traveler info
- Creates `traveler_profiles` row with vehicle/license details
- Creates `traveler_routes` rows for primary + additional routes
- Uploads ID copy and license copy to storage
- Returns success/failure

---

## Phase 6: Connect Forms to Backend

### 6.1 Sender Registration Form
- Require authentication before showing form (redirect to `/auth` if not logged in)
- On submit: call `register-sender` edge function with form data and file
- On success: show confirmation, profile is updated in database

### 6.2 Carrier Registration Form
- Same auth requirement
- On submit: call `register-traveler` edge function with all form data and files
- On success: show confirmation

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/pages/Auth.tsx` | Login/Signup page |
| `src/pages/ResetPassword.tsx` | Password reset page |
| `src/contexts/AuthContext.tsx` | Auth state provider |
| `src/components/ProtectedRoute.tsx` | Route guard |
| `supabase/functions/register-sender/index.ts` | Sender registration edge function |
| `supabase/functions/register-traveler/index.ts` | Traveler registration edge function |

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Add AuthProvider, Auth routes, ProtectedRoute |
| `src/components/Navbar.tsx` | Add login/logout button based on auth state |
| `src/components/SenderRegistrationForm/index.tsx` | POST to edge function instead of mock |
| `src/components/CarrierRegistrationForm/index.tsx` | POST to edge function instead of mock |
| `src/pages/CarrierSignup.tsx` | Redirect to auth if not logged in |
| `supabase/config.toml` | Add edge function JWT config |

### Database Migration (single SQL migration)
- Create enum, tables, indexes, trigger, helper functions, and RLS policies all in one migration

### Implementation Order
1. Database migration (tables + RLS + trigger + functions)
2. Storage bucket creation
3. Auth context + Auth page + Reset password page
4. Navbar auth state
5. Edge functions (register-sender, register-traveler)
6. Connect forms to edge functions
7. Test end-to-end

