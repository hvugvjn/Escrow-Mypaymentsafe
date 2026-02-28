import { useState } from "react";
import { Lock, CheckCircle2, Loader2, Mail, KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { PaxLogo } from "@/components/pax-logo";

type Step =
  | "auth"            // Combined: email + password (login or register)
  | "otp-register"    // Verify OTP after register
  | "forgot"          // Forgot password — enter email
  | "otp-reset"       // OTP for password reset
  | "reset";          // New password + confirm after OTP verified

// ── Defined OUTSIDE Landing so it never remounts on re-render ──────────────
interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  show: boolean;
  toggle: () => void;
  minLength?: number;
}

function PasswordInput({ id, value, onChange, placeholder, show, toggle, minLength = 8 }: PasswordInputProps) {
  return (
    <div className="relative">
      <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="pl-10 pr-10 h-14 bg-card"
        value={value}
        onChange={onChange}
        required
        minLength={minLength}
        autoComplete={show ? "off" : "current-password"}
      />
      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Landing() {
  const [step, setStep] = useState<Step>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const api = async (url: string, body: object) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
  };

  // Combined auth: try login first; if no account, register
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      // Check if email exists
      const { exists, hasPassword } = await api("/api/auth/check-email", { email });

      if (exists && hasPassword) {
        // Returning user → try login
        if (isNewUser) {
          // they toggled to register mode, but account exists
          toast({ variant: "destructive", title: "Account exists", description: "This email already has an account. Please log in instead." });
          setIsNewUser(false);
          setLoading(false);
          return;
        }
        await api("/api/auth/login", { email, password });
        toast({ title: "Welcome back! 👋", description: "Logged in successfully." });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else {
        // New user → register
        if (confirmPassword === "") {
          // they haven't filled confirm password yet — show confirm field
          setIsNewUser(true);
          setLoading(false);
          toast({ title: "New account", description: "Please confirm your password to create your account." });
          return;
        }
        if (password !== confirmPassword) {
          toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
          setLoading(false);
          return;
        }
        await api("/api/auth/register", { email, password, confirmPassword });
        toast({ title: "OTP Sent!", description: "Check your email to verify your account." });
        setStep("otp-register");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
    setLoading(false);
  };

  // Verify OTP after registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/auth/verify-otp", { email, otp });
      toast({ title: "Welcome to pax! 🎉", description: "Your account is verified." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Invalid OTP", description: err.message });
    }
    setLoading(false);
  };

  // Forgot password: send OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/auth/forgot-password", { email });
      toast({ title: "OTP Sent!", description: "Check your email for the reset code." });
      setStep("otp-reset");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
    setLoading(false);
  };

  // Verify reset OTP
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "Enter the 6-digit OTP" });
      return;
    }
    setStep("reset");
  };

  // Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/reset-password", { email, otp, newPassword, confirmPassword: confirmNewPassword });
      toast({ title: "Password Reset! ✅", description: "You are now logged in." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
    setLoading(false);
  };

  const stepConfig: Record<Step, { title: string; subtitle: string }> = {
    auth: { title: "Welcome to", subtitle: "Sign in or create your account." },
    "otp-register": { title: "Verify Your Email", subtitle: `We sent a 6-digit code to ${email}` },
    forgot: { title: "Forgot Password?", subtitle: "We'll send a reset code to your email." },
    "otp-reset": { title: "Enter Reset Code", subtitle: `Check your email at ${email}` },
    reset: { title: "Set New Password", subtitle: "Choose a strong password for your account." },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left: Branding */}
      <div className="relative flex-1 bg-foreground overflow-hidden text-white flex items-center justify-center p-8 lg:p-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent opacity-80 mix-blend-overlay" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-xl">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
            Secure your freelance deals with absolute trust.
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed font-light">
            <PaxLogo white className="text-xl" /> uses smart escrow milestones to ensure buyers get exactly what they pay for, and freelancers get paid for exactly what they do.
          </p>
          <div className="space-y-4">
            {["Funds held securely in escrow", "Milestone-based automated payouts", "Dispute resolution guarantees"].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }} className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-medium">{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-card relative">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-md space-y-8 text-center">

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-foreground">
                {step === "auth"
                  ? <>{stepConfig[step].title} <PaxLogo className="text-3xl" /></>
                  : stepConfig[step].title
                }
              </h2>
              <p className="text-muted-foreground">{stepConfig[step].subtitle}</p>
            </motion.div>
          </AnimatePresence>

          <div className="bg-background border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <AnimatePresence mode="wait">

              {/* COMBINED AUTH: Email + Password (+ optional Confirm for new users) */}
              {step === "auth" && (
                <motion.form key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleAuth} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="auth-email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10 h-14 bg-card"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <PasswordInput
                    id="auth-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password (min 8 chars)"
                    show={showPassword}
                    toggle={() => setShowPassword(v => !v)}
                  />
                  {/* Confirm password field — shown when user appears new */}
                  {isNewUser && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <PasswordInput
                        id="auth-confirm-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        show={showConfirm}
                        toggle={() => setShowConfirm(v => !v)}
                      />
                      {password && confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-destructive text-left mt-1">⚠ Passwords do not match</p>
                      )}
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    disabled={loading || (isNewUser && !!password && !!confirmPassword && password !== confirmPassword)}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isNewUser ? "Create Account & Verify Email" : "Continue →"}
                  </Button>
                  <div className="flex items-center justify-between pt-2">
                    {isNewUser ? (
                      <button type="button" onClick={() => { setIsNewUser(false); setConfirmPassword(""); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-3 h-3" /> Back to Sign In
                      </button>
                    ) : (
                      <button type="button" onClick={() => { setIsNewUser(true); }} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
                        New here? Create account
                      </button>
                    )}
                    <button type="button" onClick={() => setStep("forgot")} className="text-sm text-primary hover:underline font-medium">
                      Forgot Password?
                    </button>
                  </div>
                </motion.form>
              )}

              {/* OTP for new user registration */}
              {step === "otp-register" && (
                <motion.form key="otp-register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="text" inputMode="numeric" placeholder="Enter 6-digit OTP" className="pl-10 h-14 bg-card tracking-widest text-center text-xl font-bold" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={loading || otp.length < 6}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Create Account"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                      // Re-send OTP by re-calling register
                      setLoading(true);
                      fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password, confirmPassword: password }),
                      }).finally(() => setLoading(false));
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Resend OTP
                  </button>
                </motion.form>
              )}

              {/* Forgot Password — email entry */}
              {step === "forgot" && (
                <motion.form key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" placeholder="Enter your email" className="pl-10 h-14 bg-card" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Code"}
                  </Button>
                  <button type="button" onClick={() => setStep("auth")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto">
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                  </button>
                </motion.form>
              )}

              {/* OTP for reset */}
              {step === "otp-reset" && (
                <motion.form key="otp-reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleVerifyResetOtp} className="space-y-4">
                  <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="text" inputMode="numeric" placeholder="Enter 6-digit OTP" className="pl-10 h-14 bg-card tracking-widest text-center text-xl font-bold" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={otp.length < 6}>
                    Verify Code →
                  </Button>
                </motion.form>
              )}

              {/* New Password after reset OTP */}
              {step === "reset" && (
                <motion.form key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleResetPassword} className="space-y-4">
                  <PasswordInput
                    id="reset-new-password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    show={showNewPassword}
                    toggle={() => setShowNewPassword(v => !v)}
                  />
                  <PasswordInput
                    id="reset-confirm-password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    show={showConfirmNew}
                    toggle={() => setShowConfirmNew(v => !v)}
                  />
                  {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                    <p className="text-xs text-destructive text-left">⚠ Passwords do not match</p>
                  )}
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={loading || (!!newPassword && !!confirmNewPassword && newPassword !== confirmNewPassword)}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Reset Password & Login"}
                  </Button>
                </motion.form>
              )}

            </AnimatePresence>

            <p className="mt-8 text-sm text-muted-foreground text-center">
              By continuing, you agree to our{" "}
              <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span> and{" "}
              <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
