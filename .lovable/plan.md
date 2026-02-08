

## Join the Community: Role Selection, Sender Registration, and Delivery Rating

### Overview
Transform the "Join the Community" page into a dual-purpose signup with tab-based role selection (Traveler or Sender). Add a sender registration form with basic info and ID upload. Create a delivery rating component that prompts senders to rate their traveler after confirming delivery.

---

### Part 1: Tab-Based Role Selection on the Carrier Signup Page

**File: `src/pages/CarrierSignup.tsx`**

Replace the current page layout with a tabbed interface:

- Two tabs at the top: **"I'm a Traveler"** and **"I'm a Sender"**
- Each tab shows a brief description of what that role means:
  - Traveler: "I travel between cities and can deliver parcels along my route"
  - Sender: "I need to send a parcel to someone in another city"
- The community benefits section stays visible for both roles
- Selecting a tab shows the corresponding registration form below
- The existing `CarrierRegistrationForm` is shown for Travelers
- A new `SenderRegistrationForm` is shown for Senders

---

### Part 2: Sender Registration Form

**New file: `src/components/SenderRegistrationForm/types.ts`**

Simple schema with:

| Field | Type | Required |
|-------|------|----------|
| fullName | string | Yes |
| email | string (email) | Yes |
| phone | string (10+ digits) | Yes |
| country | enum (south-africa, lesotho, zimbabwe) | Yes |
| physicalAddress | string | Yes |
| idDocumentName | string | Yes (file name reference) |
| legalDeclarationAccepted | boolean | Yes (must be true) |

**New file: `src/components/SenderRegistrationForm/index.tsx`**

A single-page form (no multi-step needed since it is much simpler) with:

- Personal information fields (name, email, phone, country, address)
- ID/Passport document upload area (PDF, JPEG, PNG, max 5MB) with drag-and-drop
- Legal declaration checkbox: "I declare that any parcels I send will not contain items that are illegal, stolen, counterfeit, or prohibited under South African, Lesotho, or Zimbabwean law. I accept personal liability for any violations."
- Submit button
- Success confirmation screen after submission

---

### Part 3: Delivery Rating Component

**New file: `src/components/DeliveryRating.tsx`**

A reusable rating component that appears after delivery confirmation:

- Star rating (1-5 stars, mandatory)
- Optional text feedback field
- Submit button (disabled until stars are selected)
- Thank-you message after submission

**Integration in `src/pages/SmallParcelBooking.tsx`**

After the existing booking success screen, add a simulated delivery confirmation flow:

- On the success screen, add a "Confirm Delivery Received" button
- When clicked, the delivery rating component appears
- The sender must rate the traveler (1-5 stars) before the rating is submitted
- After rating, show a final "Thank you" message

---

### Technical Details

**New files to create:**

| File | Purpose |
|------|---------|
| `src/components/SenderRegistrationForm/types.ts` | Zod schema and types for sender form |
| `src/components/SenderRegistrationForm/index.tsx` | Sender registration form component |
| `src/components/DeliveryRating.tsx` | Star rating component for post-delivery |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/pages/CarrierSignup.tsx` | Add tab-based role selection (Traveler/Sender), update heading text |
| `src/pages/SmallParcelBooking.tsx` | Add delivery confirmation and mandatory rating to success screen |

**Dependencies used:** All existing (Radix tabs, Lucide icons, Framer Motion, Zod). No new packages needed.

---

### User Flow Summary

```text
Join the Community Page
        |
    [Tab Selection]
    /            \
Traveler         Sender
   |                |
6-step form     Single form
(existing)      (name, email, phone,
                 country, address,
                 ID upload, legal
                 declaration)
   |                |
Success          Success
screen           screen


Parcel Booking (separate page)
        |
   Book parcel
        |
   Booking confirmed
        |
   "Confirm Delivery Received" button
        |
   Mandatory star rating (1-5)
   + optional feedback
        |
   Thank you message
```

