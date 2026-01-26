import { useState, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, CheckCircle, MapPin, Radio, AlertTriangle, ArrowLeft, User, Truck } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  calculateDeliveryPrice,
  WEIGHT_LIMITS,
  TRACKING_FEE,
} from "@/config/pricingCalculator";

// Available cities for origin and destination
const ORIGIN_CITIES = [
  // South Africa
  { value: "Johannesburg", label: "Johannesburg (SA)" },
  { value: "Pretoria", label: "Pretoria (SA)" },
  { value: "Durban", label: "Durban (SA)" },
  { value: "Bloemfontein", label: "Bloemfontein (SA)" },
  { value: "Cape Town", label: "Cape Town (SA)" },
  // Lesotho
  { value: "Maseru", label: "Maseru (Lesotho)" },
  // Zimbabwe
  { value: "Harare", label: "Harare (Zimbabwe)" },
  { value: "Bulawayo", label: "Bulawayo (Zimbabwe)" },
];

const DESTINATION_CITIES = [
  { value: "Johannesburg", label: "Johannesburg (SA)" },
  { value: "Pretoria", label: "Pretoria (SA)" },
  { value: "Durban", label: "Durban (SA)" },
  { value: "Cape Town", label: "Cape Town (SA)" },
  { value: "Bloemfontein", label: "Bloemfontein (SA)" },
  { value: "Maseru", label: "Maseru (Lesotho)" },
  { value: "Harare", label: "Harare (Zimbabwe)" },
  { value: "Bulawayo", label: "Bulawayo (Zimbabwe)" },
];

