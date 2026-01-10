import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Package, CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Book & Drop Off",
    description: "Book your parcel online or via WhatsApp. Then drop off your package at one of our designated hubs across the region.",
    details: [
      "Book online in under 2 minutes",
      "Pay via EFT, card, or cash at hub",
      "Hubs in Johannesburg & Pretoria",
    ],
    icon: MapPin,
  },
  {
    step: "02",
    title: "We Transport It",
    description: "Your parcel is securely transported via our optimized logistics network. Our partners are established operators running daily scheduled routes.",
    details: [
      "Daily departures on popular routes",
      "Secure handling and tracking",
      "Trusted transport partners",
    ],
    icon: Package,
  },
  {
    step: "03",
    title: "Recipient Collects",
    description: "The recipient is notified when the parcel arrives at the destination hub. They simply show ID and collect. We can also arrange last-mile delivery for an additional fee.",
    details: [
      "SMS notification on arrival",
      "ID verification for security",
      "Optional door-to-door delivery",
    ],
    icon: Package,
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow">
          {/* Hero */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              How <span className="text-gradient">CourierConnect</span> Works
            </h1>
            <p className="text-lg text-muted-foreground">
              We've built a smarter way to send parcels — using optimized logistics networks 
              that deliver faster and more affordably.
            </p>
          </div>

          {/* The Innovation */}
          <div className="card-elevated p-8 md:p-12 mb-16 text-center">
            <h2 className="font-display font-bold text-2xl text-foreground mb-4">
              The <span className="text-gradient">Smart Logistics</span> Advantage
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Through route optimization and shared logistics, we pass significant savings on to you 
              while maintaining reliable, scheduled delivery service across Southern Africa.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="p-4">
                <div className="text-3xl font-display font-bold text-primary mb-2">60%</div>
                <p className="text-sm text-muted-foreground">Cheaper than traditional couriers</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-display font-bold text-primary mb-2">Daily</div>
                <p className="text-sm text-muted-foreground">Departures on major routes</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-display font-bold text-primary mb-2">3</div>
                <p className="text-sm text-muted-foreground">Countries connected</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`grid lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-6 mb-4">
                    {/* Large Step Number */}
                    <div className="font-display font-black text-6xl md:text-7xl text-primary/30 leading-none">
                      {step.step}
                    </div>
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">STEP {step.step}</div>
                      <h2 className="font-display font-bold text-2xl text-foreground">
                        {step.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`card-elevated p-8 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary to-primary/10 rounded-xl flex items-center justify-center">
                    <step.icon className="h-20 w-20 text-primary/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="card-elevated p-8 md:p-12 max-w-2xl mx-auto">
              {/* Decorative element */}
              <div className="font-display font-black text-6xl text-primary/20 mb-4 leading-none">
                2<span className="text-3xl align-top">min</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">
                Ready to Send a Parcel?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Book your delivery in under 2 minutes. Get instant pricing and drop off at your nearest hub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/small-parcel">
                  <Button variant="hero" size="lg">
                    Send a Parcel
                  </Button>
                </Link>
                <a href="https://wa.me/27115685343">
                  <Button variant="outline" size="lg">
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;