import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, MapPin, Banknote, Clock, Shield, Users } from "lucide-react";
import heroImage from "@/assets/hero-truck.jpg";

const parcelSizes = [
  {
    id: "small",
    abbr: "S",
    title: "Small",
    weight: "1-5 kg",
    description: "Documents, electronics, small packages. Perfect for e-commerce items, personal deliveries, and urgent documents.",
  },
  {
    id: "medium",
    abbr: "M",
    title: "Medium",
    weight: "5-10 kg",
    description: "Larger boxes, multiple items. Ideal for online shopping orders, care packages, and business supplies.",
  },
  {
    id: "large",
    abbr: "L",
    title: "Large",
    weight: "10-20 kg",
    description: "Suitcase-sized cargo. Great for bulk goods, essential supplies, and heavier shipments.",
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
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.85]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Light, Airy, Friendly */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-gradient-to-b from-background via-secondary/40 to-background">
        {/* Warm decorative shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl" />

        <div className="container-narrow relative z-10 text-center py-12">
          {/* Friendly badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-soft mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-foreground font-medium">Smart, efficient delivery</span>
          </motion.div>
          
          <motion.h1
            className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-primary leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            Parcel delivery made
            <br />
            <span className="text-accent">simple & affordable</span>
          </motion.h1>
          
          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            Parcel Buddy delivers your parcels across South Africa, Lesotho, and Zimbabwe — fast, affordable, and friendly.
          </motion.p>
          
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <Link to="/freight-estimator">
              <Button variant="coral" size="xl">
                Send a Parcel
              </Button>
            </Link>
            <Link to="/freight-estimator">
              <Button variant="outline" size="xl">
                Check Pricing
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
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

        {/* Scroll indicator - friendlier style */}
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

      {/* Value Proposition */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-4">
              Why <span className="text-accent">Parcel Buddy</span>?
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
                description: "Smart pricing through route optimization. Save up to 60% compared to traditional couriers.",
              },
              {
                icon: MapPin,
                title: "Wide Coverage",
                description: "Access even remote areas through our extensive logistics network across 3 countries.",
              },
              {
                icon: Clock,
                title: "Fast & Reliable",
                description: "Daily departures on popular routes with scheduled, reliable service.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="card-elevated p-8 text-center hover:border-primary/50 transition-all duration-300"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
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
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">
              What are you <span className="text-accent">sending?</span>
            </h2>
            <p className="text-muted-foreground mt-4">
              We handle parcels from 1kg to 20kg — perfect for e-commerce, personal items, and essential goods.
            </p>
          </motion.div>

          {/* Size Cards */}
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
                className="p-8 rounded-2xl border-2 transition-all duration-300 text-center border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
                variants={scaleIn}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.3)",
                  transition: { type: "spring", stiffness: 400, damping: 15 }
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Size Letter */}
                <div className="font-display font-black text-5xl md:text-6xl mb-3 transition-colors text-primary/70">
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

      {/* How It Works */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">
              How It <span className="text-accent">Works</span>
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
                title: "Drop Off",
                description: "Bring your parcel to one of our convenient collection points.",
              },
              {
                step: "02",
                title: "Community Delivers",
                description: "A community member already traveling your route carries your parcel.",
              },
              {
                step: "03",
                title: "Collect",
                description: "Recipient meets the traveler at an agreed point, or we deliver to their door.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="text-center"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {/* Large Number */}
                <motion.div
                  className="font-display font-black text-7xl md:text-8xl text-primary/20 mb-2 leading-none"
                  whileHover={{ scale: 1.05, color: "hsl(var(--primary) / 0.4)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary to-primary/5 border border-primary/20 p-8 md:p-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Left: Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-4">
                  CROSS-BORDER
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-primary mb-3">
                  South Africa • Lesotho • <span className="text-accent">Zimbabwe</span>
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Send parcels across borders with our established cross-border network. Transparent pricing, reliable delivery.
                </p>
                
                {/* Price highlights */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                  <div className="px-4 py-2 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground text-sm">Lesotho from</span>
                    <span className="ml-2 font-display font-bold text-primary text-lg">R150</span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-card border border-border">
                    <span className="text-muted-foreground text-sm">Zimbabwe from</span>
                    <span className="ml-2 font-display font-bold text-primary text-lg">R525</span>
                  </div>
                </div>

                <Link to="/freight-estimator">
                  <Button variant="hero" size="lg">
                    Send Cross-Border
                  </Button>
                </Link>
              </div>

              {/* Right: Large typography accent */}
              <div className="hidden md:block">
                <div className="font-display font-black text-7xl lg:text-8xl text-primary/15 leading-none">
                  🇿🇦→🇱🇸
                  <br />
                  🇿🇦→🇿🇼
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow">
          <motion.div
            className="grid md:grid-cols-3 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {[
              { icon: Package, stat: "5,000+", label: "Parcels Delivered" },
              { icon: Users, stat: "50+", label: "Transport Partners" },
              { icon: Shield, stat: "100%", label: "Secure Handling" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="p-6"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <item.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <div className="font-display font-black text-4xl text-foreground mb-2">
                  {item.stat}
                </div>
                <p className="text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;