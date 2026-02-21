import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedRouteMap from "@/components/AnimatedRouteMap";
import CountUpNumber from "@/components/CountUpNumber";
import { Package, MapPin, Banknote, Clock, Shield, Users, ArrowRight } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Subtle decorative blobs */}
        <div className="absolute top-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="container-narrow relative z-10 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground font-medium">Community-powered delivery</span>
              </motion.div>
              
              <motion.h1
                className="font-extrabold text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                Send parcels with travelers,{" "}
                <span className="text-primary">not just couriers.</span>
              </motion.h1>
              
              <motion.p
                className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                Affordable, reliable cross-border delivery to South Africa, Lesotho & Zimbabwe.
              </motion.p>
              
              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <Link to="/freight-estimator">
                  <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-primary-glow)] font-bold">
                    Get a Price
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" size="xl">
                    See How It Works
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                className="mt-14 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-muted-foreground"
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

            {/* Right: Animated route map */}
            <motion.div
              className="hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <AnimatedRouteMap />
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
          <div className="w-8 h-12 border-2 border-primary/25 rounded-full flex items-start justify-center pt-2">
            <motion.div 
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Value Proposition */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-extrabold text-3xl md:text-4xl mb-4">
              Why <span className="text-primary">Parcel Buddy</span>?
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
                className="card-elevated p-8 text-center hover:border-primary/40 transition-all duration-300"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3">
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
            <h2 className="font-extrabold text-3xl md:text-4xl">
              What are you <span className="text-primary">sending?</span>
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
                className="p-8 rounded-2xl border-2 transition-all duration-300 text-center border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
                variants={scaleIn}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: "0 20px 40px -15px hsl(224 50% 65% / 0.25)",
                  transition: { type: "spring", stiffness: 400, damping: 15 }
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="font-extrabold text-5xl md:text-6xl mb-3 text-primary/60">
                  {size.abbr}
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {size.title}
                </h3>
                <p className="text-sm text-muted-foreground">{size.weight}</p>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-extrabold text-3xl md:text-4xl">
              How It <span className="text-primary">Works</span>
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
                emoji: "📦",
              },
              {
                step: "02",
                title: "Community Delivers",
                description: "A community member already traveling your route carries your parcel.",
                emoji: "🤝",
              },
              {
                step: "03",
                title: "Collect",
                description: "Recipient meets the traveler at an agreed point, or we deliver to their door.",
                emoji: "✅",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="text-center relative"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {/* Step number */}
                <div className="font-extrabold text-7xl md:text-8xl text-primary/10 mb-2 leading-none select-none">
                  {item.step}
                </div>
                {/* Parcel-passing icon */}
                <div className="text-3xl mb-3 parcel-pulse inline-block">{item.emoji}</div>
                <h3 className="font-bold text-xl mb-3">
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
            className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-12"
            style={{ boxShadow: "var(--shadow-elevated)" }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/15 text-accent text-sm font-semibold mb-4">
                  CROSS-BORDER
                </div>
                <h2 className="font-extrabold text-2xl md:text-3xl mb-3">
                  South Africa • Lesotho • <span className="text-primary">Zimbabwe</span>
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Send parcels across borders with our established cross-border network. Transparent pricing, reliable delivery.
                </p>
                
                {/* Price highlights */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                  <div className="px-4 py-2 rounded-xl bg-background border border-border">
                    <span className="text-muted-foreground text-sm">Lesotho from</span>
                    <span className="ml-2 font-bold text-primary text-lg">R150</span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-background border border-border">
                    <span className="text-muted-foreground text-sm">Zimbabwe from</span>
                    <span className="ml-2 font-bold text-primary text-lg">R525</span>
                  </div>
                </div>

                <Link to="/freight-estimator">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold" size="lg">
                    Send Cross-Border
                  </Button>
                </Link>
              </div>

              {/* Right: Flags with wave animation */}
              <div className="hidden md:flex items-center gap-6">
                <span className="text-6xl flag-wave">🇿🇦</span>
                <ArrowRight className="w-8 h-8 text-primary/30" />
                <span className="text-6xl flag-wave" style={{ animationDelay: "0.5s" }}>🇱🇸</span>
                <ArrowRight className="w-8 h-8 text-primary/30" />
                <span className="text-6xl flag-wave" style={{ animationDelay: "1s" }}>🇿🇼</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust / Stats Section with counting numbers */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow">
          <motion.div
            className="grid md:grid-cols-3 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {[
              { icon: Package, end: 5000, suffix: "+", label: "Parcels Delivered" },
              { icon: Users, end: 50, suffix: "+", label: "Transport Partners" },
              { icon: Shield, end: 100, suffix: "%", label: "Secure Handling" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="p-6"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <item.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <div className="font-extrabold text-4xl mb-2">
                  <CountUpNumber end={item.end} suffix={item.suffix} />
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
