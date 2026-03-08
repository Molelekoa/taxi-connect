import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import TermsContent from "@/components/TermsOfService/TermsContent";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Use | Parcolo</title>
        <meta name="description" content="Parcolo Terms of Use - Read our terms and conditions for using our community-driven delivery platform." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 py-16 md:py-24">
          <div className="container-narrow">
            <h1 className="font-display text-4xl md:text-5xl font-black mb-8">Terms of Use</h1>
            <p className="text-muted-foreground mb-8">Last updated: 8 March 2026</p>
            <TermsContent />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;
