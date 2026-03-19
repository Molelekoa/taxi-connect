import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Package, Car, ArrowRight } from "lucide-react";

const ROUTES = [
  { from: "JHB", to: "HRE", label: "Johannesburg → Harare" },
  { from: "PTA", to: "BUL", label: "Pretoria → Bulawayo" },
  { from: "CPT", to: "MAS", label: "Cape Town → Maseru" },
  { from: "JHB", to: "MAS", label: "Johannesburg → Maseru" },
  { from: "DBN", to: "JHB", label: "Durban → Johannesburg" },
  { from: "BFN", to: "MAS", label: "Bloemfontein → Maseru" },
];

const HeroSection = () => {
  return (
    <section
      id="main-content"
      className="relative pt-14 min-h-[85vh] flex flex-col bg-gradient-to-b from-secondary via-background to-background"
      aria-label="Parcolo – peer-to-peer parcel delivery"
    >
      {/* Main hero content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Headline */}
        <motion.div
          className="text-center max-w-2xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight">
            Send parcels with{" "}
            <span className="text-primary">travelers</span> already
            heading your way
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Affordable, peer-to-peer delivery across South Africa, Lesotho &amp; Zimbabwe.
          </p>
        </motion.div>

        {/* Route strip */}
        <motion.div
          className="mt-8 w-full max-w-2xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 text-success text-xs font-bold">
              🇿🇦 South Africa
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
              🇱🇸 Lesotho
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold">
              🇿🇼 Zimbabwe
            </span>
          </div>

          {/* City pair pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {ROUTES.map((route) => (
              <span
                key={route.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-foreground shadow-soft"
              >
                <span className="font-bold text-primary">{route.from}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="font-bold text-accent">{route.to}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Dual CTA */}
        <motion.div
          className="mt-10 w-full max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/freight-estimator" className="block">
            <Button
              variant="coral"
              size="xl"
              className="w-full flex-col h-auto py-5 gap-1"
            >
              <span className="flex items-center gap-2 text-base font-bold">
                <Package className="w-5 h-5" />
                Send a Parcel
              </span>
              <span className="text-xs font-normal opacity-80">
                Need to send something?
              </span>
            </Button>
          </Link>

          <Link to="/carrier-signup" className="block">
            <Button
              variant="outline"
              size="xl"
              className="w-full flex-col h-auto py-5 gap-1 border-primary/30 hover:border-primary hover:bg-primary/5"
            >
              <span className="flex items-center gap-2 text-base font-bold text-primary">
                <Car className="w-5 h-5" />
                I'm a Traveler
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Traveling soon? Earn on your trip
              </span>
            </Button>
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="mt-6 text-xs text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          Up to 60% cheaper than traditional couriers · Daily departures
        </motion.p>
      </div>
    </section>
  );
};

export default HeroSection;
