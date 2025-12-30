import { useState } from "react";
import { z } from "zod";
import { Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const carrierSchema = z.object({
  contactName: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  mcDotNumber: z
    .string()
    .min(5, "Please enter a valid MC or DOT number")
    .regex(/^(MC|DOT)?-?\d+$/i, "Format: MC-123456 or DOT-123456"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
  fleetSize: z.string().min(1, "Please select your fleet size"),
});

type CarrierFormData = z.infer<typeof carrierSchema>;

const CarrierSignup = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CarrierFormData, string>>>({});
  const [formData, setFormData] = useState<CarrierFormData>({
    contactName: "",
    companyName: "",
    mcDotNumber: "",
    email: "",
    phone: "",
    fleetSize: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = carrierSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CarrierFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof CarrierFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CarrierFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const inputClassName = (field: keyof CarrierFormData) =>
    `w-full h-12 px-4 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

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
                      placeholder="Your full name"
                      className={inputClassName("contactName")}
                    />
                    {errors.contactName && (
                      <p className="text-sm text-destructive mt-1">{errors.contactName}</p>
                    )}
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
                      placeholder="Trucking company name"
                      className={inputClassName("companyName")}
                    />
                    {errors.companyName && (
                      <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
                    )}
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
                      placeholder="MC-123456 or DOT-123456"
                      className={inputClassName("mcDotNumber")}
                    />
                    {errors.mcDotNumber && (
                      <p className="text-sm text-destructive mt-1">{errors.mcDotNumber}</p>
                    )}
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
                        placeholder="you@company.com"
                        className={inputClassName("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email}</p>
                      )}
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
                        placeholder="(555) 123-4567"
                        className={inputClassName("phone")}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                      )}
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
                      className={`${inputClassName("fleetSize")} appearance-none cursor-pointer`}
                    >
                      <option value="" disabled>Select fleet size...</option>
                      <option value="1-5">1-5 trucks</option>
                      <option value="6-10">6-10 trucks</option>
                      <option value="10+">10+ trucks</option>
                    </select>
                    {errors.fleetSize && (
                      <p className="text-sm text-destructive mt-1">{errors.fleetSize}</p>
                    )}
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
