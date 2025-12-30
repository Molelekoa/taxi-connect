import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface QuoteFormProps {
  showTitle?: boolean;
  preSelectedService?: string;
}

const QuoteForm = ({ showTitle = true, preSelectedService = "" }: QuoteFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
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
    // Here you would typically send the data to a backend
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
              required
              placeholder="John Smith"
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
              placeholder="Your Company Inc."
              className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
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
              required
              placeholder="you@company.com"
              className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
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
              required
              placeholder="(555) 123-4567"
              className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
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
              required
              placeholder="City, State"
              className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
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
              required
              placeholder="City, State"
              className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
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
            required
            className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>Select...</option>
            <option value="ftl">Full Truckload (FTL)</option>
            <option value="ltl">Less Than Truckload (LTL)</option>
            <option value="expedited">Expedited</option>
            <option value="specialized">Specialized</option>
          </select>
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
