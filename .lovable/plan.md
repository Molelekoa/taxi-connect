

## Rebrand Legal Pages and Fix Form Scrolling

### Overview
Two changes are needed:
1. Update all "Dyno Dash" references to "Parcel Buddy" in the Privacy Policy and Terms of Service pages
2. Fix the scrolling behavior in the "Join the Community" form so it scrolls to the top when moving between steps

---

### Part 1: Rebrand Privacy Policy and Terms of Service

#### Privacy Policy (`src/pages/PrivacyPolicy.tsx`)

| Location | Current Text | New Text |
|----------|--------------|----------|
| Line 9 (title) | "Dyno Dash" | "Parcel Buddy" |
| Line 10 (meta description) | "Dyno Dash Privacy Policy" | "Parcel Buddy Privacy Policy" |
| Line 25 | "Dyno Dash" | "Parcel Buddy" |
| Line 140 (email) | "info@dynodash.com" | "hello@parcelbuddy.co.za" |

#### Terms of Service (`src/pages/TermsOfService.tsx`)

| Location | Current Text | New Text |
|----------|--------------|----------|
| Line 9 (title) | "Dyno Dash" | "Parcel Buddy" |
| Line 10 (meta description) | "Dyno Dash Terms of Service" | "Parcel Buddy Terms of Service" |
| Line 25 | "Dyno Dash" | "Parcel Buddy" |
| Line 35 | "Dyno Dash operates as a freight brokerage..." | "Parcel Buddy operates as a community-driven delivery network..." |
| Line 144 | "Carriers wishing to partner with Dyno Dash" | "Community partners wishing to join Parcel Buddy" |
| Line 161 | "property of Dyno Dash" | "property of Parcel Buddy" |
| Line 168 | "Dyno Dash, its officers..." | "Parcel Buddy, its officers..." |
| Line 207 (email) | "info@dynodash.com" | "hello@parcelbuddy.co.za" |

---

### Part 2: Fix Form Scrolling Behavior

#### Problem
When clicking "Next" or "Back" in the carrier registration form, the page scrolls to the bottom of the new step instead of the top.

#### Solution
Add a `useEffect` hook that scrolls to the top of the form container whenever `currentStep` changes.

#### Changes to `src/components/CarrierRegistrationForm/index.tsx`

| Change | Description |
|--------|-------------|
| Add `useRef` import | Import `useRef` from React |
| Create form container ref | Add `const formRef = useRef<HTMLDivElement>(null)` |
| Add scroll effect | Add a `useEffect` that scrolls the form into view when `currentStep` changes |
| Attach ref to container | Add `ref={formRef}` to the form container div |

#### Implementation Details
```text
// New useEffect to scroll to top on step change
useEffect(() => {
  formRef.current?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  });
}, [currentStep]);
```

This will smoothly scroll the form into view at the top of the viewport whenever the user navigates between steps.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/PrivacyPolicy.tsx` | Replace all "Dyno Dash" with "Parcel Buddy", update email to "hello@parcelbuddy.co.za" |
| `src/pages/TermsOfService.tsx` | Replace all "Dyno Dash" with "Parcel Buddy", update description to reflect community model, update email |
| `src/components/CarrierRegistrationForm/index.tsx` | Add `useRef`, create ref for form container, add `useEffect` to scroll on step change |

