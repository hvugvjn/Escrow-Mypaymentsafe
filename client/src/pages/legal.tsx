import { PaxLogo } from "@/components/pax-logo";

function Layout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-sm border p-8 md:p-12">
        <div className="mb-10 text-center border-b pb-8">
          <div className="flex justify-center mb-6"><PaxLogo className="text-5xl" /></div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          {children}
        </div>
        <div className="mt-12 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">For any questions, reach out to us at <a href="mailto:info@paxdot.com" className="text-primary font-medium hover:underline">info@paxdot.com</a></p>
        </div>
      </div>
    </div>
  )
}

export function Privacy() {
  return (
    <Layout title="Privacy Policy">
      <h3>1. Information We Collect</h3>
      <p>We collect information to provide better services to all our users. This includes basic account info like your email and name, as well as usage data when you interact with PAX.</p>
      <h3>2. How We Use Information</h3>
      <p>The information we collect is used strictly for operating, maintaining, and improving our escrow and project management platform. We do not sell your personal data to third parties.</p>
      <h3>3. Data Security</h3>
      <p>We use industry-standard encryption to protect your data. Your payment information is securely processed and never stored in plain text.</p>
      <h3>4. Updates to this Policy</h3>
      <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
    </Layout>
  )
}

export function Terms() {
  return (
    <Layout title="Terms of Service">
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using PAX, you agree to be bound by these Terms of Service. If you do not agree, you may not access our platform.</p>
      <h3>2. Escrow Services</h3>
      <p>We act as a secure intermediary holding funds based on mutually agreed project milestones. We do not guarantee the quality of the freelancer's work, but we ensure funds are protected according to the agreed terms.</p>
      <h3>3. Project Management Duties</h3>
      <p>When acting as project managers, PAX oversees milestones and coordinates deliverables to ensure clear communication and strict deadline adherence.</p>
      <h3>4. Dispute Resolution</h3>
      <p>In the event of a dispute, our team will review the communications and deliverables to make a fair, binding decision on fund distribution.</p>
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
        <li><strong>What if the client ghosts me?</strong> You can open a dispute. If the client does not respond within 7 days, funds for completed milestones are released to you.</li>
        <li><strong>Can I cancel a project?</strong> Yes, but only with mutual agreement or if no funding has been placed in escrow yet.</li>
      </ul>
      <br/>
      <p>Still need help? Rest assured, our team is monitoring all active projects. You can ping us directly via email.</p>
    </Layout>
  )
}
