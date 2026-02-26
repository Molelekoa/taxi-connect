
# Restructure "Join the Community" Page

## Goal
Make the benefits section the primary focus of the page, with the registration forms hidden behind a CTA button. Users read the benefits and testimonial first, then click "Join the Community" to reveal the role selection tabs and onboarding forms.

## Changes

### File: `src/pages/CarrierSignup.tsx`

1. **Add state to control form visibility** -- a `useState<boolean>` called `showRegistration`, defaulting to `false`.

2. **Add a CTA button below the testimonial** -- a prominent "Join the Community" button (using the `coral` variant) placed right after the testimonial block inside the benefits card. When clicked, it sets `showRegistration` to `true` and smooth-scrolls down to the registration section.

3. **Conditionally render the registration tabs** -- wrap the existing Tabs section in a conditional (`showRegistration &&`) so it only appears after the user clicks the CTA. Add a `ref` on the tabs section and scroll to it on reveal.

4. **Add imports** -- `useState`, `useRef`, `Button` from existing components.

## Result
- Page loads showing: header, benefits grid, testimonial, and a bold "Join the Community" button
- Clicking the button reveals the Traveler/Sender tabs with registration forms and scrolls down to them
- No other files are modified
