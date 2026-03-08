import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ParcelPaymentCancelled = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h1 className="font-display font-bold text-2xl text-foreground mb-4">
              Payment Cancelled
            </h1>
            <p className="text-muted-foreground mb-8">
              Your payment was cancelled. Your parcel booking has been saved — you can pay from your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sender-dashboard">
                <Button variant="hero">Go to Dashboard</Button>
              </Link>
              <Link to="/small-parcel">
                <Button variant="outline">Book Another Parcel</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ParcelPaymentCancelled;
