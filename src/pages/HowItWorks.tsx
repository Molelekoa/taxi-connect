import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  {
    step: "01",
    title: "Submit Your Load",
    description: "Tell us about your load in under 60 seconds. Simply fill out our quick online form with your pickup and delivery locations, freight details, and any special requirements.",
    details: [
      "No account required to get a quote",
      "Instant submission confirmation",
      "Available 24/7, even on holidays",
    ],
  },
  {
    step: "02",
    title: "We Match & Negotiate",
    description: "Our logistics experts get to work immediately. We search our extensive carrier network to find the best match for your shipment, negotiating competitive rates on your behalf.",
    details: [
      "Access to 10,000+ vetted carriers",
      "Competitive rate negotiation",
      "Carrier vetting for safety & reliability",
    ],
  },
  {
    step: "03",
    title: "Track & Deliver",
    description: "Once your carrier is confirmed, you'll receive real-time tracking updates. Our team monitors every shipment and proactively communicates any updates until delivery is complete.",
    details: [
      "Real-time GPS tracking",
      "Proactive milestone updates",
      "Dedicated support throughout transit",
    ],
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
              How <span className="text-gradient">Dyno Dash</span> Works
            </h1>
            <p className="text-lg text-muted-foreground">
              We've simplified freight logistics into three easy steps. From your first quote to final delivery, 
              we handle everything so you can focus on your business.
            </p>
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
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`card-elevated p-8 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary to-primary/10 rounded-xl flex items-center justify-center">
                    {/* Large decorative number */}
                    <span className="font-display font-black text-8xl md:text-9xl text-primary/20">
                      {step.step}
                    </span>
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
                60<span className="text-3xl align-top">sec</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">
                Ready to Get Started?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Get your free quote in under 60 seconds. Our team responds within 1 business hour.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/get-quote">
                  <Button variant="hero" size="lg">
                    Get a Free Quote
                  </Button>
                </Link>
                <a href="tel:+18005551234">
                  <Button variant="outline" size="lg">
                    (800) 555-1234
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