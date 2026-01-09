import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarrierRegistrationForm from "@/components/CarrierRegistrationForm";

const CarrierSignup = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Become a{" "}
              <span className="text-gradient">Delivery Partner</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join CourierConnect and earn by delivering parcels in your area. 
              Complete the application below to get started.
            </p>
          </div>

          {/* Multi-Step Form */}
          <CarrierRegistrationForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarrierSignup;
