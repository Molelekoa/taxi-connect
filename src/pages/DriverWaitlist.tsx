import { useState, useRef, useCallback } from "react";
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
import { Loader2, Fuel, BadgeDollarSign, Clock, Users, ChevronDown, MapPin, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

const BENEFITS = [
  {
    icon: Fuel,
    title: "Cover Your Fuel",
    desc: "Turn empty boot space into income that pays for your petrol and tolls.",
  },
  {
    icon: Clock,
    title: "Your Schedule, Your Rules",
    desc: "No shifts, no bosses. Pick up parcels only when you're already traveling.",
  },
  {
    icon: BadgeDollarSign,
    title: "Get Paid Fast",
    desc: "Earn per delivery, paid on completion. No waiting around.",
  },
  {
    icon: Users,
    title: "Community-Powered",
    desc: "Join a trusted network of drivers across Southern Africa.",
  },
];

const DriverWaitlist = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Easter egg: tap logo 5 times to navigate to /auth
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleLogoTap = useCallback(() => {
    tapCountRef.current += 1;
    clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      navigate("/auth");
      return;
    }
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
  }, [navigate]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          <button
            onClick={handleLogoTap}
            className="text-left focus:outline-none"
            aria-label="Parcolo"
            type="button"
          >
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              PARCOLO
            </h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              We Deliver Together
            </p>
          </button>
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

      {/* Hero */}
      <main className="container-narrow py-12 md:py-20">
        <div className="max-w-2xl mx-auto space-y-12">
          {/* Value Prop */}
          <div className="text-center space-y-6">
            <p className="inline-block bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-semibold">
              Be one of the first 50 drivers in your city
            </p>

            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
              Cover Your Fuel.{" "}
              <span className="text-gradient-coral">Pay Your Tolls.</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Collect parcels, earn extra cash.
              Help people get things delivered from South Africa, Lesotho and Zimbabwe — without changing your route.
              Parcolo matches travelers with senders. Get paid for trips you already make.
            </p>

            <Button
              variant="coral"
              size="xl"
              onClick={scrollToForm}
              className="mx-auto"
            >
              Join the Waitlist
              <ChevronDown className="w-5 h-5 ml-1" />
            </Button>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-elevated p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-bold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Signup Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="card-elevated p-6 md:p-8 space-y-6 scroll-mt-6">
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-foreground">
                Join the driver waitlist
              </h3>
              <p className="text-sm text-muted-foreground">Takes 2 minutes. No commitment.</p>
            </div>

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
              variant="coral"
              size="xl"
              disabled={submitting || !agreedToTerms || !fullName || !email || !phone || !country || !city || !licenseType || !yearsWithLicense || !routeFrequency || !vehicleDescription}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                "Join the Waitlist — It's Free"
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
