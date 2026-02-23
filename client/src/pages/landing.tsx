import { Shield, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
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
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl hover:shadow-black/10 active:translate-y-0 active:shadow-md"
              onClick={() => window.location.href = '/api/login'}
            >
              <Lock className="w-5 h-5 mr-2" />
              Log in with Replit
            </Button>
            
            <p className="mt-6 text-sm text-muted-foreground text-center">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
