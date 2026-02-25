import { motion } from "framer-motion";

export const DropOffIcon = () => (
  <div className="relative w-16 h-16 mx-auto">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      {/* Locker */}
      <rect x="16" y="20" width="32" height="32" rx="6" stroke="hsl(175, 85%, 35%)" strokeWidth="2.5" fill="hsl(175, 85%, 35%)" fillOpacity="0.1" />
      {/* Slot */}
      <rect x="24" y="28" width="16" height="4" rx="2" fill="hsl(175, 85%, 35%)" opacity="0.5" />
      {/* Dropping box */}
      <motion.g
        animate={{ y: [0, 8, 6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
      >
        <rect x="26" y="8" width="12" height="12" rx="3" fill="hsl(24, 90%, 55%)" />
        <line x1="32" y1="10" x2="32" y2="18" stroke="hsl(24, 90%, 65%)" strokeWidth="1.5" />
      </motion.g>
      {/* Pulse ring */}
      <motion.circle
        cx="32" cy="36"
        r="8"
        fill="none"
        stroke="hsl(175, 85%, 35%)"
        strokeWidth="1"
        animate={{ r: [8, 18], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", repeatDelay: 1 }}
      />
    </svg>
  </div>
);

export const CommunityDeliverIcon = () => (
  <div className="relative w-16 h-16 mx-auto">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      {/* Person */}
      <circle cx="22" cy="18" r="6" fill="hsl(145, 72%, 40%)" opacity="0.8" />
      <rect x="16" y="26" width="12" height="16" rx="4" fill="hsl(145, 72%, 40%)" opacity="0.6" />
      {/* Backpack */}
      <rect x="20" y="28" width="10" height="10" rx="3" fill="hsl(24, 90%, 55%)" />
      {/* Map pin */}
      <g transform="translate(48, 18)">
        <circle cx="0" cy="0" r="5" fill="hsl(24, 90%, 55%)" />
        <circle cx="0" cy="0" r="2" fill="white" />
        <path d="M0 5 L0 10" stroke="hsl(24, 90%, 55%)" strokeWidth="2" />
      </g>
      {/* Dotted path */}
      <motion.path
        d="M32 34 Q40 28 48 22"
        stroke="hsl(175, 85%, 35%)"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
        animate={{ strokeDashoffset: [16, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  </div>
);

export const CollectIcon = ({ isHovered }: { isHovered: boolean }) => (
  <div className="relative w-16 h-16 mx-auto">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      {/* Person 1 */}
      <circle cx="22" cy="22" r="6" fill="hsl(175, 85%, 35%)" opacity="0.8" />
      <rect x="16" y="30" width="12" height="14" rx="4" fill="hsl(175, 85%, 35%)" opacity="0.6" />
      {/* Person 2 */}
      <circle cx="42" cy="22" r="6" fill="hsl(24, 90%, 55%)" opacity="0.8" />
      <rect x="36" y="30" width="12" height="14" rx="4" fill="hsl(24, 90%, 55%)" opacity="0.6" />
      {/* Sparkle/heart on hover */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <text x="32" y="16" textAnchor="middle" fontSize="12">✨</text>
      </motion.g>
    </svg>
  </div>
);
