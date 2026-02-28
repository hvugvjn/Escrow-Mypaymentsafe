import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Lock, Zap, Users, Globe, ArrowRight, Star, CreditCard, AlertTriangle, BadgeCheck, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaxLogo } from "@/components/pax-logo";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white font-sans overflow-x-hidden">

            {/* ── NAV ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/5">
                <PaxLogo className="text-3xl" white />
                <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
                    <a href="#how" className="hover:text-white transition-colors">How it works</a>
                    <a href="#why" className="hover:text-white transition-colors">Why PAX</a>
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                </div>
                <Link href="/login">
                    <Button className="bg-white text-[#0a0f1e] hover:bg-white/90 font-semibold rounded-full px-6">
                        Login / Sign up
                    </Button>
                </Link>
            </nav>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24 overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                <motion.div className="relative z-10 max-w-4xl mx-auto" initial="hidden" animate="visible" variants={fadeUp}>
                    <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/70 mb-8">
                        <BadgeCheck className="w-4 h-4 text-blue-400" />
                        Trusted escrow for the digital economy
                    </motion.div>

                    <motion.h1 custom={1} variants={fadeUp} className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                        Stop getting scammed.<br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Start using </span>
                        <PaxLogo white className="text-5xl md:text-7xl" />.
                    </motion.h1>

                    <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        <PaxLogo white className="text-lg" /> is a secure escrow platform that holds your money safely until the work is done — protecting both buyers and freelancers from fraud.
                    </motion.p>

                    <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full px-8 py-6 text-base shadow-2xl shadow-blue-500/25">
                                Get Started Free
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <a href="#how">
                            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base">
                                See how it works
                            </Button>
                        </a>
                    </motion.div>

                    <motion.div custom={4} variants={fadeUp} className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-white/40">
                        {["No hidden fees", "Milestone-based payments", "Dispute resolution", "100% secure"].map((t) => (
                            <div key={t} className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                {t}
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* ── PROBLEM ── */}
            <section id="why" className="py-24 px-6 max-w-6xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Online scams are everywhere. <br /><span className="text-red-400">This stops now.</span></h2>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto">Whether you're buying a logo, a website, or digital content — you've probably been burned before. PAX fixes that.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: AlertTriangle, color: "text-red-400 bg-red-400/10", title: "Paid & never delivered", desc: "You send money upfront and the freelancer disappears. You lose everything." },
                        { icon: AlertTriangle, color: "text-orange-400 bg-orange-400/10", title: "Worked & never paid", desc: "You complete the project but the client refuses to pay or ghosts you." },
                        { icon: AlertTriangle, color: "text-yellow-400 bg-yellow-400/10", title: "No proof, no recourse", desc: "No contract, no platform, no way to get your money back. Forever gone." },
                    ].map(({ icon: Icon, color, title, desc }, i) => (
                        <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">How <PaxLogo white className="text-3xl md:text-5xl" /> works</h2>
                        <p className="text-white/50 text-lg">Simple, transparent, and secure — in 4 steps</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6 relative">
                        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                        {[
                            { icon: Users, step: "01", title: "Buyer & freelancer agree", desc: "Both parties create a project and agree on milestones and payment terms." },
                            { icon: Lock, step: "02", title: "Buyer funds escrow", desc: "Money is locked securely in PAX escrow — not released until work is approved." },
                            { icon: Zap, step: "03", title: "Freelancer completes work", desc: "Work is delivered milestone by milestone. PAX tracks everything." },
                            { icon: CheckCircle2, step: "04", title: "Payment released", desc: "Buyer approves the work → PAX instantly releases payment to the freelancer." },
                        ].map(({ icon: Icon, step, title, desc }, i) => (
                            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center">
                                        <Icon className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <span className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">{step}</span>
                                </div>
                                <h3 className="font-semibold text-base mb-2">{title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">transact safely</span></h2>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: Shield, title: "Escrow Protection", desc: "Money stays locked until both parties are satisfied. No early release possible." },
                        { icon: Zap, title: "Milestone Payments", desc: "Break projects into stages. Pay bit by bit as work gets done and approved." },
                        { icon: Handshake, title: "Dispute Resolution", desc: "If things go wrong, PAX steps in to fairly resolve disagreements." },
                        { icon: CreditCard, title: "Secure Transactions", desc: "Bank-grade encryption protects every rupee flowing through the platform." },
                        { icon: Globe, title: "Works for Everything", desc: "Freelance work, digital products, online services — PAX covers it all." },
                        { icon: BadgeCheck, title: "Full Transparency", desc: "Both parties see every transaction, milestone, and status in real-time." },
                    ].map(({ icon: Icon, title, desc }, i) => (
                        <motion.div key={i} custom={i % 3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            className="group bg-white/5 hover:bg-gradient-to-br hover:from-blue-600/10 hover:to-purple-600/10 border border-white/10 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-base mb-2">{title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── USE CASES ── */}
            <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Use <PaxLogo white className="text-3xl md:text-5xl" /> for any digital deal</h2>
                        <p className="text-white/50 text-lg">Any online transaction where trust matters</p>
                    </motion.div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {["Website Development", "Logo & Branding", "Video Editing", "App Development", "Content Writing", "Social Media", "UI/UX Design", "Digital Products"].map((item, i) => (
                            <motion.div key={i} custom={i % 4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
                                {item}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {[
                        { value: "100%", label: "Scam protection guaranteed" },
                        { value: "₹0", label: "Hidden fees, ever" },
                        { value: "24/7", label: "Dispute support available" },
                    ].map(({ value, label }, i) => (
                        <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">{value}</div>
                            <div className="text-white/50 text-base">{label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-6">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to transact with confidence?</h2>
                    <p className="text-white/60 text-lg mb-8">Join <PaxLogo white className="text-lg" /> today — it's free to get started.</p>
                    <Link href="/login">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full px-10 py-6 text-base shadow-2xl shadow-blue-500/30">
                            Create Free Account
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/10 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <PaxLogo white className="text-2xl" />
                    <p className="text-white/30 text-sm">© 2025 PAX Escrow. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
