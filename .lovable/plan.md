
## Admin Dashboard for Parcel Booking Management

### Overview
Build a complete admin system to view and manage parcel bookings, with email notifications for new bookings and status tracking through the delivery lifecycle.

---

### Architecture

```text
+------------------+     +-------------------+     +------------------+
|  Booking Form    | --> |  Supabase DB      | --> |  Admin Dashboard |
|  (SmallParcel)   |     |  parcel_bookings  |     |  /admin          |
+------------------+     +-------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+     +------------------+
|  Edge Function   |     |  Status Updates   |     |  Protected by    |
|  send-email      |     |  (Collected,      |     |  Admin Login     |
|  (Resend)        |     |   In Transit,     |     |                  |
+------------------+     |   Delivered)      |     +------------------+
                         +-------------------+
```

---

### What You Will Get

1. **Email Notifications**: Receive an email whenever someone books a parcel
2. **Admin Dashboard**: View all bookings in a table with filtering and search
3. **Status Tracking**: Update each parcel's status (Pending, Collected, In Transit, Delivered)
4. **Simple Admin Login**: Password-protected access just for you
5. **Booking Details**: Click any booking to see full details in a slide-out panel

---

### Implementation Steps

#### Step 1: Enable Supabase (Lovable Cloud)
Set up the backend database to store bookings. This is a one-click action in Lovable.

#### Step 2: Create Database Table
Create a `parcel_bookings` table to store all booking data:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Unique booking ID |
| booking_ref | text | Human-readable reference (e.g., CC-2024-001) |
| contact_name | text | Sender's name |
| email | text | Sender's email |
| phone | text | Sender's phone |
| origin_city | text | Pickup city |
| pickup_address | text | Full pickup address |
| pickup_date | date | Requested pickup date |
| destination_city | text | Delivery city |
| delivery_address | text | Full delivery address |
| recipient_name | text | Recipient's name |
| recipient_phone | text | Recipient's phone |
| weight | decimal | Parcel weight in kg |
| description | text | Contents description |
| include_tracking | boolean | Tracking add-on |
| price | decimal | Final quoted price |
| status | text | Current status |
| created_at | timestamp | When booking was made |
| updated_at | timestamp | Last status update |

#### Step 3: Set Up Admin Authentication
Create a simple admin login system:
- Single admin account (just you)
- Protected `/admin` route
- Session-based access using Supabase Auth

#### Step 4: Create Admin Dashboard Page
Build the `/admin` page with:
- Login form (if not authenticated)
- Bookings table with columns: Ref, Sender, Route, Date, Status
- Search by booking ref or sender name
- Filter by status (All, Pending, Collected, In Transit, Delivered)
- Click row to view full details in a Sheet (slide-out panel)

#### Step 5: Add Status Management
- Dropdown to change status for each booking
- Status options: Pending → Collected → In Transit → Delivered
- Automatic timestamp update when status changes

#### Step 6: Email Notifications (Optional Enhancement)
Set up email alerts for new bookings:
- Requires Resend API key
- Edge function to send email when booking is created
- Email includes booking details and link to admin dashboard

---

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/create_parcel_bookings.sql` | Create | Database table for bookings |
| `src/pages/Admin.tsx` | Create | Admin dashboard page |
| `src/components/admin/BookingTable.tsx` | Create | Table component for bookings list |
| `src/components/admin/BookingDetails.tsx` | Create | Sheet component for booking details |
| `src/components/admin/AdminLogin.tsx` | Create | Login form for admin access |
| `src/hooks/useAdminAuth.ts` | Create | Hook for admin authentication |
| `src/pages/SmallParcelBooking.tsx` | Modify | Save bookings to Supabase |
| `src/App.tsx` | Modify | Add /admin route |
| `supabase/functions/send-booking-email/index.ts` | Create | Email notification (if using Resend) |

---

### Admin Dashboard Preview

The dashboard will show:
- Summary stats at the top (Total bookings, Pending, In Transit, Delivered today)
- Searchable, sortable table of all bookings
- Color-coded status badges
- Click-to-view details panel
- Quick status update buttons

---

### Security Considerations
- Admin route protected by Supabase Auth
- RLS policies to ensure only admin can read/update bookings
- Customers cannot access the admin dashboard
- Booking data is only visible to the admin account

---

### Next Steps After Implementation
Once the admin dashboard is built, you could optionally add:
- Customer tracking page (enter booking ref to see status)
- SMS notifications using Twilio
- Export bookings to CSV
- Daily/weekly summary reports

---

### Technical Notes

**Database**: Uses Lovable Cloud (Supabase) for data storage

**Authentication**: Supabase Auth with email/password for admin login

**Email**: Resend integration (requires API key) for new booking notifications

**RLS Policies**: 
- `parcel_bookings` table: Only authenticated admin can SELECT/UPDATE
- Public can INSERT (to create bookings)
