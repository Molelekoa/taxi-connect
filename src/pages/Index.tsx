import { Zap, Network, Eye, Truck, Package, Clock, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-truck.jpg";

const Index = () => {
  const scrollToQuote = () => {
    document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Dyno<span className="text-primary">Dash</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#quote-form" className="text-muted-foreground hover:text-foreground transition-colors">Get Quote</a>
          </div>
          <Button variant="hero" size="default" onClick={scrollToQuote}>
            Get a Free Quote
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern truck on highway with motion blur"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
        </div>
        
        {/* Glow Effect */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-30 blur-3xl animate-pulse-glow" style={{ background: "var(--gradient-glow)" }} />

        <div className="container-narrow relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight animate-fade-up">
              Powering Your{" "}
              <span className="text-gradient">Supply Chain.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl animate-fade-up delay-100" style={{ opacity: 0, animationFillMode: "forwards" }}>
              Dyno Dash connects your freight with our trusted carrier network for fast, reliable, and cost-effective logistics.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-up delay-200" style={{ opacity: 0, animationFillMode: "forwards" }}>
              <Button variant="hero" size="xl" onClick={scrollToQuote}>
                Get a Free Quote
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              Why <span className="text-gradient">Dyno Dash</span>?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              We combine cutting-edge technology with industry expertise to deliver exceptional logistics solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Speed You Can Rely On",
                description: "Lightning-fast dispatch and real-time carrier matching ensures your freight moves without delay.",
              },
              {
                icon: Network,
                title: "Vast Carrier Network",
                description: "Access to thousands of vetted carriers nationwide, giving you competitive rates and capacity when you need it.",
              },
              {
                icon: Eye,
                title: "Transparent Tracking",
                description: "Real-time visibility into every shipment with proactive updates and milestone notifications.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="card-elevated p-8 text-center hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Getting your freight moving is simple. Three steps to seamless logistics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            {[
              {
                step: "01",
                title: "Submit Your Load",
                description: "Fill out our simple online form with your shipment details. It takes less than 2 minutes.",
              },
              {
                step: "02",
                title: "We Match & Negotiate",
                description: "Our team finds the best carrier for your load and negotiates competitive rates on your behalf.",
              },
              {
                step: "03",
                title: "Track & Deliver",
                description: "Receive real-time updates as your freight moves. We handle everything until delivery is confirmed.",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-secondary border-2 border-primary flex items-center justify-center mb-6 relative z-10">
                  <span className="font-display font-bold text-2xl text-primary">{item.step}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section-padding bg-secondary/30">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                Our <span className="text-gradient">Services</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                From full truckloads to expedited shipping, we provide comprehensive freight solutions tailored to your business needs.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  { icon: Truck, title: "Full Truckload (FTL)", description: "Dedicated trucks for large shipments requiring exclusive capacity." },
                  { icon: Package, title: "Less Than Truckload (LTL)", description: "Cost-effective shipping for smaller loads that don't require a full trailer." },
                  { icon: Clock, title: "Expedited Shipping", description: "Time-critical deliveries with guaranteed transit times and priority handling." },
                  { icon: Route, title: "Dedicated Routes", description: "Consistent, scheduled transportation for recurring shipping needs." },
                ].map((service) => (
                  <div key={service.title} className="flex items-start gap-4 p-4 rounded-xl hover:bg-card transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground">{service.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-2xl" />
              <div className="relative card-elevated p-1 rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-br from-secondary to-card p-8 rounded-3xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 rounded-xl bg-background/50">
                      <div className="font-display font-bold text-4xl text-primary">98%</div>
                      <div className="text-sm text-muted-foreground mt-1">On-Time Delivery</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-background/50">
                      <div className="font-display font-bold text-4xl text-primary">10K+</div>
                      <div className="text-sm text-muted-foreground mt-1">Carriers Network</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-background/50">
                      <div className="font-display font-bold text-4xl text-primary">24/7</div>
                      <div className="text-sm text-muted-foreground mt-1">Support Available</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-background/50">
                      <div className="font-display font-bold text-4xl text-primary">15%</div>
                      <div className="text-sm text-muted-foreground mt-1">Average Savings</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote-form" className="section-padding">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                Get a <span className="text-gradient">Free Quote</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Tell us about your shipment and we'll get back to you within 30 minutes.
              </p>
            </div>

            <form className="card-elevated p-8 md:p-10 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                  <input
                    type="text"
                    placeholder="Company name"
                    className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Route (Origin → Destination)</label>
                <input
                  type="text"
                  placeholder="e.g., Los Angeles, CA → Chicago, IL"
                  className="w-full h-12 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Load Description</label>
                <textarea
                  placeholder="Describe your freight: weight, dimensions, special requirements..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                />
              </div>

              <Button variant="hero" size="xl" className="w-full">
                Submit for Quote
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                By submitting, you agree to our terms and privacy policy.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-6">
              Why Choose <span className="text-gradient">Dyno Dash</span>?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              With decades of combined experience in freight logistics, we understand that every shipment is critical to your business. 
              Our commitment to transparent communication, competitive pricing, and reliable service makes us the partner you can trust for all your logistics needs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border">
        <div className="container-narrow">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Dyno<span className="text-primary">Dash</span>
                </span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                Your trusted freight brokerage partner. Connecting shippers with reliable carriers since 2020.
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Services</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#quote-form" className="text-muted-foreground hover:text-primary transition-colors">Get Quote</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>hello@dynodash.com</li>
                <li>(555) 123-DASH</li>
                <li>123 Logistics Way<br />Chicago, IL 60601</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dyno Dash. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
