import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, CheckCircle2, Lock, Zap, Users, ArrowRight,
    BadgeCheck, AlertTriangle, Handshake, Menu, X,
    ChevronDown, ChevronUp, TrendingUp, Clock, FileText,
    IndianRupee, Building2, Code2, Layers, ShieldCheck,
    Timer, BarChart3, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaxLogo } from "@/components/pax-logo";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

const NAV_ITEMS = [
    {
        label: "For Agencies",
        key: "agencies",
        links: [
            { label: "Guaranteed Payments", sub: "Get paid the moment work is approved", href: "/info/guaranteed-payments" },
            { label: "Change Order Management", sub: "Lock scope creep in real-time", href: "/info/managed-escrow" },
            { label: "Dispute Protection", sub: "Expert arbitration, not silence", href: "/info/dispute-resolution" },
            { label: "Automated Invoicing", sub: "Replace Jira-to-PDF manual chasing", href: "/info/how-it-works-talent" },
            { label: "Zero Commission Model", sub: "Keep 100% of every contract", href: "/info/guaranteed-payments" },
        ],
    },
    {
        label: "For Clients",
        key: "clients",
        links: [
            { label: "Secure Milestone Escrow", sub: "Funds locked until you approve", href: "/info/managed-escrow" },
            { label: "Project Oversight", sub: "We track delivery so you don't have to", href: "/info/project-oversight" },
            { label: "Objective Completion Gates", sub: "Binary criteria, no guesswork", href: "/info/managed-escrow" },
            { label: "Agency Vetting", sub: "Work only with verified execution partners", href: "/info/find-top-talents" },
            { label: "VIP Pay-on-Delivery", sub: "For enterprise contracts above ₹50L", href: "/info/vip-pay-on-delivery" },
        ],
    },
    {
        label: "Why PAX",
        key: "why",
        links: [
            { label: "Trust & Safety", sub: "Bank-grade security, RBI-compliant escrow", href: "/info/trust-and-safety" },
            { label: "How It Works", sub: "4-step escrow milestone framework", href: "/info/how-to-hire" },
            { label: "PAX for Enterprise", sub: "₹50L+ contracts with dedicated oversight", href: "/info/pax-for-enterprise" },
            { label: "Success Stories", sub: "Agencies that eliminated payment delays", href: "/info/success-stories" },
        ],
    },
];

