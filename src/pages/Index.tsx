import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParcelPassAnimation from "@/components/ParcelPassAnimation";
import SavingsCounter from "@/components/SavingsCounter";
import CommunityStrip from "@/components/CommunityStrip";
import { DropOffIcon, CommunityDeliverIcon, CollectIcon } from "@/components/HowItWorksIcons";
import { Package, MapPin, Banknote, Clock, Shield, Users } from "lucide-react";

const parcelSizes = [
  {
    id: "small",
    abbr: "S",
    title: "Small",
    weight: "1-5 kg",
    description: "Documents, electronics, small packages.",
  },
  {
    id: "medium",
    abbr: "M",
    title: "Medium",
    weight: "5-10 kg",
    description: "Larger boxes, multiple items.",
  },
  {
    id: "large",
    abbr: "L",
    title: "Large",
    weight: "10-20 kg",
    description: "Suitcase-sized cargo.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const Index = () => {
  const navigate = useNavigate();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section — Warm, Mint-tinted */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16" style={{ background: "var(--gradient-hero)" }}>
        {/* Soft decorative shapes in brand colors */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/12 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-success/10 rounded-full blur-2xl" />

        <div className="container-narrow relative z-10 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-soft mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground font-medium">Community-powered delivery</span>
              </motion.div>
              
              <motion.h1
                className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                Parcel delivery
                <br />
                made <span className="text-gradient-coral">simple</span>
              </motion.h1>
              
              <motion.p
                className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                Send parcels across South Africa, Lesotho & Zimbabwe with verified travelers already on your route. No warehouses, no middlemen.
              </motion.p>
              
              <motion.p
                className="mt-3 text-sm text-primary font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.25 }}
              >
                Create a free account to book — pricing is always free to check.
              </motion.p>
              
              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <Link to="/freight-estimator">
                  <Button variant="coral" size="xl" className="w-full sm:w-auto">
                    Send a Parcel
                  </Button>
                </Link>
                <Link to="/freight-estimator">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Check Pricing
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">Secure handling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Daily departures</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Community of travelers</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Parcel Pass Animation */}
            <motion.div
              className="hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150" />
                <ParcelPassAnimation />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="w-8 h-12 border-2 border-primary/30 rounded-full flex items-start justify-center pt-2">
            <motion.div 
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Value Proposition — Mint background */}
      <section className="section-padding bg-mint-section">
        <div className="container-narrow">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-4">
              Why <span className="text-gradient-coral">Parcolo</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our optimized logistics network delivers faster and more affordably than traditional couriers.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Banknote,
                title: "Affordable",
                description: "Smart pricing through route optimization.",
                extra: <SavingsCounter />,
                color: "accent",
              },
              {
                icon: MapPin,
                title: "Wide Coverage",
                description: "Access even remote areas through our extensive logistics network across 3 countries.",
                extra: null,
                color: "primary",
              },
              {
                icon: Clock,
                title: "Fast & Reliable",
                description: "Daily departures on popular routes with scheduled, reliable service.",
                extra: null,
                color: "success",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="card-interactive p-8 text-center group"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 transition-colors ${
                  item.color === "accent" ? "bg-accent/10 group-hover:bg-accent/20" :
                  item.color === "success" ? "bg-success/10 group-hover:bg-success/20" :
                  "bg-primary/10 group-hover:bg-primary/20"
                }`}>
                  <item.icon className={`h-7 w-7 ${
                    item.color === "accent" ? "text-accent" :
                    item.color === "success" ? "text-success" :
                    "text-primary"
                  }`} />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {item.description}
                </p>
                {item.extra && <div className="mt-2">{item.extra}</div>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Parcel Size Selector */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground">
              What are you <span className="text-gradient-coral">sending?</span>
            </h2>
            <p className="text-muted-foreground mt-4">
              We handle parcels from 1kg to 20kg — perfect for e-commerce, personal items, and essential goods.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {parcelSizes.map((size, index) => (
              <motion.button
                key={size.id}
                onClick={() => navigate('/small-parcel')}
                className="p-8 rounded-2xl border-2 transition-all duration-300 text-center border-border bg-card hover:border-accent/50 hover:shadow-coral-glow group"
                variants={scaleIn}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 15 }
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="font-display font-extrabold text-5xl md:text-6xl mb-3 transition-colors text-accent/60 group-hover:text-accent">
                  {size.abbr}
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-1">
                  {size.title}
                </h3>
                <p className="text-sm text-muted-foreground">{size.weight}</p>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works — With animated icons */}
      <section className="section-padding bg-mint-section">
        <div className="container-narrow">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground">
              How It <span className="text-gradient">Works</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {[
              {
                step: "01",
                title: "Book & Pay",
                description: "Book online in 2 minutes. Pay securely via card or EFT — then a traveler on your route picks up your parcel.",
                IconComponent: DropOffIcon,
              },
              {
                step: "02",
                title: "Traveler Delivers",
                description: "A verified community member already traveling your route carries your parcel — no warehouses, no middlemen.",
                IconComponent: CommunityDeliverIcon,
              },
              {
                step: "03",
                title: "Recipient Collects",
                description: "The recipient is notified, meets the traveler at an agreed point, and collects with ID verification.",
                IconComponent: null,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="text-center card-interactive p-8 group"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                onHoverStart={() => setHoveredStep(index)}
                onHoverEnd={() => setHoveredStep(null)}
              >
                {/* Animated icon */}
                <div className="mb-6">
                  {item.IconComponent ? (
                    <item.IconComponent />
                  ) : (
                    <CollectIcon isHovered={hoveredStep === index} />
                  )}
                </div>

                <div className="font-brand font-bold text-sm text-accent mb-2 uppercase tracking-wider">
                  Step {item.step}
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/how-it-works">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Cross-Border Routes */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-accent/20 p-8 md:p-12"
            style={{ background: "linear-gradient(135deg, hsl(24 90% 55% / 0.08) 0%, hsl(160 45% 94%) 40%, hsl(175 85% 35% / 0.06) 100%)" }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-4">
                  CROSS-BORDER
                </div>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-3">
                  South Africa • Lesotho • <span className="text-gradient-coral">Zimbabwe</span>
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Send parcels across borders with our established cross-border network. Transparent pricing, reliable delivery.
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                  <div className="px-4 py-2 rounded-2xl bg-card border border-border">
                    <span className="text-muted-foreground text-sm">Lesotho from</span>
                    <span className="ml-2 font-display font-bold text-accent text-lg">R150</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-card border border-border">
                    <span className="text-muted-foreground text-sm">Zimbabwe from</span>
                    <span className="ml-2 font-display font-bold text-accent text-lg">R525</span>
                  </div>
                </div>

                <Link to="/freight-estimator">
                  <Button variant="coral" size="lg">
                    Send Cross-Border
                  </Button>
                </Link>
              </div>

              <div className="hidden md:block">
                <div className="font-display font-extrabold text-7xl lg:text-8xl text-primary/15 leading-none">
                  🇿🇦→🇱🇸
                  <br />
                  🇿🇦→🇿🇼
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-mint-section">
        <div className="container-narrow">
          <motion.div
            className="grid md:grid-cols-3 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {[
              { icon: Package, stat: "5,000+", label: "Parcels Delivered", color: "text-primary" },
              { icon: Users, stat: "50+", label: "Transport Partners", color: "text-accent" },
              { icon: Shield, stat: "100%", label: "Secure Handling", color: "text-success" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="p-6"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-4`} />
                <div className="font-display font-extrabold text-4xl text-foreground mb-2">
                  {item.stat}
                </div>
                <p className="text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Strip */}
      <CommunityStrip />

      <Footer />
    </div>
  );
};

export default Index;
