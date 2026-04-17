import { useRoute } from "wouter";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Zap, Users, Shield, Briefcase, FileText, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaxLogo } from "@/components/pax-logo";
import { useEffect } from "react";

// --- CONTENT MAP ---
// This holds the enterprise-grade copy for each footer page.
const INFO_CONTENT: Record<string, { tag: string, title: string, subtitle: string, icon: any, imageColor: string, bodyHeading: string, bodyText: string, bullets: string[] }> = {
  // For Clients
  "how-to-hire": {
    tag: "For Clients",
    title: "How to hire on PAX",
    subtitle: "Grow your business confidently, supported by experienced freelancers every step of the way.",
    icon: Users,
    imageColor: "from-blue-600 to-blue-900",
    bodyHeading: "A better way to build your team",
    bodyText: "Forget the risks of traditional hiring. With PAX, you post your project, review curated talent, and fund escrow only when you are purely satisfied with the scope.",
    bullets: ["Post a job and receive targeted proposals.", "Review portfolios and past verified escrow successes.", "Fund the first milestone specifically to begin work securely."],
  },
  "managed-escrow": {
    tag: "For Clients",
    title: "Managed Escrow",
    subtitle: "Absolute financial security for every project milestone.",
    icon: ShieldCheck,
    imageColor: "from-emerald-600 to-teal-900",
    bodyHeading: "Never worry about paying for incomplete work.",
    bodyText: "PAX acts as a secure intermediary. You deposit funds, but they are only released to the talent when you explicitly approve the deliverables.",
    bullets: ["Funds are held safely in a verified escrow vault.", "Release payments milestone-by-milestone.", "Built-in mediation if deliverables don't match the scope."],
  },
  "project-oversight": {
    tag: "For Clients",
    title: "Project Oversight",
    subtitle: "Let PAX project managers handle the heavy lifting of deadlines.",
    icon: Briefcase,
    imageColor: "from-purple-600 to-indigo-900",
    bodyHeading: "Active tracking, zero micromanagement.",
    bodyText: "Our platform goes beyond just payments. We provide the tools and oversight required to ensure your talent delivers exactly what was promised, exactly on time.",
    bullets: ["Automated deadline tracking and nudges.", "Centralized file sharing and approvals.", "Complete audit trail of all correspondence."],
  },
  "find-top-talents": {
    tag: "For Clients",
    title: "Find Top Talents",
    subtitle: "Connect with the top 1% of verified global professionals.",
    icon: Zap,
    imageColor: "from-amber-500 to-orange-800",
    bodyHeading: "Quality you can inherently trust.",
    bodyText: "Every freelancer on PAX is subjected to performance tracking. You only engage with talent who have a proven history of successful escrow deliveries.",
    bullets: ["Access our exclusive talent pool.", "Filter by verified skills and past escrow success rate.", "Direct contract negotiations."],
  },
  "vip-pay-on-delivery": {
    tag: "For Clients",
    title: "VIP Pay-on-Delivery",
    subtitle: "The ultimate risk-free experience for enterprise clients.",
    icon: Building2,
    imageColor: "from-zinc-700 to-zinc-950",
    bodyHeading: "Premium security logic.",
    bodyText: "For select, highly-vetted clients, PAX allows structured project beginnings with deferred escrow funding, utilizing legal enforcement to secure talent payment while minimizing upfront client working capital constraints.",
    bullets: ["Optimized working capital flow.", "Strict legal safeguards.", "Available by application only."],
  },

  // For Talents
  "how-it-works-talent": {
    tag: "For Talents",
    title: "How PAX works for you",
    subtitle: "Never chase an invoice again. Guarantee your payment before writing a single line of code.",
    icon: Zap,
    imageColor: "from-pink-600 to-rose-900",
    bodyHeading: "Secure your income, focus on your craft.",
    bodyText: "PAX protects freelancers. The client funds the milestone upfront. As long as you deliver the agreed-upon work, you are 100% guaranteed to be paid.",
    bullets: ["Agree on clear scopes and milestones.", "Client funds the escrow vault.", "Submit work and receive instant payouts upon approval."],
  },
  "guaranteed-payments": {
    tag: "For Talents",
    title: "Guaranteed Payments",
    subtitle: "Your work is valuable. Your payment should be inevitable.",
    icon: Shield,
    imageColor: "from-green-500 to-emerald-800",
    bodyHeading: "Eradicate non-payment risk.",
    bodyText: "Because funds are secured in escrow before you begin, the risk of a client disappearing without paying is completely eliminated.",
    bullets: ["Upfront funding verification.", "Automatic release if client ghosts after delivery.", "Zero collection hassle."],
  },
  "direct-contracts": {
    tag: "For Talents",
    title: "Direct Contracts",
    subtitle: "Turn long-term relationships into secure, automated revenue streams.",
    icon: FileText,
    imageColor: "from-indigo-500 to-indigo-900",
    bodyHeading: "Skip the marketplace, keep the security.",
    bodyText: "Bring your existing clients to PAX to lock in payment security and seamless structured milestones without finding new leads.",
    bullets: ["Client onboarding with minimal friction.", "Guaranteed milestone payments.", "Professional, branded invoicing automatically handled."],
  },
  "success-stories": {
    tag: "For Talents",
    title: "Success Stories",
    subtitle: "See how professionals are scaling their businesses safely with PAX.",
    icon: Users,
    imageColor: "from-yellow-400 to-orange-600",
    bodyHeading: "Real talent. Real security.",
    bodyText: "Join a global community of top-tier freelancers and agencies who have completely eliminated payment risk from their operation.",
    bullets: ["Zero disputes on over 95% of projects.", "Average payout speed under 2 hours.", "Consistent growth in high-value escrow deals."],
  },
  
  // Resources & Company
  "trust-and-safety": {
    tag: "Trust & Safety",
    title: "Trust & Safety",
    subtitle: "Bank-grade security meets enterprise compliance.",
    icon: ShieldCheck,
    imageColor: "from-slate-700 to-slate-900",
    bodyHeading: "We take your security seriously.",
    bodyText: "From data encryption to strict KYC/AML compliance, the PAX infrastructure is designed to protect your identity, your intellectual property, and your money.",
    bullets: ["End-to-end data encryption.", "Strict identity verification processes.", "PCI-DSS compliant payment processing."],
  },
  "pax-for-enterprise": {
    tag: "Enterprise",
    title: "PAX for Enterprise",
    subtitle: "Scale your external workforce with absolute compliance.",
    icon: Building2,
    imageColor: "from-blue-800 to-indigo-950",
    bodyHeading: "A single unified platform for enterprise agility.",
    bodyText: "Manage hundreds of freelancers, agencies, and external contractors with a unified dashboard. Enforce compliance, track spend, and utilize API integrations.",
    bullets: ["Custom contract support and compliance.", "Multi-team access and permission roles.", "Dedicated account management."],
  },
  "dispute-resolution": {
    tag: "Resources",
    title: "Dispute Resolution",
    subtitle: "Fair, swift, and strictly impartial mediation when things don't go to plan.",
    icon: Shield,
    imageColor: "from-red-600 to-rose-900",
    bodyHeading: "Protecting both sides of the agreement.",
    bodyText: "If a project derails, PAX steps in. Our specialized arbitration team reviews the agreed scope, milestones, and deliverables to ensure funds are distributed exactly according to the contract.",
    bullets: ["Impartial platform-based mediation.", "Evidence-based decision-making system.", "Typically resolved within 3-5 business days."],
  },
  "blog": {
    tag: "Resources",
    title: "PAX Blog & Insights",
    subtitle: "The latest insights on global hiring, digital security, and remote management.",
    icon: FileText,
    imageColor: "from-cyan-600 to-sky-900",
    bodyHeading: "Educating the future of work.",
    bodyText: "Explore our curated articles designed to help clients execute flawless projects and help talent secure their income.",
    bullets: ["Guides to managing remote talent.", "Deep-dives into specific freelance niches.", "Platform updates and feature drops."],
  },
  "press-and-media": {
    tag: "Company",
    title: "Press & Media Center",
    subtitle: "The story of how we are fixing the gig economy trust deficit.",
    icon: Zap,
    imageColor: "from-violet-600 to-fuchsia-900",
    bodyHeading: "PAX in the news.",
    bodyText: "Discover our press releases, media kits, and coverage as we continue to scale the most secure escrow platform in the world.",
    bullets: ["Downloadable high-res brand assets.", "Direct contact for press inquiries.", "Archive of our major announcements."],
  },
  "about-pax": {
    tag: "Company",
    title: "About PAX",
    subtitle: "Building the standard for global digital trust.",
    icon: Users,
    imageColor: "from-[#0e4573] to-[#0a2f4c]",
    bodyHeading: "Our Mission",
    bodyText: "PAX was founded on a simple principle: doing business online should not require a leap of faith. By blending escrow with project management, we are eliminating fraud from digital work.",
    bullets: ["Founded by industry veterans.", "Securing millions in digital transactions.", "A 100% remote, global enterprise."],
  }
};

