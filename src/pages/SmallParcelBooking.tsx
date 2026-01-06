import { useState, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, CheckCircle, MapPin, AlertCircle } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PARCEL_SERVICE, getParcelPrice, isEligibleOrigin, type ParcelDestination } from "@/config/parcelService";

const parcelBookingSchema = z.object({
  contactName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupDate: z.string().optional(),
  destination: z.enum(["lesotho", "zimbabwe"]),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().min(10, "Recipient phone required"),
  weight: z.number().min(1, "Minimum 1 kg").max(5, "Maximum 5 kg"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof parcelBookingSchema>;

const SmallParcelBooking = () => {
  const location = useLocation();
  const { toast } = useToast();
  
  // Pre-fill from freight estimator if available
  const prefilled = location.state as { destination?: ParcelDestination; weight?: number } | null;

  const [formData, setFormData] = useState<Partial<FormData>>({
    contactName: "",
    email: "",
    phone: "",
    pickupAddress: "",
    pickupDate: "",
    destination: prefilled?.destination || undefined,
    deliveryAddress: "",
    recipientName: "",
    recipientPhone: "",
    weight: prefilled?.weight || undefined,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate live price
  const calculatedPrice = useMemo(() => {
    if (!formData.destination || !formData.weight) return null;
    return getParcelPrice(formData.destination, formData.weight);
  }, [formData.destination, formData.weight]);

  // Check origin eligibility
  const originWarning = useMemo(() => {
    if (!formData.pickupAddress || formData.pickupAddress.length < 3) return null;
    return !isEligibleOrigin(formData.pickupAddress);
  }, [formData.pickupAddress]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = parcelBookingSchema.parse({
        ...formData,
        weight: Number(formData.weight),
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log("Parcel booking submitted:", validated);
      setIsSuccess(true);
      toast({
        title: "Booking Submitted!",
        description: "We'll confirm your parcel pickup within 1 hour.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container-narrow max-w-2xl mx-auto">
            <motion.div
              className="bg-card border border-border rounded-xl p-8 md:p-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
              </motion.div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-muted-foreground mb-2">
                Your small parcel booking has been received.
              </p>
              <p className="text-muted-foreground mb-8">
                We'll contact you within <strong className="text-foreground">1 hour</strong> to confirm pickup details.
              </p>

              <div className="bg-secondary/50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    Our team reviews your booking and confirms availability
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    You receive a confirmation call/SMS with pickup time
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    Courier collects your parcel and provides tracking
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">4.</span>
                    Parcel delivered to recipient in {formData.destination === 'lesotho' ? 'Lesotho' : 'Zimbabwe'}
                  </li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setIsSuccess(false)} variant="outline">
                  Book Another Parcel
                </Button>
                <Link to="/">
                  <Button variant="hero">Return Home</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Package className="w-4 h-4" />
              Small Parcel Express
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Cross-Border Parcel Delivery
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fast, fixed-price delivery for small packages (1-5 kg) from Johannesburg & Pretoria to Lesotho and Zimbabwe.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <motion.div
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                formData.destination === 'lesotho'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => handleInputChange('destination', 'lesotho')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-foreground">Lesotho</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">1-3 kg</span>
                  <span className="font-bold text-foreground">R150</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">3-5 kg</span>
                  <span className="font-bold text-foreground">R800</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                formData.destination === 'zimbabwe'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => handleInputChange('destination', 'zimbabwe')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-foreground">Zimbabwe</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">1-3 kg</span>
                  <span className="font-bold text-foreground">R525</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">3-5 kg</span>
                  <span className="font-bold text-foreground">R2,800</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-foreground text-background p-6">
              <h2 className="font-display font-bold text-xl">Book Your Parcel</h2>
              <p className="text-background/70 text-sm mt-1">
                Fill in the details below and we'll arrange pickup.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Contact Details */}
              <section className="space-y-4">
                <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">
                  Your Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Full Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className={errors.contactName ? 'border-destructive' : ''}
                    />
                    {errors.contactName && <p className="text-destructive text-xs">{errors.contactName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="e.g., 082 123 4567"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              {/* Pickup Details */}
              <section className="space-y-4">
                <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">
                  Pickup Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress">Pickup Address *</Label>
                    <Input
                      id="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                      placeholder="Full street address in Johannesburg or Pretoria"
                      className={errors.pickupAddress ? 'border-destructive' : ''}
                    />
                    {errors.pickupAddress && <p className="text-destructive text-xs">{errors.pickupAddress}</p>}
                    {originWarning && (
                      <div className="flex items-start gap-2 text-amber-600 text-xs mt-1">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Small Parcel service is only available from Johannesburg and Pretoria areas.{" "}
                          <Link to="/get-quote" className="underline">Need shipping from another location?</Link>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Preferred Pickup Date (optional)</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </section>

              {/* Delivery Details */}
              <section className="space-y-4">
                <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">
                  Delivery Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Destination Country *</Label>
                    <Select
                      value={formData.destination}
                      onValueChange={(value) => handleInputChange('destination', value)}
                    >
                      <SelectTrigger className={errors.destination ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesotho">Lesotho</SelectItem>
                        <SelectItem value="zimbabwe">Zimbabwe</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.destination && <p className="text-destructive text-xs">{errors.destination}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">City / Area *</Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      placeholder={formData.destination === 'lesotho' ? 'e.g., Maseru' : 'e.g., Harare'}
                      className={errors.deliveryAddress ? 'border-destructive' : ''}
                    />
                    {errors.deliveryAddress && <p className="text-destructive text-xs">{errors.deliveryAddress}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange('recipientName', e.target.value)}
                      className={errors.recipientName ? 'border-destructive' : ''}
                    />
                    {errors.recipientName && <p className="text-destructive text-xs">{errors.recipientName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientPhone">Recipient Phone *</Label>
                    <Input
                      id="recipientPhone"
                      value={formData.recipientPhone}
                      onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                      className={errors.recipientPhone ? 'border-destructive' : ''}
                    />
                    {errors.recipientPhone && <p className="text-destructive text-xs">{errors.recipientPhone}</p>}
                  </div>
                </div>
              </section>

              {/* Package Details */}
              <section className="space-y-4">
                <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">
                  Package Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.weight || ''}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                      placeholder="1-5 kg"
                      className={errors.weight ? 'border-destructive' : ''}
                    />
                    {errors.weight && <p className="text-destructive text-xs">{errors.weight}</p>}
                    <p className="text-xs text-muted-foreground">Maximum 5 kg per parcel</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Contents Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of parcel contents"
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              {/* Live Price Display */}
              {calculatedPrice && (
                <motion.div
                  className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-muted-foreground mb-1">Your Price</p>
                  <p className="font-display font-bold text-4xl text-primary">
                    R{calculatedPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Fixed price • No hidden fees
                  </p>
                </motion.div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={isSubmitting || originWarning || !formData.destination}
              >
                {isSubmitting ? "Submitting..." : "Book Now"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By booking, you agree to our{" "}
                <Link to="/terms-of-service" className="underline">Terms of Service</Link>.
                We'll confirm your booking within 1 hour.
              </p>
            </div>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SmallParcelBooking;
