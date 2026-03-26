/**
 * Launch gate — controls whether the public platform is visible.
 * Set VITE_PUBLIC_LAUNCHED=true in .env to open the platform to everyone.
 * When false, only the driver waitlist page is shown to public visitors.
 * Admins always get full access regardless of this flag.
 */
export const IS_LAUNCHED =
  import.meta.env.VITE_PUBLIC_LAUNCHED === "true";
