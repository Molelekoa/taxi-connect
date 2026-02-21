import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MultiStepQuoteForm from "@/components/MultiStepQuoteForm";

const GetQuote = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow">
          {/* Hero Text */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
             <h1 className="font-display font-bold text-4xl md:text-5xl text-primary mb-4">
              Request a <span className="text-accent">Free Quote</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Complete the form below and our team will respond within 1 business hour 
              with your customized shipping quote.
            </p>
          </div>

          {/* Multi-Step Form */}
          <div className="max-w-3xl mx-auto">
            <MultiStepQuoteForm />
          </div>

          {/* Trust Signals */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <div className="font-display font-bold text-3xl text-primary">98%</div>
              <div className="text-sm text-muted-foreground mt-1">On-Time Delivery</div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl text-primary">10K+</div>
              <div className="text-sm text-muted-foreground mt-1">Carrier Network</div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl text-primary">24/7</div>
              <div className="text-sm text-muted-foreground mt-1">Support</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GetQuote;
