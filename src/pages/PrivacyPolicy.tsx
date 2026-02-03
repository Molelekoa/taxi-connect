import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Parcel Buddy</title>
        <meta name="description" content="Parcel Buddy Privacy Policy - Learn how we collect, use, and protect your personal information." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 py-16 md:py-24">
          <div className="container-narrow">
            <h1 className="font-display text-4xl md:text-5xl font-black mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="prose prose-lg max-w-none text-foreground">
              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  Parcel Buddy ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our community-driven delivery services and website.
                </p>
                <p className="text-muted-foreground">
                  By using our services, you consent to the data practices described in this policy. If you do not agree with the terms of this Privacy Policy, please do not access our website or use our services.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">2. Information We Collect</h2>
                <h3 className="font-display text-xl font-semibold mb-3">Personal Information</h3>
                <p className="text-muted-foreground mb-4">We may collect the following personal information:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Name and contact details (email address, phone number, physical address)</li>
                  <li>Company name and business registration details</li>
                  <li>VAT registration number</li>
                  <li>Shipping and delivery addresses</li>
                  <li>Payment and billing information</li>
                  <li>Communication records and correspondence</li>
                </ul>
                
                <h3 className="font-display text-xl font-semibold mb-3">Automatically Collected Information</h3>
                <p className="text-muted-foreground mb-4">When you visit our website, we may automatically collect:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Referring website addresses</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide, operate, and maintain our freight brokerage services</li>
                  <li>Process quotes, bookings, and transactions</li>
                  <li>Communicate with you regarding shipments, updates, and customer service</li>
                  <li>Connect shippers with appropriate carriers</li>
                  <li>Improve and personalize your experience</li>
                  <li>Comply with legal obligations and industry regulations</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">4. Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-4">We may share your information with:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Carriers and logistics partners:</strong> To facilitate the transportation of your goods</li>
                  <li><strong>Service providers:</strong> Third parties who assist in operating our business</li>
                  <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">5. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">6. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Shipping records may be retained for a minimum of 5 years as required by transport regulations.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">7. Your Rights (POPIA Compliance)</h2>
                <p className="text-muted-foreground mb-4">
                  In accordance with the Protection of Personal Information Act (POPIA), you have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information (subject to legal requirements)</li>
                  <li>Object to the processing of your personal information</li>
                  <li>Withdraw consent for marketing communications</li>
                  <li>Lodge a complaint with the Information Regulator</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">8. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user preferences. You can control cookie settings through your browser preferences. Disabling cookies may affect the functionality of certain features on our website.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">9. Third-Party Links</h2>
                <p className="text-muted-foreground">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4">10. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
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

export default PrivacyPolicy;