const parcelBookingSchema = z.object({
  contactName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  originCity: z.string().min(2, "Origin city is required"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupDate: z.string().optional(),
  destinationCity: z.string().min(2, "Destination city is required"),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().min(10, "Recipient phone required"),
  weight: z.number().min(WEIGHT_LIMITS.min, `Minimum ${WEIGHT_LIMITS.min} kg`).max(WEIGHT_LIMITS.max, `Maximum ${WEIGHT_LIMITS.max} kg`),
  description: z.string().optional(),
  includeTracking: z.boolean().optional(),
});

type FormData = z.infer<typeof parcelBookingSchema>;

const SmallParcelBooking = () => {
  const location = useLocation();
  const { toast } = useToast();
  
  // Pre-fill from estimator if available
  const prefilled = location.state as { 
    origin?: string; 
    destination?: string; 
    weight?: number;
    price?: number;
    includeTracking?: boolean;
  } | null;

  const [formData, setFormData] = useState<Partial<FormData>>({
    contactName: "",
    email: "",
    phone: "",
    originCity: prefilled?.origin || "",
    pickupAddress: "",
    pickupDate: "",
    destinationCity: prefilled?.destination || "",
    deliveryAddress: "",
    recipientName: "",
    recipientPhone: "",
    weight: prefilled?.weight || undefined,
    description: "",
    includeTracking: prefilled?.includeTracking || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);
  
  // Track if we should use the pre-calculated price from the estimator
  const [usePrefilledPrice, setUsePrefilledPrice] = useState(
    !!(prefilled?.price && prefilled?.origin && prefilled?.destination && prefilled?.weight)
  );

  // Calculate live price using new pricing calculator (only when not using prefilled price)
  const calculatedPriceBreakdown = useMemo(() => {
    if (usePrefilledPrice) return null; // Don't recalculate if using prefilled price
    if (!formData.originCity || !formData.destinationCity || !formData.weight) return null;
    if (formData.weight < WEIGHT_LIMITS.min || formData.weight > WEIGHT_LIMITS.max) return null;
    return calculateDeliveryPrice(formData.originCity, formData.destinationCity, formData.weight, undefined, formData.includeTracking || false);
  }, [formData.originCity, formData.destinationCity, formData.weight, formData.includeTracking, usePrefilledPrice]);

  // Use prefilled price or calculated price
  // When using prefilled price, adjust for tracking toggle changes
  const displayPrice = useMemo(() => {
    if (usePrefilledPrice && prefilled?.price) {
      // Calculate base price without tracking from the prefilled price
      const prefilledBasePrice = prefilled.includeTracking 
        ? prefilled.price - TRACKING_FEE 
        : prefilled.price;
      
      // Add tracking fee based on current form state
      return formData.includeTracking 
        ? prefilledBasePrice + TRACKING_FEE 
        : prefilledBasePrice;
    }
    return calculatedPriceBreakdown?.finalPrice || null;
  }, [usePrefilledPrice, prefilled?.price, prefilled?.includeTracking, formData.includeTracking, calculatedPriceBreakdown?.finalPrice]);

  // Build a price breakdown object for display (either from prefilled or calculated)
  const priceBreakdown = useMemo(() => {
    if (usePrefilledPrice && prefilled?.price) {
      // Calculate the current price based on tracking toggle
      const prefilledBasePrice = prefilled.includeTracking 
        ? prefilled.price - TRACKING_FEE 
        : prefilled.price;
      const currentPrice = formData.includeTracking 
        ? prefilledBasePrice + TRACKING_FEE 
        : prefilledBasePrice;
      
      // Return a simplified breakdown using the adjusted prefilled price
      return {
        finalPrice: currentPrice,
        route: `${prefilled.origin} → ${prefilled.destination}`,
        parcelWeightKg: prefilled.weight || 0,
        distanceCategory: "Pre-quoted",
        trackingIncluded: formData.includeTracking || false,
        trackingFee: formData.includeTracking ? TRACKING_FEE : 0,
      };
    }
    return calculatedPriceBreakdown;
  }, [usePrefilledPrice, prefilled, formData.includeTracking, calculatedPriceBreakdown]);


  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    // If user changes route or weight, stop using prefilled price and recalculate
    // NOTE: Tracking changes should NOT invalidate prefilled price - we adjust it instead
    if (['originCity', 'destinationCity', 'weight'].includes(field)) {
      setUsePrefilledPrice(false);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = parcelBookingSchema.parse({
        ...formData,
        weight: Number(formData.weight),
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log("Parcel booking submitted:", validated);
      setShowReview(false);
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
        setShowReview(false);
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
                Your parcel booking has been received.
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
                    Parcel delivered to recipient in {formData.destinationCity}
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
              CourierConnect Booking
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Book Your Parcel Delivery
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Affordable parcel delivery ({WEIGHT_LIMITS.min}-{WEIGHT_LIMITS.max}kg) across South Africa, Lesotho, and Zimbabwe through our optimized logistics network.
            </p>
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
                    <Label>Origin City *</Label>
                    <Select
                      value={formData.originCity}
                      onValueChange={(value) => handleInputChange('originCity', value)}
                    >
                      <SelectTrigger className={errors.originCity ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select origin city" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORIGIN_CITIES.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.originCity && <p className="text-destructive text-xs">{errors.originCity}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress">Pickup Address *</Label>
                    <Input
                      id="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                      placeholder="Full street address"
                      className={errors.pickupAddress ? 'border-destructive' : ''}
                    />
                    {errors.pickupAddress && <p className="text-destructive text-xs">{errors.pickupAddress}</p>}
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
                    <Label>Destination City *</Label>
                    <Select
                      value={formData.destinationCity}
                      onValueChange={(value) => handleInputChange('destinationCity', value)}
                    >
                      <SelectTrigger className={errors.destinationCity ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {DESTINATION_CITIES.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.destinationCity && <p className="text-destructive text-xs">{errors.destinationCity}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Delivery Address / Area *</Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      placeholder="Full address or area name"
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
                      min={WEIGHT_LIMITS.min}
                      max={WEIGHT_LIMITS.max}
                      step="0.1"
                      value={formData.weight || ''}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                      placeholder={`${WEIGHT_LIMITS.min}-${WEIGHT_LIMITS.max} kg`}
                      className={errors.weight ? 'border-destructive' : ''}
                    />
                    {errors.weight && <p className="text-destructive text-xs">{errors.weight}</p>}
                    <p className="text-xs text-muted-foreground">
                      {WEIGHT_LIMITS.min}kg minimum — {WEIGHT_LIMITS.max}kg maximum
                    </p>
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

                {/* Tracking Add-on */}
                <div className="bg-secondary/50 border border-border rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="includeTracking"
                      checked={formData.includeTracking || false}
                      onCheckedChange={(checked) => handleInputChange('includeTracking', checked === true)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="includeTracking" 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        <Radio className="w-4 h-4 text-primary" />
                        Get Tracking Link
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                          +R{TRACKING_FEE}
                        </span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Receive a unique tracking link you can share with the recipient to follow your parcel's journey.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Live Price Display */}
              {priceBreakdown && (
                <motion.div
                  className="bg-primary/10 border border-primary/20 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Your Price</p>
                    <p className="font-display font-bold text-4xl text-primary">
                      R{priceBreakdown.finalPrice.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-background/50 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span>{priceBreakdown.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight</span>
                      <span>{priceBreakdown.parcelWeightKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span>{priceBreakdown.distanceCategory}</span>
                    </div>
                    {priceBreakdown.trackingIncluded && (
                      <div className="flex justify-between text-primary font-medium">
                        <span>Parcel Tracking</span>
                        <span>+R{priceBreakdown.trackingFee}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Review Button */}
              <Button
                type="button"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={!formData.originCity || !formData.destinationCity || !priceBreakdown}
                onClick={() => {
                  // Validate form before showing review
                  try {
                    parcelBookingSchema.parse({
                      ...formData,
                      weight: Number(formData.weight),
                    });
                    setErrors({});
                    setShowReview(true);
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
                  }
                }}
              >
                Review Booking{priceBreakdown ? ` — R${priceBreakdown.finalPrice}` : ''}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You'll be able to review all details before confirming.
              </p>
            </div>
          </motion.form>

          {/* Review Section */}
          {showReview && (
            <motion.div
              className="fixed inset-0 z-50 bg-background/95 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="container-narrow max-w-3xl mx-auto py-8 px-4">
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="bg-foreground text-background p-6">
                    <h2 className="font-display font-bold text-xl flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Review Your Booking
                    </h2>
                    <p className="text-background/70 text-sm mt-1">
                      Please verify all details are correct before confirming.
                    </p>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    {/* Disclaimer */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                            Please verify all details
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            It is your responsibility to ensure the accuracy of all information provided. 
                            Incorrect details may result in delivery delays or failed deliveries.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Your Details */}
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Your Details
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Name:</span> {formData.contactName}</p>
                          <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                          <p><span className="text-muted-foreground">Phone:</span> {formData.phone}</p>
                        </div>
                      </div>

                      {/* Package Details */}
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          Package
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Weight:</span> {formData.weight} kg</p>
                          <p><span className="text-muted-foreground">Tracking:</span> {formData.includeTracking ? "Yes (+R" + TRACKING_FEE + ")" : "No"}</p>
                          {formData.description && (
                            <p><span className="text-muted-foreground">Contents:</span> {formData.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Pickup Details */}
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          Pickup
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">City:</span> {formData.originCity}</p>
                          <p><span className="text-muted-foreground">Address:</span> {formData.pickupAddress}</p>
                          {formData.pickupDate && (
                            <p><span className="text-muted-foreground">Date:</span> {formData.pickupDate}</p>
                          )}
                        </div>
                      </div>

                      {/* Delivery Details */}
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-primary" />
                          Delivery
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">City:</span> {formData.destinationCity}</p>
                          <p><span className="text-muted-foreground">Address:</span> {formData.deliveryAddress}</p>
                          <p><span className="text-muted-foreground">Recipient:</span> {formData.recipientName}</p>
                          <p><span className="text-muted-foreground">Phone:</span> {formData.recipientPhone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    {priceBreakdown && (
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                        <div className="text-center mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                          <p className="font-display font-bold text-4xl text-primary">
                            R{priceBreakdown.finalPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-3 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Route</span>
                            <span>{priceBreakdown.route}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight</span>
                            <span>{priceBreakdown.parcelWeightKg} kg</span>
                          </div>
                          {priceBreakdown.trackingIncluded && (
                            <div className="flex justify-between text-primary font-medium">
                              <span>Parcel Tracking</span>
                              <span>+R{priceBreakdown.trackingFee}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="sm:flex-1"
                        onClick={() => setShowReview(false)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Edit Details
                      </Button>
                      <Button
                        type="button"
                        variant="hero"
                        size="lg"
                        className="sm:flex-1"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                      >
                        {isSubmitting ? "Processing..." : "Confirm Booking"}
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      By confirming, you agree to our{" "}
                      <Link to="/terms-of-service" className="underline">Terms of Service</Link>.
                      We'll confirm your booking within 1 hour.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SmallParcelBooking;
