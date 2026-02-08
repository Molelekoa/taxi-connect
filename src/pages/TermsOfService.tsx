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
                  Parcel Buddy operates as a community-driven delivery network, connecting senders with Traveler Partners who deliver parcels along routes they are already taking. Our services include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Parcel delivery coordination between senders and Traveler Partners</li>
                  <li>Route matching to connect senders with community members traveling to the same destination</li>
                  <li>Delivery quotation and estimation services</li>
                  <li>Delivery tracking and coordination</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Parcel Buddy facilitates connections between senders and Traveler Partners but does not directly transport goods. Traveler Partners are independent community members who carry parcels on routes they are already traveling.
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
                  <li>Actual weight and dimensions of the parcel</li>
                  <li>Distance between pickup and delivery locations</li>
                  <li>Re-delivery attempts or address corrections</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Quotes are valid for 7 days unless otherwise specified. We reserve the right to adjust pricing based on actual parcel characteristics.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">6. Payment Terms</h2>
                <p className="text-muted-foreground mb-4">
                  Payment terms are as follows:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Payment is released after the successful completion of a delivery, which must be confirmed by both the sender and the Traveler Partner</li>
                  <li>We accept payment via EFT or credit card</li>
                  <li>All prices are quoted in South African Rand (ZAR) unless otherwise specified</li>
                  <li>Parcel Buddy's service fee is deducted from the delivery payment before disbursement to the Traveler Partner</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">7. Liability and Risk</h2>
                <p className="text-muted-foreground mb-4">
                  Please note the following regarding liability:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>The risk of loss or damage to a parcel is borne solely by the sender</li>
                  <li>Parcel Buddy does not offer liability insurance or cargo insurance of any kind</li>
                  <li>We endeavor to vet all members of our community to maintain a trustworthy network</li>
                  <li>In the event of theft, Parcel Buddy will assist by providing all information necessary to file a police report</li>
                  <li>Senders are encouraged to arrange their own insurance for valuable items</li>
                </ul>
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
