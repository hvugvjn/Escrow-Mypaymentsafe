import { useState } from "react";
import { Shield, Lock, CheckCircle2, Loader2, Mail, KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type Step =
  | "email"           // Step 1: Enter email
  | "register"        // Step 2a: New user — password + confirm + then OTP
  | "otp-register"    // Step 3a: Verify OTP after register
  | "login"           // Step 2b: Returning user — password only
  | "forgot"          // Forgot password — enter email
  | "otp-reset"       // OTP for password reset
  | "reset";          // New password + confirm after OTP verified

export default function Landing() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  // Step 1: Check if email is new or returning
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const data = await api("/api/auth/check-email", { email });
      if (data.exists && data.hasPassword) {
        setStep("login"); // Returning user
      } else {
        setStep("register"); // New user
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
    setLoading(false);
  };

  // Step 2a: Register new user → sends OTP
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/register", { email, password, confirmPassword });
      toast({ title: "OTP Sent!", description: "Check your email to verify your account." });
      setStep("otp-register");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
    setLoading(false);
  };

  // Step 3a: Verify OTP after registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/auth/verify-otp", { email, otp });
      toast({ title: "Welcome to PAX! 🎉", description: "Your account is verified." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Invalid OTP", description: err.message });
    }
    setLoading(false);
  };

  // Step 2b: Login returning user
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/auth/login", { email, password });
      toast({ title: "Welcome back! 👋", description: "Logged in successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login Failed", description: err.message });
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
    email: { title: "Welcome to PAX", subtitle: "Enter your email to get started." },
    register: { title: "Create Your Account", subtitle: "Set a secure password for your account." },
    "otp-register": { title: "Verify Your Email", subtitle: `We sent a 6-digit code to ${email}` },
    login: { title: "Welcome Back!", subtitle: "Enter your password to continue." },
    forgot: { title: "Forgot Password?", subtitle: "We'll send a reset code to your email." },
    "otp-reset": { title: "Enter Reset Code", subtitle: `Check your email at ${email}` },
    reset: { title: "Set New Password", subtitle: "Choose a strong password for your account." },
  };

  const PasswordInput = ({ value, onChange, placeholder, show, toggle }: any) => (
    <div className="relative">
      <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="pl-10 pr-10 h-14 bg-card"
        value={value}
        onChange={onChange}
        required
        minLength={8}
      />
      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left: Branding */}
      <div className="relative flex-1 bg-foreground overflow-hidden text-white flex items-center justify-center p-8 lg:p-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent opacity-80 mix-blend-overlay" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
            Secure your freelance deals with absolute trust.
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed font-light">
            PAX uses smart escrow milestones to ensure buyers get exactly what they pay for, and freelancers get paid for exactly what they do.
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
              <h2 className="text-3xl font-display font-bold text-foreground">{stepConfig[step].title}</h2>
              <p className="text-muted-foreground">{stepConfig[step].subtitle}</p>
            </motion.div>
          </AnimatePresence>

          <div className="bg-background border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <AnimatePresence mode="wait">

              {/* STEP 1: Email */}
              {step === "email" && (
                <motion.form key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleCheckEmail} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" placeholder="Enter your email address" className="pl-10 h-14 bg-card" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continue →"}
                  </Button>
                </motion.form>
              )}

              {/* STEP 2a: Register — New User */}
              {step === "register" && (
                <motion.form key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRegister} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" className="pl-10 h-14 bg-muted/50 text-muted-foreground" value={email} readOnly />
                  </div>
                  <PasswordInput value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="Create password (min 8 chars)" show={showPassword} toggle={() => setShowPassword(v => !v)} />
                  <PasswordInput value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} placeholder="Confirm password" show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive text-left">⚠ Passwords do not match</p>
                  )}
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={loading || (!!password && !!confirmPassword && password !== confirmPassword)}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account & Verify Email"}
                  </Button>
                  <button type="button" onClick={() => { setStep("email"); setPassword(""); setConfirmPassword(""); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto">
                    <ArrowLeft className="w-3 h-3" /> Use different email
                  </button>
                </motion.form>
              )}

              {/* STEP 3a: OTP for new user */}
              {step === "otp-register" && (
                <motion.form key="otp-register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="text" inputMode="numeric" placeholder="Enter 6-digit OTP" className="pl-10 h-14 bg-card tracking-widest text-center text-xl font-bold" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={loading || otp.length < 6}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Create Account"}
                  </Button>
                  <button type="button" onClick={() => handleRegister({ preventDefault: () => { } } as any)} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
                    Resend OTP
                  </button>
                </motion.form>
              )}

              {/* STEP 2b: Login — Returning User */}
              {step === "login" && (
                <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" className="pl-10 h-14 bg-muted/50 text-muted-foreground" value={email} readOnly />
                  </div>
                  <PasswordInput value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="Enter your password" show={showPassword} toggle={() => setShowPassword(v => !v)} />
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Login →"}
                  </Button>
                  <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={() => { setStep("email"); setPassword(""); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <button type="button" onClick={() => setStep("forgot")} className="text-sm text-primary hover:underline font-medium">
                      Forgot Password?
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Forgot Password */}
              {step === "forgot" && (
                <motion.form key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" placeholder="Enter your email" className="pl-10 h-14 bg-card" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Code"}
                  </Button>
                  <button type="button" onClick={() => setStep("login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto">
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
                  <PasswordInput value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} placeholder="New password (min 8 chars)" show={showPassword} toggle={() => setShowPassword(v => !v)} />
                  <PasswordInput value={confirmNewPassword} onChange={(e: any) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
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
