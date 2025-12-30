import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const quoteSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
  origin: z.string().min(2, "Please enter a valid origin location"),
  destination: z.string().min(2, "Please enter a valid destination"),
  loadType: z.string().min(1, "Please select a load type"),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  showTitle?: boolean;
  preSelectedService?: string;
}

const QuoteForm = ({ showTitle = true, preSelectedService = "" }: QuoteFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormData, string>>>({});
  const [formData, setFormData] = useState<QuoteFormData>({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    origin: "",
    destination: "",
    loadType: preSelectedService,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = quoteSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof QuoteFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof QuoteFormData;
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
    // Clear error when user starts typing
    if (errors[name as keyof QuoteFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="card-elevated p-8 md:p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display font-bold text-2xl text-foreground mb-3">
          Thank You!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          A Dyno Dash specialist will contact you shortly. We typically respond within 1 business hour.
        </p>
      </div>
    );
  }

  const inputClassName = (field: keyof QuoteFormData) =>
    `w-full h-12 px-4 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  return (
    <div>
      {showTitle && (
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Get Your <span className="text-gradient">Instant Quote</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fill out the form below and we'll get back to you within 1 business hour.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-elevated p-8 md:p-10 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Smith"
              className={inputClassName("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
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
              placeholder="Your Company Inc."
              className={inputClassName("companyName")}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address *
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
              Phone Number *
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

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Load Origin *
            </label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              placeholder="City, State"
              className={inputClassName("origin")}
            />
            {errors.origin && (
              <p className="text-sm text-destructive mt-1">{errors.origin}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Load Destination *
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="City, State"
              className={inputClassName("destination")}
            />
            {errors.destination && (
              <p className="text-sm text-destructive mt-1">{errors.destination}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Load Type *
          </label>
          <select
            name="loadType"
            value={formData.loadType}
            onChange={handleChange}
            className={`${inputClassName("loadType")} appearance-none cursor-pointer`}
          >
            <option value="" disabled>Select...</option>
            <option value="ftl">Full Truckload (FTL)</option>
            <option value="ltl">Less Than Truckload (LTL)</option>
            <option value="expedited">Expedited</option>
            <option value="specialized">Specialized</option>
          </select>
          {errors.loadType && (
            <p className="text-sm text-destructive mt-1">{errors.loadType}</p>
          )}
        </div>

        <Button type="submit" variant="hero" size="xl" className="w-full">
          Submit Quote Request
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Your information is secure. We'll contact you within 1 business hour.
        </p>
      </form>
    </div>
  );
};

export default QuoteForm;
