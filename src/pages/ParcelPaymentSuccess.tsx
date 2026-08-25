import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ParcelPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const { user } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "pending" | "error">("verifying");
  const [parcelDetails, setParcelDetails] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!paymentId || !user) return;

    const verify = async () => {
      // Poll for payment status.
      // NOTE: payment_id in the URL is the payment_records.id (set by
      // process-parcel-payment), so query by id — NOT yoco_checkout_id.
      let attempts = 0;
      const maxAttempts = 10;

      const poll = async () => {
        let hardError = false;
        const { data, error } = await supabase
          .from("payment_records")
          .select("*, parcels:parcel_id(pickup_location, dropoff_location, weight_band, price)")
          .eq("id", paymentId)
          .maybeSingle() as { data: any; error: { message: string } | null };

        // A genuine query failure (RLS/network) is different from "not visible yet"
        if (error) {
          hardError = true;
        }

        if (!error && data) {
          setParcelDetails(data.parcels);
          if (data.status === "paid") {
            setStatus("success");
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts && !hardError) {
          setTimeout(poll, 2000);
        } else {
          setStatus(hardError ? "error" : data ? "pending" : "pending");
        }
      };

      await poll();
    };

    verify();
  }, [paymentId, user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-narrow max-w-2xl mx-auto">
          <motion.div
            className="bg-card border border-border rounded-xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {status === "verifying" && (
              <>
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                <h1 className="font-display font-bold text-2xl text-foreground mb-4">
                  Verifying Payment...
                </h1>
                <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
              </>
            )}

            {status === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                </motion.div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground mb-2">
                  Your parcel has been booked and is now available for travelers.
                </p>

                {parcelDetails && (
                  <div className="bg-secondary/50 rounded-lg p-4 my-6 text-left text-sm">
                    <p><span className="font-medium">Route:</span> {parcelDetails.pickup_location} → {parcelDetails.dropoff_location}</p>
                    {parcelDetails.weight_band && (
                      <p><span className="font-medium">Weight:</span> {parcelDetails.weight_band}</p>
                    )}
                    {parcelDetails.price && (
                      <p><span className="font-medium">Amount Paid:</span> R{parcelDetails.price}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Link to="/sender-dashboard">
                    <Button variant="hero">View My Parcels</Button>
                  </Link>
                  <Link to="/small-parcel">
                    <Button variant="outline">Book Another Parcel</Button>
                  </Link>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <Package className="w-16 h-16 text-destructive mx-auto mb-6" />
                <h1 className="font-display font-bold text-2xl text-foreground mb-4">
                  Couldn't Verify Payment
                </h1>
                <p className="text-muted-foreground mb-6">
                  We had trouble confirming your payment. If you were charged, don't worry —
                  check your dashboard or contact support with your payment reference.
                </p>
                <Link to="/sender-dashboard">
                  <Button variant="hero">Go to Dashboard</Button>
                </Link>
              </>
            )}

            {status === "pending" && (
              <>
                <Package className="w-16 h-16 text-warning mx-auto mb-6" />
                <h1 className="font-display font-bold text-2xl text-foreground mb-4">
                  Payment Processing
                </h1>
                <p className="text-muted-foreground mb-6">
                  Your payment is being processed. It may take a few moments to confirm.
                  You can check your parcel status on the dashboard.
                </p>
                <Link to="/sender-dashboard">
                  <Button variant="hero">Go to Dashboard</Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ParcelPaymentSuccess;
