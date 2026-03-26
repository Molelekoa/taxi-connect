import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Truck, Package, MapPin, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const COUNTRIES = ["South Africa", "Lesotho", "Zimbabwe"];

const CITIES: Record<string, string[]> = {
  "South Africa": [
    "Johannesburg", "Pretoria", "Cape Town", "Durban", "Bloemfontein",
    "Port Elizabeth", "Polokwane", "Nelspruit", "Rustenburg", "Kimberley",
  ],
  Lesotho: ["Maseru", "Leribe", "Mafeteng", "Mohale's Hoek", "Qacha's Nek"],
  Zimbabwe: ["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Beitbridge"],
};

const LICENSE_TYPES = ["Code B (Light vehicle)", "Code C1 (Heavy vehicle)", "Code EC (Articulated)"];
const ROUTE_FREQUENCIES = ["Daily", "A few times a week", "Weekly", "Monthly", "Occasionally"];

const DriverWaitlist = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [yearsWithLicense, setYearsWithLicense] = useState("");
  const [routeFrequency, setRouteFrequency] = useState("");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [maxLoadKg, setMaxLoadKg] = useState([25]);
  const [loadsPerTrip, setLoadsPerTrip] = useState([3]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const availableCities = country ? CITIES[country] ?? [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({ title: "Please agree to the terms", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("driver_waitlist" as any).insert({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        country,
        city,
        license_type: licenseType,
        years_with_license: yearsWithLicense,
        route_frequency: routeFrequency,
        vehicle_description: vehicleDescription.trim(),
        max_load_kg: maxLoadKg[0],
        loads_per_trip: loadsPerTrip[0],
        agreed_to_terms: true,
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Application submitted!", description: "We'll be in touch soon." });
    } catch (err: any) {
      console.error("Waitlist submission error:", err);
      toast({
        title: "Submission failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6 animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">You're on the list!</h1>
          <p className="text-muted-foreground text-lg">
            Thanks for signing up, <strong className="text-foreground">{fullName}</strong>. 
            We'll reach out when it's time to get you onboarded.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? Email us at{" "}
            <a href="mailto:hello@parcolo.com" className="text-primary hover:underline">
              hello@parcolo.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container-narrow flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              PARCOLO
            </h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              We Deliver Together
            </p>
          </div>
          <Link to="/auth">
            <Button variant="ghost" size="sm">Admin Login</Button>
          </Link>
        </div>
      </header>

      {/* Route strip */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container-narrow py-3 flex items-center justify-center gap-3 text-sm text-primary font-medium">
          <MapPin className="w-4 h-4" />
          <span>South Africa</span>
          <span className="text-muted-foreground">→</span>
          <span>Lesotho</span>
          <span className="text-muted-foreground">→</span>
          <span>Zimbabwe</span>
        </div>
      </div>

      {/* Hero + Form */}
      <main className="container-narrow py-12 md:py-16">
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Value Prop */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium">
              <Truck className="w-4 h-4" />
              Now recruiting drivers
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
              Earn money delivering parcels on routes you already travel
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Parcolo connects travelers with senders. Join our driver network and get paid for 
              deliveries along your regular routes between South Africa, Lesotho, and Zimbabwe.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Package, title: "Flexible loads", desc: "Choose parcels that fit your trip" },
              { icon: MapPin, title: "Your routes", desc: "No detours — deliver along your way" },
              { icon: Truck, title: "Get paid", desc: "Earn per delivery, paid on completion" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-soft p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="card-elevated p-6 md:p-8 space-y-6">
            <h3 className="text-xl font-display font-bold text-foreground">
              Join the driver waitlist
            </h3>

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name *</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number *</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} placeholder="+27 81 234 5678" />
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={country} onValueChange={(v) => { setCountry(v); setCity(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select value={city} onValueChange={setCity} disabled={!country}>
                  <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {availableCities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Driving Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Driver's license type *</Label>
                <Select value={licenseType} onValueChange={setLicenseType}>
                  <SelectTrigger><SelectValue placeholder="Select license type" /></SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="years">Years with license *</Label>
                <Input id="years" value={yearsWithLicense} onChange={(e) => setYearsWithLicense(e.target.value)} required maxLength={10} placeholder="e.g. 5" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>How often do you travel a route corridor? *</Label>
                <Select value={routeFrequency} onValueChange={setRouteFrequency}>
                  <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                  <SelectContent>
                    {ROUTE_FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vehicle */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle description *</Label>
              <Input id="vehicle" value={vehicleDescription} onChange={(e) => setVehicleDescription(e.target.value)} required maxLength={200} placeholder="e.g. 2020 Toyota Hilux Double Cab" />
            </div>

            {/* Load */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Max load capacity: <strong>{maxLoadKg[0]} kg</strong></Label>
                <Slider value={maxLoadKg} onValueChange={setMaxLoadKg} min={1} max={50} step={1} />
                <p className="text-xs text-muted-foreground">1–50 kg</p>
              </div>
              <div className="space-y-3">
                <Label>Loads per trip: <strong>{loadsPerTrip[0]}</strong></Label>
                <Slider value={loadsPerTrip} onValueChange={setLoadsPerTrip} min={1} max={10} step={1} />
                <p className="text-xs text-muted-foreground">1–10 parcels</p>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to Parcolo's{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </Link>
                . I understand my information will be used to assess my suitability as a driver.
              </Label>
            </div>

            <Button
              type="submit"
              disabled={submitting || !agreedToTerms || !fullName || !email || !phone || !country || !city || !licenseType || !yearsWithLicense || !routeFrequency || !vehicleDescription}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground glow-coral text-base py-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                "Join the Waitlist"
              )}
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container-narrow text-center text-sm text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} Parcolo. We Deliver Together.</p>
          <p>
            <a href="mailto:hello@parcolo.com" className="text-primary hover:underline">hello@parcolo.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DriverWaitlist;
