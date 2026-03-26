import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CookieConsent from "./components/CookieConsent";
import PageLoadingBar from "./components/PageLoadingBar";
import OfflineBanner from "./components/OfflineBanner";
import ScrollToTop from "./components/ScrollToTop";
import { IS_LAUNCHED } from "./config/launchGate";
import { useIsAdmin } from "./hooks/useIsAdmin";

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
const DriverWaitlist = lazy(() => import("./pages/DriverWaitlist"));

const queryClient = new QueryClient();

const PageFallback = () => <PageLoadingBar />;

/** All platform routes — rendered when launched OR when user is admin */
const FullPlatformRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/get-quote" element={<GetQuote />} />
    <Route path="/freight-estimator" element={<FreightEstimator />} />
    <Route path="/small-parcel" element={
      <ProtectedRoute><SmallParcelBooking /></ProtectedRoute>
    } />
    <Route path="/carrier-signup" element={
      <ProtectedRoute><CarrierSignup /></ProtectedRoute>
    } />
    <Route path="/traveler-dashboard" element={
      <ProtectedRoute><TravelerDashboard /></ProtectedRoute>
    } />
    <Route path="/sender-dashboard" element={
      <ProtectedRoute><SenderDashboard /></ProtectedRoute>
    } />
    <Route path="/how-it-works" element={<HowItWorks />} />
    <Route path="/services" element={<Services />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/parcel-payment-success" element={
      <ProtectedRoute><ParcelPaymentSuccess /></ProtectedRoute>
    } />
    <Route path="/parcel-payment-cancelled" element={
      <ProtectedRoute><ParcelPaymentCancelled /></ProtectedRoute>
    } />
    <Route path="/admin" element={
      <AdminRoute><AdminDashboard /></AdminRoute>
    } />
    <Route path="/driver-waitlist" element={<DriverWaitlist />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

/** Pre-launch routes — only waitlist, auth, and admin */
const PreLaunchRoutes = () => (
  <Routes>
    <Route path="/" element={<DriverWaitlist />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    <Route path="/admin" element={
      <AdminRoute><AdminDashboard /></AdminRoute>
    } />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/** Decides which routes to render based on launch gate + admin status */
const AppRoutes = () => {
  const { isAdmin, isLoading } = useIsAdmin();

  if (IS_LAUNCHED) return <FullPlatformRoutes />;

  // Pre-launch: admin gets full access, everyone else gets waitlist
  if (isLoading) return <PageFallback />;
  if (isAdmin) return <FullPlatformRoutes />;
  return <PreLaunchRoutes />;
};

const App = () => (
  <ErrorBoundary>
    <OfflineBanner />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
        <CookieConsent />
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
