import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CookieConsent from "./components/CookieConsent";
import PageLoadingBar from "./components/PageLoadingBar";
import OfflineBanner from "./components/OfflineBanner";

// Eagerly load the landing page for instant first paint
import Index from "./pages/Index";

// Lazy-load all other routes for smaller initial bundle
const GetQuote = lazy(() => import("./pages/GetQuote"));
const CarrierSignup = lazy(() => import("./pages/CarrierSignup"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Services = lazy(() => import("./pages/Services"));
const FreightEstimator = lazy(() => import("./pages/FreightEstimator"));
const SmallParcelBooking = lazy(() => import("./pages/SmallParcelBooking"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TravelerDashboard = lazy(() => import("./pages/TravelerDashboard"));
const SenderDashboard = lazy(() => import("./pages/SenderDashboard"));
const ParcelPaymentSuccess = lazy(() => import("./pages/ParcelPaymentSuccess"));
const ParcelPaymentCancelled = lazy(() => import("./pages/ParcelPaymentCancelled"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient();

const PageFallback = () => <PageLoadingBar />;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
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
          </Suspense>
        </AuthProvider>
        <CookieConsent />
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
