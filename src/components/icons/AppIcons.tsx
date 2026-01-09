import { cn } from "@/lib/utils";

interface IconProps {
  size?: number;
  className?: string;
  active?: boolean;
}

const defaultSize = 24;

// Dashboard: 2x2 grid with checkmark in top-left square
export const DashboardIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* Top-left square with check */}
    <rect
      x="3"
      y="3"
      width="8"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? "currentColor" : "none"}
    />
    {active ? (
      <path
        d="M5.5 7L7 8.5L10 5.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M5.5 7L7 8.5L10 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    {/* Top-right square */}
    <rect
      x="13"
      y="3"
      width="8"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    {/* Bottom-left square */}
    <rect
      x="3"
      y="13"
      width="8"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    {/* Bottom-right square */}
    <rect
      x="13"
      y="13"
      width="8"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// Send: Box with tape lines and + sign on side
export const SendPackageIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* Main box */}
    <rect
      x="3"
      y="6"
      width="14"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? "currentColor" : "none"}
    />
    {/* Tape lines on top */}
    <path
      d="M7 6V3.5C7 3.22 7.22 3 7.5 3H12.5C12.78 3 13 3.22 13 3.5V6"
      stroke={active ? "white" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Center vertical tape */}
    <line
      x1="10"
      y1="6"
      x2="10"
      y2="20"
      stroke={active ? "white" : "currentColor"}
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />
    {/* Plus sign on right side */}
    <circle
      cx="19"
      cy="10"
      r="4"
      fill={active ? "hsl(var(--accent))" : "currentColor"}
    />
    <path
      d="M19 8V12M17 10H21"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Track: Radar circle with dot and line
export const TrackIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* Outer radar circle */}
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.1 : 0}
    />
    {/* Middle ring */}
    <circle
      cx="12"
      cy="12"
      r="5"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth="1.5"
      strokeOpacity="0.4"
      fill="none"
    />
    {/* Center dot */}
    <circle
      cx="12"
      cy="12"
      r="2"
      fill="currentColor"
    />
    {/* Sweep line pointing to tracked item */}
    <line
      x1="12"
      y1="12"
      x2="18"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Tracked item dot */}
    <circle
      cx="18"
      cy="6"
      r="2.5"
      fill={active ? "hsl(var(--accent))" : "currentColor"}
    />
  </svg>
);

// Schedule: Calendar with 7 squares, center highlighted
export const ScheduleIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* Calendar frame */}
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.1 : 0}
    />
    {/* Calendar hooks */}
    <line x1="7" y1="3" x2="7" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="17" y1="3" x2="17" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Header line */}
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
    {/* Grid squares - Row 1 */}
    <rect x="5" y="12" width="3" height="3" rx="0.5" fill={active ? "currentColor" : "currentColor"} fillOpacity="0.3" />
    <rect x="10.5" y="12" width="3" height="3" rx="0.5" fill={active ? "hsl(var(--accent))" : "currentColor"} />
    <rect x="16" y="12" width="3" height="3" rx="0.5" fill={active ? "currentColor" : "currentColor"} fillOpacity="0.3" />
    {/* Grid squares - Row 2 */}
    <rect x="5" y="16.5" width="3" height="3" rx="0.5" fill={active ? "currentColor" : "currentColor"} fillOpacity="0.3" />
    <rect x="10.5" y="16.5" width="3" height="3" rx="0.5" fill={active ? "currentColor" : "currentColor"} fillOpacity="0.3" />
  </svg>
);

// Account: Person silhouette with box in chest
export const AccountIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* Head circle */}
    <circle
      cx="12"
      cy="7"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? "currentColor" : "none"}
    />
    {/* Body/shoulders */}
    <path
      d="M4 21V19C4 16.2386 6.23858 14 9 14H15C17.7614 14 20 16.2386 20 19V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.2 : 0}
    />
    {/* Small box badge in chest area */}
    <rect
      x="9.5"
      y="16"
      width="5"
      height="4"
      rx="1"
      fill={active ? "hsl(var(--accent))" : "currentColor"}
    />
    {/* Box tape detail */}
    <line
      x1="12"
      y1="16"
      x2="12"
      y2="20"
      stroke="white"
      strokeWidth="1"
    />
  </svg>
);

// Home icon for navigation
export const HomeIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* House shape */}
    <path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    {/* Door circle */}
    <circle
      cx="12"
      cy="14"
      r="3"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth="2"
      fill={active ? "currentColor" : "none"}
    />
    {/* Door handle dot */}
    <circle
      cx="13.5"
      cy="14"
      r="0.75"
      fill={active ? "white" : "currentColor"}
    />
  </svg>
);

// Pricing/Calculator icon
export const PricingIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* Tag shape */}
    <path
      d="M20.59 13.41L13.42 20.58C13.2343 20.766 12.9857 20.8716 12.725 20.875H12.71C12.4493 20.8716 12.2007 20.766 12.015 20.58L2.29 10.85C2.10009 10.6603 1.99455 10.4027 2 10.135V4C2 3.44772 2.44772 3 3 3H9.135C9.40274 2.99455 9.66027 3.10009 9.85 3.29L19.58 13.015C19.766 13.2007 19.8716 13.4493 19.875 13.71V13.725C19.8716 13.9857 19.766 14.2343 19.58 14.42L20.59 13.41Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    {/* Tag hole */}
    <circle
      cx="6"
      cy="7"
      r="1.5"
      fill={active ? "white" : "currentColor"}
    />
    {/* Price lines */}
    <line x1="10" y1="10" x2="16" y2="16" stroke={active ? "white" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="8" x2="18" y2="14" stroke={active ? "white" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Partner/Handshake icon
export const PartnerIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* Truck simplified */}
    <rect
      x="2"
      y="8"
      width="10"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    {/* Truck cab */}
    <path
      d="M12 10H16L19 13V16H12V10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    {/* Wheels */}
    <circle cx="6" cy="16" r="2" stroke="currentColor" strokeWidth="2" fill="white" />
    <circle cx="16" cy="16" r="2" stroke="currentColor" strokeWidth="2" fill="white" />
    {/* Plus badge */}
    <circle
      cx="19"
      cy="7"
      r="4"
      fill={active ? "hsl(var(--accent))" : "currentColor"}
    />
    <path
      d="M19 5V9M17 7H21"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Package/Parcel icon (for logo and general use)
export const PackageIcon = ({ size = defaultSize, className, active }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("transition-colors", className)}
  >
    {/* 3D box with perspective */}
    <path
      d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    {/* Center vertical line */}
    <line x1="12" y1="12" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
    {/* Horizontal middle line */}
    <path d="M3 7L12 12L21 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {/* Top tape accent */}
    <line x1="12" y1="2" x2="12" y2="12" stroke={active ? "hsl(var(--accent))" : "currentColor"} strokeWidth="2" />
  </svg>
);

export const AppIcons = {
  Dashboard: DashboardIcon,
  SendPackage: SendPackageIcon,
  Track: TrackIcon,
  Schedule: ScheduleIcon,
  Account: AccountIcon,
  Home: HomeIcon,
  Pricing: PricingIcon,
  Partner: PartnerIcon,
  Package: PackageIcon,
};

export default AppIcons;
