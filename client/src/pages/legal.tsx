import { PaxLogo } from "@/components/pax-logo";
import { Link, useLocation, useRoute } from "wouter";

function LegalSidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/terms", label: "Master Terms of Service" },
    { href: "/legal/user-agreement", label: "User Agreement" },
    { href: "/legal/terms-of-use", label: "Terms of Use" },
    { href: "/legal/enterprise-hire", label: "Enterprise Hire Terms" },
    { href: "/legal/direct-contracts-terms", label: "Direct Contracts Terms" },
    { href: "/escrow-terms", label: "Escrow Instructions" },
    { href: "/legal/hourly-escrow", label: "Hourly & Bonus Escrow Instructions" },
    { href: "/legal/fixed-price-escrow", label: "Fixed Price Contract Escrow" },
    { href: "/legal/enterprise-escrow", label: "Enterprise Escrow Instructions" },
    { href: "/legal/direct-contracts-escrow", label: "Direct Contracts Escrow Instructions" },
    { href: "/legal/pax-escrow-inc", label: "Pax Payment Escrow Inc." },
    { href: "/legal/fee-authorization", label: "Fee and ACH Authorization Agreement" },
    { href: "/legal/membership", label: "Freelancer Membership Agreement" },
    { href: "/legal/optional-contract", label: "Optional Service Contract Terms" },
    { href: "/legal/referral", label: "Referral Program Terms & Conditions" },
    { href: "/legal/mark-use", label: "Mark Use Guidelines" },
    { href: "/legal/infringement", label: "Proprietary Rights Infringement Procedures" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/legal/gdpa", label: "Global Data Processing Agreement" },
    { href: "/legal/dsa", label: "Digital Services Act compliance" },
    { href: "/legal/privacy-center", label: "Privacy Center Hub" },
    { href: "/legal/cookie", label: "Cookie Policy" },
    { href: "/legal/api-terms", label: "API Terms of Use" },
    { href: "/support", label: "Help & Support" },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 mt-8 md:mt-0">
      <div className="md:sticky md:top-24">
        <div className="mb-8">
          <PaxLogo className="text-3xl" />
          <h2 className="text-lg font-semibold text-foreground mt-4 mb-1">Legal Center</h2>
          <p className="text-sm text-muted-foreground">Platform policies and agreements.</p>
        </div>
        
        <nav className="flex flex-col space-y-1 relative before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <button
                  className={`text-left px-4 py-2.5 text-sm font-medium transition-all relative
                    ${isActive 
                      ? "text-primary before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                >
                  {link.label}
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-12 pt-6 border-t">
          <p className="text-xs text-muted-foreground leading-relaxed">
            For legal inquiries or notices, please contact us at <br/>
            <a href="mailto:legal@paxdot.com" className="text-primary hover:underline mt-1 inline-block">legal@paxdot.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Layout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background border-t">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12 md:gap-24">
        
        {/* Left Sidebar */}
        <LegalSidebar />

        {/* Right Content Area */}
        <div className="flex-1 max-w-4xl">
          <div className="mb-12 border-b pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{title}</h1>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none 
                          prose-headings:font-bold prose-headings:tracking-tight 
                          prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
                          prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                          prose-li:text-muted-foreground prose-li:my-1
                          prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <Layout title="Master Terms of Service / User Agreement">
      <p className="not-prose text-sm font-medium text-muted-foreground mb-8">Last Updated: 17/04/26</p>
      
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
      <p>To ensure a safe and professional environment, you agree not to use Pax to:</p>
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
      <p>When entering a Project, Clients agree to fund Milestones into Escrow upfront. Pax charges a Service Fee for platform use and payment facilitation. For detailed breakdowns of these charges, processing times, and conditions, please thoroughly review our <Link href="/escrow-terms">Payment &amp; Fees Policy / Escrow Terms</Link>.</p>

      <h3>8. Suspension and Termination</h3>
      <p>Pax reserves the right to suspend or permanently terminate your account without prior notice if we suspect you have violated these Terms. In the event of suspension or termination, active Projects will be frozen. Funds held in Escrow will be resolved following an internal audit by Pax's Trust &amp; Safety team, returning funds to the rightful owner based on milestone deliveries prior to suspension.</p>

      <h3>9. Limitation of Liability and Disclaimers</h3>
      <p>PAX MAKES NO EXPRESS OR IMPLIED WARRANTIES REGARDING THE PLATFORM, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. 
      Under no circumstances shall Pax be liable for any indirect, incidental, special, or consequential damages arising out of your use of the platform, the freelancers hired, or the work delivered.</p>

      <h3>10. Governing Law and Dispute Resolution</h3>
      <p>These Terms shall be governed by and construed in accordance with the laws of India. Any claims or disputes arising out of the platform or these Terms which cannot be resolved amicably via Pax’s internal dispute resolution shall be resolved by binding arbitration.</p>

      <h3>11. Incorporation by Reference</h3>
      <p>Our Escrow Terms &amp; Conditions, Privacy Policy, and any other policies published on our website are expressly incorporated into this Master User Agreement by reference.</p>
    </Layout>
  )
}

export function EscrowTerms() {
  return (
    <Layout title="Escrow Terms & Conditions">
      <p className="not-prose text-sm font-medium text-muted-foreground mb-8">Last Updated: 17/04/26</p>

      <h3>1. Role of Pax as an Escrow Facilitator</h3>
      <p>Pax acts solely as a secure facilitator. We use trusted third-party payment processors to hold project funds securely in escrow. <strong>Pax is not a bank, financial institution, or money transmitter.</strong> Our Escrow service simply ensures that funds are held conditionally and released only when predefined project criteria or mutual agreements are met.</p>

      <h3>2. Funding Escrow</h3>
      <p>Before a Freelancer initiates work on a Project or Milestone, the Client is required to deposit the agreed-upon total amount into the Escrow. The funds will remain locked in Escrow until they are explicitly released, a dispute is resolved, or a refund is authorized.</p>

      <h3>3. Releasing Funds to Freelancers</h3>
      <p>Funds are securely released from Escrow to the Freelancer under the following conditions:</p>
      <ul>
        <li><strong>Client Approval:</strong> The Client reviews the submitted work via the platform and clicks "Approve" or releases the milestone.</li>
        <li><strong>Automatic Release:</strong> If a Freelancer submits work for a Milestone and the Client takes no action (neither approves nor requests revisions) for 14 days, the funds will automatically be released to the Freelancer.</li>
        <li><strong>Dispute Resolution:</strong> Pax’s dispute team resolves a conflict in favor of the Freelancer.</li>
      </ul>

      <h3>4. Refunds and Cancellations</h3>
      <p>If a Project is cancelled before any work begins, the Client receives a full refund of Escrowed funds. Mid-project cancellations require mutual agreement; if unresolved, they enter the Dispute process. Partial refunds can be negotiated and agreed upon by both parties within the platform interface.</p>

      <h3>5. Disputes and Arbitration</h3>
      <p>If a Client is dissatisfied with submitted work, or if a Freelancer claims they are unfairly denied payment, either party may open a formal Dispute. Both parties will be asked to provide evidence (messages, files, timestamps) logged on the Pax platform. A Pax specialist (or a designated third-party arbitrator) will review the evidence and make a final, binding determination on how Escrow funds are split or released.</p>

      <h3>6. Fraud, Chargebacks, and Legal Orders</h3>
      <p>Pax maintains a zero-tolerance policy for fraud. If we suspect payment fraud, stolen cards, or money laundering, or if we receive a legal or regulatory order, Pax reserves the absolute right to freeze, hold, or reverse any funds currently in Escrow. If a Client initiates an unauthorized chargeback with their credit card company while funds are legitimately owed to a Freelancer under these Terms, Pax will suspend the Client's account and legally dispute the chargeback.</p>

      <h3>7. Service Fees and Escrow Charges</h3>
      <p>Using the Pax Escrow Service incurs a platform fee of 5% per transaction/project, deducted automatically prior to payout or added to the initial invoice depending on standard fee structures. Specific fee brackets will be visible clearly at the checkout stage before funding Escrow in INR.</p>
    </Layout>
  )
}

export function Privacy() {
  return (
    <Layout title="Privacy Policy">
      <p className="not-prose text-sm font-medium text-muted-foreground mb-8">Last Updated: April 17, 2026</p>
      
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
      <p className="not-prose text-sm font-medium text-muted-foreground mb-8">Last Updated: 17/04/26</p>
      
      <h3>How can we help you?</h3>
      <p>Welcome to the PAX Support Center. If you're experiencing issues with an active escrow, a delayed milestone, or a technical bug, we are here to help!</p>
      
      <h3>Quick FAQs</h3>
      <ul>
        <li><strong>How long do payouts take?</strong> Usually within 24 hours of milestone approval.</li>
        <li><strong>What if the client ghosts me?</strong> You can open a dispute. If the client does not respond within the dispute window (14 days), funds for completed milestones are released to you automatically.</li>
        <li><strong>Can I cancel a project?</strong> Yes, but only with mutual agreement or if no funding has been placed in escrow yet.</li>
      </ul>
      
      <h3>Contact Technical Support</h3>
      <p>Still need help? Rest assured, our team is monitoring all active projects. You can ping us directly via email at <a href="mailto:info@paxdot.com">info@paxdot.com</a>.</p>
    </Layout>
  )
}

// Dynamic Content Map for remaining legal pages
const LEGAL_CONTENT: Record<string, { title: string, sections: { head: string, body: string }[] }> = {
  "user-agreement": {
    title: "User Agreement",
    sections: [
      { head: "1. Account Registration", body: "By registering for an account on PAX, you agree to provide truthful, accurate, and complete information. You are strictly responsible for preserving the confidentiality of your login credentials." },
      { head: "2. Platform Conduct", body: "Users must adhere strictly to professional standards. Harassment, unauthorized circumventing of platform fees, and fraudulent behavior are grounds for immediate and permanent termination without recourse." },
      { head: "3. Service Availability", body: "PAX aims for 99.9% uptime, but we do not guarantee uninterrupted access. We reserve the right to perform emergency maintenance, which may result in temporary offline status." }
    ]
  },
  "terms-of-use": {
    title: "Terms of Use",
    sections: [
      { head: "1. Acceptable Use", body: "The PAX platform must not be used for illicit transactions, money laundering, or the distribution of restricted materials. Use of the service is limited strictly to professional freelance arrangements." },
      { head: "2. Intellectual Property", body: "All content uploaded to the platform remains the property of the creator until explicit transfer occurs upon final escrow milestone release." },
      { head: "3. Termination", body: "We reserve the right to suspend or terminate any user who operates in violation of these usage terms, local laws, or international financial regulations." }
    ]
  },
  "enterprise-hire": {
    title: "Enterprise Hire Terms",
    sections: [
      { head: "1. Enterprise Scope", body: "Enterprise clients gain access to advanced routing, volume discounts, and dedicated account management. These terms supersede standard Client terms where conflicts arise." },
      { head: "2. Dedicated Compliance", body: "PAX provides worker classification services for Enterprise users, but the ultimate tax liability rests with the employing corporate entity unless specifically stated in an addendum." }
    ]
  },
  "direct-contracts-terms": {
    title: "Direct Contracts Terms",
    sections: [
      { head: "1. Direct Engagement", body: "Talent may bring external clients to PAX to utilize our escrow infrastructure. These contracts bypass marketplace discovery fees." },
      { head: "2. Non-Circumvention Waiver", body: "Direct Contracts are exempt from the standard non-circumvention clause, provided the relationship provably originated externally." }
    ]
  },
  "hourly-escrow": {
    title: "Hourly & Bonus Escrow Instructions",
    sections: [
      { head: "1. Hourly Tracking", body: "All hourly contracts require the use of the PAX time tracker to guarantee payment. Manual time is not protected by escrow guarantees." },
      { head: "2. Bonus Payments", body: "Clients may issue discretionary bonuses. These bypass the escrow holding period and are distributed immediately upon clearance." }
    ]
  },
  "fixed-price-escrow": {
    title: "Fixed Price Contract Escrow Instructions",
    sections: [
      { head: "1. Milestone Funding", body: "The client must fully fund a milestone into the PAX escrow vault before work commences. Talent should never begin work on an unfunded milestone." },
      { head: "2. Milestone Approval", body: "Clients have 14 days to review submitted work. If no action is taken, the escrow vault will automatically release the funds to the Talent." }
    ]
  },
  "enterprise-escrow": {
    title: "Enterprise Escrow Instructions",
    sections: [
      { head: "1. Deferred Funding", body: "Qualifying Enterprise clients may utilize credit-based escrow initiation, where funds are guaranteed by institutional credit lines rather than cash-up-front deposits." },
      { head: "2. Enterprise Dispute Processing", body: "Disputes involving Enterprise accounts are routed through priority arbitration channels with dedicated impartial legal analysts." }
    ]
  },
  "direct-contracts-escrow": {
    title: "Direct Contracts Escrow Instructions",
    sections: [
      { head: "1. Payment Processing", body: "Direct Contract funds are processed swiftly through Stripe and held in custody until client approval is received." },
      { head: "2. Dispute Limitations", body: "Since these relationships originate off-platform, PAX mediation is strictly limited to verifying whether the delivered file matches the contract description." }
    ]
  },
  "pax-escrow-inc": {
    title: "Pax Payment Escrow Inc.",
    sections: [
      { head: "1. Corporate Structure", body: "Pax Payment Escrow Inc. is a registered financial intermediary acting solely as an escrow agent. We are not a licensed bank." },
      { head: "2. Custodial Accounts", body: "All funds are held in non-interest-bearing custodial accounts at top-tier partner banking institutions, ring-fenced entirely from PAX operational capital." }
    ]
  },
  "fee-authorization": {
    title: "Fee and ACH Authorization Agreement",
    sections: [
      { head: "1. Authorization", body: "By linking a bank account, you authorize PAX to execute ACH debits and credits for funding escrow and receiving payouts." },
      { head: "2. Insufficient Funds", body: "Any failed ACH transfer due to insufficient funds may result in penalty fees and immediate suspension of your PAX account." }
    ]
  },
  "membership": {
    title: "Freelancer Membership Agreement",
    sections: [
      { head: "1. Membership Tiers", body: "Talent may opt into premium membership tiers for additional proposal credits, advanced analytics, and enhanced profile visibility." },
      { head: "2. Billing", body: "Memberships are billed on a recurring monthly cycle. Cancellations must occur 48 hours prior to the next billing date to avoid charges." }
    ]
  },
  "optional-contract": {
    title: "Optional Service Contract Terms",
    sections: [
      { head: "1. Custom Addendums", body: "Clients and Talent may attach custom NDAs or IP transfer agreements to PAX milestones. In the event of a dispute, PAX arbitration will enforce these agreed-upon addendums." }
    ]
  },
  "referral": {
    title: "Referral Program Terms & Conditions",
    sections: [
      { head: "1. Eligibility", body: "Any verified user may generate referral links. Rewards are disbursed only after the referred user completes their first successful escrow transaction." },
      { head: "2. Reward Structure", body: "PAX reserves the right to dynamically adjust the referral fiat reward or platform credit distributions without prior notice." }
    ]
  },
  "mark-use": {
    title: "Mark Use Guidelines",
    sections: [
      { head: "1. Allowed Usage", body: "You may use the PAX logo only to indicate that your services are available on our platform. The logo must not be distorted, recolored, or used in a way that implies PAX endorsement." }
    ]
  },
  "infringement": {
    title: "Proprietary Rights Infringement Reporting Procedures",
    sections: [
      { head: "1. DMCA Notices", body: "If you believe your copyrighted work is being used improperly on a freelancer's portfolio, submit a formal DMCA takedown notice to legal@paxdot.com." },
      { head: "2. Counter-Notices", body: "Accused parties will be granted 10 days to submit a legal counter-notice before permanent removal of the disputed content." }
    ]
  },
  "gdpa": {
    title: "Global Data Processing Agreement",
    sections: [
      { head: "1. Controller and Processor", body: "PAX acts as a Data Processor for the files shared in the workspace, and a Data Controller for account infrastructure. We strictly comply with GDPR regulations." },
      { head: "2. Sub-processors", body: "We employ strictly vetted third-party sub-processors (e.g., AWS, Stripe) which adhere to equal or greater data protection standards." }
    ]
  },
  "dsa": {
    title: "Digital Services Act Compliance",
    sections: [
      { head: "1. European Market Operations", body: "In accordance with the EU DSA, PAX maintains a single point of contact and publishes annual transparency reports regarding content moderation." }
    ]
  },
  "privacy-center": {
    title: "Privacy Center Hub",
    sections: [
      { head: "1. Data Export", body: "Users may request a full JSON export of all platform data via the Support portal. Requests are fulfilled within 30 days." },
      { head: "2. Right to be Forgotten", body: "Account deletion initiates a cascading purge of PII, though financial transaction records may be retained up to 7 years to comply with international KYC/AML laws." }
    ]
  },
  "cookie": {
    title: "Cookie Policy",
    sections: [
      { head: "1. Tracking Instruments", body: "PAX uses essential cookies for session authentication, and optional cookies for analytics and targeted platform notifications." },
      { head: "2. Consent Management", body: "You can revoke non-essential cookie consent at any time via your browser settings or the platform footer toggle." }
    ]
  },
  "api-terms": {
    title: "API Terms of Use",
    sections: [
      { head: "1. Rate Limiting", body: "API access is strictly rate-limited to ensure platform stability. Excessive polling will trigger temporary IP bans." },
      { head: "2. Commercial Restrictions", body: "The PAX API cannot be used to replicate the core marketplace functionality or scrape talent profiles for external aggregation." }
    ]
  }
};

export function DynamicLegalPage() {
  const [match, params] = useRoute("/legal/:slug");
  
  if (!match || !params?.slug) return null;
  const content = LEGAL_CONTENT[params.slug];

  if (!content) {
    return (
      <Layout title="Document Not Found">
        <p className="not-prose text-sm font-medium text-muted-foreground mb-8">Error: 404</p>
        <p>The requested legal document could not be found. Please contact support if you believe this is an error.</p>
      </Layout>
    );
  }

  return (
    <Layout title={content.title}>
      <p className="not-prose text-sm font-medium text-muted-foreground mb-8">Last Updated: 17/04/26</p>
      
      <p className="mb-8">This agreement details the exact operational methodologies, policies, and parameters governing this specific area of your interaction with the PAX platform.</p>

      {content.sections.map((section, idx) => (
        <div key={idx} className="mb-8">
          <h3>{section.head}</h3>
          <p>{section.body}</p>
        </div>
      ))}
      
      <div className="mt-12 p-6 bg-muted/30 rounded-xl border border-muted">
        <p className="text-sm m-0 text-muted-foreground">
          <strong>Need clarification?</strong> If you have any questions regarding this specific policy, please reach out to <a href="mailto:legal@paxdot.com" className="text-primary hover:underline">legal@paxdot.com</a> before agreeing to proceed.
        </p>
      </div>
    </Layout>
  );
}
