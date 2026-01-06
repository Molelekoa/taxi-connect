import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import heroImage from "@/assets/hero-truck.jpg";

const services = [
  {
    id: "ftl",
    abbr: "FTL",
    title: "Full Truckload",
    description: "Dedicated capacity for large shipments. Your freight gets exclusive use of the entire trailer, ensuring fast transit times and reduced handling. Ideal for shipments over 4,500 kg or 10+ pallets.",
  },
  {
    id: "ltl",
    abbr: "LTL",
    title: "Less Than Truckload",
    description: "Cost-effective shipping for smaller loads. Share trailer space with other shippers to reduce costs while still getting reliable service. Perfect for shipments between 70–4,500 kg.",
  },
  {
    id: "expedited",
    abbr: "EXP",
    title: "Expedited",
    description: "Time-critical deliveries when every hour counts. Dedicated equipment, direct routes, and priority handling ensure your urgent freight arrives on schedule. Available 24/7.",
  },
  {
    id: "specialized",
    abbr: "SPEC",
    title: "Specialized",
    description: "Custom solutions for unique freight requirements. Temperature-controlled, hazmat, oversized, or high-value cargo—we have the expertise and carrier network to handle it safely.",
  },
  {
    id: "parcel",
    abbr: "PKG",
    title: "Small Parcel",
    description: "Affordable cross-border delivery for small packages (1-5 kg) from Johannesburg and Pretoria to Lesotho and Zimbabwe. Fixed pricing from R150. Fast, reliable, and hassle-free.",
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
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.8]);

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
            alt="Modern truck on highway"
            className="w-full h-full object-cover"
            style={{ scale: backgroundScale }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
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
          <motion.h1
            className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            Powerful Logistics.
            <br />
            <span className="text-gradient">Simple Process.</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            Dyno Dash connects your freight with our vetted carrier network. Fast, reliable, and transparent.
          </motion.p>
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <Link to="/get-quote">
              <Button variant="hero" size="xl">
                Get a Free Quote
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

      {/* Interactive Service Selector */}
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
              What are you <span className="text-gradient">shipping?</span>
            </h2>
          </motion.div>

          {/* Service Cards - Typography Based */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {services.map((service, index) => (
              <motion.button
                key={service.id}
                onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                className={`p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 text-center ${
                  selectedService === service.id
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
                {/* Bold Abbreviation */}
                <div className={`font-display font-black text-4xl md:text-5xl mb-3 transition-colors ${
                  selectedService === service.id ? "text-primary" : "text-primary/70"
                }`}>
                  {service.abbr}
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm md:text-base">
                  {service.title}
                </h3>
              </motion.button>
            ))}
          </motion.div>

          {/* Selected Service Description */}
          {selectedService && (
            <motion.div
              className="mt-8 p-6 md:p-8 rounded-2xl bg-secondary/50 border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-6">
                {services.find((s) => s.id === selectedService)?.description}
              </p>
              <div className="text-center">
                <Link to={selectedService === 'parcel' ? '/small-parcel' : '/get-quote'}>
                  <Button variant="hero" size="lg">
                    {selectedService === 'parcel' ? 'Book Small Parcel' : `Get Quote for ${services.find((s) => s.id === selectedService)?.title}`}
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
                title: "Submit",
                description: "Tell us about your load in under 60 seconds.",
              },
              {
                step: "02",
                title: "Match",
                description: "Our system finds the ideal carrier from our network.",
              },
              {
                step: "03",
                title: "Track",
                description: "Receive updates and track your shipment seamlessly.",
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

      {/* Quote Form Section */}
      <motion.section
        id="quote-form"
        className="section-padding"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto">
            <QuoteForm />
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Index;