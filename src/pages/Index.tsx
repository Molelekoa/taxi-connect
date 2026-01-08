import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Bus, MapPin, Banknote, Clock, Shield, Users } from "lucide-react";
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
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

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: backgroundY }}
        >
          <motion.img
            src={heroImage}
            alt="Bus traveling on a highway"
            className="w-full h-full object-cover"
            style={{ scale: backgroundScale }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </motion.div>
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />

        {/* Glow Effect */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-glow)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        <div className="container-narrow relative z-10 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Bus className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Powered by taxis & buses</span>
          </motion.div>
          
          <motion.h1
            className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            Smart Parcel Delivery.
            <br />
            <span className="text-gradient">Affordable Rates.</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            CourierConnect uses existing taxi and bus routes to deliver your parcels across South Africa, Lesotho, and Zimbabwe — fast and affordable.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <Link to="/small-parcel">
              <Button variant="hero" size="xl">
                Send a Parcel
              </Button>
            </Link>
            <Link to="/freight-estimator">
              <Button variant="outline" size="xl">
                Get Pricing
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex items-start justify-center pt-2 animate-float">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
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
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Why <span className="text-gradient">CourierConnect</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We leverage underutilized space on vehicles already traveling these routes daily — turning everyday travel into reliable delivery.
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
                description: "Smart pricing based on discounted transport rates. Save up to 60% compared to traditional couriers.",
              },
              {
                icon: MapPin,
                title: "Wide Coverage",
                description: "Access remote areas through our network of taxi ranks and bus routes across 3 countries.",
              },
              {
                icon: Clock,
                title: "Fast & Reliable",
                description: "Daily departures on popular routes. Your parcel travels with scheduled passenger transport.",
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
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              What are you <span className="text-gradient">sending?</span>
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
                onClick={() => setSelectedSize(selectedSize === size.id ? null : size.id)}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 text-center ${
                  selectedSize === size.id
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
                }`}
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
                <div className={`font-display font-black text-5xl md:text-6xl mb-3 transition-colors ${
                  selectedSize === size.id ? "text-primary" : "text-primary/70"
                }`}>
                  {size.abbr}
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-1">
                  {size.title}
                </h3>
                <p className="text-sm text-muted-foreground">{size.weight}</p>
              </motion.button>
            ))}
          </motion.div>

          {/* Selected Size Description */}
          {selectedSize && (
            <motion.div
              className="mt-8 p-6 md:p-8 rounded-2xl bg-secondary/50 border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-6">
                {parcelSizes.find((s) => s.id === selectedSize)?.description}
              </p>
              <div className="text-center">
                <Link to="/small-parcel">
                  <Button variant="hero" size="lg">
                    Send {parcelSizes.find((s) => s.id === selectedSize)?.title} Parcel
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
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
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
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
                title: "Drop Off",
                description: "Bring your parcel to a designated hub at a taxi rank or bus terminal.",
              },
              {
                step: "02",
                title: "We Transport",
                description: "Your parcel travels on the next available taxi or bus heading to your destination.",
              },
              {
                step: "03",
                title: "Collect",
                description: "Recipient picks up from the destination hub, or we deliver to their door.",
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
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-3">
                  South Africa • Lesotho • <span className="text-gradient">Zimbabwe</span>
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Send parcels across borders with our established taxi and bus routes. Transparent pricing, reliable delivery.
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

                <Link to="/small-parcel">
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