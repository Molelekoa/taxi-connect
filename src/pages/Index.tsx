import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityStrip from "@/components/CommunityStrip";
import LocationInput from "@/components/LocationInput";
import RouteMap from "@/components/RouteMap";
import { useMapboxDistance } from "@/hooks/useMapboxDistance";
import { Banknote, Globe, Zap, ArrowRight, ChevronDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const POPULAR_CITIES = [
  { value: "Johannesburg", label: "Johannesburg" },
  { value: "Pretoria", label: "Pretoria" },
  { value: "Durban", label: "Durban" },
  { value: "Bloemfontein", label: "Bloemfontein" },
  { value: "Cape Town", label: "Cape Town" },
  { value: "Maseru", label: "Maseru (Lesotho)" },
  { value: "Harare", label: "Harare (Zimbabwe)" },
  { value: "Bulawayo", label: "Bulawayo (Zimbabwe)" },
];

const Index = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const {
    pickupCoordinates,
    deliveryCoordinates,
    pickupPlace,
    deliveryPlace,
  } = useMapboxDistance(origin, destination);

  const handleGetQuote = () => {
    navigate("/freight-estimator", {
      state: { pickupLocation: origin, deliveryLocation: destination },
    });
  };

  const [showScrollCue, setShowScrollCue] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setShowScrollCue(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — Map + Booking Form */}
      <section id="main-content" className="relative pt-14 min-h-[85vh] flex flex-col" aria-label="Send a parcel">
        {/* Map background */}
        <div className="absolute inset-0 pt-14">
          <RouteMap
            pickupCoordinates={pickupCoordinates}
            deliveryCoordinates={deliveryCoordinates}
            pickupLabel={pickupPlace || "Pickup"}
            deliveryLabel={deliveryPlace || "Delivery"}
          />
        </div>

        {/* Booking card overlay */}
        <div className="relative z-10 flex-1 flex items-end pb-12 px-4">
          <motion.div
            className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-md rounded-2xl border border-border shadow-elevated p-6 space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            role="form"
            aria-label="Get a delivery quote"
          >
            <h1 className="font-display font-bold text-xl text-foreground">
              Where are you sending?
            </h1>

            <div className="space-y-3">
              <LocationInput
                value={origin}
                onChange={setOrigin}
                suggestions={POPULAR_CITIES}
                placeholder="Pickup city or address"
              />
              <LocationInput
                value={destination}
                onChange={setDestination}
                suggestions={POPULAR_CITIES}
                placeholder="Delivery city or address"
              />
            </div>

            <Button
              variant="coral"
              size="lg"
              className="w-full"
              onClick={handleGetQuote}
              disabled={!origin || !destination}
            >
              Get Quote
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              <Link
                to="/carrier-signup"
                className="text-primary font-medium hover:underline"
              >
                I'm a traveler — earn on your trips →
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Scroll down cue */}
        <AnimatePresence>
          {showScrollCue && (
            <motion.div
              className="relative z-10 flex justify-center pb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => window.scrollBy({ top: 300, behavior: "smooth" })}
                className="flex flex-col items-center gap-1 text-muted-foreground/70 hover:text-foreground transition-colors touch-manipulation"
                aria-label="Scroll down for more"
              >
                <span className="text-xs font-medium">More below</span>
                <ChevronDown className="w-5 h-5 animate-bounce-gentle" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Quick stats strip */}
      <section className="py-6 border-b border-border bg-card" aria-label="Key statistics">
        <div className="container-narrow flex items-center justify-center gap-8 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-accent" aria-hidden="true" />
            <span className="font-semibold text-foreground">60% cheaper</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">3 countries</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-success" aria-hidden="true" />
            <span className="font-semibold text-foreground">Daily departures</span>
          </div>
        </div>
      </section>

      {/* How It Works — compact row */}
      <section className="section-padding bg-mint-section">
        <div className="container-narrow">
          <h2 className="font-display font-extrabold text-2xl text-foreground text-center mb-8">
            How It <span className="text-gradient">Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { step: "01", title: "Book & Pay", desc: "Choose your route, pay online — a traveler heading your way picks up." },
              { step: "02", title: "Traveler Delivers", desc: "A verified member carries your parcel on a trip they're already making." },
              { step: "03", title: "Collect", desc: "SMS on arrival. Show ID, collect your parcel — done." },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-2xl bg-card border border-border">
                <div className="text-accent font-bold text-xs uppercase tracking-wider mb-2">
                  Step {item.step}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Border Routes */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="rounded-2xl border border-border p-6 md:p-8 bg-card">
            <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-3">
              CROSS-BORDER
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-4">
              Send Across Borders
            </h2>

            <Tabs defaultValue="zimbabwe" className="w-full">
              <TabsList className="mb-4 bg-secondary border border-border">
                <TabsTrigger value="zimbabwe">Zimbabwe</TabsTrigger>
                <TabsTrigger value="lesotho">Lesotho</TabsTrigger>
                <TabsTrigger value="south-africa">Domestic</TabsTrigger>
              </TabsList>

              <TabsContent value="zimbabwe" className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Delivered by travelers on daily JHB–Harare routes. From <span className="font-bold text-accent">R525</span>.
                </p>
                <Link to="/freight-estimator">
                  <Button variant="coral" size="sm">Get a Quote</Button>
                </Link>
              </TabsContent>
              <TabsContent value="lesotho" className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Affordable cross-border delivery on established routes. From <span className="font-bold text-accent">R150</span>.
                </p>
                <Link to="/freight-estimator">
                  <Button variant="coral" size="sm">Get a Quote</Button>
                </Link>
              </TabsContent>
              <TabsContent value="south-africa" className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  City-to-city delivery without the courier markup. From <span className="font-bold text-accent">R80</span>.
                </p>
                <Link to="/freight-estimator">
                  <Button variant="coral" size="sm">Get a Quote</Button>
                </Link>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <CommunityStrip />
      <Footer />
    </div>
  );
};

export default Index;
