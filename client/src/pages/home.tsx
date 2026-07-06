import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, CheckCircle2, Lock, Zap, Users, ArrowRight,
    BadgeCheck, AlertTriangle, Handshake, Menu, X,
    ChevronDown, ChevronUp, Clock, FileText,
    Building2, ShieldCheck, Timer, BarChart3,
    Globe, Truck, Scale, Anchor, FileCheck, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaxLogo } from "@/components/pax-logo";

const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (i = 0) => ({ 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" } 
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
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            
            {/* ── NAVIGATION (High z-index to stay above hero content) ── */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-16 py-4 border-b border-white/5 transition-colors duration-200 ${mobileMenuOpen ? "bg-[#030816]" : "bg-[#030816]/95 backdrop-blur-md"}`}>
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

                                {/* Dropdown Container (Forced z-[1000] and Solid Opaque Background) */}
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

            {/* ── MOBILE MENU ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-[#030816] pt-20 pb-8 px-6 overflow-y-auto flex flex-col lg:hidden"
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

            {/* ── HERO SECTION (Clean alignment, low z-index sibling) ── */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center pt-28 pb-16 overflow-hidden bg-[#030816] z-10">
                {/* Background Radial Glow */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-blue-900/20 rounded-full blur-[130px]" />
                </div>

                <motion.div className="relative z-10 max-w-5xl mx-auto w-full" initial="hidden" animate="visible" variants={fadeUp}>
                    {/* Badge */}
                    <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 bg-[#122b5e]/40 border border-blue-500/20 rounded-full px-3.5 py-1 text-xs text-blue-300 mb-6 font-medium">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        RBI-Compliant Transaction & Escrow Infrastructure
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 custom={1} variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-4 tracking-tight text-white font-sans">
                        Execute Trade with <br />
                        <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-[#54a6ff] bg-clip-text text-transparent">Absolute Financial Trust.</span>
                    </motion.h1>

                    {/* Concise Copy */}
                    <motion.p custom={2} variants={fadeUp} className="text-sm sm:text-base md:text-lg text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed">
                        PAX is a regulated milestone escrow platform built for transactions between unknown buyers and sellers. 
                        We secure raw material shipments, bulk wholesale cargo, and high-value service milestones inside a safe banking vault, releasing payouts only upon verified delivery.
                    </motion.p>

                    {/* CTAs (Visible immediately above the fold) */}
                    <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-3.5 justify-center mb-12">
                        <Link href="/login">
                            <Button size="lg" className="bg-[#122b5e] hover:bg-[#1a3d80] text-white font-bold rounded-xl px-7 py-5 text-sm border border-white/10 shadow-xl transition-all">
                                Create Secure Escrow
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/5 rounded-xl px-7 py-5 text-sm">
                                Register as Buyer / Seller
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Pictorial Flow Stepper (Visually explaining the concept) */}
                    <motion.div custom={4} variants={fadeUp} className="max-w-4xl mx-auto w-full bg-[#060e22]/60 border border-white/5 rounded-2xl p-5 md:p-6 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
                        <div className="absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-white/5 -translate-y-6 hidden md:block" />
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                            {[
                                { icon: FileText, label: "01. Terms Gated", desc: "Define inspection/UAT gates" },
                                { icon: Lock, label: "02. Vault Secured", desc: "Buyer deposits payment" },
                                { icon: Truck, label: "03. Fulfilled", desc: "Seller ships goods/code" },
                                { icon: CheckCircle2, label: "04. Disbursed", desc: "Funds release instantly" }
                            ].map((s, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#0c1836] to-[#050c1e] border border-blue-500/20 flex items-center justify-center mb-2.5 relative">
                                        <s.icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <span className="text-xs font-bold text-white mb-0.5">{s.label}</span>
                                    <span className="text-[10px] text-white/45">{s.desc}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── THE TRUST GAP SECTION ── */}
            <section className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">
                        Unknown Partners. <span className="text-[#54a6ff]">Zero Risk.</span>
                    </h2>
                    <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        Transacting with new partners presents unavoidable credit and delivery risks. 
                        PAX neutralizes the trust deficit by holding funds independently until agreed parameters are satisfied.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: AlertTriangle,
                            color: "text-red-400 bg-red-400/5 border-red-500/10",
                            title: "Buyer Credit Risk",
                            desc: "Depositing cash advances to unknown international suppliers exposes you to raw material delays, substandard cargo, or complete loss of funds.",
                            tagline: "Deposit Secured, Never Pre-paid"
                        },
                        {
                            icon: Clock,
                            color: "text-amber-400 bg-amber-400/5 border-amber-500/10",
                            title: "Seller Payment Risk",
                            desc: "Allocating machinery, purchasing logistics freights, or dedicating developers without payment backing results in default exposure or scope creep.",
                            tagline: "Guaranteed Upfront Verification"
                        },
                        {
                            icon: ShieldCheck,
                            color: "text-blue-400 bg-blue-400/5 border-blue-500/10",
                            title: "Neutral Escrow Gateway",
                            desc: "PAX locks the transaction value. The buyer verifies that delivery satisfies terms; the seller ships with guaranteed payout upon arrival.",
                            tagline: "100% Risk Neutralization"
                        },
                    ].map(({ icon: Icon, color, title, desc, tagline }, i) => (
                        <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className="bg-[#050c1b] border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all flex flex-col justify-between">
                            <div>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 border ${color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-white">{title}</h3>
                                <p className="text-white/50 text-xs leading-relaxed mb-5">{desc}</p>
                            </div>
                            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest border-t border-white/5 pt-3">{tagline}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── VISUAL TRADE SOLUTIONS SECTION ── */}
            <section className="py-24 px-6 bg-white/[0.005] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-3 text-white tracking-tight">Structured Escrow for All Trade Segments</h2>
                        <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto">PAX matches delivery workflows with digital tracking and physical documentation.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Anchor,
                                title: "Import & Export Logistics",
                                desc: "Safeguard international cargo. Funds sit vaulted. Release is gated against port loading paperwork, customs clearance forms, and BoL validation.",
                                tracker: ["Deposit Locks", "BoL Verification", "Port Landing", "Payout Release"],
                                currentStep: 2
                            },
                            {
                                icon: Truck,
                                title: "B2B Goods & Wholesale",
                                desc: "Protect wholesale inventories, raw materials, and merchant distribution. Payout is gated by delivery slips and weight clearance slips.",
                                tracker: ["Deposit Locks", "Transit Loading", "Quality Control", "Payout Release"],
                                currentStep: 3
                            },
                            {
                                icon: FileCheck,
                                title: "Service & IT Contracts",
                                desc: "Secure custom software agencies, digital services, and high-value contractors. Payout releases via milestone code reviews & UAT testing.",
                                tracker: ["Milestone Set", "UAT Submission", "Review Passed", "Payout Release"],
                                currentStep: 2
                            }
                        ].map(({ icon: Icon, title, desc, tracker, currentStep }, i) => (
                            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="bg-[#050c1c] border border-white/5 hover:border-blue-500/20 rounded-xl p-6 transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-lg bg-blue-900/20 border border-blue-500/20 flex items-center justify-center mb-5">
                                        <Icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                                    <p className="text-white/50 text-xs leading-relaxed mb-6">{desc}</p>
                                </div>
                                
                                {/* Pictorial Tracker Elements */}
                                <div className="border-t border-white/5 pt-4">
                                    <span className="text-[10px] font-bold text-blue-400 block mb-3 uppercase tracking-wider">Transaction Tracker</span>
                                    <div className="flex items-center justify-between relative px-1">
                                        {/* Connector Bar */}
                                        <div className="absolute top-2 left-2 right-2 h-[2px] bg-white/5 -z-0" />
                                        <div className="absolute top-2 left-2 h-[2px] bg-blue-500 -z-0 transition-all" style={{ width: `${(currentStep / 3) * 100}%` }} />
                                        
                                        {tracker.map((stepName, stepIdx) => {
                                            const active = stepIdx <= currentStep;
                                            return (
                                                <div key={stepIdx} className="flex flex-col items-center relative z-10 group/step">
                                                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-bold ${active ? "bg-blue-500 text-white" : "bg-[#091122] border border-white/10 text-white/30"}`}>
                                                        {stepIdx + 1}
                                                    </div>
                                                    <span className="text-[7px] text-white/40 mt-1 uppercase font-semibold text-center whitespace-nowrap">{stepName.split(" ")[0]}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── THE PAX PRINCIPLE & QUOTE (Eye Catching Design) ── */}
            <section className="py-20 px-6 max-w-4xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="bg-gradient-to-br from-[#0c1836]/60 to-[#040a17]/80 border border-blue-500/25 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-[#54a6ff]/40 to-transparent" />
                    
                    <Shield className="w-10 h-10 text-blue-400 mx-auto mb-6 opacity-85" />
                    <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Core Philosophy</h3>
                    <p className="text-xl md:text-3xl font-bold text-white italic leading-relaxed mb-6 font-sans">
                        "Where trust is absent, PAX provides absolute transaction certainty."
                    </p>
                    <div className="w-12 h-0.5 bg-blue-500/35 mx-auto" />
                </motion.div>
            </section>

            {/* ── REGULATORY & SAFEGUARDS ── */}
            <section className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">Enterprise Trust Safeguards</h2>
                    <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">Designed for robust transaction security, banking regulatory adherence, and operational compliance.</p>
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
                            title: "Multicurrency Setup",
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
                            className="bg-[#050c1b] border border-white/5 rounded-xl p-5 hover:bg-[#071128] transition-all">
                            <div className="flex items-start justify-between mb-3.5">
                                <div className="w-9 h-9 rounded-lg bg-blue-900/10 border border-blue-500/20 flex items-center justify-center">
                                    <Icon className="w-4.5 h-4.5 text-blue-400" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400/60 bg-blue-400/5 border border-blue-400/15 rounded-full px-2 py-0.5">{tag}</span>
                            </div>
                            <h3 className="font-bold text-sm mb-1 text-white">{title}</h3>
                            <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── TRANSACTION PRICING ── */}
            <section className="py-24 px-6 max-w-4xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">Transparent Escrow Fees</h2>
                    <p className="text-white/50 text-sm md:text-base">No hidden costs, no multi-layered commissions. Clear pricing for clear trade protection.</p>
                </motion.div>
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="bg-white/[0.015] border border-white/10 rounded-xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Standard Trade</div>
                            <div className="text-3xl font-bold text-white mb-2">1.5% <span className="text-sm font-normal text-white/40">of Escrow Value</span></div>
                            <p className="text-white/45 text-xs mb-5 leading-relaxed">Charged on deposits into the vault. Can be split between Buyer and Seller by agreement.</p>
                            <ul className="space-y-3 mb-6">
                                {["Unlimited trade milestones", "Standard change order updates", "Logistics document gates", "Standard 7-day negotiation window", "Complete audit trail logs"].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />{f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link href="/login">
                            <Button className="w-full bg-[#122b5e] hover:bg-[#1a3d80] text-white rounded-lg py-4 border border-white/5 font-semibold text-xs">Create Standard Escrow</Button>
                        </Link>
                    </motion.div>

                    <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="bg-gradient-to-br from-blue-900/10 to-indigo-900/10 border border-blue-500/25 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="absolute top-4 right-4 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">High-Volume</div>
                            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">PAX Enterprise</div>
                            <div className="text-3xl font-bold text-white mb-2">Custom <span className="text-sm font-normal text-white/40">Pricing</span></div>
                            <p className="text-white/45 text-xs mb-5 leading-relaxed">For import/export firms, manufacturing hubs, and trade networks with over ₹50L+ in transaction volume.</p>
                            <ul className="space-y-3 mb-6">
                                {["Custom contract terms & APIs", "Priority logistics verification integrations", "On-demand industry expert arbitration", "Dedicated account trade managers", "Custom multi-user permissions"].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#54a6ff] flex-shrink-0" />{f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link href="/info/pax-for-enterprise">
                            <Button className="w-full bg-[#122b5e] hover:bg-[#1a3d80] text-white border border-white/5 rounded-lg py-4 font-semibold text-xs">
                                Talk to Trade Specialist <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── FINAL CALL TO ACTION ── */}
            <section className="py-24 px-4 md:px-6">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#09152e] to-[#040916] border border-blue-500/20 rounded-2xl p-10 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                    <BadgeCheck className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-2xl md:text-4xl font-bold mb-3 text-white tracking-tight">
                        Securing B2B Transactions,<br />Every Step of the Way.
                    </h2>
                    <p className="text-white/55 text-sm md:text-base mb-6 max-w-xl mx-auto">
                        Open your account in minutes. Secure your raw materials, wholesale inventory, or tech milestones from the moment negotiations conclude.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="bg-[#122b5e] hover:bg-[#1a3d80] text-white font-bold rounded-xl px-7 py-5 text-sm border border-white/10 shadow-xl">
                                Open Secure Account <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/info/pax-for-enterprise">
                            <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/5 rounded-xl px-7 py-5 text-sm">
                                Contact Sales Team
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-[#02050f] border-t border-white/5 pt-16 pb-8 px-6 md:px-12 z-10 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-1 space-y-4">
                            <PaxLogo className="text-xl" white />
                            <p className="text-white/30 text-xs leading-relaxed max-w-[200px]">
                                Secure banking and transaction escrow infrastructure for B2B trade.
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
