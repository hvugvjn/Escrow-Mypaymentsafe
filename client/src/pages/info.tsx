import { useState } from "react";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Zap, Users, Shield, Briefcase, FileText, CheckCircle2, Building2, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaxLogo } from "@/components/pax-logo";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
    {
        label: "How It Protects",
        key: "protects",
        links: [
            { label: "Buyer Security", sub: "Verify cargo or digital work before funds release", href: "/info/managed-escrow" },
            { label: "Seller Guarantees", sub: "Fulfill contracts with verified upfront funding", href: "/info/guaranteed-payments" },
            { label: "Neutral Arbitration", sub: "Legal & technical resolution when disputes arise", href: "/info/dispute-resolution" },
            { label: "RBI Compliance", sub: "Safe transactional infrastructure & nodal vaults", href: "/info/trust-and-safety" },
        ],
    },
    {
        label: "Trade Solutions",
        key: "solutions",
        links: [
            { label: "Import & Export", sub: "Secure cross-border logistics & supplier advances", href: "/info/escrow-for-import-export" },
            { label: "B2B Goods & Trade", sub: "Domestic wholesale, manufacturing & inventory", href: "/info/escrow-for-wholesale-trade" },
            { label: "Service Contracts", sub: "Safeguard agency & high-value contractor milestones", href: "/info/escrow-for-service-contracts" },
            { label: "Enterprise Escrow", sub: "Tailored structures for high-volume transactions", href: "/info/vip-pay-on-delivery" },
        ],
    },
    {
        label: "Resources",
        key: "resources",
        links: [
            { label: "How Escrow Works", sub: "4-step secure transaction workflow", href: "/info/how-to-hire" },
            { label: "Success Stories", sub: "Traders who eliminated credit risk with PAX", href: "/info/success-stories" },
            { label: "PAX Blog", sub: "Latest insights on trade risk management", href: "/info/blog" },
            { label: "Press Center", sub: "Latest announcements and media assets", href: "/info/press-and-media" },
        ],
    },
];

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
  "escrow-for-import-export": {
    tag: "Trade Escrow",
    title: "Secure Import & Export Escrow Solutions",
    subtitle: "Eliminate cross-border default risk, secure supplier advance deposits, and gate payouts against Bill of Lading, weight slips, and custom clearance papers.",
    icon: ShieldCheck,
    imageColor: "from-blue-700 to-slate-900",
    bodyHeading: "Regulated Milestone Protection for International Cargo Trade",
    bodyText: "For B2B importers and exporters, transacting with new international suppliers presents critical delivery risks. PAX neutralizes this credit gap by locking the transaction value in an RBI-compliant nodal vault. The seller loads cargo knowing the payout is secured; the buyer releases funds only after verified customs entry, weight-slip validation, or quality audit reports are uploaded and verified.",
    bullets: [
      "Secures advance deposits: No money leaves the vault until cargo is logged at the origin port.",
      "Customs and BoL gates: Payout milestones are tied directly to shipping cargo documentation.",
      "Third-party inspections: Support for independent cargo and raw material quality audits before disbursement."
    ]
  },
  "escrow-for-wholesale-trade": {
    tag: "Trade Escrow",
    title: "B2B Escrow for Bulk Wholesale & Manufacturing",
    subtitle: "Protect domestic supply lines, secure raw materials, and prevent buyer default. Gate payouts against freight loading, weight clearance, and inspection approvals.",
    icon: Building2,
    imageColor: "from-teal-700 to-zinc-900",
    bodyHeading: "Eliminate Trade Credit Risk & Cash Flow Strains",
    bodyText: "Domestic B2B trade, bulk manufacturing, and merchant distribution require substantial upfront capital. Exposing your business to unpaid invoices or substandard supply defaults can paralyze operations. PAX provides a secure trade escrow where buyers deposit payment upfront into a licensed banking vault. Sellers manufacture and dispatch inventory with absolute payment certainty, and funds disburse automatically upon receipt verification.",
    bullets: [
      "100% Payment Guarantee: Sellers start manufacturing with verified, locked escrow backing.",
      "Receipt & Weight Gated: Payouts are bound to domestic logistics receipts and weight slips.",
      "Customizable Milestones: Set partial advance releases for raw material sourcing or shipping phases."
    ]
  },
  "escrow-for-service-contracts": {
    tag: "Contract Escrow",
    title: "Milestone Escrow for High-Value Service Contracts",
    subtitle: "Safeguard software development milestones, digital agency deliverables, and high-value consultancy agreements. Payouts release strictly upon milestone code reviews and UAT approvals.",
    icon: FileText,
    imageColor: "from-indigo-700 to-gray-900",
    bodyHeading: "Binding Milestones & Code Review Gates",
    bodyText: "Whether you are a corporate client hiring a custom software agency or a high-value contractor delivering specialized systems, scope creep and invoice defaults are major hazards. PAX provides structured milestone contracts. Client deposits funding into escrow. The developer submits deliverables to our staging environment. Payouts release when the User Acceptance Testing (UAT) parameters pass, backed by independent expert arbitration if scope conflicts arise.",
    bullets: [
      "Milestone-Gated Payouts: Fund and release in stages (e.g. Wireframes, Beta, Final Deploy).",
      "Staging Code Checks: Deliverables are held in secure repositories until milestones pass.",
      "Built-in Dispute Mediation: Impartial tech arbitrators review codebases and specifications to resolve conflicts."
    ]
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [openNav, setOpenNav] = useState<string | null>(null);

  const toggleAccordion = (name: string) =>
    setExpandedAccordion(expandedAccordion === name ? null : name);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  if (!match || !params?.slug) return null;

  const content = INFO_CONTENT[params.slug];

  if (!content) {
    // Dynamically generate content based on the slug for all the mega-menu items!
    const isHire = params.slug.startsWith("hire-");
    const titleRaw = isHire ? params.slug.replace("hire-", "") : params.slug;
    
    const formattedTitle = titleRaw.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    const finalTitle = isHire ? `Hire Expert ${formattedTitle}` : `Find ${formattedTitle}`;
    const desc = isHire 
      ? `Discover and securely hire the top 1% of ${formattedTitle} on PAX. Ensure your project's success with our enterprise-grade managed escrow infrastructure.`
      : `Browse premium ${formattedTitle} carefully curated by PAX's matchmaking system. Secure guaranteed payment through our managed milestone escrow.`;

    // Mock an object to pass to the rest of the renderer
    return (
      <div className="min-h-screen bg-white font-sans">
        {/* Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-16 py-4 border-b border-white/5 bg-[#030816] text-[#f5f7fa] font-sans`}>
          <div className="flex items-center gap-10">
            <Link href="/">
              <a className="hover:opacity-80 transition-opacity"><PaxLogo className="text-2xl" white /></a>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-white/70">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="relative group py-2"
                  onMouseEnter={() => setOpenNav(item.key)}
                  onMouseLeave={() => setOpenNav(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${openNav === item.key ? "rotate-180" : ""}`} />
                  </button>

                  <div className={`absolute top-full left-0 mt-1 w-80 bg-[#0b1426] border border-white/10 rounded-2xl shadow-2xl transition-all duration-200 p-3 z-[1000] ${openNav === item.key ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
                    {item.links.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <a className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group/link">
                          <span className="font-semibold text-white text-sm group-hover/link:text-blue-400 transition-colors">{link.label}</span>
                          <span className="text-xs text-white/40">{link.sub}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 text-sm">
                Log In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#122b5e] hover:bg-[#1a3d80] text-white font-semibold rounded-lg px-5 py-2 text-sm border border-white/15 shadow-lg shadow-blue-900/25 transition-all">
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); if (mobileMenuOpen) setExpandedAccordion(null); }}
              className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] bg-[#030816] pt-20 pb-8 px-6 overflow-y-auto flex flex-col lg:hidden font-sans text-white"
            >
              <div className="flex-1 space-y-2 mt-4">
                {NAV_ITEMS.map((item) => (
                  <div key={item.key} className={`border-b border-white/5 pb-3 transition-all duration-200 ${expandedAccordion === item.key ? "bg-white/[0.03] border border-white/10 rounded-2xl p-4 my-2" : "py-1"}`}>
                    <button
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full flex items-center justify-between py-2 text-base font-bold text-white/90 hover:text-white"
                    >
                      <span>{item.label}</span>
                      {expandedAccordion === item.key
                        ? <ChevronUp className="w-5 h-5 text-blue-400" />
                        : <ChevronDown className="w-5 h-5 text-white/40" />
                      }
                    </button>
                    <AnimatePresence>
                      {expandedAccordion === item.key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-2 py-2 space-y-3"
                        >
                          {item.links.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                              <a className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold text-white">{link.label}</span>
                                <span className="text-xs text-white/40">{link.sub}</span>
                              </a>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 py-5 rounded-full font-bold text-sm">Log In</Button>
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#122b5e] hover:bg-[#1a3d80] text-white py-5 rounded-full font-bold text-sm shadow-xl">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#0a0f1e] to-[#1a2f4c] text-white shadow-lg mb-8">
               <Zap className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 shadow-sm border border-blue-100">
              <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-500"></span>
              {isHire ? "Talent Solutions" : "Freelance Opportunities"}
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              {finalTitle}
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl">
              {desc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  {isHire ? "Browse Talent" : "Sign Up to Apply"}
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base font-semibold border-gray-200">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Content Divider */}
        <div className="border-t border-gray-100 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">Scale securely with PAX.</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Stop worrying about untrusted relationships. PAX provides mathematical certainty that {isHire ? "work is delivered before funds are released" : "you are paid immediately for approved work"}.
                </p>
                <ul className="space-y-4">
                  {[
                    "Zero fraud tolerance with 100% escrow-backed milestones.",
                    isHire ? "Access to un-circulated enterprise talent pools." : "Access to high-paying enterprise contracts.",
                    "Binding arbitration and unbiased conflict resolution."
                  ].map((bullet, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        </div>

      </div>
    );
  }

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-16 py-4 border-b border-white/5 bg-[#030816] text-[#f5f7fa] font-sans`}>
        <div className="flex items-center gap-10">
          <Link href="/">
            <a className="hover:opacity-80 transition-opacity"><PaxLogo className="text-2xl" white /></a>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-white/70">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.key}
                className="relative group py-2"
                onMouseEnter={() => setOpenNav(item.key)}
                onMouseLeave={() => setOpenNav(null)}
              >
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                  {item.label}
                  <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${openNav === item.key ? "rotate-180" : ""}`} />
                </button>

                <div className={`absolute top-full left-0 mt-1 w-80 bg-[#0b1426] border border-white/10 rounded-2xl shadow-2xl transition-all duration-200 p-3 z-[1000] ${openNav === item.key ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
                  {item.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <a className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group/link">
                        <span className="font-semibold text-white text-sm group-hover/link:text-blue-400 transition-colors">{link.label}</span>
                        <span className="text-xs text-white/40">{link.sub}</span>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 text-sm">
              Log In
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-[#122b5e] hover:bg-[#1a3d80] text-white font-semibold rounded-lg px-5 py-2 text-sm border border-white/15 shadow-lg shadow-blue-900/25 transition-all">
              Get Started
            </Button>
          </Link>
          <button
            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); if (mobileMenuOpen) setExpandedAccordion(null); }}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-[#030816] pt-20 pb-8 px-6 overflow-y-auto flex flex-col lg:hidden font-sans text-white"
          >
            <div className="flex-1 space-y-2 mt-4">
              {NAV_ITEMS.map((item) => (
                <div key={item.key} className={`border-b border-white/5 pb-3 transition-all duration-200 ${expandedAccordion === item.key ? "bg-white/[0.03] border border-white/10 rounded-2xl p-4 my-2" : "py-1"}`}>
                  <button
                    onClick={() => toggleAccordion(item.key)}
                    className="w-full flex items-center justify-between py-2 text-base font-bold text-white/90 hover:text-white"
                  >
                    <span>{item.label}</span>
                    {expandedAccordion === item.key
                      ? <ChevronUp className="w-5 h-5 text-blue-400" />
                      : <ChevronDown className="w-5 h-5 text-white/40" />
                    }
                  </button>
                  <AnimatePresence>
                    {expandedAccordion === item.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-2 py-2 space-y-3"
                      >
                        {item.links.map((link) => (
                          <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                            <a className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-white">{link.label}</span>
                              <span className="text-xs text-white/40">{link.sub}</span>
                            </a>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 py-5 rounded-full font-bold text-sm">Log In</Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#122b5e] hover:bg-[#1a3d80] text-white py-5 rounded-full font-bold text-sm shadow-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="mt-1 bg-primary/10 rounded-full p-1">
                <CheckCircle2 className="w-5 h-5 text-primary" />
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
              <Button size="lg" className="rounded-full px-8 shrink-0 shadow-md h-12 text-base">
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
