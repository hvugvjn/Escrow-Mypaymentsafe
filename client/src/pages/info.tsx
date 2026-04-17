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
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-3 md:py-4 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="hover:opacity-80 transition-opacity"><PaxLogo className="text-3xl" /></a>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold hidden sm:flex text-gray-600 hover:text-gray-900 hover:bg-gray-50">Log In</Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full px-6 font-semibold shadow-sm">Sign Up</Button>
            </Link>
          </div>
        </nav>

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
              <Link href="/info/pax-for-enterprise">
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
      {/* Navbar — Clean White Style like Upwork with Mega Menu */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-3 md:py-4 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="hover:opacity-80 transition-opacity"><PaxLogo className="text-3xl" /></a>
          </Link>
          
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
            {/* Hire Freelancers */}
            <div className="group relative py-4">
                <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                    Hire freelancers <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full -left-4 w-[1100px] bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-8 grid grid-cols-4 gap-y-12 gap-x-8">
                    {/* ROW 1 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Admin & support</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/hire-cold-callers"><a className="hover:text-primary transition-colors cursor-pointer block">Cold callers</a></Link></li>
                            <li><Link href="/info/hire-content-moderators"><a className="hover:text-primary transition-colors cursor-pointer block">Content moderators</a></Link></li>
                            <li><Link href="/info/hire-lead-generation-specialists"><a className="hover:text-primary transition-colors cursor-pointer block">Lead generation specialists</a></Link></li>
                            <li><Link href="/info/hire-personal-assistants"><a className="hover:text-primary transition-colors cursor-pointer block">Personal assistants</a></Link></li>
                            <li><Link href="/info/hire-virtual-assistants"><a className="hover:text-primary transition-colors cursor-pointer block">Virtual assistants</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Design & creative</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/hire-graphic-designers"><a className="hover:text-primary transition-colors cursor-pointer block">Graphic designers</a></Link></li>
                            <li><Link href="/info/hire-illustrators"><a className="hover:text-primary transition-colors cursor-pointer block">Illustrators</a></Link></li>
                            <li><Link href="/info/hire-logo-designers"><a className="hover:text-primary transition-colors cursor-pointer block">Logo designers</a></Link></li>
                            <li><Link href="/info/hire-ux-designers"><a className="hover:text-primary transition-colors cursor-pointer block">UX designers</a></Link></li>
                            <li><Link href="/info/hire-web-designers"><a className="hover:text-primary transition-colors cursor-pointer block">Web designers</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Marketing</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/hire-digital-marketers"><a className="hover:text-primary transition-colors cursor-pointer block">Digital marketers</a></Link></li>
                            <li><Link href="/info/hire-email-marketers"><a className="hover:text-primary transition-colors cursor-pointer block">Email marketers</a></Link></li>
                            <li><Link href="/info/hire-google-ads-experts"><a className="hover:text-primary transition-colors cursor-pointer block">Google Ads experts</a></Link></li>
                            <li><Link href="/info/hire-seo-experts"><a className="hover:text-primary transition-colors cursor-pointer block">SEO experts</a></Link></li>
                            <li><Link href="/info/hire-social-media-managers"><a className="hover:text-primary transition-colors cursor-pointer block">Social media managers</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Writing & content</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/hire-book-editors"><a className="hover:text-primary transition-colors cursor-pointer block">Book editors</a></Link></li>
                            <li><Link href="/info/hire-content-writers"><a className="hover:text-primary transition-colors cursor-pointer block">Content writers</a></Link></li>
                            <li><Link href="/info/hire-copywriters"><a className="hover:text-primary transition-colors cursor-pointer block">Copywriters</a></Link></li>
                            <li><Link href="/info/hire-email-copywriters"><a className="hover:text-primary transition-colors cursor-pointer block">Email copywriters</a></Link></li>
                            <li><Link href="/info/hire-ghostwriters"><a className="hover:text-primary transition-colors cursor-pointer block">Ghostwriters</a></Link></li>
                        </ul>
                    </div>

                    {/* ROW 2 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">AI & emerging tech</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/hire-automation-engineers"><a className="hover:text-primary transition-colors cursor-pointer block">Automation engineers</a></Link></li>
                            <li><Link href="/info/hire-chatbot-developers"><a className="hover:text-primary transition-colors cursor-pointer block">Chatbot developers</a></Link></li>
                            <li><Link href="/info/hire-computer-vision-engineers"><a className="hover:text-primary transition-colors cursor-pointer block">Computer vision engineers</a></Link></li>
                            <li><Link href="/info/hire-ethical-hackers"><a className="hover:text-primary transition-colors cursor-pointer block">Ethical hackers</a></Link></li>
                            <li><Link href="/info/hire-machine-learning-engineers"><a className="hover:text-primary transition-colors cursor-pointer block">Machine learning engineers</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Development & tech</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/hire-mobile-app-developers"><a className="hover:text-primary transition-colors cursor-pointer block">Mobile app developers</a></Link></li>
                            <li><Link href="/info/hire-python-developers"><a className="hover:text-primary transition-colors cursor-pointer block">Python developers</a></Link></li>
                            <li><Link href="/info/hire-software-developers"><a className="hover:text-primary transition-colors cursor-pointer block">Software developers</a></Link></li>
                            <li><Link href="/info/hire-web-developers"><a className="hover:text-primary transition-colors cursor-pointer block">Web developers</a></Link></li>
                            <li><Link href="/info/hire-wordpress-developers"><a className="hover:text-primary transition-colors cursor-pointer block">WordPress developers</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Video, audio & animation</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/hire-animators"><a className="hover:text-primary transition-colors cursor-pointer block">Animators</a></Link></li>
                            <li><Link href="/info/hire-audio-editors"><a className="hover:text-primary transition-colors cursor-pointer block">Audio editors</a></Link></li>
                            <li><Link href="/info/hire-music-producers"><a className="hover:text-primary transition-colors cursor-pointer block">Music producers</a></Link></li>
                            <li><Link href="/info/hire-video-editors"><a className="hover:text-primary transition-colors cursor-pointer block">Video editors</a></Link></li>
                            <li><Link href="/info/hire-voice-actors"><a className="hover:text-primary transition-colors cursor-pointer block">Voice actors</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-6 flex flex-col justify-end">
                        <Link href="/info/how-to-hire"><a className="text-primary font-semibold hover:underline flex items-center gap-2 cursor-pointer">Explore more <ArrowRight className="w-4 h-4"/></a></Link>
                        <Link href="/support"><a className="text-primary font-semibold hover:underline flex items-center gap-2 cursor-pointer">Book consultation <ArrowRight className="w-4 h-4"/></a></Link>
                        <Link href="/info/pax-for-enterprise"><a className="text-primary font-semibold hover:underline flex items-center gap-2 cursor-pointer">Join Business Plus <ArrowRight className="w-4 h-4"/></a></Link>
                    </div>
                </div>
            </div>

            {/* Find Work */}
            <div className="group relative py-4">
                <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                    Find work <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full -left-4 w-[1100px] bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-8 grid grid-cols-4 gap-y-12 gap-x-8">
                    {/* ROW 1 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Admin & support jobs</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/chat-support-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Chat support jobs</a></Link></li>
                            <li><Link href="/info/cold-calling-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Cold calling jobs</a></Link></li>
                            <li><Link href="/info/content-moderation-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Content moderation jobs</a></Link></li>
                            <li><Link href="/info/lead-generation-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Lead generation jobs</a></Link></li>
                            <li><Link href="/info/virtual-assistant-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Virtual assistant jobs</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Design & creative jobs</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/canva-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Canva jobs</a></Link></li>
                            <li><Link href="/info/graphic-design-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Graphic design jobs</a></Link></li>
                            <li><Link href="/info/illustration-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Illustration jobs</a></Link></li>
                            <li><Link href="/info/logo-design-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Logo design jobs</a></Link></li>
                            <li><Link href="/info/web-design-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Web design jobs</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Marketing jobs</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/digital-marketing-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Digital marketing jobs</a></Link></li>
                            <li><Link href="/info/email-marketing-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Email marketing jobs</a></Link></li>
                            <li><Link href="/info/google-ads-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Google Ads jobs</a></Link></li>
                            <li><Link href="/info/seo-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">SEO jobs</a></Link></li>
                            <li><Link href="/info/social-media-management-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Social media management jobs</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Writing & content jobs</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/book-editing-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Book editing jobs</a></Link></li>
                            <li><Link href="/info/content-writing-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Content writing jobs</a></Link></li>
                            <li><Link href="/info/copywriting-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Copywriting jobs</a></Link></li>
                            <li><Link href="/info/email-copywriting-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Email copywriting jobs</a></Link></li>
                            <li><Link href="/info/ghostwriting-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Ghostwriting jobs</a></Link></li>
                        </ul>
                    </div>

                    {/* ROW 2 */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">AI & emerging tech jobs</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/ai-app-development-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">AI app development jobs</a></Link></li>
                            <li><Link href="/info/chatbot-development-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Chatbot development jobs</a></Link></li>
                            <li><Link href="/info/ethical-hacking-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Ethical hacking jobs</a></Link></li>
                            <li><Link href="/info/machine-learning-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Machine learning jobs</a></Link></li>
                            <li><Link href="/info/openai-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">OpenAI jobs</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Development & tech jobs</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/mobile-app-development-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Mobile app development jobs</a></Link></li>
                            <li><Link href="/info/python-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Python jobs</a></Link></li>
                            <li><Link href="/info/software-development-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Software development jobs</a></Link></li>
                            <li><Link href="/info/web-development-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Web development jobs</a></Link></li>
                            <li><Link href="/info/wordpress-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">WordPress jobs</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 mb-2">Video, audio & animation jobs</h4>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/info/animation-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Animation jobs</a></Link></li>
                            <li><Link href="/info/audio-editing-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Audio editing jobs</a></Link></li>
                            <li><Link href="/info/music-production-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Music production jobs</a></Link></li>
                            <li><Link href="/info/video-editing-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Video editing jobs</a></Link></li>
                            <li><Link href="/info/voice-over-jobs"><a className="hover:text-primary transition-colors cursor-pointer block">Voice over jobs</a></Link></li>
                        </ul>
                    </div>
                    <div className="space-y-6 flex flex-col justify-end">
                        <Link href="/info/how-it-works-talent"><a className="text-primary font-semibold hover:underline flex items-center gap-2 cursor-pointer">Explore more <ArrowRight className="w-4 h-4"/></a></Link>
                        <Link href="/info/direct-contracts"><a className="text-primary font-semibold hover:underline flex items-center gap-2 cursor-pointer">Ways to earn <ArrowRight className="w-4 h-4"/></a></Link>
                        <Link href="/info/success-stories"><a className="text-primary font-semibold hover:underline flex items-center gap-2 cursor-pointer">Win work with ads <ArrowRight className="w-4 h-4"/></a></Link>
                        <Link href="/info/guaranteed-payments"><a className="text-primary font-semibold hover:underline flex items-center gap-2 cursor-pointer">Join Freelancer Plus <ArrowRight className="w-4 h-4"/></a></Link>
                    </div>
                </div>
            </div>

            {/* Why PAX */}
            <div className="group relative py-4">
                <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                    Why PAX <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full -left-4 w-[250px] bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-6">
                    <ul className="space-y-4 text-gray-600">
                        <li><Link href="/info/trust-and-safety"><a className="hover:text-gray-900 flex flex-col gap-1 cursor-pointer"><span className="font-semibold text-gray-900">Trust & Safety</span><span className="text-xs">Bank-grade security</span></a></Link></li>
                        <li><Link href="/info/managed-escrow"><a className="hover:text-gray-900 flex flex-col gap-1 cursor-pointer"><span className="font-semibold text-gray-900">Managed Escrow</span><span className="text-xs">Absolute financial safety</span></a></Link></li>
                        <li><Link href="/info/project-oversight"><a className="hover:text-gray-900 flex flex-col gap-1 cursor-pointer"><span className="font-semibold text-gray-900">Project Oversight</span><span className="text-xs">Zero micromanagement</span></a></Link></li>
                    </ul>
                </div>
            </div>

            {/* What's New */}
            <div className="group relative py-4">
                <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                    What's new <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute top-full -left-4 w-[250px] bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4">
                    <ul className="space-y-1 text-gray-600">
                        <li><Link href="/info/blog"><a className="block hover:bg-gray-50 rounded-lg p-3 transition-colors cursor-pointer"><span className="block font-semibold text-gray-900 mb-1">Blog</span><span className="block text-xs text-gray-500">Trends & strategies</span></a></Link></li>
                        <li><Link href="/info/press-and-media"><a className="block hover:bg-gray-50 rounded-lg p-3 transition-colors cursor-pointer"><span className="block font-semibold text-gray-900 mb-1">Press Releases</span><span className="block text-xs text-gray-500">Our latest announcements</span></a></Link></li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold hidden sm:flex text-gray-600 hover:text-gray-900 hover:bg-gray-50">Log In</Button>
          </Link>
          <Link href="/login">
            <Button className="rounded-full px-6 font-semibold shadow-sm">
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
