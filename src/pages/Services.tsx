import { Link } from "react-router-dom";
import { Truck, Package, Zap, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const services = [
  {
    id: "ftl",
    icon: Truck,
    title: "Full Truckload (FTL)",
    description: "Dedicated trucks for your large shipments requiring exclusive capacity.",
    features: [
      "Exclusive use of entire trailer",
      "Fastest transit times",
      "Reduced handling and risk",
      "Ideal for 10,000+ lbs or 10+ pallets",
      "Dry van, flatbed, and refrigerated options",
    ],
  },
  {
    id: "ltl",
    icon: Package,
    title: "Less Than Truckload (LTL)",
    description: "Cost-effective shipping for smaller loads that don't require a full trailer.",
    features: [
      "Share trailer space to reduce costs",
      "Ideal for 150–10,000 lbs",
      "Flexible pickup schedules",
      "Perfect for routine shipments",
      "Nationwide coverage",
    ],
  },
  {
    id: "expedited",
    icon: Zap,
    title: "Expedited Shipping",
    description: "Time-critical deliveries with guaranteed transit times and priority handling.",
    features: [
      "Dedicated equipment, no stops",
      "Direct routes for fastest delivery",
      "24/7 availability",
      "Team drivers for non-stop transit",
      "Real-time tracking & updates",
    ],
  },
  {
    id: "specialized",
    icon: Shield,
    title: "Specialized Freight",
    description: "Custom solutions for unique freight requirements and complex shipments.",
    features: [
      "Temperature-controlled (reefer)",
      "Hazardous materials (hazmat)",
      "Oversized and heavy haul",
      "High-value cargo",
      "White glove delivery services",
    ],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow">
          {/* Hero */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Our <span className="text-gradient">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              From full truckloads to expedited shipping, we provide comprehensive freight solutions 
              tailored to your business needs. Whatever you're shipping, we've got you covered.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="card-elevated p-8 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-foreground">
                      {service.title}
                    </h2>
                    <p className="text-muted-foreground mt-1">{service.description}</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/get-quote">
                  <Button variant="outline" className="w-full">
                    Get Quote for {service.title.split(" (")[0]}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">
              Not sure which service is right for you? Our logistics experts are here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-quote">
                <Button variant="hero" size="lg">
                  Get a Free Quote
                </Button>
              </Link>
              <a href="tel:+18005551234">
                <Button variant="outline" size="lg">
                  Call (800) 555-1234
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