export default function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
    const [openNav, setOpenNav] = useState<string | null>(null);

    const toggleAccordion = (name: string) =>
        setExpandedAccordion(expandedAccordion === name ? null : name);

    return (
        <div className="min-h-screen bg-[#060b18] text-white font-sans overflow-x-hidden">

            {/* ── NAV ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-16 py-4 border-b border-white/5 transition-colors duration-200 ${mobileMenuOpen ? "bg-[#060b18]" : "bg-[#060b18]/80 backdrop-blur-md"}`}>
                <div className="flex items-center gap-10">
                    <PaxLogo className="text-3xl" white />

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-white/70">
                        {NAV_ITEMS.map((item) => (
                            <div
                                key={item.key}
                                className="relative group py-4"
                                onMouseEnter={() => setOpenNav(item.key)}
                                onMouseLeave={() => setOpenNav(null)}
                            >
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                                    {item.label}
                                    <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${openNav === item.key ? "rotate-180" : ""}`} />
                                </button>

                                {/* Dropdown */}
                                <div className={`absolute top-full left-0 mt-1 w-72 bg-[#0d1628]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-200 p-3 ${openNav === item.key ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
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

                        <Link href="/info/pax-for-enterprise">
                            <a className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-all">Pricing</a>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 text-sm">
                            Log In
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full px-5 py-2 text-sm shadow-lg shadow-blue-600/25 transition-all">
                            Get Started Free
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

            {/* ── MOBILE MENU ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-[#060b18] pt-20 pb-8 px-6 overflow-y-auto flex flex-col lg:hidden"
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
                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-full font-bold text-sm shadow-xl shadow-blue-500/25">
                                    Get Started Free
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-blue-600/15 rounded-full blur-[130px]" />
                    <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[100px]" />
                </div>
                <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

                <motion.div className="relative z-10 max-w-5xl mx-auto" initial="hidden" animate="visible" variants={fadeUp}>
                    {/* Badge */}
                    <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-full px-4 py-2 text-sm text-blue-300 mb-8 font-medium">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        Financial Infrastructure for B2B Project Delivery
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 custom={1} variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
                        Your client owes you<br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">₹40 Lakhs.</span>
                        <br />
                        <span className="text-white/90">PAX makes sure they pay it.</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p custom={2} variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
                        PAX is the escrow-first payment platform built for Indian software agencies and digital studios. We lock client funds upfront, enforce milestone deadlines, and release payments the moment work is approved — eliminating Net-60 delays and subjective sign-off disputes forever.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full px-9 py-6 text-base shadow-2xl shadow-blue-500/30 transition-all">
                                Protect Your Next Project
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <a href="#how">
                            <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/8 rounded-full px-9 py-6 text-base transition-all">
                                See How It Works
                            </Button>
                        </a>
                    </motion.div>

                    {/* Trust signals */}
                    <motion.div custom={4} variants={fadeUp} className="mt-14 flex flex-wrap justify-center gap-6 text-sm text-white/35">
                        {["RBI-Compliant Nodal Escrow", "0% Agency Commission", "Objective Milestone Gating", "Change Order Lock-In", "Expert Dispute Arbitration"].map((t) => (
                            <div key={t} className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                {t}
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* ── THE PAIN ── */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 text-sm text-red-400 mb-6 font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        The Problem Every Agency Knows
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                        You delivered the work.<br />
                        <span className="text-red-400">They haven't paid.</span>
                    </h2>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                        Indian software agencies lose an average of <strong className="text-white">56 days</strong> to payment delays on every major contract. Clients hold approval hostage. Scope creep bleeds budgets. DSO kills cash flow. And you've already paid your developers.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Clock,
                            color: "text-red-400 bg-red-400/10 border-red-400/20",
                            title: "The 56-Day Payment Gap",
                            desc: "The average B2B invoice in India goes unpaid for 56 days past the agreed date. For a ₹30L project, that's your entire operations cost for two months — funded by you, not your client.",
                            stat: "56 days avg delay"
                        },
                        {
                            icon: FileText,
                            color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
                            title: "\u2018Subjective Milestone\u2019 Trap",
                            desc: "A client's definition of 'done' is never the same as yours. They delay the approval, claim the UI 'doesn't feel right,' and your final 30% — already earned — sits frozen for months.",
                            stat: "₹10.8L Cr in stuck receivables"
                        },
                        {
                            icon: TrendingUp,
                            color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
                            title: "Scope Creep Bleeds Profit",
                            desc: "One 'quick change request' before milestone sign-off becomes three. You do it free to maintain the relationship. Then you do it again. Your 22% margin becomes 8% and you're cash-flow negative.",
                            stat: "30% of agency margin lost to scope creep"
                        },
                    ].map(({ icon: Icon, color, title, desc, stat }, i) => (
                        <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className={`bg-white/[0.03] border rounded-2xl p-6 ${color.split(" ").slice(1).join(" ")} border-opacity-30`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-white">{title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed mb-4">{desc}</p>
                            <div className="text-xs font-semibold text-white/30 uppercase tracking-widest border-t border-white/5 pt-3">{stat}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">How <span className="text-blue-400">PAX</span> works</h2>
                        <p className="text-white/50 text-lg max-w-xl mx-auto">Four steps that convert a ₹10–50 Lakh project from a handshake into a guaranteed payout.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6 relative">
                        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                        {[
                            { icon: Layers, step: "01", title: "Define Binary Milestones", desc: "Agency and client agree on objective, measurable completion criteria — not feelings. Deployed to staging. Tests passing. Artifacts uploaded. PAX locks these in." },
                            { icon: Lock, step: "02", title: "Client Deposits into Escrow", desc: "Client transfer the full milestone amount into a secure RBI-compliant nodal account. Work begins only when money is confirmed locked — not promised." },
                            { icon: Code2, step: "03", title: "Agency Executes & Logs", desc: "Agency delivers work against the agreed deliverables. Progress, artifacts, and completion evidence are logged directly in PAX. Change orders are raised in-platform, not over WhatsApp." },
                            { icon: CheckCircle2, step: "04", title: "Approve → Instant Payout", desc: "Client reviews against the objective checklist and approves. PAX instantly routes the exact payment to the agency's registered bank account. No invoice chasing." },
                        ].map(({ icon: Icon, step, title, desc }, i) => (
                            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600/25 to-indigo-600/25 border border-blue-500/25 flex items-center justify-center">
                                        <Icon className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <span className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center">{step}</span>
                                </div>
                                <h3 className="font-bold text-base mb-2 text-white">{title}</h3>
                                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                        Built for agencies that are{" "}
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">done being burned.</span>
                    </h2>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">Every feature was designed to eliminate one specific way an agency loses money.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                        {
                            icon: IndianRupee,
                            title: "Upfront Escrow Lock",
                            desc: "Client money sits in a RBI-regulated nodal account before your team writes a single line of code. You know you are getting paid before you start.",
                            tag: "For Agencies"
                        },
                        {
                            icon: FileText,
                            title: "In-Platform Change Orders",
                            desc: "Client wants to add a feature mid-sprint? PAX generates a Change Order Card: 'Deposit ₹1.2L and extend deadline by 5 days.' One click to accept. No awkward negotiation calls.",
                            tag: "Scope Creep Solved"
                        },
                        {
                            icon: ShieldCheck,
                            title: "Objective Completion Gates",
                            desc: "Milestones are completed against a binary checklist — not a client's mood. Code deployed? Tests passing? Files uploaded? Gate opens. Payment releases.",
                            tag: "No More Subjectivity"
                        },
                        {
                            icon: Timer,
                            title: "Deadline Penalty Enforcement",
                            desc: "If the agency misses a delivery deadline without an approved extension, PAX automatically applies a financial penalty — protecting the client's timeline.",
                            tag: "For Clients"
                        },
                        {
                            icon: Handshake,
                            title: "Structured Dispute Resolution",
                            desc: "Conflict arises? Funds freeze. PAX opens a 7-day in-app negotiation window, then escalates to a neutral technical auditor — ensuring a fair, documented resolution.",
                            tag: "Dispute Framework"
                        },
                        {
                            icon: BarChart3,
                            title: "Real-Time Project Dashboard",
                            desc: "Both parties see every transaction, every milestone, every deliverable log — updated live. No PDF invoice attachments. No WhatsApp status chasing.",
                            tag: "Full Transparency"
                        },
                    ].map(({ icon: Icon, title, desc, tag }, i) => (
                        <motion.div key={i} custom={i % 3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className="group bg-white/[0.04] hover:bg-gradient-to-br hover:from-blue-600/10 hover:to-indigo-600/10 border border-white/8 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20">
                                    <Icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 bg-blue-400/5 border border-blue-400/15 rounded-full px-2.5 py-1">{tag}</span>
                            </div>
                            <h3 className="font-bold text-base mb-2 text-white">{title}</h3>
                            <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── WHO IT'S FOR ── */}
            <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                            Built for the <span className="text-blue-400">₹10L–₹5Cr contract</span> segment
                        </h2>
                        <p className="text-white/50 text-lg">Too large to ignore. Too complex for a handshake. Too important to risk.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Building2,
                                audience: "Software & Digital Agencies",
                                color: "blue",
                                points: [
                                    "Custom software development shops (5–200 engineers)",
                                    "Digital product and UX studios",
                                    "Offshore development centres serving US/EU clients",
                                    "Marketing & performance agencies on retainer projects",
                                    "Animation and media production houses",
                                ],
                                cta: "Protect your agency's cash flow",
                                href: "/login"
                            },
                            {
                                icon: Users,
                                audience: "Enterprise & Growth-Stage Clients",
                                color: "indigo",
                                points: [
                                    "Funded startups outsourcing core product development",
                                    "Mid-market companies building internal tools",
                                    "Enterprises managing 3–10 agency relationships simultaneously",
                                    "International businesses engaging Indian dev teams",
                                    "Government & institutional project owners",
                                ],
                                cta: "Guarantee delivery before you pay",
                                href: "/login"
                            }
                        ].map(({ icon: Icon, audience, color, points, cta, href }, i) => (
                            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className={`bg-white/[0.03] border border-${color}-500/20 rounded-3xl p-8`}>
                                <div className={`w-12 h-12 rounded-xl bg-${color}-600/15 border border-${color}-500/25 flex items-center justify-center mb-5`}>
                                    <Icon className={`w-6 h-6 text-${color}-400`} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-5">{audience}</h3>
                                <ul className="space-y-3 mb-8">
                                    {points.map((p, pi) => (
                                        <li key={pi} className="flex items-start gap-3 text-sm text-white/60">
                                            <CheckCircle2 className={`w-4 h-4 text-${color}-400 mt-0.5 flex-shrink-0`} />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={href}>
                                    <Button className={`bg-${color}-600 hover:bg-${color}-500 text-white rounded-full px-6 font-semibold text-sm w-full`}>
                                        {cta} <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: "₹10.8L Cr", label: "B2B receivables stuck in India annually", sub: "RBI Working Paper, 2023" },
                        { value: "56 days", label: "Average payment delay past agreed terms", sub: "MSME Payment Council data" },
                        { value: "82%", label: "SMB failures caused by cash flow gaps", sub: "Multi-year U.S. Banking Study" },
                        { value: "0%", label: "Commission charged to agencies, ever", sub: "PAX core commitment" },
                    ].map(({ value, label, sub }, i) => (
                        <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">{value}</div>
                            <div className="text-white/80 text-sm font-semibold mb-1">{label}</div>
                            <div className="text-white/25 text-xs">{sub}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── TESTIMONIALS / SOCIAL PROOF ── */}
            <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                            Agencies that stopped chasing<br />
                            <span className="text-blue-400">and started closing.</span>
                        </h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "We had a ₹28L project where the client delayed sign-off for 3 months after delivery. PAX's escrow would have released our funds the day we met the milestone. That one project nearly bankrupt us.",
                                name: "Arjun Mehta",
                                role: "Co-founder, Bengaluru SaaS Agency",
                                avatar: "AM"
                            },
                            {
                                quote: "Our DSO was 72 days. Engineers needed salaries on the 1st. The mismatch was killing us. The moment we started using escrow-first contracts, that entire anxiety disappeared.",
                                name: "Priya Nair",
                                role: "Director of Operations, Chennai Dev Shop",
                                avatar: "PN"
                            },
                            {
                                quote: "A client added 14 features to a ₹15L contract without a single change order. We delivered them all for free to protect the relationship. Never again. PAX's change order system is non-negotiable now.",
                                name: "Rohan Sharma",
                                role: "Founder, Hyderabad Digital Studio",
                                avatar: "RS"
                            }
                        ].map(({ quote, name, role, avatar }, i) => (
                            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="bg-white/[0.04] border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                                </div>
                                <p className="text-white/65 text-sm leading-relaxed italic">"{quote}"</p>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                                        {avatar}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">{name}</div>
                                        <div className="text-white/35 text-xs">{role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING TRANSPARENCY ── */}
            <section className="py-24 px-6 max-w-4xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                        Simple, <span className="text-blue-400">transparent</span> pricing
                    </h2>
                    <p className="text-white/50 text-lg">No hidden fees. No commissions on agency earnings. Ever.</p>
                </motion.div>
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
                        <div className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">Standard</div>
                        <div className="text-4xl font-black text-white mb-1">1.5% <span className="text-lg font-normal text-white/40">of escrow value</span></div>
                        <p className="text-white/40 text-sm mb-6">Charged to client on funds deposited. Agency pays zero.</p>
                        <ul className="space-y-3">
                            {["Unlimited milestones", "In-platform change orders", "Escrow protection", "Dispute negotiation window", "Real-time dashboard"].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm text-white/65">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />{f}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="bg-gradient-to-br from-blue-600/15 to-indigo-600/15 border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">Enterprise</div>
                        <div className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">PAX Enterprise</div>
                        <div className="text-4xl font-black text-white mb-1">Custom <span className="text-lg font-normal text-white/40">pricing</span></div>
                        <p className="text-white/40 text-sm mb-6">For agencies &amp; clients managing ₹50L+ in annual contract value.</p>
                        <ul className="space-y-3">
                            {["Everything in Standard", "Dedicated account manager", "Human arbitrator on demand", "Priority dispute resolution", "Custom SLA agreements", "Volume pricing"].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm text-white/65">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />{f}
                                </li>
                            ))}
                        </ul>
                        <Link href="/info/pax-for-enterprise">
                            <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold">
                                Talk to us <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-4 md:px-6">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600/20 to-indigo-600/15 border border-blue-500/20 rounded-3xl p-10 md:p-14 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                    <BadgeCheck className="w-12 h-12 text-blue-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                        Start your first<br />protected project today.
                    </h2>
                    <p className="text-white/55 text-lg mb-8 max-w-xl mx-auto">
                        Free to get started. No credit card required. Your next ₹10L+ contract, fully protected from the moment the brief is signed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full px-10 py-6 text-base shadow-2xl shadow-blue-500/30">
                                Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/info/pax-for-enterprise">
                            <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/8 rounded-full px-10 py-6 text-base">
                                Book a Demo
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-[#030710] border-t border-white/5 pt-16 pb-8 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
                        {/* Brand column */}
                        <div className="col-span-2 md:col-span-1 space-y-4">
                            <PaxLogo className="text-2xl" white />
                            <p className="text-white/25 text-xs leading-relaxed max-w-[200px]">
                                Financial infrastructure for B2B project delivery in India.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white text-xs font-medium transition-colors">Twitter</a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white text-xs font-medium transition-colors">LinkedIn</a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white text-xs font-medium transition-colors">Instagram</a>
                            </div>
                        </div>

                        {/* For Agencies */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-xs tracking-widest uppercase">For Agencies</h4>
                            <ul className="space-y-3 text-xs text-white/35">
                                {[
                                    { label: "How It Works", href: "/info/how-it-works-talent" },
                                    { label: "Guaranteed Payments", href: "/info/guaranteed-payments" },
                                    { label: "Change Order System", href: "/info/managed-escrow" },
                                    { label: "Dispute Protection", href: "/info/dispute-resolution" },
                                    { label: "Zero Commission", href: "/info/guaranteed-payments" },
                                ].map(l => (
                                    <li key={l.href}><Link href={l.href}><a className="hover:text-white transition-colors">{l.label}</a></Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* For Clients */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-xs tracking-widest uppercase">For Clients</h4>
                            <ul className="space-y-3 text-xs text-white/35">
                                {[
                                    { label: "How to Use PAX", href: "/info/how-to-hire" },
                                    { label: "Secure Escrow", href: "/info/managed-escrow" },
                                    { label: "Project Oversight", href: "/info/project-oversight" },
                                    { label: "VIP Pay-on-Delivery", href: "/info/vip-pay-on-delivery" },
                                    { label: "PAX for Enterprise", href: "/info/pax-for-enterprise" },
                                ].map(l => (
                                    <li key={l.href}><Link href={l.href}><a className="hover:text-white transition-colors">{l.label}</a></Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-xs tracking-widest uppercase">Resources</h4>
                            <ul className="space-y-3 text-xs text-white/35">
                                {[
                                    { label: "Trust & Safety", href: "/info/trust-and-safety" },
                                    { label: "Dispute Resolution", href: "/info/dispute-resolution" },
                                    { label: "Blog", href: "/info/blog" },
                                    { label: "Press & Media", href: "/info/press-and-media" },
                                    { label: "Help & Support", href: "/support" },
                                ].map(l => (
                                    <li key={l.href}><Link href={l.href}><a className="hover:text-white transition-colors">{l.label}</a></Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-xs tracking-widest uppercase">Legal</h4>
                            <ul className="space-y-3 text-xs text-white/35">
                                {[
                                    { label: "Privacy Policy", href: "/privacy" },
                                    { label: "Terms of Service", href: "/terms" },
                                    { label: "Escrow Terms", href: "/escrow-terms" },
                                    { label: "About PAX", href: "/info/about-pax" },
                                    { label: "Contact Us", href: "/support" },
                                ].map(l => (
                                    <li key={l.href}><Link href={l.href}><a className="hover:text-white transition-colors">{l.label}</a></Link></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/20 text-xs">© 2025 PAX Escrow Technologies Pvt. Ltd. — RBI-Compliant Nodal Escrow. Designed for absolute trust.</p>
                        <p className="text-white/15 text-xs">PAX is not a bank. Escrow services provided via registered payment partners.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
