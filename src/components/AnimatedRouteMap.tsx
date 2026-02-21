import { motion } from "framer-motion";

const AnimatedRouteMap = () => {
  return (
    <svg viewBox="0 0 300 280" className="w-full max-w-xs mx-auto" aria-label="Southern Africa route map">
      {/* SA outline (simplified) */}
      <path
        d="M60,220 Q80,180 100,170 Q130,155 160,160 Q190,150 210,170 Q230,190 220,220 Q200,250 170,260 Q140,265 110,255 Q80,245 60,220Z"
        fill="none"
        stroke="hsl(224 50% 65%)"
        strokeWidth="1.5"
        opacity="0.3"
      />
      
      {/* Lesotho dot */}
      <circle cx="170" cy="210" r="6" fill="hsl(224 50% 65%)" opacity="0.2" />
      <circle cx="170" cy="210" r="3" fill="hsl(224 50% 65%)" />
      
      {/* Zimbabwe area */}
      <path
        d="M160,60 Q180,50 210,55 Q230,60 240,80 Q245,100 230,110 Q210,115 190,105 Q170,95 160,75Z"
        fill="none"
        stroke="hsl(224 50% 65%)"
        strokeWidth="1.5"
        opacity="0.3"
      />
      
      {/* Harare dot */}
      <circle cx="210" cy="75" r="6" fill="hsl(25 70% 65%)" opacity="0.2" />
      <circle cx="210" cy="75" r="3" fill="hsl(25 70% 65%)" />

      {/* Johannesburg dot */}
      <circle cx="150" cy="185" r="6" fill="hsl(224 50% 65%)" opacity="0.2" />
      <circle cx="150" cy="185" r="3" fill="hsl(224 50% 65%)" />

      {/* Route: JHB to Maseru */}
      <line
        x1="150" y1="185" x2="170" y2="210"
        stroke="hsl(224 50% 65%)"
        strokeWidth="2"
        className="route-line-animated"
        opacity="0.6"
      />

      {/* Route: JHB to Harare */}
      <line
        x1="150" y1="185" x2="210" y2="75"
        stroke="hsl(25 70% 65%)"
        strokeWidth="2"
        className="route-line-animated"
        opacity="0.6"
      />

      {/* Pulsing dots on routes */}
      <circle cx="165" cy="195" r="4" fill="hsl(224 50% 65%)" className="pulse-dot" />
      <circle cx="175" cy="145" r="4" fill="hsl(25 70% 65%)" className="pulse-dot" style={{ animationDelay: "0.5s" }} />
      <circle cx="190" cy="115" r="4" fill="hsl(25 70% 65%)" className="pulse-dot" style={{ animationDelay: "1s" }} />

      {/* Labels */}
      <text x="150" y="178" textAnchor="middle" fill="hsl(216 28% 12%)" fontSize="9" fontWeight="600">JHB</text>
      <text x="170" y="228" textAnchor="middle" fill="hsl(216 28% 12%)" fontSize="9" fontWeight="600">Maseru</text>
      <text x="210" y="68" textAnchor="middle" fill="hsl(216 28% 12%)" fontSize="9" fontWeight="600">Harare</text>
    </svg>
  );
};

export default AnimatedRouteMap;
