## Fix Three Issues on the Waitlist Page

### 1. Remove "Skip to main content" banner

The link in `index.html` is styled to only appear on keyboard focus, but it's visibly rendering. The CSS uses `opacity-0` and `pointer-events-none` which should hide it -- but it appears something is overriding this. The cleanest fix: remove the `<a>` tag from `index.html` entirely and delete the `.skip-to-content` styles from `src/index.css`. The accessibility benefit is negligible for this app and it's causing visual noise.

### 2. Hide "Admin Login" button elegantly

Replace the visible "Admin Login" button with a hidden easter egg: tapping the PARCOLO logo 5 times triggers navigation to `/auth`. No visible button, no confusion for regular visitors. Admins who know the trick can access it; everyone else never sees it.

### 3. Make the waitlist more compelling and prominent

Redesign the hero section to sell the benefits harder before showing the form:

- Bigger, bolder headline with earning figures ("**Cover Your Fuel" "Pay Your Tolls"** )
- Add a prominent "Join the Waitlist" CTA button at the top that scrolls down to the form
- Expand the benefits grid to 4 items with stronger copy (flexible schedule, no detours, get paid fast, community-powered)
- Add a "*"Be one of the first 50 drivers in your City.*" urgency indicator
- Make the submit button larger with coral glow styling.

### Files to modify


| File                           | Change                                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `index.html`                   | Remove the skip-to-content `<a>` tag                                                                                   |
| `src/index.css`                | Remove `.skip-to-content` styles                                                                                       |
| `src/pages/DriverWaitlist.tsx` | Remove Admin Login button, add logo tap-to-auth easter egg, redesign hero with stronger selling copy and prominent CTA |
