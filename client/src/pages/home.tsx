import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, CheckCircle2, Lock, Zap, Users, ArrowRight,
    BadgeCheck, AlertTriangle, Handshake, Menu, X,
    ChevronDown, ChevronUp, Clock, FileText,
    Building2, ShieldCheck, Timer, BarChart3,
    Globe, Truck, Scale, Anchor, FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaxLogo } from "@/components/pax-logo";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" } 
    }),
};

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
            { label: "Import & Export", sub: "Secure cross-border logistics & supplier advances", href: "/info/pax-for-enterprise" },
            { label: "B2B Goods & Trade", sub: "Domestic wholesale, manufacturing & inventory", href: "/info/managed-escrow" },
            { label: "Service Contracts", sub: "Safeguard agency & high-value contractor milestones", href: "/info/project-oversight" },
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

export default function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
    const [openNav, setOpenNav] = useState<string | null>(null);

    const toggleAccordion = (name: string) =>
        setExpandedAccordion(expandedAccordion === name ? null : name);

    return (
        <div className="min-h-screen bg-[#030816] text-[#f5f7fa] font-sans overflow-x-hidden">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            
            {/* ── NAVIGATION ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 border-b border-white/5 transition-colors duration-200 ${mobileMenuOpen ? "bg-[#030816]" : "bg-[#030816]/90 backdrop-blur-md"}`}>
                <div className="flex items-center gap-10">
                    <PaxLogo className="text-2xl" white />

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

                                {/* Dropdown */}
                                <div className={`absolute top-full left-0 mt-1 w-80 bg-[#091122]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-200 p-3 ${openNav === item.key ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
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

            {/* ── MOBILE MENU ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-[#030816] pt-20 pb-8 px-6 overflow-y-auto flex flex-col lg:hidden"
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

            {/* ── HERO SECTION ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24 overflow-hidden bg-[#030816]">
                {/* Background Radial Glow */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-900/20 rounded-full blur-[140px]" />
                    <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-900/10 rounded-full blur-[100px]" />
                </div>

                <motion.div className="relative z-10 max-w-5xl mx-auto" initial="hidden" animate="visible" variants={fadeUp}>
                    {/* Badge */}
                    <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 bg-[#122b5e]/40 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs text-blue-300 mb-8 font-medium">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        RBI-Compliant Transaction & Escrow Infrastructure
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 custom={1} variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-white font-sans">
                        Execute Trade with <br />
                        <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-[#54a6ff] bg-clip-text text-transparent">Absolute Financial Trust.</span>
                    </motion.h1>

                    {/* Quotable Catchphrase */}
                    <motion.div custom={2} variants={fadeUp} className="my-6 max-w-3xl mx-auto border-l-2 border-blue-500/30 pl-4 md:pl-6 text-left py-1">
                        <span className="text-[#54a6ff] font-semibold block text-sm tracking-wider uppercase mb-1">The PAX Principle</span>
                        <p className="text-lg md:text-xl font-medium text-white/90 italic leading-relaxed">
                            "Where trust is absent, escrow provides absolute certainty."
                        </p>
                    </motion.div>

                    {/* Mature Copy */}
                    <motion.p custom={3} variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed">
                        PAX is the regulated milestone escrow system designed for transactions between unknown buyers and sellers. 
                        Whether importing bulk cargo, funding domestic wholesale shipments, or contract engineering high-value software, 
                        PAX secures the contract value in a verified banking vault. Sellers ship with guaranteed payment security, 
                        while buyers release funds only upon verified inspection or delivery validation.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div custom={4} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="bg-[#122b5e] hover:bg-[#1a3d80] text-white font-bold rounded-xl px-8 py-6 text-base border border-white/10 shadow-xl shadow-blue-900/35 transition-all">
                                Create Secure Escrow
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/5 rounded-xl px-8 py-6 text-base">
                                Register as Buyer / Seller
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div custom={5} variants={fadeUp} className="mt-16 flex flex-wrap justify-center gap-y-3 gap-x-8 text-xs font-medium text-white/40 tracking-wider uppercase">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            Logistics & Customs Auditing
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/15 self-center hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-blue-400" />
                            Impartial Dispute Arbitration
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/15 self-center hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-400" />
                            RBI-Regulated Escrow Accounts
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── THE TRUST GAP SECTION ── */}
            <section className="py-28 px-6 max-w-6xl mx-auto border-t border-white/5">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                        Unknown Partners. <br />
                        <span className="text-[#54a6ff]">Zero Financial Risk.</span>
                    </h2>
                    <p className="text-white/50 text-lg max-w-3xl mx-auto leading-relaxed">
                        Transacting with new partners presents unavoidable credit and delivery risks. 
                        PAX neutralizes the trust deficit by holding funds independently until agreed parameters are satisfied.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: AlertTriangle,
                            color: "text-red-400 bg-red-400/10 border-red-500/20",
                            title: "The Buyer's Dilemma",
                            desc: "Sending upfront deposits to unverified international suppliers or service providers leaves you vulnerable to delayed logistics, defective merchandise, or complete fraud.",
                            tagline: "Deposit Secured, Never Pre-paid"
                        },
                        {
                            icon: Clock,
                            color: "text-amber-400 bg-amber-400/10 border-amber-500/20",
                            title: "The Seller's Dilemma",
                            desc: "Allocating raw materials, manufacturing custom cargo, or dedicating engineering time without advance funding exposes you to delayed payments, default, or unilateral cancellation.",
                            tagline: "Guaranteed Upfront Verification"
                        },
                        {
                            icon: ShieldCheck,
                            color: "text-blue-400 bg-blue-400/10 border-blue-500/20",
                            title: "The PAX Solution",
                            desc: "An objective financial gateway. The buyer funds the escrow vault; the seller fulfills cargo dispatch or digital milestone deliveries; PAX verifies compliance and releases funds.",
                            tagline: "100% Risk Neutralization"
                        },
                    ].map(({ icon: Icon, color, title, desc, tagline }, i) => (
                        <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className="bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl p-8 transition-all flex flex-col justify-between">
                            <div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">{title}</h3>
                                <p className="text-white/55 text-sm leading-relaxed mb-6">{desc}</p>
                            </div>
                            <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest border-t border-white/5 pt-4">{tagline}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── TRADE SOLUTIONS & USE CASES ── */}
            <section className="py-28 px-6 bg-white/[0.01] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">Structured Escrow for All Trade Segments</h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">Different assets require different checks. PAX gates payouts against specialized verification criteria.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Anchor,
                                title: "Import & Export Logistics",
                                desc: "Safeguard international trade. Funds are locked before production begins. Final disbursement is gated against Bill of Lading (BoL), customs clearance forms, and port loading validation.",
                                features: ["Logistics Tracking Integrations", "Bill of Lading Inspections", "Customs clearance gates"]
                            },
                            {
                                icon: Truck,
                                title: "B2B Goods & Wholesale",
                                desc: "Protect bulk domestic raw material orders, hardware procurement, and distribution agreements. Escrow releases upon delivery confirmation and quality inspection reports.",
                                features: ["Quality Inspection Holds", "Weight & Volume Validation", "Delivery Note Gates"]
                            },
                            {
                                icon: FileCheck,
                                title: "Service & IT Contracts",
                                desc: "Secure digital collaborations, software development agencies, and consultants. Milestones release dynamically using code validation, UAT checklist audits, and deployment tests.",
                                features: ["Objective UAT Checklists", "Change Order locks", "Code repository verification"]
                            }
                        ].map(({ icon: Icon, title, desc, features }, i) => (
                            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="bg-[#091122]/50 border border-white/5 hover:border-blue-500/20 rounded-2xl p-8 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-blue-900/20 border border-blue-500/25 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                                    <Icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed mb-6">{desc}</p>
                                <ul className="space-y-2 border-t border-white/5 pt-4">
                                    {features.map((f, fi) => (
                                        <li key={fi} className="flex items-center gap-2.5 text-xs text-white/60 font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── THE 4-STEP ESCROW WORKFLOW ── */}
            <section className="py-28 px-6 max-w-6xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">The Escrow Workflow</h2>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">From agreement to final clearance — structured protection for unknown trading parties.</p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-8 relative">
                    {/* Visual Connector Line */}
                    <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-[#1a3d80] to-transparent z-0" />
                    {[
                        { icon: FileText, step: "01", title: "Define Verification Terms", desc: "Buyer and Seller mutually set the project or logistics milestones, defining clear gates (e.g., shipping paperwork upload, quality reports, dev deployment)." },
                        { icon: Lock, step: "02", title: "Fund the Escrow Vault", desc: "The Buyer deposits the milestone amount into the PAX secure escrow account. The Seller receives bank-backed confirmation that funds are locked." },
                        { icon: Truck, step: "03", title: "Deliver or Ship Cargo", desc: "The Seller manufactures/ships the physical goods, or executes the digital services, tracking all progress and documentation in the PAX dashboard." },
                        { icon: CheckCircle2, step: "04", title: "Inspect and Disburse", desc: "Upon port arrival, inspection check, or UAT validation, the Buyer approves the delivery. PAX instantly releases the funds directly to the Seller's account." },
                    ].map(({ icon: Icon, step, title, desc }, i) => (
                        <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className="flex flex-col items-center text-center relative z-10">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0c1836] to-[#050c1e] border border-blue-500/20 flex items-center justify-center">
                                    <Icon className="w-8 h-8 text-blue-400" />
                                </div>
                                <span className="absolute -top-2.5 -right-2.5 bg-[#122b5e] border border-white/10 text-white text-[10px] font-black w-6.5 h-6.5 rounded-full flex items-center justify-center">{step}</span>
                            </div>
                            <h3 className="font-bold text-base mb-2 text-white">{title}</h3>
                            <p className="text-white/40 text-xs leading-relaxed max-w-xs">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── SECURITY & FEATURES ── */}
            <section className="py-28 px-6 bg-white/[0.01] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">Enterprise Trust Safeguards</h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">Designed for robust transaction security, regulatory adherence, and operational compliance.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "RBI-Regulated Safeguards",
                                desc: "All escrow accounts are structured via RBI-compliant nodal banking partners. Funds sit protected inside authorized commercial banks.",
                                tag: "Regulatory"
                            },
                            {
                                icon: Scale,
                                title: "Independent Arbitration",
                                desc: "If transaction parameters are disputed, PAX freezes the funds and brings in trade-specific inspectors or technical auditors to resolve issues impartially.",
                                tag: "Disputes"
                            },
                            {
                                icon: Timer,
                                title: "Fulfillment SLA Checks",
                                desc: "Auto-enforce penalties or partial refunds if suppliers miss shipping schedules or software deadlines without mutual client consent.",
                                tag: "Timeline Protection"
                            },
                            {
                                icon: Building2,
                                title: "Multicurparent Setup",
                                desc: "Configure escrows in INR, USD, and major currencies. Handle local domestic B2B trade or global container imports with ease.",
                                tag: "Global Trade"
                            },
                            {
                                icon: FileText,
                                title: "Dynamic Change Orders",
                                desc: "Need to alter cargo volume, freight costs, or milestone scope? Adjust contract values mid-project with automated dual-consent validation.",
                                tag: "Agility"
                            },
                            {
                                icon: BarChart3,
                                title: "Full Transaction Logs",
                                desc: "Every agreement revision, funding receipt, shipping upload, and audit check is fully logged for tax, customs, and corporate records.",
                                tag: "Audit Ready"
                            },
                        ].map(({ icon: Icon, title, desc, tag }, i) => (
                            <motion.div key={i} custom={i % 3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="bg-[#091122]/40 border border-white/5 rounded-xl p-6 transition-all hover:bg-[#0b162e]">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-900/10 border border-blue-500/20 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400/60 bg-blue-400/5 border border-blue-400/15 rounded-full px-2.5 py-1">{tag}</span>
                                </div>
                                <h3 className="font-bold text-base mb-2 text-white">{title}</h3>
                                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TRANSACTION PRICING ── */}
            <section className="py-28 px-6 max-w-4xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">Transparent Escrow Fees</h2>
                    <p className="text-white/50 text-lg">No hidden costs, no multi-layered commissions. Clear pricing for clear trade protection.</p>
                </motion.div>
                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 flex flex-col justify-between">
                        <div>
                            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Standard Trade</div>
                            <div className="text-4xl font-bold text-white mb-2">1.5% <span className="text-base font-normal text-white/40">of Escrow Value</span></div>
                            <p className="text-white/45 text-sm mb-6 leading-relaxed">Charged on deposits into the vault. Can be split between Buyer and Seller by agreement.</p>
                            <ul className="space-y-3.5 mb-8">
                                {["Unlimited trade milestones", "Standard change order updates", "Logistics document gates", "Standard 7-day negotiation window", "Complete audit trail logs"].map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-xs text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />{f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link href="/login">
                            <Button className="w-full bg-[#122b5e] hover:bg-[#1a3d80] text-white rounded-lg py-5 border border-white/5 font-semibold text-sm">Create Standard Escrow</Button>
                        </Link>
                    </motion.div>

                    <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="bg-gradient-to-br from-blue-900/10 to-indigo-900/10 border border-blue-500/25 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="absolute top-4 right-4 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">High-Volume</div>
                            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">PAX Enterprise</div>
                            <div className="text-4xl font-bold text-white mb-2">Custom <span className="text-base font-normal text-white/40">Pricing</span></div>
                            <p className="text-white/45 text-sm mb-6 leading-relaxed">For import/export firms, manufacturing hubs, and trade networks with over ₹50L+ in transaction volume.</p>
                            <ul className="space-y-3.5 mb-8">
                                {["Custom contract terms & APIs", "Priority logistics verification integrations", "On-demand industry expert arbitration", "Dedicated account trade managers", "Custom multi-user permissions"].map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-xs text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-[#54a6ff] flex-shrink-0" />{f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link href="/info/pax-for-enterprise">
                            <Button className="w-full bg-[#122b5e] hover:bg-[#1a3d80] text-white border border-white/5 rounded-lg py-5 font-semibold text-sm">
                                Talk to Trade Specialist <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── FINAL CALL TO ACTION ── */}
            <section className="py-28 px-4 md:px-6">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#09152e] to-[#040916] border border-blue-500/20 rounded-3xl p-10 md:p-14 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                    <BadgeCheck className="w-12 h-12 text-blue-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">
                        Securing B2B Transactions,<br />Every Step of the Way.
                    </h2>
                    <p className="text-white/55 text-lg mb-8 max-w-xl mx-auto">
                        Open your account in minutes. Secure your raw materials, wholesale inventory, or tech milestones from the moment negotiations conclude.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="bg-[#122b5e] hover:bg-[#1a3d80] text-white font-bold rounded-xl px-8 py-6 text-base border border-white/10 shadow-xl shadow-blue-900/35">
                                Open Secure Account <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/info/pax-for-enterprise">
                            <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/5 rounded-xl px-8 py-6 text-base">
                                Contact Sales Team
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-[#02050f] border-t border-white/5 pt-16 pb-8 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-1 space-y-4">
                            <PaxLogo className="text-xl" white />
                            <p className="text-white/30 text-xs leading-relaxed max-w-[200px]">
                                Secure banking and transaction escrow infrastructure for commercial B2B trade.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white text-xs font-medium transition-colors">Twitter</a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white text-xs font-medium transition-colors">LinkedIn</a>
                            </div>
                        </div>

                        {/* Solutions Columns */}
                        <div className="space-y-4">
                            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">How It Protects</h4>
                            <ul className="space-y-3 text-xs text-white/35">
                                <li><Link href="/info/managed-escrow"><a className="hover:text-white transition-colors">Buyer Protection</a></Link></li>
                                <li><Link href="/info/guaranteed-payments"><a className="hover:text-white transition-colors">Seller Guarantees</a></Link></li>
                                <li><Link href="/info/dispute-resolution"><a className="hover:text-white transition-colors">Arbitration Panel</a></Link></li>
                                <li><Link href="/info/trust-and-safety"><a className="hover:text-white transition-colors">RBI Nodal Guidelines</a></Link></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Use Cases</h4>
                            <ul className="space-y-3 text-xs text-white/35">
                                <li><Link href="/info/pax-for-enterprise"><a className="hover:text-white transition-colors">Import & Export</a></Link></li>
                                <li><Link href="/info/managed-escrow"><a className="hover:text-white transition-colors">B2B Goods & Inventory</a></Link></li>
                                <li><Link href="/info/project-oversight"><a className="hover:text-white transition-colors">Digital & Tech Contracts</a></Link></li>
                                <li><Link href="/info/vip-pay-on-delivery"><a className="hover:text-white transition-colors">Enterprise High-Value</a></Link></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Legal & Contact</h4>
                            <ul className="space-y-3 text-xs text-white/35">
                                <li><Link href="/privacy"><a className="hover:text-white transition-colors">Privacy Policy</a></Link></li>
                                <li><Link href="/terms"><a className="hover:text-white transition-colors">Terms of Service</a></Link></li>
                                <li><Link href="/support"><a className="hover:text-white transition-colors">Contact Support</a></Link></li>
                                <li><Link href="/info/about-pax"><a className="hover:text-white transition-colors">About PAX</a></Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/20 text-xs">© 2026 PAX Escrow Technologies Pvt. Ltd. — RBI-Compliant Nodal Account. Designed for absolute trust.</p>
                        <p className="text-white/15 text-xs">PAX is a transaction protection service, not a banking institution. Escrows are serviced by licensed nodal partners.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
