const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="font-display text-2xl font-bold mb-4">{title}</h2>
    {children}
  </section>
);

const P = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-muted-foreground mb-4 ${className}`}>{children}</p>
);

const UL = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const TermsContent = () => {
  return (
    <div className="prose prose-lg max-w-none text-foreground">
      <Section title="1. Introduction">
        <P>
          Welcome to Parcolo ("Company," "we," "our," "us"). These Terms of Use ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Platform"). By accessing or using Parcolo, you agree to be bound by these Terms.
        </P>
        <P>
          Parcolo is a technology platform, not a courier or logistics provider. We connect Senders who need parcels delivered with Travelers who are already traveling along certain routes. We do not employ, contract with, or control any Travelers.
        </P>
      </Section>

      <Section title="2. Definitions">
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-muted-foreground border border-border rounded-lg">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold text-foreground border-b border-border">Term</th>
                <th className="text-left p-3 font-semibold text-foreground border-b border-border">Definition</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['"Parcel"', 'Any item a Sender entrusts to a Traveler for delivery'],
                ['"Sender"', 'Anyone who uses the Platform to arrange delivery of a Parcel'],
                ['"Traveler"', 'Anyone who uses the Platform to offer delivery services for Parcels'],
                ['"Platform"', 'The Parcolo website, mobile applications, and related services'],
                ['"Parties"', 'Senders and Travelers collectively'],
              ].map(([term, def], i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="p-3 font-medium text-foreground">{term}</td>
                  <td className="p-3">{def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Our Role as a Platform">
        <P>
          <strong className="text-foreground">3.1 No Carrier Relationship.</strong> Parcolo is not a courier, common carrier, freight forwarder, or logistics provider. We do not take possession, custody, or control of any Parcels. We simply provide a platform where Senders and Travelers can connect.
        </P>
        <P>
          <strong className="text-foreground">3.2 Independent Parties.</strong> Travelers are independent third parties. They are not employees, agents, contractors, or representatives of Parcolo. We do not supervise, direct, or control Travelers' actions.
        </P>
        <P>
          <strong className="text-foreground">3.3 No Employment Relationship.</strong> Nothing in these Terms creates an employment, partnership, joint venture, or agency relationship between Parcolo and any Traveler.
        </P>
      </Section>

      <Section title="4. Verification and Vetting">
        <P>
          <strong className="text-foreground">4.1 Best Efforts Only.</strong> Parcolo endeavors to verify the identity of Travelers using available information (typically government-issued ID). However:
        </P>
        <UL items={[
          "We cannot guarantee that any verification method is foolproof",
          "We do not perform background checks unless required by applicable law",
          "We make no representations about the character, reliability, or trustworthiness of any Traveler",
        ]} />
        <P className="mt-4">
          <strong className="text-foreground">4.2 User Responsibility.</strong> You are responsible for your own interactions with other users. Parcolo encourages you to communicate directly with Travelers, use your best judgment, and take reasonable precautions.
        </P>
      </Section>

      <Section title="5. No Insurance or Liability">
        <P>
          <strong className="text-foreground">5.1 Parcels Are Not Insured.</strong> Parcolo does not provide any insurance coverage for Parcels. Any insurance, if desired, must be obtained independently by the Sender.
        </P>
        <P>
          <strong className="text-foreground">5.2 Sender Assumes All Risk.</strong> The Sender assumes all risk of loss, damage, theft, delay, or non-delivery of any Parcel. Parcolo is not responsible for:
        </P>
        <UL items={[
          "Lost, stolen, or damaged Parcels",
          "Delayed deliveries",
          "Traveler cancellation or no-show",
          "Incorrect deliveries",
          "Any other issue arising from the Sender-Traveler relationship",
        ]} />
        <P className="mt-4">
          <strong className="text-foreground">5.3 No Warranty.</strong> THE PLATFORM AND SERVICES ARE PROVIDED "AS IS" WITHOUT ANY WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </P>
      </Section>

      <Section title="6. Release and Waiver">
        <P>
          <strong className="text-foreground">6.1 Release.</strong> To the maximum extent permitted by law, you hereby release Parcolo and its officers, directors, employees, shareholders, agents, and affiliates from any and all claims, demands, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or in connection with:
        </P>
        <UL items={[
          "Any dispute between Senders and Travelers",
          "Any lost, damaged, or undelivered Parcel",
          "Any personal injury or property damage",
          "Any other issue related to your use of the Platform",
        ]} />
        <P className="mt-4">
          <strong className="text-foreground">6.2 Waiver of Liability.</strong> You expressly waive any right to hold Parcolo liable for the acts or omissions of any Traveler or Sender.
        </P>
      </Section>

      <Section title="7. Our Commitment to Assist">
        <P>
          <strong className="text-foreground">7.1 Information Sharing.</strong> In the event of a dispute, suspected theft, or other incident, Parcolo will provide Senders with all information we have about the relevant Traveler, including:
        </P>
        <UL items={[
          "Full name (as provided during verification)",
          "ID number (where permitted by law)",
          "Contact information",
          "Communication records related to the transaction",
        ]} />
        <P className="mt-4">
          <strong className="text-foreground">7.2 Cooperation with Authorities.</strong> Parcolo will cooperate with law enforcement authorities investigating alleged criminal activity. We will provide information to assist Senders in filing police reports.
        </P>
        <P>
          <strong className="text-foreground">7.3 Platform Integrity.</strong> We reserve the right to remove any user from our Platform for violating these Terms or for conduct we deem harmful to the community.
        </P>
        <P>
          <strong className="text-foreground">7.4 No Legal Obligation.</strong> The assistance described in Section 7 is a courtesy, not a legal obligation. Parcolo may modify or discontinue this assistance at any time without notice.
        </P>
      </Section>

      <Section title="8. Prohibited Items">
        <P>Senders may not use the Platform to arrange delivery of:</P>
        <UL items={[
          "Cash or monetary instruments",
          "Illegal drugs or substances",
          "Weapons, explosives, or hazardous materials",
          "Perishable items requiring temperature control",
          "Live animals",
          "Stolen goods",
          "Items prohibited by applicable law",
        ]} />
        <P className="mt-4">
          Parcolo reserves the right to refuse or remove any listing or transaction involving prohibited items.
        </P>
      </Section>

      <Section title="8A. Payment Terms and Refund Policy">
        <P>
          <strong className="text-foreground">8A.1 Electronic Payment Only.</strong> All payments on the Platform are processed electronically through our payment partner, Yoco. We accept card payments and EFT transfers. Cash payments are strictly prohibited for all parcel booking transactions.
        </P>
        <P>
          <strong className="text-foreground">8A.2 Payment Timing.</strong> Payment is collected from the Sender at the time of booking. Funds are held by Parcolo and released to the Traveler only after the delivery has been administratively verified, following a 72-hour processing period or the next Wednesday payout cycle, whichever comes first.
        </P>
        <P>
          <strong className="text-foreground">8A.3 Refund Policy.</strong> Refunds are available under the following circumstances:
        </P>
        <UL items={[
          "Cancellation by the Sender before a Traveler has accepted the parcel: full refund minus any payment processing fees",
          "Cancellation by the Sender after a Traveler has accepted: refund at Parcolo's discretion, subject to any costs already incurred",
          "Non-delivery confirmed by Parcolo: full refund of the delivery fee",
          "Traveler cancellation or no-show: full refund of the delivery fee",
        ]} />
        <P className="mt-4">
          <strong className="text-foreground">8A.4 Refund Processing.</strong> Approved refunds are processed within 5–10 business days via the original payment method. Parcolo is not responsible for delays caused by your bank or payment provider.
        </P>
        <P>
          <strong className="text-foreground">8A.5 No Card Storage.</strong> Parcolo does not store your credit card or banking details. All payment information is processed and secured by Yoco in compliance with PCI-DSS standards.
        </P>
      </Section>

      <Section title="9. User Conduct">
        <P><strong className="text-foreground">9.1 Sender Obligations.</strong> Senders agree to:</P>
        <UL items={[
          "Provide accurate information about Parcels (weight, contents, value)",
          "Meet Travelers at agreed times and locations",
          "Communicate clearly and respectfully",
          "Compensate Travelers as agreed",
        ]} />
        <P className="mt-4"><strong className="text-foreground">9.2 Traveler Obligations.</strong> Travelers agree to:</P>
        <UL items={[
          "Provide accurate information about routes and availability",
          "Communicate clearly with Senders",
          "Handle Parcels with reasonable care",
          "Deliver to the agreed recipient",
          "Not open, inspect, or tamper with Parcels",
        ]} />
        <P className="mt-4"><strong className="text-foreground">9.3 General Conduct.</strong> All users agree to:</P>
        <UL items={[
          "Comply with all applicable laws",
          "Not harass, threaten, or harm other users",
          "Not use the Platform for fraudulent purposes",
          "Not attempt to circumvent Parcolo's verification or safety measures",
        ]} />
      </Section>

      <Section title="10. Dispute Resolution">
        <P>
          <strong className="text-foreground">10.1 User-to-User Disputes.</strong> Parcolo is not responsible for resolving disputes between Senders and Travelers. We encourage users to communicate directly and in good faith to resolve issues.
        </P>
        <P>
          <strong className="text-foreground">10.2 Informal Resolution.</strong> If you have a concern, please contact us. We may, at our sole discretion, offer assistance or mediation, but we are not obligated to do so.
        </P>
        <P>
          <strong className="text-foreground">10.3 Governing Law.</strong> These Terms shall be governed by the laws of the Republic of South Africa, without regard to its conflict of laws principles.
        </P>
        <P>
          <strong className="text-foreground">10.4 Arbitration.</strong> Any dispute arising out of or relating to these Terms or your use of the Platform shall be resolved by binding arbitration in accordance with the rules of the Arbitration Foundation of Southern Africa (AFSA). The arbitration shall be held in Johannesburg, South Africa. You agree to waive any right to participate in a class action lawsuit or class-wide arbitration.
        </P>
        <P>
          <strong className="text-foreground">10.5 Limitation of Liability.</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PARCOLO'S TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU PAID TO PARCOLO (IF ANY) IN THE SIX (6) MONTHS PRECEDING THE CLAIM.
        </P>
      </Section>

      <Section title="11. Indemnification">
        <P>
          You agree to indemnify, defend, and hold harmless Parcolo and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses (including reasonable attorneys' fees) arising out of:
        </P>
        <UL items={[
          "Your use of the Platform",
          "Your violation of these Terms",
          "Your interaction with any other user",
          "Your Parcel or its contents",
        ]} />
      </Section>

      <Section title="12. Changes to Terms">
        <P>
          Parcolo may modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified Terms. Material changes will be notified via email or platform notification.
        </P>
      </Section>

      <Section title="13. Contact Information">
        <P>For questions about these Terms of Use, please contact us:</P>
        <ul className="text-muted-foreground space-y-2">
          <li><strong className="text-foreground">Email:</strong> hello@parcolo.com</li>
          <li><strong className="text-foreground">Phone:</strong> (011) 568 5343</li>
          <li><strong className="text-foreground">Address:</strong> Johannesburg, South Africa</li>
        </ul>
      </Section>
    </div>
  );
};

export default TermsContent;
