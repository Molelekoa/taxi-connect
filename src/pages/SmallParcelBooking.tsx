import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Package, CheckCircle, MapPin, Radio, AlertTriangle, ArrowLeft, User, Truck, Upload, FileCheck, Scale, X, ShieldCheck, ExternalLink, CalendarIcon } from "lucide-react";
import LocationInput from "@/components/LocationInput";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMapboxDistance } from "@/hooks/useMapboxDistance";
import WeightBandSelector from "@/components/WeightBandSelector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  calculateBandPrice,
  getWeightBand,
  WEIGHT_BANDS,
  TRACKING_FEE,
} from "@/config/pricingCalculator";

// File upload validation constants
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Available cities for origin and destination
import { CITY_OPTIONS } from "@/config/cities";

const parcelBookingSchema = z.object({
  contactName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  originCity: z.string().min(2, "Origin city is required"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupEarliest: z.string().min(1, "Earliest pickup date is required"),
  pickupLatest: z.string().min(1, "Latest pickup date is required"),
  destinationCity: z.string().min(2, "Destination city is required"),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().min(10, "Recipient phone required"),
  weightBand: z.string().min(1, "Please select a weight band"),
  description: z.string().optional(),
  includeTracking: z.boolean().optional(),
  idDocumentName: z.string().min(1, "ID or Passport upload is required"),
  legalDeclarationAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the legal declaration to proceed" }),
  }),
});

