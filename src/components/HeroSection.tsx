import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Package, Car, ArrowRight } from "lucide-react";
import HeroMap from "@/components/HeroMap";

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
      className="relative pt-14 min-h-[85vh] flex flex-col bg-background overflow-hidden"
      aria-label="Parcolo – peer-to-peer parcel delivery"
    >
      {/* Background map — decorative, covers full section */}
      <div className="absolute inset-0 pt-14">
        <HeroMap />
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background from-25% via-background/70 via-55% to-background/10" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end px-4 pb-8 pt-20 sm:justify-center sm:pb-12">
        {/* Route corridor label */}
        <motion.div
          className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span>South Africa</span>
          <ArrowRight className="w-3 h-3" />
          <span>Lesotho</span>
          <ArrowRight className="w-3 h-3" />
          <span>Zimbabwe</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          className="text-center max-w-xl mx-auto space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight">
            Send parcels with{" "}
            <span className="text-primary">travelers</span> already
            heading your way
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Affordable, peer-to-peer delivery across Southern Africa.
            Up to 60% cheaper than traditional couriers.
          </p>
        </motion.div>

        {/* Route chips — clean, monochrome */}
        <motion.div
          className="mt-6 flex flex-wrap justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {ROUTES.map((route) => (
            <span
              key={route.label}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card/80 backdrop-blur-sm border border-border text-[11px] font-mono tracking-wide text-muted-foreground"
            >
              {route.from}
              <ArrowRight className="w-2.5 h-2.5 text-primary/60" />
              {route.to}
            </span>
          ))}
        </motion.div>

        {/* Dual CTA */}
        <motion.div
          className="mt-8 w-full max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Link to="/freight-estimator" className="block">
            <Button
              variant="coral"
              size="xl"
              className="w-full flex-col h-auto py-4 gap-0.5"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <Package className="w-4 h-4" />
                Send a Parcel
              </span>
              <span className="text-[11px] font-normal opacity-75">
                Need to send something?
              </span>
            </Button>
          </Link>

          <Link to="/carrier-signup" className="block">
            <Button
              variant="outline"
              size="xl"
              className="w-full flex-col h-auto py-4 gap-0.5 border-border hover:border-primary hover:bg-primary/5"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Car className="w-4 h-4 text-primary" />
                I'm a Traveler
              </span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Traveling soon? Earn on your trip
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
