import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityStrip from "@/components/CommunityStrip";
import HeroSection from "@/components/HeroSection";
import { Banknote, Globe, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <HeroSection />

      {/* Quick stats strip */}
      <section className="py-6 border-b border-border bg-card" aria-label="Key statistics">
        <div className="container-narrow flex items-center justify-center gap-8 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-accent" aria-hidden="true" />
            <span className="font-semibold text-foreground">60% cheaper</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">3 countries</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-success" aria-hidden="true" />
            <span className="font-semibold text-foreground">Daily departures</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-mint-section">
        <div className="container-narrow">
          <h2 className="font-display font-extrabold text-2xl text-foreground text-center mb-8">
            How It <span className="text-gradient">Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { step: "01", title: "Book & Pay", desc: "Choose your route, pay online — a traveler heading your way picks up." },
              { step: "02", title: "Traveler Delivers", desc: "A verified member carries your parcel on a trip they're already making." },
              { step: "03", title: "Delivered", desc: "Your parcel is delivered to the address you provided — done." },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-2xl bg-card border border-border">
                <div className="text-accent font-bold text-xs uppercase tracking-wider mb-2">
                  Step {item.step}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Border Routes */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="rounded-2xl border border-border p-6 md:p-8 bg-card">
            <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-3">
              CROSS-BORDER
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-4">
              Send Across Borders
            </h2>

            <Tabs defaultValue="zimbabwe" className="w-full">
              <TabsList className="mb-4 bg-secondary border border-border">
                <TabsTrigger value="zimbabwe">Zimbabwe</TabsTrigger>
                <TabsTrigger value="lesotho">Lesotho</TabsTrigger>
                <TabsTrigger value="south-africa">Domestic</TabsTrigger>
              </TabsList>

              <TabsContent value="zimbabwe" className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Delivered by travelers on daily JHB–Harare routes. From <span className="font-bold text-accent">R525</span>.
                </p>
                <Link to="/freight-estimator">
                  <Button variant="coral" size="sm">Get a Quote</Button>
                </Link>
              </TabsContent>
              <TabsContent value="lesotho" className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Affordable cross-border delivery on established routes. From <span className="font-bold text-accent">R150</span>.
                </p>
                <Link to="/freight-estimator">
                  <Button variant="coral" size="sm">Get a Quote</Button>
                </Link>
              </TabsContent>
              <TabsContent value="south-africa" className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  City-to-city delivery without the courier markup. From <span className="font-bold text-accent">R80</span>.
                </p>
                <Link to="/freight-estimator">
                  <Button variant="coral" size="sm">Get a Quote</Button>
                </Link>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <CommunityStrip />
      <Footer />
    </div>
  );
};

export default Index;