// Lighter schema for verified senders — no contact details or ID/legal required
const verifiedSenderSchema = z.object({
  contactName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  originCity: z.string().min(2, "Origin city is required"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  pickupEarliest: z.string().min(1, "Earliest pickup date is required"),
  pickupLatest: z.string().min(1, "Latest pickup date is required"),
  destinationCity: z.string().min(2, "Destination city is required"),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().min(10, "Recipient phone required"),
  weightBand: z.string().min(1, "Please select a weight band"),
  description: z.string().optional(),
  includeTracking: z.boolean().optional(),
  idDocumentName: z.string().optional(),
  legalDeclarationAccepted: z.boolean().optional(),
});

type FormData = z.infer<typeof parcelBookingSchema>;
type FormDataInput = Partial<Omit<FormData, 'legalDeclarationAccepted'> & { legalDeclarationAccepted: boolean }>;

const SmallParcelBooking = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Profile state for verified senders
  const [isVerifiedSender, setIsVerifiedSender] = useState(false);
  const [profileData, setProfileData] = useState<{
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);


  // Fetch profile to check if user is a verified sender
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name, email, phone, id_document_url, legal_declaration_accepted')
        .eq('auth_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name && data?.id_document_url && data?.legal_declaration_accepted) {
            setProfileData({ full_name: data.full_name, email: data.email, phone: data.phone });
            setIsVerifiedSender(true);
          }
          setProfileLoading(false);
        });
    } else {
      setProfileLoading(false);
    }
  }, [user]);
  
  // Pre-fill from estimator if available
  const prefilled = location.state as { 
    origin?: string; 
    destination?: string; 
    pickupAddress?: string;
    deliveryAddress?: string;
    weight?: number;
    weightBand?: string;
    price?: number;
    includeTracking?: boolean;
    distance?: number;
  } | null;

  // Store prefilled distance for use when prefilled price is active
  const [prefilledDistance] = useState(prefilled?.distance || null);

  const [formData, setFormData] = useState<FormDataInput>({
    contactName: "",
    email: "",
    phone: "",
    originCity: prefilled?.origin || "",
    pickupAddress: prefilled?.pickupAddress || "",
    pickupEarliest: "",
    pickupLatest: "",
    destinationCity: prefilled?.destination || "",
    deliveryAddress: prefilled?.deliveryAddress || "",
    recipientName: "",
    recipientPhone: "",
    weightBand: prefilled?.weightBand || "",
    description: "",
    includeTracking: prefilled?.includeTracking || false,
    idDocumentName: "",
    legalDeclarationAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPayNowPrompt, setShowPayNowPrompt] = useState(false);

  // Scroll to top when switching between form and review
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [showReview]);

  // Pre-fill form with profile data when verified sender
  useEffect(() => {
    if (isVerifiedSender && profileData) {
      setFormData(prev => ({
        ...prev,
        contactName: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        idDocumentName: "on-file",
        legalDeclarationAccepted: true,
      }));
    }
  }, [isVerifiedSender, profileData]);

  // Pick the right schema based on sender status
  const activeSchema = isVerifiedSender ? verifiedSenderSchema : parcelBookingSchema;
  
  
  // ID Document upload state
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [idUploadError, setIdUploadError] = useState<string>("");
  const idInputRef = useRef<HTMLInputElement>(null);
  
  // Track if we should use the pre-calculated price from the estimator
  const [usePrefilledPrice, setUsePrefilledPrice] = useState(
    !!(prefilled?.price && prefilled?.origin && prefilled?.destination && prefilled?.weight)
  );

  // Use Mapbox distance for live calculation when user enters origin/destination directly
  const { distance: mapboxDistance } = useMapboxDistance(
    formData.originCity || "",
    formData.destinationCity || "",
    usePrefilledPrice // skip API call when using prefilled price
  );

  // Effective distance: prefilled > mapbox > undefined
  const effectiveDistance = usePrefilledPrice
    ? prefilledDistance
    : mapboxDistance;

  // Calculate live price using new pricing calculator (only when not using prefilled price)
  const calculatedPriceBreakdown = useMemo(() => {
    if (usePrefilledPrice) return null;
    if (!formData.originCity || !formData.destinationCity || !formData.weightBand) return null;
    return calculateBandPrice(formData.originCity, formData.destinationCity, formData.weightBand, effectiveDistance || undefined, formData.includeTracking || false);
  }, [formData.originCity, formData.destinationCity, formData.weightBand, formData.includeTracking, usePrefilledPrice, effectiveDistance]);

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


  const handleInputChange = (field: keyof FormDataInput, value: string | number | boolean) => {
    // If user changes route or weight, stop using prefilled price and recalculate
    // NOTE: Tracking changes should NOT invalidate prefilled price - we adjust it instead
    if (['originCity', 'destinationCity', 'weightBand'].includes(field)) {
      setUsePrefilledPrice(false);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // ID Document upload handler
  const handleIdUpload = (file: File | null) => {
    setIdUploadError("");
    
    if (!file) {
      setIdDocumentFile(null);
      setFormData(prev => ({ ...prev, idDocumentName: "" }));
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setIdUploadError("Please upload a PDF, JPEG, or PNG file");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setIdUploadError("File size must be less than 5MB");
      return;
    }

    setIdDocumentFile(file);
    setFormData(prev => ({ ...prev, idDocumentName: file.name }));
    if (errors.idDocumentName) {
      setErrors(prev => ({ ...prev, idDocumentName: "" }));
    }
  };

  const handleIdDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleIdUpload(file);
  };

  const handleIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleIdUpload(file);
  };

  const removeIdDocument = () => {
    setIdDocumentFile(null);
    setFormData(prev => ({ ...prev, idDocumentName: "" }));
    if (idInputRef.current) {
      idInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = activeSchema.parse({
        ...formData,
      });

      if (!user) {
        toast({ title: "Please log in to book a parcel", variant: "destructive" });
        return;
      }

      // Get profile ID
      const { data: profileId, error: profileError } = await supabase.rpc('get_profile_id', { _auth_uid: user.id });
      if (profileError || !profileId) {
        toast({ title: "Could not find your profile. Please register first.", variant: "destructive" });
        return;
      }

      // Upload ID document via edge function (server-side validation) if not verified sender
      if (!isVerifiedSender && idDocumentFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", idDocumentFile);
        uploadForm.append("profileId", profileId);
        uploadForm.append("purpose", "id-document");

        const { data: uploadResult, error: uploadError } = await supabase.functions.invoke("upload-document", {
          body: uploadForm,
        });

        if (uploadError || !uploadResult?.success) {
          toast({ title: "Failed to upload ID document", description: uploadError?.message || "Upload failed", variant: "destructive" });
          return;
        }
      }

      // Get selected band info for weight midpoint
      const selectedBand = WEIGHT_BANDS.find(b => b.id === formData.weightBand);

      // Insert parcel into database
      const { error: insertError } = await supabase.from('parcels').insert({
        sender_id: profileId,
        pickup_location: formData.originCity,
        dropoff_location: formData.destinationCity,
        pickup_address: formData.pickupAddress,
        delivery_address: formData.deliveryAddress,
        recipient_name: formData.recipientName,
        recipient_phone: formData.recipientPhone,
        weight_band: formData.weightBand,
        weight_kg: selectedBand ? (selectedBand.range[0] + selectedBand.range[1]) / 2 : null,
        price: displayPrice,
        include_tracking: formData.includeTracking || false,
        description: formData.description || null,
        sender_name: isVerifiedSender ? (profileData?.full_name || '') : (formData.contactName || ''),
        sender_email: isVerifiedSender ? (profileData?.email || '') : (formData.email || ''),
        sender_phone: isVerifiedSender ? (profileData?.phone || '') : (formData.phone || ''),
        status: 'pending',
        pickup_earliest: formData.pickupEarliest || null,
        pickup_latest: formData.pickupLatest || null,
      } as any);

      if (insertError) {
        toast({ title: "Booking failed", description: insertError.message, variant: "destructive" });
        return;
      }

      setShowReview(false);
      setIsSuccess(true);
      setShowPayNowPrompt(true);
      toast({
        title: "Booking Submitted!",
        description: "We'll contact you soon to confirm pickup details.",
      });

      // Belt-and-suspenders: call find-matching-trips as fallback in case trigger didn't fire
      try {
        // Get the most recent parcel for this sender to find the ID
        const { data: recentParcel } = await supabase
          .from("parcels")
          .select("id")
          .eq("sender_id", profileId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (recentParcel) {
          await supabase.functions.invoke("find-matching-trips", {
            body: { parcelId: recentParcel.id },
          });
        }
      } catch {
        // Silent fallback — trigger should have handled it
      }
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
                We'll contact you soon to confirm pickup details.
              </p>

              {/* Pay Now Discount Prompt */}
              {showPayNowPrompt && displayPrice && (
                <motion.div
                  className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6 mb-8 text-left"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Pay now & save 10%!</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Secure your booking by paying now and receive a 10% discount on your delivery.
                  </p>
                  <div className="flex items-center justify-between bg-background rounded-lg p-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Original price</p>
                      <p className="text-sm text-muted-foreground line-through">R{Math.round(displayPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-primary font-medium">Pay now price (10% off)</p>
                      <p className="text-xl font-bold text-primary">R{Math.round(displayPrice * 0.9)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="hero" className="flex-1" onClick={() => {
                      toast({ title: "Payment feature coming soon", description: "Online payments will be available shortly." });
                      setShowPayNowPrompt(false);
                    }}>
                      Pay Now — R{Math.round(displayPrice * 0.9)}
                    </Button>
                    <Button variant="outline" onClick={() => setShowPayNowPrompt(false)}>
                      Pay Later
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    You save R{Math.round(displayPrice * 0.1)} by paying now
                  </p>
                </motion.div>
              )}

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
                    A traveler collects your parcel along their route
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
              Parcolo Booking
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Book Your Parcel Delivery
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Affordable parcel delivery (1–20 kg) across South Africa, Lesotho, and Zimbabwe through our optimized logistics network.
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
              {/* Verified Sender Banner OR Contact + Verification sections */}
              {isVerifiedSender && profileData ? (
                <section className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          Booking as {profileData.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profileData.email} · {profileData.phone}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/auth"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Edit profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </section>
              ) : (
                <>
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

                  {/* Sender Verification Section */}
                  <section className="space-y-4">
                    <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">
                      Sender Verification *
                    </h3>
                    
                    {/* ID Upload */}
                    <div className="space-y-2">
                      <Label>ID Document / Passport *</Label>
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          idDocumentFile 
                            ? 'border-primary bg-primary/5' 
                            : errors.idDocumentName 
                              ? 'border-destructive bg-destructive/5' 
                              : 'border-border hover:border-primary/50'
                        }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleIdDrop}
                      >
                        <input
                          ref={idInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleIdInputChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        {idDocumentFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <FileCheck className="w-8 h-8 text-primary" />
                            <div className="text-left">
                              <p className="font-medium text-foreground">{idDocumentFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(idDocumentFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeIdDocument();
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">Upload your ID or Passport</p>
                              <p className="text-xs text-muted-foreground">
                                PDF, JPEG, or PNG up to 5MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {(errors.idDocumentName || idUploadError) && (
                        <p className="text-destructive text-xs">{idUploadError || errors.idDocumentName}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Your ID is required for traceability and will be stored securely.
                      </p>
                    </div>

                    {/* Legal Declaration */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                      <div className="flex gap-3">
                        <Checkbox
                          id="legalDeclaration"
                          checked={formData.legalDeclarationAccepted || false}
                          onCheckedChange={(checked) => {
                            handleInputChange('legalDeclarationAccepted', checked === true);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor="legalDeclaration" 
                            className="text-sm font-medium cursor-pointer flex items-center gap-2 text-amber-800 dark:text-amber-200"
                          >
                            <Scale className="w-4 h-4" />
                            Legal Declaration *
                          </Label>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
                            I hereby declare that the contents of this parcel are not illegal, stolen, counterfeit, 
                            or prohibited under the laws of South Africa, Lesotho, or Zimbabwe. I understand that 
                            I will be held personally liable for any violation of applicable laws and that false 
                            declarations may result in legal action. I consent to my identification being recorded 
                            for traceability purposes.
                          </p>
                        </div>
                      </div>
                      {errors.legalDeclarationAccepted && (
                        <p className="text-destructive text-xs mt-2 ml-7">{errors.legalDeclarationAccepted}</p>
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* Pickup Details */}
              <section className="space-y-4">
                <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">
                  Pickup Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Origin City *</Label>
                    <LocationInput
                      value={formData.originCity || ""}
                      onChange={(value) => handleInputChange('originCity', value)}
                      suggestions={CITY_OPTIONS}
                      placeholder="Type city or full address"
                      error={!!errors.originCity}
                    />
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Earliest Pickup Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.pickupEarliest && "text-muted-foreground",
                              errors.pickupEarliest && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.pickupEarliest ? format(new Date(formData.pickupEarliest + "T00:00:00"), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.pickupEarliest ? new Date(formData.pickupEarliest + "T00:00:00") : undefined}
                            onSelect={(date) => handleInputChange('pickupEarliest', date ? format(date, "yyyy-MM-dd") : "")}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.pickupEarliest && <p className="text-destructive text-xs">{errors.pickupEarliest}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Latest Pickup Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.pickupLatest && "text-muted-foreground",
                              errors.pickupLatest && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.pickupLatest ? format(new Date(formData.pickupLatest + "T00:00:00"), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.pickupLatest ? new Date(formData.pickupLatest + "T00:00:00") : undefined}
                            onSelect={(date) => handleInputChange('pickupLatest', date ? format(date, "yyyy-MM-dd") : "")}
                            disabled={(date) => {
                              const earliest = formData.pickupEarliest ? new Date(formData.pickupEarliest + "T00:00:00") : new Date();
                              return date < earliest;
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.pickupLatest && <p className="text-destructive text-xs">{errors.pickupLatest}</p>}
                    </div>
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
                    <LocationInput
                      value={formData.destinationCity || ""}
                      onChange={(value) => handleInputChange('destinationCity', value)}
                      suggestions={CITY_OPTIONS}
                      placeholder="Type city or full address"
                      error={!!errors.destinationCity}
                    />
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Weight Band *</Label>
                    <WeightBandSelector
                      value={formData.weightBand || ""}
                      onChange={(bandId) => handleInputChange('weightBand', bandId)}
                      error={errors.weightBand}
                    />
                  </div>

                  {/* Weight verification notice */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Your parcel will be weighed at collection. If the actual weight falls in a different band, the price will be adjusted accordingly.
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
                      <span className="text-muted-foreground">Weight Band</span>
                      <span>
                        {getWeightBand(formData.weightBand || "")?.label ?? ""} ({getWeightBand(formData.weightBand || "")?.range[0]}–{getWeightBand(formData.weightBand || "")?.range[1]} kg)
                      </span>
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
                    activeSchema.parse({
                      ...formData,
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
                          <p><span className="text-muted-foreground">Weight:</span> {getWeightBand(formData.weightBand || "")?.label ?? ""} ({getWeightBand(formData.weightBand || "")?.range[0]}–{getWeightBand(formData.weightBand || "")?.range[1]} kg)</p>
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
                          {formData.pickupEarliest && (
                            <p><span className="text-muted-foreground">Earliest:</span> {formData.pickupEarliest}</p>
                          )}
                          {formData.pickupLatest && (
                            <p><span className="text-muted-foreground">Latest:</span> {formData.pickupLatest}</p>
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

                      {/* Verification Details — only for non-verified senders */}
                      {!isVerifiedSender && (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 md:col-span-2">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-primary" />
                          Sender Verification
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">ID Document:</span> {formData.idDocumentName}
                          </p>
                          <p className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">Legal Declaration:</span> Accepted
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 italic">
                          You have declared that the parcel contents are legal and agreed to be held personally liable under SA, Lesotho, and Zimbabwe law.
                        </p>
                      </div>
                      )}
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
                            <span className="text-muted-foreground">Weight Band</span>
                            <span>
                              {getWeightBand(formData.weightBand || "")?.label ?? ""} ({getWeightBand(formData.weightBand || "")?.range[0]}–{getWeightBand(formData.weightBand || "")?.range[1]} kg)
                            </span>
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
