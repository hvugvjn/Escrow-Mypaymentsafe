import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfileComplete() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const updateProfile = useUpdateProfile();
  
  const [role, setRole] = useState<'BUYER' | 'FREELANCER' | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    skills: "",
    portfolioLink: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    await updateProfile.mutateAsync({
      role,
      ...(role === 'BUYER' 
        ? { companyName: formData.companyName, phone: formData.phone }
        : { skills: formData.skills, portfolioLink: formData.portfolioLink })
    });
    
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-display">Complete Your Profile</CardTitle>
            <CardDescription className="text-base mt-2">
              Hi {user?.firstName}, let's get you set up to use TrustLayer. Are you looking to hire or find work?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('BUYER')}
                  className={cn(
                    "p-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition-all duration-200",
                    role === 'BUYER' 
                      ? "border-primary bg-primary/5 text-primary shadow-md" 
                      : "border-border bg-card hover:border-primary/30 hover:bg-muted"
                  )}
                >
                  <Briefcase className="w-12 h-12" />
                  <div className="text-center">
                    <h3 className="font-bold text-lg">I'm a Buyer</h3>
                    <p className="text-sm opacity-80 mt-1">I want to hire freelancers securely</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('FREELANCER')}
                  className={cn(
                    "p-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition-all duration-200",
                    role === 'FREELANCER' 
                      ? "border-primary bg-primary/5 text-primary shadow-md" 
                      : "border-border bg-card hover:border-primary/30 hover:bg-muted"
                  )}
                >
                  <UserCircle2 className="w-12 h-12" />
                  <div className="text-center">
                    <h3 className="font-bold text-lg">I'm a Freelancer</h3>
                    <p className="text-sm opacity-80 mt-1">I want to get paid securely</p>
                  </div>
                </button>
              </div>

              {role === 'BUYER' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      className="bg-muted/50"
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      className="bg-muted/50"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {role === 'FREELANCER' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Key Skills (comma separated)</Label>
                    <Input 
                      id="skills" 
                      className="bg-muted/50"
                      placeholder="e.g. React, Node.js, Design"
                      value={formData.skills}
                      onChange={e => setFormData({...formData, skills: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolioLink">Portfolio URL</Label>
                    <Input 
                      id="portfolioLink" 
                      type="url"
                      className="bg-muted/50"
                      placeholder="https://"
                      value={formData.portfolioLink}
                      onChange={e => setFormData({...formData, portfolioLink: e.target.value})}
                      required
                    />
                  </div>
                </motion.div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={!role || updateProfile.isPending}
              >
                {updateProfile.isPending ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
