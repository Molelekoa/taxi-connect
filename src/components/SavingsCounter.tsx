import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const SavingsCounter = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = 60;
    const duration = 1500;
    const stepTime = duration / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      {/* Piggy bank icon */}
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
        <circle cx="20" cy="20" r="18" fill="hsl(24, 90%, 55%)" opacity="0.15" />
        <text x="20" y="26" textAnchor="middle" fontSize="20">🐷</text>
      </svg>
      <div>
        <motion.span
          className="font-display font-black text-3xl text-accent"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          {count}%
        </motion.span>
        <p className="text-sm text-muted-foreground">saved vs couriers</p>
      </div>
    </div>
  );
};

export default SavingsCounter;
