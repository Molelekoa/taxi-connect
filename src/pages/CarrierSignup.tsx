import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarrierRegistrationForm from "@/components/CarrierRegistrationForm";
import { Fuel, Coins, Calendar, Heart } from "lucide-react";

const communityBenefits = [
  {
    icon: Fuel,
    title: "Cover Your Fuel",
    description: "Delivery fees help offset your petrol costs on trips you're already making",
  },
  {
    icon: Coins,
    title: "Pay Your Tolls",
    description: "Earn enough to cover highway toll fees and more",
  },
  {
    icon: Calendar,
    title: "Your Schedule",
    description: "Only accept deliveries when you're already traveling that route",
  },
  {
    icon: Heart,
    title: "Help Your Community",
    description: "Connect people across borders with their parcels and essential goods",
  },
];

const CarrierSignup = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Community-Powered Delivery
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Join the{" "}
              <span className="text-gradient">Community</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Already traveling between cities? Turn your trip into an opportunity. 
              Deliver parcels along your route and earn extra income to cover your petrol and toll fees.
            </p>
          </div>

          {/* Community Benefits Section */}
          <div className="card-elevated p-8 mb-12">
            <h2 className="font-display font-bold text-xl text-foreground text-center mb-2">
              Traveling anyway? <span className="text-gradient">Earn along the way.</span>
            </h2>
            <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
              Join our community of travelers who deliver parcels on routes they're already taking.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {communityBenefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="mt-8 p-6 rounded-xl bg-secondary/50 border border-border">
              <p className="text-muted-foreground italic text-center">
                "I travel between Joburg and Maseru every week for work. Now my deliveries 
                pay for my toll fees and most of my petrol."
              </p>
              <p className="text-sm text-primary font-medium text-center mt-3">— Community Partner</p>
            </div>
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
