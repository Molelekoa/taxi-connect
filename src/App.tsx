import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Index from "./pages/Index";
import GetQuote from "./pages/GetQuote";
import CarrierSignup from "./pages/CarrierSignup";
import HowItWorks from "./pages/HowItWorks";
import Services from "./pages/Services";
import FreightEstimator from "./pages/FreightEstimator";
import SmallParcelBooking from "./pages/SmallParcelBooking";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import TravelerDashboard from "./pages/TravelerDashboard";
import SenderDashboard from "./pages/SenderDashboard";
import ParcelPaymentSuccess from "./pages/ParcelPaymentSuccess";
import ParcelPaymentCancelled from "./pages/ParcelPaymentCancelled";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/get-quote" element={<GetQuote />} />
            <Route path="/freight-estimator" element={<FreightEstimator />} />
            <Route path="/small-parcel" element={
              <ProtectedRoute>
                <SmallParcelBooking />
              </ProtectedRoute>
            } />
            <Route path="/carrier-signup" element={
              <ProtectedRoute>
                <CarrierSignup />
              </ProtectedRoute>
            } />
            <Route path="/traveler-dashboard" element={
              <ProtectedRoute>
                <TravelerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/sender-dashboard" element={
              <ProtectedRoute>
                <SenderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/services" element={<Services />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/parcel-payment-success" element={
              <ProtectedRoute>
                <ParcelPaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/parcel-payment-cancelled" element={
              <ProtectedRoute>
                <ParcelPaymentCancelled />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
