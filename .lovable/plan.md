

# Streamlined Booking for Registered Users

## The Idea

Yes to both of your instincts:

1. **Pricing stays public** -- anyone can use the Freight Estimator (/freight-estimator) without an account. This lets people discover affordable pricing before committing.

2. **Booking requires an account** -- when they click "Book This Delivery", if they are not logged in they get redirected to sign up / log in first. Once logged in, their profile data (name, email, phone, ID document, legal declaration) is already on file, so the booking form becomes much shorter.

### What the booking form looks like for a registered sender

Currently the form has 5 sections. For a registered user it shrinks to just 3:

| Section | Currently | After (registered user) |
|---------|-----------|------------------------|
| Your Details (name, email, phone) | Manual input | Auto-filled from profile, shown as read-only summary |
| Sender Verification (ID upload, legal declaration) | Required every time | Skipped entirely -- already on file |
| Pickup Details | Manual input | Manual input (changes each booking) |
| Delivery Details | Manual input | Manual input (changes each booking) |
| Parcel Details (weight band, tracking, description) | Manual input | Manual input (changes each booking) |

A small "Booking as [Name]" banner at the top confirms their identity with an option to update their profile if details have changed.

For users who are **not** registered as senders (e.g. they only have an auth account but never completed sender registration), the full form is shown as it is today -- they still need to provide ID and legal declaration for that booking.

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Wrap `/small-parcel` route in `ProtectedRoute` so booking requires login |
| `src/pages/SmallParcelBooking.tsx` | Fetch logged-in user's profile on mount; if profile has `full_name`, `email`, `phone`, `id_document_url`, and `legal_declaration_accepted`, auto-fill those fields and hide the manual input sections; show a compact identity banner instead; keep route/parcel/recipient fields as-is |
| `src/pages/FreightEstimator.tsx` | No changes needed -- stays fully public |

## Technical Details

**Profile fetch on SmallParcelBooking mount:**
```
const { user } = useAuth();

// Fetch profile if logged in
useEffect(() => {
  if (user) {
    supabase.from('profiles')
      .select('full_name, email, phone, id_document_url, legal_declaration_accepted')
      .eq('auth_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name && data?.id_document_url && data?.legal_declaration_accepted) {
          // Profile is complete -- auto-fill and mark as verified sender
          setProfileData(data);
          setIsVerifiedSender(true);
        }
      });
  }
}, [user]);
```

**When `isVerifiedSender` is true:**
- The "Your Details" section becomes a compact read-only card showing name, email, phone with a small "Edit profile" link
- The "Sender Verification" section (ID upload + legal declaration) is hidden entirely
- The form validation schema switches to a lighter version that omits `contactName`, `email`, `phone`, `idDocumentName`, and `legalDeclarationAccepted`
- The form pre-fills `contactName`, `email`, and `phone` from the profile so they are included in submission data

**When `isVerifiedSender` is false** (logged in but incomplete profile, or edge case):
- Full form is shown exactly as today
- No change in behavior

**ProtectedRoute on `/small-parcel`:**
- When an unauthenticated user clicks "Book This Delivery" on the estimator, they land on `/small-parcel` which redirects to `/auth` with a return URL
- After login/signup, they are sent back to `/small-parcel` with the pricing state preserved (React Router state persists through the redirect since ProtectedRoute stores it)

**ProtectedRoute state preservation:**
- The existing `ProtectedRoute` component will be updated to pass `location.state` through to the auth redirect so the prefilled pricing data (origin, destination, weight band, price) survives the login round-trip
- This is done by encoding the return path and state in the redirect

