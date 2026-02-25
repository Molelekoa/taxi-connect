import { motion } from "framer-motion";

const ParcelPassAnimation = () => {
  return (
    <div className="relative w-64 h-40 mx-auto">
      <svg viewBox="0 0 240 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Left Hand */}
        <motion.g
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Palm */}
          <path
            d="M30 75 C30 60, 50 50, 60 55 L65 60 L65 80 C65 90, 45 95, 30 85Z"
            fill="hsl(175, 85%, 35%)"
            opacity="0.8"
          />
          {/* Fingers */}
          <rect x="52" y="48" width="8" height="18" rx="4" fill="hsl(175, 85%, 40%)" />
          <rect x="44" y="44" width="8" height="20" rx="4" fill="hsl(175, 85%, 40%)" />
          <rect x="36" y="46" width="8" height="18" rx="4" fill="hsl(175, 85%, 40%)" />
        </motion.g>

        {/* Parcel Box */}
        <motion.g
          animate={{ x: [0, 12, 0], y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Box body */}
          <rect x="90" y="42" width="50" height="40" rx="6" fill="hsl(24, 90%, 55%)" />
          {/* Box top flap */}
          <path d="M90 52 L115 38 L140 52" fill="hsl(24, 90%, 60%)" stroke="hsl(24, 90%, 48%)" strokeWidth="1.5" />
          {/* Tape stripe */}
          <rect x="110" y="42" width="10" height="40" rx="1" fill="hsl(24, 90%, 65%)" opacity="0.6" />
          {/* Happy face */}
          <circle cx="107" cy="65" r="2" fill="hsl(0, 0%, 100%)" />
          <circle cx="123" cy="65" r="2" fill="hsl(0, 0%, 100%)" />
          <path d="M108 73 Q115 78 122 73" stroke="hsl(0, 0%, 100%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          
          {/* Pulse effect */}
          <motion.circle
            cx="115"
            cy="62"
            r="30"
            fill="none"
            stroke="hsl(24, 90%, 55%)"
            strokeWidth="1"
            animate={{ r: [30, 40], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.g>

        {/* Right Hand */}
        <motion.g
          animate={{ x: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Palm */}
          <path
            d="M210 75 C210 60, 190 50, 180 55 L175 60 L175 80 C175 90, 195 95, 210 85Z"
            fill="hsl(145, 72%, 40%)"
            opacity="0.8"
          />
          {/* Fingers */}
          <rect x="180" y="48" width="8" height="18" rx="4" fill="hsl(145, 72%, 45%)" />
          <rect x="188" y="44" width="8" height="20" rx="4" fill="hsl(145, 72%, 45%)" />
          <rect x="196" y="46" width="8" height="18" rx="4" fill="hsl(145, 72%, 45%)" />
        </motion.g>
      </svg>
    </div>
  );
};

export default ParcelPassAnimation;
