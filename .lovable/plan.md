

# Replace Logo and Update Theme

## Overview
Replace the current logo with the new uploaded image, switch the "PARCOLO" brand text to the Fredoka font, and adjust the color theme to match the new logo while maintaining a trustworthy, professional feel.

## Color Palette (from the new logo)
The new logo features a mint/aqua background with coral-orange text and colorful accents. The theme will be updated to:

- **Primary**: Deep teal-green (from the bicycle/package elements) -- kept similar but slightly adjusted
- **Accent**: Warm orange (from the "PARCOLO" text in the logo, ~`28 90% 55%`)
- **Background accents**: Soft mint (`160 80% 85%`) used subtly in sections
- **Supporting dots**: Green, purple accents for visual interest

## Changes

### 1. Copy new logo to project
- Copy `user-uploads://Untitled_5.png` to `src/assets/parcolo-logo.png` (replacing existing)

### 2. Add Fredoka font (index.css)
- Add Fredoka to the Google Fonts import
- Create a new `font-brand` family for the PARCOLO wordmark specifically

### 3. Update Navbar.tsx
- Replace `font-display` on "PARCOLO" text with `font-brand` (Fredoka)
- Adjust text color to match the orange from the logo
- Add tagline "WE DELIVER TOGETHER" in small green text below the brand name (matching logo)

### 4. Update Footer.tsx
- Same font and color change for the "PARCOLO" brand text
- Add tagline

### 5. Update index.css theme
- Adjust `--accent` to match the orange in the logo text more closely (~`28 90% 55%`)
- Add a subtle mint tint to `--secondary` for section backgrounds
- Update coral glow shadow to match new orange
- Update gradient definitions

### 6. Update tailwind.config.ts
- Add `font-brand: ['Fredoka', 'system-ui', 'sans-serif']` to fontFamily

## Files Modified
| File | Change |
|------|--------|
| `src/assets/parcolo-logo.png` | Replaced with new logo |
| `src/index.css` | Add Fredoka font import, adjust accent/secondary colors |
| `tailwind.config.ts` | Add `font-brand` family |
| `src/components/Navbar.tsx` | Use Fredoka + orange for brand text |
| `src/components/Footer.tsx` | Use Fredoka + orange for brand text |

