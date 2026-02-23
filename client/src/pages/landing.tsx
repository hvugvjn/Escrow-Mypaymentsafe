import { useState } from "react";
import { Shield, Lock, CheckCircle2, Loader2, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep("otp");
        toast({ title: "OTP Sent", description: "Check your email for the code." });
      } else {
        const err = await res.json();
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Logged in successfully." });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else {
        const err = await res.json();
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side: Branding & Value Prop */}
      <div className="relative flex-1 bg-foreground overflow-hidden text-white flex items-center justify-center p-8 lg:p-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent opacity-80 mix-blend-overlay"></div>
          {/* subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
            Secure your freelance deals with absolute trust.
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed font-light">
            TrustLayer uses smart escrow milestones to ensure buyers get exactly what they pay for, and freelancers get paid for exactly what they do.
          </p>

          <div className="space-y-4">
            {[
              "Funds held securely in escrow",
              "Milestone-based automated payouts",
              "Dispute resolution guarantees"
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-3 text-white/80"
              >
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side: Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-card relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md space-y-8 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to manage your secure projects.</p>
          </div>

          <div className="bg-background border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            {step === "email" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10 h-14 bg-card"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl active:translate-y-0"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continue with Email"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground mb-4">We sent a 6-digit code to {email}</p>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP code"
                    className="pl-10 h-14 bg-card tracking-widest text-center text-xl font-bold"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl active:translate-y-0"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Login"}
                </Button>
                <div className="mt-4">
                  <Button variant="ghost" className="text-sm text-muted-foreground" onClick={() => setStep("email")} type="button">
                    Change email address
                  </Button>
                </div>
              </form>
            )}

            <p className="mt-8 text-sm text-muted-foreground text-center">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
