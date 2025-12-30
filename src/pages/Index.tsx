import { useState } from "react";
import { Link } from "react-router-dom";
import { Truck, Package, Zap, Shield, FileText, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import heroImage from "@/assets/hero-truck.jpg";

const services = [
  {
    id: "ftl",
    icon: Truck,
    title: "Full Truckload",
    description: "Dedicated capacity for large shipments. Your freight gets exclusive use of the entire trailer, ensuring fast transit times and reduced handling. Ideal for shipments over 10,000 lbs or 10+ pallets.",
  },
  {
    id: "ltl",
    icon: Package,
    title: "Less Than Truckload",
    description: "Cost-effective shipping for smaller loads. Share trailer space with other shippers to reduce costs while still getting reliable service. Perfect for shipments between 150–10,000 lbs.",
  },
  {
    id: "expedited",
    icon: Zap,
    title: "Expedited",
    description: "Time-critical deliveries when every hour counts. Dedicated equipment, direct routes, and priority handling ensure your urgent freight arrives on schedule. Available 24/7.",
  },
  {
    id: "specialized",
    icon: Shield,
    title: "Specialized",
    description: "Custom solutions for unique freight requirements. Temperature-controlled, hazmat, oversized, or high-value cargo—we have the expertise and carrier network to handle it safely.",
  },
];

const Index = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern truck on highway"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
        </div>

        {/* Glow Effect */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-glow)" }}
        />

        <div className="container-narrow relative z-10 text-center">
          <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight animate-fade-up">
            Powerful Logistics.
            <br />
            <span className="text-gradient">Simple Process.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "100ms" }}>
            Dyno Dash connects your freight with our vetted carrier network. Fast, reliable, and transparent.
          </p>
          <div className="mt-10 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Link to="/get-quote">
              <Button variant="hero" size="xl">
                Get a Free Quote
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Interactive Service Selector */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              What are you <span className="text-gradient">shipping?</span>
            </h2>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                className={`p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 text-center ${
                  selectedService === service.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  selectedService === service.id ? "bg-primary" : "bg-secondary"
                }`}>
                  <service.icon className={`w-7 h-7 ${
                    selectedService === service.id ? "text-primary-foreground" : "text-primary"
                  }`} />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {service.title}
                </h3>
              </button>
            ))}
          </div>

          {/* Selected Service Description */}
          {selectedService && (
            <div className="mt-8 p-6 md:p-8 rounded-2xl bg-secondary/50 border border-border animate-fade-up">
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-6">
                {services.find((s) => s.id === selectedService)?.description}
              </p>
              <div className="text-center">
                <Link to="/get-quote">
                  <Button variant="hero" size="lg">
                    Get Quote for {services.find((s) => s.id === selectedService)?.title}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                icon: FileText,
                title: "Submit",
                description: "Tell us about your load in under 60 seconds.",
              },
              {
                step: "2",
                icon: Users,
                title: "Match",
                description: "Our system finds the ideal carrier from our network.",
              },
              {
                step: "3",
                icon: MapPin,
                title: "Track",
                description: "Receive updates and track your shipment seamlessly.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="font-display font-bold text-sm text-primary mb-2">
                  STEP {item.step}
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/how-it-works">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section id="quote-form" className="section-padding">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto">
            <QuoteForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
