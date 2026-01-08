import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Truck, Clock, Shield } from "lucide-react";

const services = [
  {
    id: "small",
    number: "01",
    title: "Small Parcels (1-5 kg)",
    description: "Perfect for documents, electronics, and small packages.",
    features: [
      "Documents and paperwork",
      "Phones, tablets, small electronics",
      "E-commerce deliveries",
      "Personal care packages",
      "From R150 to Lesotho",
    ],
    icon: Package,
  },
  {
    id: "medium",
    number: "02",
    title: "Medium Parcels (5-10 kg)",
    description: "Ideal for larger boxes and multiple items.",
    features: [
      "Online shopping orders",
      "Care packages",
      "Business supplies",
      "Clothing and textiles",
      "Bulk small items",
    ],
    icon: Package,
  },
  {
    id: "large",
    number: "03",
    title: "Large Parcels (10-20 kg)",
    description: "Suitcase-sized cargo for heavier shipments.",
    features: [
      "Essential supplies",
      "Bulk goods",
      "Equipment and tools",
      "Maximum suitcase dimensions",
      "Cross-border capability",
    ],
    icon: Truck,
  },
  {
    id: "express",
    number: "04",
    title: "Express Delivery",
    description: "Priority handling for time-sensitive parcels.",
    features: [
      "First available departure",
      "Priority loading",
      "SMS tracking updates",
      "Same-day on popular routes",
      "Guaranteed next-day delivery",
    ],
    icon: Clock,
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
              From small documents to larger packages, CourierConnect handles parcels up to 20kg 
              across South Africa, Lesotho, and Zimbabwe using our taxi and bus network.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="card-elevated p-8 hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="flex items-start gap-6 mb-6">
                  {/* Large Number */}
                  <div className="font-display font-black text-5xl md:text-6xl text-primary/30 group-hover:text-primary/50 transition-colors leading-none shrink-0">
                    {service.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <service.icon className="h-5 w-5 text-primary" />
                      <h2 className="font-display font-bold text-xl text-foreground">
                        {service.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground mt-1">{service.description}</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 pl-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/small-parcel">
                  <Button variant="outline" className="w-full">
                    Send {service.title.split(" (")[0]}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Coverage Section */}
          <div className="mt-16 card-elevated p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="font-display font-bold text-xl text-foreground">
                Our Coverage Areas
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <h4 className="font-display font-semibold text-foreground mb-2">🇿🇦 South Africa</h4>
                <p className="text-sm text-muted-foreground">
                  Johannesburg, Pretoria, and major cities connected via taxi ranks.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <h4 className="font-display font-semibold text-foreground mb-2">🇱🇸 Lesotho</h4>
                <p className="text-sm text-muted-foreground">
                  Maseru and surrounding areas. From R150 for small parcels.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <h4 className="font-display font-semibold text-foreground mb-2">🇿🇼 Zimbabwe</h4>
                <p className="text-sm text-muted-foreground">
                  Harare and major cities. From R525 for small parcels.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">
              Not sure which service is right for you? Get an instant price estimate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/small-parcel">
                <Button variant="hero" size="lg">
                  Send a Parcel
                </Button>
              </Link>
              <Link to="/freight-estimator">
                <Button variant="outline" size="lg">
                  Get Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;