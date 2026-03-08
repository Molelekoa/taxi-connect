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
      title: "About Our Community",
      faqs: [
        {
          question: "What is Parcolo?",
          answer: "Parcolo is a community-driven parcel delivery network based in Johannesburg, South Africa. We connect people who need parcels delivered with Traveler Partners who are already traveling to those destinations. It's a win-win: senders get affordable delivery, and travelers offset their petrol and toll costs."
        },
        {
          question: "How is this different from traditional couriers?",
          answer: "Traditional couriers run dedicated routes whether they have packages or not. Our community members are already traveling—they're simply carrying parcels along routes they're taking anyway. This makes delivery more affordable and environmentally friendly while creating earning opportunities for our Traveler Partners."
        },
        {
          question: "What areas do you service?",
          answer: "We service routes throughout South Africa and cross-border destinations including Lesotho, Zimbabwe, Botswana, Mozambique, and other SADC countries. Our network grows as more Traveler Partners join, so route availability expands with our community."
        },
        {
          question: "Is my parcel safe with a community member?",
          answer: "Yes. All Traveler Partners go through a verification process including ID verification, vehicle documentation, and reference checks. We also provide tracking and maintain communication throughout the delivery process. Our community is built on trust and accountability."
        }
      ]
    },
    {
      title: "Sending Parcels",
      faqs: [
        {
          question: "What can I send?",
          answer: "We handle parcels weighing between 1kg and 50kg. This includes documents, clothing, gifts, electronics, household items, small furniture, and other everyday goods. We focus on cargo that's easy to transport safely."
        },
        {
          question: "What can't I send?",
          answer: "We don't accept packages over 50kg, temperature-sensitive goods requiring refrigeration, hazardous materials, illegal items, or anything prohibited by law. Our service is designed for everyday parcels, not specialized freight."
        },
        {
          question: "Do you offer temperature-controlled shipping?",
          answer: "No, we don't offer temperature-controlled or refrigerated shipping. Our community model isn't suited for perishables or items requiring cold chain integrity. For temperature-sensitive goods, we recommend using a specialized courier service."
        },
        {
          question: "Can I send large or heavy items?",
          answer: "Our service is limited to parcels under 20kg that can fit comfortably in a car boot or passenger space. We don't handle large furniture, heavy equipment, or freight-sized cargo. For larger shipments, you'll need a traditional freight service."
        },
        {
          question: "How do I book a delivery?",
          answer: "Use our online booking form to enter your pickup and delivery locations, parcel details, and preferred timing. We'll match you with a Traveler Partner heading that way and provide a quote. Once confirmed, you'll arrange pickup with your matched partner."
        },
        {
          question: "How much does delivery cost?",
          answer: "Pricing depends on distance, parcel size, and route demand. Our community model typically offers rates lower than traditional couriers since our partners are traveling anyway. Use our quote tool for instant pricing on your specific route."
        }
      ]
    },
    {
      title: "Delivery & Tracking",
      faqs: [
        {
          question: "How long does delivery take?",
          answer: "Delivery times depend on when a Traveler Partner is heading your way. Popular routes like Johannesburg to Maseru or Johannesburg to Harare often have daily travelers. Less common routes may take a few days to match. We'll always give you an estimated timeframe upfront."
        },
        {
          question: "Can I track my parcel?",
          answer: "Yes, once matched with a Traveler Partner, you'll receive updates at key milestones: pickup confirmation, departure, border crossing (for cross-border), and delivery. You can also communicate directly with your partner through our platform."
        },
        {
          question: "What if my parcel is delayed?",
          answer: "Since our partners are real travelers, occasional delays can happen due to traffic, border queues, or schedule changes. We keep you informed of any delays and work to find alternative partners if needed. For time-critical items, please factor in some flexibility."
        },
        {
          question: "Do you offer same-day delivery?",
          answer: "Same-day delivery is possible on busy routes if a Traveler Partner is heading out that day and has capacity. However, we recommend booking at least 24-48 hours ahead for the best chance of securing your preferred timing."
        },
        {
          question: "What if nobody is home for delivery?",
          answer: "Coordinate directly with your Traveler Partner on delivery timing. They'll contact you before arrival. If plans change, you can arrange an alternative time or location that works for both parties."
        }
      ]
    },
    {
      title: "Cross-Border Deliveries",
      faqs: [
        {
          question: "Can you deliver to other countries?",
          answer: "Yes! Cross-border delivery is one of our specialties. We have active routes to Lesotho, Zimbabwe, Botswana, Mozambique, and other SADC destinations. Many of our Traveler Partners regularly cross borders and are familiar with the process."
        },
        {
          question: "How does customs work?",
          answer: "Our Traveler Partners are experienced with border crossings. For personal items and gifts, customs is usually straightforward. You may need to provide an invoice or contents declaration. Duties and taxes, if applicable, are the recipient's responsibility."
        },
        {
          question: "Are there restrictions on cross-border parcels?",
          answer: "Each country has import restrictions. Generally, everyday items like clothing, documents, and household goods are fine. Restricted items include certain foods, plants, medicines, and items exceeding duty-free allowances. When in doubt, check with us before booking."
        },
        {
          question: "How long do cross-border deliveries take?",
          answer: "Cross-border times vary by destination and border traffic. Lesotho deliveries from Johannesburg are often next-day. Zimbabwe typically takes 1-2 days. Border delays during peak periods can add time, so we recommend some flexibility for international routes."
        }
      ]
    },
    {
      title: "Pricing & Payment",
      faqs: [
        {
          question: "How is pricing calculated?",
          answer: "Prices are based on distance, parcel weight/size, and route demand. Cross-border deliveries factor in border crossing complexity. Our community model means you're essentially sharing travel costs, making rates competitive with—or better than—traditional couriers."
        },
        {
          question: "When do I pay?",
          answer: "Payment is collected when you confirm your booking. This secures your spot with a Traveler Partner. We hold the payment in escrow and release it to the partner once delivery is confirmed."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept EFT bank transfers, credit/debit cards, and mobile money options. All transactions are in South African Rand (ZAR). Cross-border recipients can pay in local currency equivalent where available."
        },
        {
          question: "What if my delivery doesn't arrive?",
          answer: "In the rare event of non-delivery, contact us immediately. We investigate with the Traveler Partner and work to resolve the issue. Refunds are provided for undelivered parcels according to our terms of service. Our verification process helps minimize such occurrences."
        }
      ]
    },
    {
      title: "Becoming a Traveler Partner",
      faqs: [
        {
          question: "How do I join as a Traveler Partner?",
          answer: "Complete our online registration form with your personal details, ID verification, and information about your regular travel routes. Once verified, you'll start receiving delivery opportunities matching your routes. It's free to join!"
        },
        {
          question: "What are the requirements?",
          answer: "You need a valid ID, reliable vehicle (or regular transport means), and commitment to safe, timely delivery. For cross-border routes, valid travel documents are required. No commercial license needed—you're simply carrying parcels on trips you're already making."
        },
        {
          question: "How much can I earn?",
          answer: "Earnings depend on your routes, frequency of travel, and how many parcels you carry. Many partners earn enough to cover their petrol and tolls, while frequent travelers on popular routes can earn meaningful supplemental income. You set your own availability."
        },
        {
          question: "How do I get paid?",
          answer: "Earnings are released to your account once delivery is confirmed. You can withdraw to your bank account or mobile money wallet. We offer fast payouts so you have your earnings quickly after completing deliveries."
        },
        {
          question: "Can I choose which parcels to carry?",
          answer: "Absolutely. You'll see delivery opportunities matching your registered routes and schedule. Accept the ones that work for you and decline others. You're in control of your availability and capacity."
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | Parcolo</title>
        <meta name="description" content="Find answers about our community-driven parcel delivery network, sending parcels, becoming a Traveler Partner, and cross-border deliveries to Lesotho, Zimbabwe, and SADC." />
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
                Everything you need to know about our community-driven delivery network. Can't find your answer? We're here to help.
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
                  <Link to="/small-parcel">Send a Parcel</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-semibold">
                  <Link to="/carrier-signup">Join as Traveler Partner</Link>
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
