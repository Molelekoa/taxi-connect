import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const faqCategories = [
    {
      title: "General Questions",
      faqs: [
        {
          question: "What is Dyno Dash?",
          answer: "Dyno Dash is a freight brokerage company based in Johannesburg, South Africa. We connect shippers with reliable carriers to transport goods across South Africa and the SADC region. As a broker, we handle the logistics coordination, carrier vetting, and shipment tracking so you can focus on your business."
        },
        {
          question: "What areas do you service?",
          answer: "We provide freight services throughout South Africa and the broader SADC region, including Botswana, Namibia, Zimbabwe, Mozambique, Zambia, Malawi, and other neighboring countries. Whether you need local delivery within Gauteng or cross-border transportation, we have carrier partners to meet your needs."
        },
        {
          question: "How do I get started with Dyno Dash?",
          answer: "Getting started is simple. Request a quote through our online form or call us at (011) 568 5343. Provide details about your shipment including origin, destination, cargo type, and weight. We'll match you with the right carrier and provide a competitive quote within hours."
        },
        {
          question: "Do I need an account to ship with you?",
          answer: "No account is required for one-time shipments. However, creating an account allows you to access preferential rates, track shipment history, and streamline future bookings. Business accounts with regular shipping volumes may qualify for credit terms."
        }
      ]
    },
    {
      title: "Shipping & Services",
      faqs: [
        {
          question: "What types of freight do you handle?",
          answer: "We handle a wide range of freight including Full Truckload (FTL), Less Than Truckload (LTL), expedited/time-critical shipments, and specialized cargo. Our specialized services cover hazardous materials (with proper certification), temperature-controlled goods, oversized loads, and high-value cargo requiring extra security."
        },
        {
          question: "What is the difference between FTL and LTL?",
          answer: "Full Truckload (FTL) means your cargo occupies the entire truck exclusively. It's ideal for large shipments over 10,000 kg or when you need direct, faster delivery. Less Than Truckload (LTL) combines your shipment with other cargo heading the same direction, making it cost-effective for smaller loads under 5,000 kg."
        },
        {
          question: "Can you handle hazardous materials?",
          answer: "Yes, we work with certified carriers who are licensed to transport hazardous materials. You must provide proper documentation including Safety Data Sheets (SDS), UN numbers, and hazard classifications. Additional permits and specialized equipment may be required, which we'll coordinate for you."
        },
        {
          question: "Do you offer temperature-controlled shipping?",
          answer: "Yes, we partner with carriers offering refrigerated (reefer) trucks for temperature-sensitive goods. We can maintain cold chain integrity for perishables, pharmaceuticals, and other temperature-critical cargo with real-time temperature monitoring throughout transit."
        },
        {
          question: "Can you ship internationally?",
          answer: "We specialize in cross-border shipping throughout the SADC region. Our team handles customs documentation, border clearances, and regulatory compliance. For destinations outside Africa, we can coordinate with international freight forwarders to provide end-to-end solutions."
        }
      ]
    },
    {
      title: "Pricing & Quotes",
      faqs: [
        {
          question: "How is freight pricing calculated?",
          answer: "Freight rates depend on several factors: distance, cargo weight and dimensions, shipment type (FTL vs LTL), required equipment, pickup and delivery locations, and current market conditions including fuel costs. Special requirements like hazmat handling or temperature control also affect pricing."
        },
        {
          question: "How do I get a quote?",
          answer: "You can request a quote through our online form, which takes about 2 minutes to complete. Alternatively, call us at (011) 568 5343 or email info@dynodash.com. Provide shipment details including pickup and delivery locations, cargo description, weight, and any special requirements for the most accurate quote."
        },
        {
          question: "How long are quotes valid?",
          answer: "Standard quotes are valid for 7 days from issue. Market conditions, fuel prices, and carrier availability can affect rates, so we recommend booking promptly. For time-sensitive shipments, quotes may be valid for shorter periods, which will be clearly indicated."
        },
        {
          question: "Are there any hidden fees?",
          answer: "We believe in transparent pricing. Your quote includes the base freight rate and any standard accessorial charges. Additional fees may apply for services like liftgate delivery, inside pickup/delivery, detention time, re-delivery attempts, or address corrections. All potential charges are disclosed upfront."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept EFT bank transfers, credit cards, and approved credit terms for established business accounts. Payment is typically due within 30 days of invoice. All transactions are in South African Rand (ZAR) unless otherwise specified for international shipments."
        },
        {
          question: "Do you offer volume discounts?",
          answer: "Yes, we offer competitive rates for businesses with regular shipping needs. Contact us to discuss your shipping volume and frequency—we'll create a customized rate structure that provides savings while maintaining service quality."
        }
      ]
    },
    {
      title: "Delivery & Tracking",
      faqs: [
        {
          question: "How long does delivery take?",
          answer: "Delivery times depend on distance, shipment type, and service level. Local deliveries within Gauteng typically take 1-2 business days. National shipments range from 2-5 business days. Cross-border SADC shipments may take 3-7 business days depending on customs clearance. Expedited options are available for urgent cargo."
        },
        {
          question: "Can I track my shipment?",
          answer: "Yes, we provide shipment tracking for all bookings. Once your shipment is picked up, you'll receive tracking information via email or SMS. You can monitor your cargo's progress and receive updates on estimated delivery times throughout transit."
        },
        {
          question: "What happens if my delivery is delayed?",
          answer: "While we strive for on-time delivery, delays can occur due to weather, traffic, customs processing, or unforeseen circumstances. We proactively communicate any delays and work to minimize impact. For time-critical shipments, consider our expedited service with guaranteed delivery windows."
        },
        {
          question: "Do you offer same-day or next-day delivery?",
          answer: "Yes, our expedited service offers same-day and next-day delivery options for urgent shipments within South Africa. These premium services use dedicated vehicles and priority routing. Contact us for availability and pricing on time-critical shipments."
        },
        {
          question: "What if no one is available to receive the delivery?",
          answer: "For commercial deliveries, shipments are typically received at loading docks during business hours. If no authorized person is available, the driver will attempt to contact you. Failed delivery attempts may result in detention fees or re-delivery charges. Please ensure someone is available at the specified time window."
        }
      ]
    },
    {
      title: "Insurance & Claims",
      faqs: [
        {
          question: "Is my cargo insured during transit?",
          answer: "Carriers maintain basic cargo liability coverage, typically limited to R100 per kilogram. For valuable shipments, we strongly recommend purchasing additional cargo insurance. We can arrange comprehensive coverage through our insurance partners to protect your goods' full value."
        },
        {
          question: "How do I file a claim for damaged or lost goods?",
          answer: "Report any damage or loss immediately. For visible damage, note it on the delivery receipt before signing. Photograph all damage and retain packaging. Contact us within 14 days for visible damage or 21 days for concealed damage. Submit a written claim with documentation including photos, invoices, and proof of value."
        },
        {
          question: "How long does the claims process take?",
          answer: "We aim to resolve claims within 30-60 days, depending on complexity and carrier response. We act as your advocate throughout the process, coordinating with carriers and insurers to achieve fair resolution. You'll receive regular updates on claim status."
        }
      ]
    },
    {
      title: "Carrier Partnership",
      faqs: [
        {
          question: "How do I become a carrier partner?",
          answer: "We welcome applications from professional carriers. Complete our online Carrier Signup form with your company details, fleet information, insurance documentation, and operating credentials. Our team will review your application and contact you within 3-5 business days."
        },
        {
          question: "What are the requirements to partner with Dyno Dash?",
          answer: "Carrier partners must maintain valid business registration, appropriate operating authority, adequate liability and cargo insurance, well-maintained vehicles, and a satisfactory safety record. We verify credentials and may conduct inspections before approving partnerships."
        },
        {
          question: "How quickly do carriers get paid?",
          answer: "We offer competitive payment terms to our carrier partners. Standard payment is processed within 30 days of delivery confirmation. Quick-pay options may be available for a small fee. We pride ourselves on reliable, on-time payments to maintain strong carrier relationships."
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | Dyno Dash</title>
        <meta name="description" content="Find answers to common questions about freight shipping, pricing, delivery times, and our services at Dyno Dash." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-24 border-b border-border">
            <div className="container-narrow text-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                Frequently Asked <span className="text-primary">Questions</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about shipping with Dyno Dash. Can't find what you're looking for? Contact our team.
              </p>
            </div>
          </section>

          {/* FAQ Sections */}
          <section className="py-16 md:py-24">
            <div className="container-narrow">
              <div className="space-y-12">
                {faqCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="font-display text-4xl font-black text-primary/30">
                        {String(categoryIndex + 1).padStart(2, '0')}
                      </span>
                      <h2 className="font-display text-2xl md:text-3xl font-bold">
                        {category.title}
                      </h2>
                    </div>
                    
                    <Accordion type="single" collapsible className="space-y-3">
                      {category.faqs.map((faq, faqIndex) => (
                        <AccordionItem 
                          key={faqIndex} 
                          value={`${categoryIndex}-${faqIndex}`}
                          className="border border-border rounded-lg px-6 bg-secondary/20 data-[state=open]:bg-secondary/40 transition-colors"
                        >
                          <AccordionTrigger className="text-left font-semibold hover:text-primary hover:no-underline py-5">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24 border-t border-border bg-secondary/30">
            <div className="container-narrow text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Our team is ready to help. Get in touch and we'll respond within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="font-semibold">
                  <Link to="/get-quote">Get a Quote</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-semibold">
                  <a href="tel:+27115685343">Call (011) 568 5343</a>
                </Button>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default FAQ;
