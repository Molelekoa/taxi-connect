import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Parcel Buddy</title>
        <meta name="description" content="Parcel Buddy Terms of Service - Read our terms and conditions for using our community-driven delivery services." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 py-16 md:py-24">
          <div className="container-narrow">
            <h1 className="font-display text-4xl md:text-5xl font-black mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="prose prose-lg max-w-none text-foreground">
              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground mb-4">
                  Welcome to Parcel Buddy. These Terms of Service ("Terms") govern your use of our website and community-driven delivery services. By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.
                </p>
                <p className="text-muted-foreground">
                  If you do not agree to these Terms, you may not access or use our services. We reserve the right to modify these Terms at any time, and your continued use of our services constitutes acceptance of any modifications.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">2. Description of Services</h2>
                <p className="text-muted-foreground mb-4">
                  Parcel Buddy operates as a community-driven delivery network, connecting senders with travelers who deliver parcels along routes they are already taking. Our services include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Full Truckload (FTL) shipping coordination</li>
                  <li>Less Than Truckload (LTL) shipping services</li>
                  <li>Expedited and time-sensitive shipping</li>
                  <li>Specialized freight handling (hazardous materials, temperature-controlled, etc.)</li>
                  <li>Freight quotation and estimation services</li>
                  <li>Shipment tracking and coordination</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  As a broker, we arrange transportation services but do not own or operate the vehicles that transport your goods. We contract with independent carriers who are responsible for the actual transportation.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">3. User Responsibilities</h2>
                <p className="text-muted-foreground mb-4">When using our services, you agree to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide accurate and complete information about shipments, including weight, dimensions, and contents</li>
                  <li>Properly package and label all goods for transportation</li>
                  <li>Disclose any hazardous materials or special handling requirements</li>
                  <li>Comply with all applicable laws and regulations regarding the goods being shipped</li>
                  <li>Pay all agreed-upon fees and charges in a timely manner</li>
                  <li>Not use our services for illegal purposes or to ship prohibited items</li>
                  <li>Maintain valid business registration and VAT documentation where applicable</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">4. Prohibited Items</h2>
                <p className="text-muted-foreground mb-4">
                  The following items are prohibited from being shipped through our services:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Illegal substances and controlled drugs</li>
                  <li>Weapons, ammunition, and explosives (unless properly licensed and disclosed)</li>
                  <li>Stolen goods or contraband</li>
                  <li>Live animals (without proper permits and specialized carriers)</li>
                  <li>Human remains</li>
                  <li>Currency, negotiable instruments, or precious metals (without prior arrangement)</li>
                  <li>Items prohibited by South African law or international regulations</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">5. Quotes and Pricing</h2>
                <p className="text-muted-foreground mb-4">
                  All quotes provided are estimates based on the information you provide. Final pricing may vary based on:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Actual weight and dimensions of the shipment</li>
                  <li>Fuel surcharges and market conditions</li>
                  <li>Additional services required (liftgate, inside delivery, etc.)</li>
                  <li>Detention or waiting time at pickup or delivery locations</li>
                  <li>Re-delivery attempts or address corrections</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Quotes are valid for 7 days unless otherwise specified. We reserve the right to adjust pricing based on actual shipment characteristics.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">6. Payment Terms</h2>
                <p className="text-muted-foreground mb-4">
                  Payment terms are as follows:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Payment is due within 30 days of invoice date unless otherwise agreed</li>
                  <li>We accept payment via EFT, credit card, or approved credit terms</li>
                  <li>Late payments may incur interest at 2% per month on outstanding balances</li>
                  <li>We reserve the right to suspend services for accounts with overdue balances</li>
                  <li>All prices are quoted in South African Rand (ZAR) unless otherwise specified</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">7. Liability and Insurance</h2>
                <p className="text-muted-foreground mb-4">
                  As a freight broker, our liability is limited as follows:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>We are not liable for loss, damage, or delay caused by carriers</li>
                  <li>Carrier liability is typically limited to R100 per kilogram unless additional insurance is purchased</li>
                  <li>We strongly recommend purchasing additional cargo insurance for valuable shipments</li>
                  <li>Claims must be filed within 14 days of delivery for visible damage, or within 21 days for concealed damage</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We maintain contingent cargo insurance and will assist in processing claims against carriers.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">8. Claims Procedure</h2>
                <p className="text-muted-foreground mb-4">
                  In the event of loss or damage:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Note any visible damage on the delivery receipt before signing</li>
                  <li>Photograph all damage and retain original packaging</li>
                  <li>Report damage or loss to us immediately via phone or email</li>
                  <li>Submit a written claim with supporting documentation within 14 days</li>
                  <li>Do not dispose of damaged goods until the claim is resolved</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">9. Carrier Registration</h2>
                <p className="text-muted-foreground mb-4">
                  Community partners wishing to join Parcel Buddy must:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Maintain valid operating authority and business registration</li>
                  <li>Carry adequate liability and cargo insurance</li>
                  <li>Meet our safety and compliance standards</li>
                  <li>Provide accurate fleet and equipment information</li>
                  <li>Comply with all applicable transport regulations</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We reserve the right to reject or terminate carrier partnerships at our discretion.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">10. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content on our website, including text, graphics, logos, and software, is the property of Parcel Buddy and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">11. Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to indemnify and hold harmless Parcel Buddy, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our services, violation of these Terms, or infringement of any third-party rights.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">12. Dispute Resolution</h2>
                <p className="text-muted-foreground mb-4">
                  Any disputes arising from these Terms or our services shall be:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>First addressed through good-faith negotiation between the parties</li>
                  <li>If unresolved, submitted to mediation in Johannesburg</li>
                  <li>If mediation fails, resolved through arbitration under South African law</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  These Terms shall be governed by the laws of the Republic of South Africa.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">13. Force Majeure</h2>
                <p className="text-muted-foreground">
                  We shall not be liable for delays or failures in performance resulting from circumstances beyond our reasonable control, including natural disasters, strikes, government actions, pandemics, civil unrest, or other force majeure events.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">14. Severability</h2>
                <p className="text-muted-foreground">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">15. Contact Information</h2>
                <p className="text-muted-foreground mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  <li><strong>Email:</strong> hello@parcelbuddy.co.za</li>
                  <li><strong>Phone:</strong> (011) 568 5343</li>
                  <li><strong>Address:</strong> Johannesburg, South Africa</li>
                </ul>
              </section>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;
