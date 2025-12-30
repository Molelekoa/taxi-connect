import { useState } from "react";
import { Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CarrierSignup = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    contactName: "",
    companyName: "",
    mcDotNumber: "",
    email: "",
    phone: "",
    fleetSize: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const benefits = [
    "Access to quality, consistent loads",
    "Fast, reliable payment terms",
    "Dedicated carrier support team",
    "Simple onboarding process",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left - Info */}
            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
                Join the Dyno Dash{" "}
                <span className="text-gradient">Carrier Network</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Partner with Dyno Dash to access quality loads, reliable payment, and dedicated support. 
                We're always looking for professional carriers to join our growing network.
              </p>

              {/* Benefits */}
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-secondary/50 border border-border text-center">
                  <div className="font-display font-bold text-3xl text-primary">$500M+</div>
                  <div className="text-sm text-muted-foreground mt-1">Freight Moved Annually</div>
                </div>
                <div className="p-6 rounded-xl bg-secondary/50 border border-border text-center">
                  <div className="font-display font-bold text-3xl text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground mt-1">Active Carriers</div>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div>
              {isSubmitted ? (
                <div className="card-elevated p-8 md:p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-foreground mb-3">
                    Application Received!
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Thank you for your interest in joining Dyno Dash. Our carrier team will review your application and contact you within 1-2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h2 className="font-display font-bold text-xl text-foreground">
                      Carrier Application
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder="Trucking company name"
                      className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      MC Number / DOT Number *
                    </label>
                    <input
                      type="text"
                      name="mcDotNumber"
                      value={formData.mcDotNumber}
                      onChange={handleChange}
                      required
                      placeholder="MC-123456 or DOT-123456"
                      className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@company.com"
                        className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="(555) 123-4567"
                        className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Fleet Size *
                    </label>
                    <select
                      name="fleetSize"
                      value={formData.fleetSize}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select fleet size...</option>
                      <option value="1-5">1-5 trucks</option>
                      <option value="6-10">6-10 trucks</option>
                      <option value="10+">10+ trucks</option>
                    </select>
                  </div>

                  <Button type="submit" variant="hero" size="xl" className="w-full">
                    Apply to Join
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Your information is secure. We'll contact you within 1-2 business days.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarrierSignup;
