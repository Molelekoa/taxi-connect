import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarrierRegistrationForm from "@/components/CarrierRegistrationForm";
import SenderRegistrationForm from "@/components/SenderRegistrationForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fuel, Coins, Calendar, Heart, Truck, Package } from "lucide-react";

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
              Whether you're traveling between cities or need to send a parcel,
              join our community and get started today.
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

          {/* Tab-Based Role Selection */}
          <Tabs defaultValue="traveler" className="space-y-8">
            <TabsList className="w-full h-auto p-1 grid grid-cols-2 bg-muted rounded-xl">
              <TabsTrigger
                value="traveler"
                className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Truck className="w-4 h-4" />
                I'm a Traveler
              </TabsTrigger>
              <TabsTrigger
                value="sender"
                className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Package className="w-4 h-4" />
                I'm a Sender
              </TabsTrigger>
            </TabsList>

            <TabsContent value="traveler" className="space-y-4">
              <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Travelers</strong> — I travel between cities and can deliver parcels along my route
                </p>
              </div>
              <CarrierRegistrationForm />
            </TabsContent>

            <TabsContent value="sender" className="space-y-4">
              <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Senders</strong> — I need to send a parcel to someone in another city
                </p>
              </div>
              <SenderRegistrationForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CarrierSignup;
