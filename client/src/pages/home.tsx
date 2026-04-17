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
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-16 py-3 md:py-4 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-8">
                    <PaxLogo className="text-3xl" white />
                    
                    <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/70">
                        {/* Hire Freelancers */}
                        <div className="group relative py-4">
                            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                                Hire freelancers <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className="absolute top-full -left-4 w-[1100px] bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-8 grid grid-cols-4 gap-y-12 gap-x-8">
                                {/* ROW 1 */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Admin & support</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Cold callers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Content moderators</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Lead generation specialists</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Personal assistants</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Virtual assistants</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Design & creative</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Graphic designers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Illustrators</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Logo designers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">UX designers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Web designers</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Marketing</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Digital marketers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Email marketers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Google Ads experts</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">SEO experts</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Social media managers</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Writing & content</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Book editors</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Content writers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Copywriters</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Email copywriters</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Ghostwriters</a></Link></li>
                                    </ul>
                                </div>

                                {/* ROW 2 */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">AI & emerging tech</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Automation engineers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Chatbot developers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Computer vision engineers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Ethical hackers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Machine learning engineers</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Development & tech</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Mobile app developers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Python developers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Software developers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Web developers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">WordPress developers</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Video, audio & animation</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Animators</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Audio editors</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Music producers</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Video editors</a></Link></li>
                                        <li><Link href="/talent"><a className="hover:text-primary transition-colors cursor-pointer block">Voice actors</a></Link></li>
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
                            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                                Find work <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className="absolute top-full -left-4 w-[1100px] bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-8 grid grid-cols-4 gap-y-12 gap-x-8">
                                {/* ROW 1 */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Admin & support jobs</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Chat support jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Cold calling jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Content moderation jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Lead generation jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Virtual assistant jobs</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Design & creative jobs</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Canva jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Graphic design jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Illustration jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Logo design jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Web design jobs</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Marketing jobs</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Digital marketing jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Email marketing jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Google Ads jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">SEO jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Social media management jobs</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Writing & content jobs</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Book editing jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Content writing jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Copywriting jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Email copywriting jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Ghostwriting jobs</a></Link></li>
                                    </ul>
                                </div>

                                {/* ROW 2 */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">AI & emerging tech jobs</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">AI app development jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Chatbot development jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Ethical hacking jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Machine learning jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">OpenAI jobs</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Development & tech jobs</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Mobile app development jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Python jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Software development jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Web development jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">WordPress jobs</a></Link></li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white mb-2">Video, audio & animation jobs</h4>
                                    <ul className="space-y-3 text-white/60">
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Animation jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Audio editing jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Music production jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Video editing jobs</a></Link></li>
                                        <li><Link href="/login"><a className="hover:text-primary transition-colors cursor-pointer block">Voice over jobs</a></Link></li>
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
                            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                                Why PAX <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className="absolute top-full -left-4 w-[250px] bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-6">
                                <ul className="space-y-4 text-white/70">
                                    <li><Link href="/info/trust-and-safety"><a className="hover:text-white flex flex-col gap-1 cursor-pointer"><span className="font-semibold text-white">Trust & Safety</span><span className="text-xs">Bank-grade security</span></a></Link></li>
                                    <li><Link href="/info/managed-escrow"><a className="hover:text-white flex flex-col gap-1 cursor-pointer"><span className="font-semibold text-white">Managed Escrow</span><span className="text-xs">Absolute financial safety</span></a></Link></li>
                                    <li><Link href="/info/project-oversight"><a className="hover:text-white flex flex-col gap-1 cursor-pointer"><span className="font-semibold text-white">Project Oversight</span><span className="text-xs">Zero micromanagement</span></a></Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* What's New */}
                        <div className="group relative py-4">
                            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                                What's new <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className="absolute top-full -left-4 w-[250px] bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4">
                                <ul className="space-y-1">
                                    <li><Link href="/info/blog"><a className="block hover:bg-white/5 rounded-lg p-3 transition-colors cursor-pointer"><span className="block font-semibold text-white mb-1">Blog</span><span className="block text-xs text-white/50">Trends & strategies</span></a></Link></li>
                                    <li><Link href="/info/press-and-media"><a className="block hover:bg-white/5 rounded-lg p-3 transition-colors cursor-pointer"><span className="block font-semibold text-white mb-1">Press Releases</span><span className="block text-xs text-white/50">Our latest announcements</span></a></Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="hidden sm:flex text-white hover:bg-white/10">Log In</Button>
                    </Link>
                    <Link href="/login">
                        <Button className="bg-white text-[#0a0f1e] hover:bg-white/90 font-bold rounded-full px-6 shadow-xl shadow-white/10">
                            Sign up
                        </Button>
                    </Link>
                </div>
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
                        Escrow managed for you
                    </motion.div>

                    <motion.h1 custom={1} variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
                        Stop stressing over execution.<br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Start using </span>
                        pax.
                    </motion.h1>

                    <motion.p custom={2} variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed">
                        PAX is the only platform that combines <strong>secure financial escrow</strong> with <strong>full-service project management</strong>.
                        We hold your money safely, structure your milestones, and actively oversee exactly what the talent delivers — so you never have to worry about fraud or missed deadlines again.
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
                        {["No hidden fees", "Actively Managed Projects", "Dispute resolution", "100% secure"].map((t) => (
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
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Project execution chaos is everywhere. <br /><span className="text-red-400">This stops now.</span></h2>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto">Whether you're buying an app, a website, or digital content — you've probably been burned by bad communication or scams. PAX fixes that.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: AlertTriangle, color: "text-red-400 bg-red-400/10", title: "Paid & never delivered", desc: "You send money upfront and the talent disappears. With PAX, funds are held securely until the work is actually done." },
                        { icon: AlertTriangle, color: "text-orange-400 bg-orange-400/10", title: "Missed Deadlines & Chaos", desc: "Projects drag on forever without proper oversight. PAX's Project Managers step in to enforce deadlines and track daily progress." },
                        { icon: AlertTriangle, color: "text-yellow-400 bg-yellow-400/10", title: "Worked & never paid", desc: "Talents complete the project but the client refuses to pay. PAX strictly guarantees payouts upon approved milestones." },
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
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">How <span className="text-blue-400">PAX</span> works</h2>
                        <p className="text-white/50 text-lg">Escrow protection meets seamless project management.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6 relative">
                        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                        {[
                            { icon: Users, step: "01", title: "Scope & Agreements", desc: "Client and talent define the project. PAX structures clear, actionable milestones for the work." },
                            { icon: Lock, step: "02", title: "Secure Funding", desc: "Money is locked securely in PAX escrow so work can confidently begin with guaranteed payment." },
                            { icon: Zap, step: "03", title: "Managed Execution", desc: "Our team actively oversees the deliverables, tracking progress to ensure work is delivered on time." },
                            { icon: CheckCircle2, step: "04", title: "Approval & Payout", desc: "You review and approve the specific milestone. PAX instantly releases the exact payment." },
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
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">execute safely</span></h2>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: Shield, title: "Automated Escrow", desc: "We securely hold your project capital in a verified vault, releasing funds only when both parties agree the work is completed." },
                        { icon: Users, title: "Dedicated Project Managers", desc: "Don't have time to chase talents? Our team actively oversees your timelines, reviews deliverables, and ensures everything stays completely on track." },
                        { icon: Zap, title: "Milestone-Based Payouts", desc: "Large projects are safely broken into bite-sized stages. You comfortably pay bit by bit as actual progress is properly approved." },
                        { icon: Handshake, title: "Fair Dispute Resolution", desc: "If things go wrong or communication breaks down, PAX instantly steps in to fairly review the project and resolve disagreements." },
                        { icon: CreditCard, title: "Bank-Grade Transactions", desc: "State-of-the-art encryption strictly protects every single rupee effectively flowing through the platform infrastructure." },
                        { icon: BadgeCheck, title: "Total Transparency", desc: "Log in anytime. Both parties see every transaction, detailed milestone, and execution status updated in real-time." },
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
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Use PAX for any digital deal</h2>
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
            <section className="py-24 px-4 md:px-6">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-8 md:p-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to transact with confidence?</h2>
                    <p className="text-white/60 text-lg mb-8">Join PAX today — it's free to get started.</p>
                    <Link href="/login">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full px-10 py-6 text-base shadow-2xl shadow-blue-500/30">
                            Create Free Account
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-[#050810] border-t border-white/5 pt-16 pb-8 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        {/* For Clients */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-sm tracking-widest uppercase">For Clients</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li><Link href="/info/how-to-hire"><a className="hover:text-white transition-colors">How to hire</a></Link></li>
                                <li><Link href="/info/managed-escrow"><a className="hover:text-white transition-colors">Managed Escrow</a></Link></li>
                                <li><Link href="/info/project-oversight"><a className="hover:text-white transition-colors">Project Oversight</a></Link></li>
                                <li><Link href="/info/find-top-talents"><a className="hover:text-white transition-colors">Find Top Talents</a></Link></li>
                                <li><Link href="/info/managed-escrow"><a className="hover:text-white transition-colors">Secure Payouts</a></Link></li>
                                <li><Link href="/info/vip-pay-on-delivery"><a className="hover:text-white transition-colors">VIP Pay-on-Delivery</a></Link></li>
                                <li><Link href="/login"><a className="hover:text-white transition-colors">Post a Project</a></Link></li>
                            </ul>
                        </div>

                        {/* For Talents */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-sm tracking-widest uppercase">For Talents</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li><Link href="/info/how-it-works-talent"><a className="hover:text-white transition-colors">How it works</a></Link></li>
                                <li><Link href="/info/guaranteed-payments"><a className="hover:text-white transition-colors">Guaranteed Payments</a></Link></li>
                                <li><Link href="/info/guaranteed-payments"><a className="hover:text-white transition-colors">Secure Invoicing</a></Link></li>
                                <li><Link href="/info/direct-contracts"><a className="hover:text-white transition-colors">Direct Contracts</a></Link></li>
                                <li><Link href="/info/success-stories"><a className="hover:text-white transition-colors">Success Stories</a></Link></li>
                                <li><Link href="/info/project-oversight"><a className="hover:text-white transition-colors">Managed Milestones</a></Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-sm tracking-widest uppercase">Resources</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li><Link href="/support"><a className="hover:text-white transition-colors">Help & Support</a></Link></li>
                                <li><Link href="/info/trust-and-safety"><a className="hover:text-white transition-colors">Trust & Safety</a></Link></li>
                                <li><Link href="/info/dispute-resolution"><a className="hover:text-white transition-colors">Dispute Resolution</a></Link></li>
                                <li><Link href="/info/pax-for-enterprise"><a className="hover:text-white transition-colors">PAX for Enterprise</a></Link></li>
                                <li><Link href="/info/blog"><a className="hover:text-white transition-colors">Blog</a></Link></li>
                                <li><Link href="/info/press-and-media"><a className="hover:text-white transition-colors">Press & Media</a></Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold text-sm tracking-widest uppercase">Company</h4>
                            <ul className="space-y-3 text-sm text-white/40">
                                <li><Link href="/info/about-pax"><a className="hover:text-white transition-colors">About PAX</a></Link></li>
                                <li><Link href="/info/about-pax"><a className="hover:text-white transition-colors">Why Choose Us</a></Link></li>
                                <li><Link href="/info/trust-and-safety"><a className="hover:text-white transition-colors">Security</a></Link></li>
                                <li><Link href="/support"><a className="hover:text-white transition-colors">Contact Us</a></Link></li>
                                <li><Link href="/privacy"><a className="hover:text-white transition-colors">Privacy Policy</a></Link></li>
                                <li><Link href="/terms"><a className="hover:text-white transition-colors">Terms of Service</a></Link></li>
                                <li><Link href="/escrow-terms"><a className="hover:text-white transition-colors">Escrow Terms</a></Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <PaxLogo className="text-2xl" white />
                            <p className="text-white/20 text-xs tracking-wide">© 2025 PAX Escrow. Designed for absolute trust.</p>
                        </div>
                        <div className="flex gap-8">
                             {/* Social Icons Placeholder Labels */}
                            <span className="text-white/30 hover:text-white text-xs font-medium cursor-default transition-colors">Twitter</span>
                            <span className="text-white/30 hover:text-white text-xs font-medium cursor-default transition-colors">LinkedIn</span>
                            <span className="text-white/30 hover:text-white text-xs font-medium cursor-default transition-colors">Instagram</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
