import { PaxLogo } from "@/components/pax-logo";

function Layout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-sm border p-8 md:p-12">
        <div className="mb-10 text-center border-b pb-8">
          <div className="flex justify-center mb-6"><PaxLogo className="text-5xl" /></div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          {children}
        </div>
        <div className="mt-12 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">For any legal inquiries, please reach out to <a href="mailto:legal@paxdot.com" className="text-primary font-medium hover:underline">legal@paxdot.com</a></p>
        </div>
      </div>
    </div>
  )
}

export function Terms() {
  return (
    <Layout title="Master Terms of Service / User Agreement">
      <p><em>Last Updated: [DATE]</em></p>
      
      <h3>1. Introduction to Pax and Our Role</h3>
      <p>Welcome to Pax! Pax operates an online marketplace, project management tool, and escrow-based payment platform connecting clients seeking professional services ("Clients") with independent professionals offering those services ("Freelancers" or "Talent").</p>
      <p><strong>Pax is a platform venue only.</strong> We provide the digital tools for Users to connect, manage their projects, and facilitate secure payments. Pax is NOT an employer, contractor, partner, joint venturer, or agent of any Client or Freelancer. When Users enter into an agreement for services (a "Project Contract"), they do so directly with each other. Pax is not a party to any Project Contract and does not guarantee the execution, safety, or quality of the services provided by Freelancers.</p>
      
      <h3>2. Definitions</h3>
      <ul>
        <li><strong>Client:</strong> Any User who uses the platform to seek, hire, or manage Freelancers for a Project.</li>
        <li><strong>Freelancer:</strong> Any User offering their professional services through the platform.</li>
        <li><strong>Project:</strong> An agreed-upon set of services and deliverables to be provided by a Freelancer to a Client.</li>
        <li><strong>Milestone:</strong> A defined segment or deliverable of a Project with an associated payment amount.</li>
        <li><strong>Escrow:</strong> The secure holding of funds by Pax’s designated third-party payment processors until mutual criteria are met.</li>
        <li><strong>Service Fee:</strong> The fee charged by Pax to Users for the use of the platform and escrow services.</li>
        <li><strong>Dispute:</strong> A formal disagreement raised by a Client or Freelancer regarding the delivery or payment of a Milestone or Project.</li>
      </ul>

      <h3>3. Account Eligibility and Usage Rules</h3>
      <p>To access Pax, you must be at least 18 years of age and legally capable of forming binding contracts. By registering, you agree to provide true, accurate, and complete information, including a valid identity. You are solely responsible for maintaining the security of your account credentials. You may not share your account or allow any other person to use your account.</p>

      <h3>4. Prohibited Activities</h3>
      <p>To ensure a safe environment, you agree not to use Pax to:</p>
      <ul>
        <li>Offer, request, or complete any work that violates applicable law (e.g., illegal content, stolen intellectual property).</li>
        <li>Engage in academic cheating, fraud, or scams.</li>
        <li>Post fake reviews, artificially inflate ratings, or manipulate our feedback system.</li>
        <li>Scrape data, crawl, or reverse-engineer the platform's code or algorithms.</li>
        <li>Attempt payment fraud, circumvent the platform’s payment system (e.g., taking communication and payment off-platform to avoid fees), or engage in money laundering.</li>
        <li>Harass, threaten, or discriminate against other Users or Pax staff via messages or project tools.</li>
      </ul>

      <h3>5. Relationship Between Clients and Freelancers</h3>
      <p>The relationship between Clients and Freelancers is strictly that of independent contracting parties. Clients are solely responsible for vetting the Freelancers they hire. Freelancers are strictly responsible for the quality, timeliness, and legality of the work they produce. Pax does not direct, control, or supervise the work of Freelancers.</p>

      <h3>6. Intellectual Property and Licensing</h3>
      <p><strong>User Content:</strong> By uploading portfolios, profiles, or project briefs, you grant Pax a non-exclusive, worldwide, royalty-free license to use, display, and distribute this content strictly for operating and promoting the platform.</p>
      <p><strong>Work Product:</strong> Unless otherwise agreed in explicitly written terms between the Client and Freelancer, upon the release of full payment for a Milestone or Project from Escrow to the Freelancer, all intellectual property rights in the delivered work transfer fully from the Freelancer to the Client.</p>

      <h3>7. Payments and Fees</h3>
      <p>When entering a Project, Clients agree to fund Milestones into Escrow upfront. Pax charges a Service Fee for platform use and payment facilitation. For detailed breakdowns of these charges, processing times, and conditions, please thoroughly review our <a href="/escrow-terms" className="text-primary hover:underline">Payment &amp; Fees Policy / Escrow Terms</a>.</p>

      <h3>8. Suspension and Termination</h3>
      <p>Pax reserves the right to suspend or permanently terminate your account without prior notice if we suspect you have violated these Terms. In the event of suspension or termination, active Projects will be frozen. Funds held in Escrow will be resolved following an internal audit by Pax's Trust &amp; Safety team, returning funds to the rightful owner based on milestone deliveries prior to suspension.</p>

      <h3>9. Limitation of Liability and Disclaimers</h3>
      <p>PAX MAKES NO EXPRESS OR IMPLIED WARRANTIES REGARDING THE PLATFORM, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. 
      Under no circumstances shall Pax be liable for any indirect, incidental, special, or consequential damages arising out of your use of the platform, the freelancers hired, or the work delivered.</p>

      <h3>10. Governing Law and Dispute Resolution</h3>
      <p>These Terms shall be governed by and construed in accordance with the laws of [GOVERNING LAW REGION]. Any claims or disputes arising out of the platform or these Terms which cannot be resolved amicably via Pax’s internal dispute resolution shall be resolved by binding arbitration located in [GOVERNING LAW REGION].</p>

      <h3>11. Incorporation by Reference</h3>
      <p>Our Escrow Terms &amp; Conditions, Privacy Policy, and any other policies published on our website are expressly incorporated into this Master User Agreement by reference.</p>
    </Layout>
  )
}

