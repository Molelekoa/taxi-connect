import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const avatars = [
  { color: "hsl(175, 85%, 35%)", emoji: "👩🏾" },
  { color: "hsl(24, 90%, 55%)", emoji: "👨🏽" },
  { color: "hsl(145, 72%, 40%)", emoji: "👩🏻" },
  { color: "hsl(280, 60%, 55%)", emoji: "👨🏿" },
  { color: "hsl(175, 85%, 35%)", emoji: "👩🏼" },
  { color: "hsl(24, 90%, 55%)", emoji: "👨🏾" },
  { color: "hsl(145, 72%, 40%)", emoji: "👩🏽" },
  { color: "hsl(280, 60%, 55%)", emoji: "👨🏻" },
  { color: "hsl(175, 85%, 35%)", emoji: "👩🏿" },
  { color: "hsl(24, 90%, 55%)", emoji: "👨🏼" },
  { color: "hsl(145, 72%, 40%)", emoji: "👩🏾" },
  { color: "hsl(280, 60%, 55%)", emoji: "👨🏽" },
];

const CommunityStrip = () => {
  return (
    <section className="py-12 overflow-hidden bg-mint-section">
      <div className="container-narrow text-center mb-8">
        <h3 className="font-display font-bold text-xl text-foreground">
          Your <span className="text-gradient">Community</span> Delivers
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Trusted travelers across Southern Africa
        </p>
      </div>

      <div className="relative">
        {/* Scrolling strip */}
        <motion.div
          className="flex gap-6 px-8"
          animate={{ x: [0, -400] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...avatars, ...avatars].map((avatar, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 border-background shadow-soft"
              style={{ backgroundColor: avatar.color + "20", borderColor: avatar.color + "40" }}
            >
              {avatar.emoji}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="text-center mt-8">
        <Link to="/carrier-signup">
          <Button variant="coral" size="lg">Join the Community</Button>
        </Link>
      </div>
    </section>
  );
};

export default CommunityStrip;