export default function InfoPage() {
  const [match, params] = useRoute("/info/:slug");
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  if (!match || !params?.slug) return null;

  const content = INFO_CONTENT[params.slug];

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
          <p className="text-gray-500 mt-2">The information page you are looking for does not exist.</p>
          <Link href="/">
            <Button className="mt-4">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar — Clean White Style like Upwork */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="hover:opacity-80 transition-opacity"><PaxLogo className="text-3xl" /></a>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold hidden md:flex">Log In</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section — Matching Upwork's Rounded Card Style */}
      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${content.imageColor} text-white px-8 md:px-16 py-20 md:py-32 shadow-xl`}>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-semibold mb-6">
              <Icon className="w-4 h-4" />
              {content.tag}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              {content.title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-xl mb-10 font-medium">
              {content.subtitle}
            </p>
            
            <Link href="/login">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-full px-8 py-6 text-base">
                Get started free 
              </Button>
            </Link>
          </div>

          {/* Abstract geometric background to replace the image for now, giving a premium enterprise feel */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
            <svg viewBox="0 0 800 800" className="absolute right-[-20%] top-[-10%] w-[120%] h-[120%]">
              <circle cx="400" cy="400" r="300" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 20" />
              <circle cx="400" cy="400" r="200" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
              <path d="M 100 400 Q 400 100 700 400 T 1300 400" fill="none" stroke="white" strokeWidth="4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
          {content.bodyHeading}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-12">
          {content.bodyText}
        </p>

        <div className="space-y-6">
          {content.bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="mt-1 bg-green-100 rounded-full p-1">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-800">{bullet}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 rounded-3xl p-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to transform how you work?</h3>
              <p className="text-gray-500">Join thousands of professionals already using PAX.</p>
            </div>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shrink-0">
                Create your account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-gray-900 py-12 text-center border-t border-gray-800">
        <PaxLogo className="text-2xl text-white inline-block mb-4" white />
        <p className="text-gray-500 text-sm">© 2026 PAX Escrow. Designed for absolute trust.</p>
      </footer>
    </div>
  );
}