export function EscrowTerms() {
  return (
    <Layout title="Escrow Terms & Conditions">
      <p><em>Last Updated: [DATE]</em></p>

      <h3>1. Role of Pax as an Escrow Facilitator</h3>
      <p>Pax acts solely as a secure facilitator. We use trusted third-party payment processors to hold project funds securely in escrow. <strong>Pax is not a bank, financial institution, or money transmitter.</strong> Our Escrow service simply ensures that funds are held conditionally and released only when predefined project criteria or mutual agreements are met.</p>

      <h3>2. Funding Escrow</h3>
      <p>Before a Freelancer initiates work on a Project or Milestone, the Client is required to deposit the agreed-upon total amount into the Escrow. The funds will remain locked in Escrow until they are explicitly released, a dispute is resolved, or a refund is authorized.</p>

      <h3>3. Releasing Funds to Freelancers</h3>
      <p>Funds are securely released from Escrow to the Freelancer under the following conditions:</p>
      <ul>
        <li><strong>Client Approval:</strong> The Client reviews the submitted work via the platform and clicks "Approve" or releases the milestone.</li>
        <li><strong>Automatic Release:</strong> If a Freelancer submits work for a Milestone and the Client takes no action (neither approves nor requests revisions) for [DISPUTE WINDOW IN DAYS] days, the funds will automatically be released to the Freelancer.</li>
        <li><strong>Dispute Resolution:</strong> Pax’s dispute team resolves a conflict in favor of the Freelancer.</li>
      </ul>

      <h3>4. Refunds and Cancellations</h3>
      <p>If a Project is cancelled before any work begins, the Client receives a full refund of Escrowed funds. Mid-project cancellations require mutual agreement; if unresolved, they enter the Dispute process. Partial refunds can be negotiated and agreed upon by both parties within the platform interface.</p>

      <h3>5. Disputes and Arbitration</h3>
      <p>If a Client is dissatisfied with submitted work, or if a Freelancer claims they are unfairly denied payment, either party may open a formal Dispute. Both parties will be asked to provide evidence (messages, files, timestamps) logged on the Pax platform. A Pax specialist (or a designated third-party arbitrator) will review the evidence and make a final, binding determination on how Escrow funds are split or released.</p>

      <h3>6. Fraud, Chargebacks, and Legal Orders</h3>
      <p>Pax maintains a zero-tolerance policy for fraud. If we suspect payment fraud, stolen cards, or money laundering, or if we receive a legal or regulatory order, Pax reserves the absolute right to freeze, hold, or reverse any funds currently in Escrow. If a Client initiates an unauthorized chargeback with their credit card company while funds are legitimately owed to a Freelancer under these Terms, Pax will suspend the Client's account and legally dispute the chargeback.</p>

      <h3>7. Service Fees and Escrow Charges</h3>
      <p>Using the Pax Escrow Service incurs a platform fee of [PERCENTAGE]% per transaction/project, deducted automatically prior to payout or added to the initial invoice depending on standard fee structures. Specific fee brackets will be visible clearly at the checkout stage before funding Escrow in [CURRENCY].</p>
    </Layout>
  )
}

export function Privacy() {
  return (
    <Layout title="Privacy Policy">
      <p><em>Last Updated: [DATE]</em></p>
      <h3>1. Information We Collect</h3>
      <p>To provide secure escrow and marketplace functionalities, we collect Identity information (Name, Contact Details, verifying documents) and financial information (transaction history, payment methods processed via strict third-party partners).</p>
      <h3>2. Use of Information</h3>
      <p>We use this data solely to enforce our Master Terms, prevent fraud, facilitate project matching, and ensure safe escrow processing. We do not sell user data to advertising third parties.</p>
      <h3>3. Cookies and Tracking</h3>
      <p>We use essential cookies to maintain session security and performance cookies to understand app usage. You may refer to our Cookie Policy (incorporated here) for detailed toggles.</p>
    </Layout>
  )
}

export function Support() {
  return (
    <Layout title="Help & Support">
      <h3>How can we help you?</h3>
      <p>Welcome to the PAX Support Center. If you're experiencing issues with an active escrow, a delayed milestone, or a technical bug, we are here to help!</p>
      <h3>Quick FAQs</h3>
      <ul>
        <li><strong>How long do payouts take?</strong> Usually within 24 hours of milestone approval.</li>
        <li><strong>What if the client ghosts me?</strong> You can open a dispute. If the client does not respond within the dispute window, funds for completed milestones are released to you.</li>
        <li><strong>Can I cancel a project?</strong> Yes, but only with mutual agreement or if no funding has been placed in escrow yet.</li>
      </ul>
      <br/>
      <p>Still need help? Rest assured, our team is monitoring all active projects. You can ping us directly via email at <a href="mailto:info@paxdot.com" className="text-primary hover:underline">info@paxdot.com</a>.</p>
    </Layout>
  )
}

