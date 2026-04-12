import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaxLogo } from "@/components/pax-logo";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const POPULAR_SKILLS = [
  "React", "Node.js", "UI/UX Design", "Python", "SEO",
  "Tailwind CSS", "TypeScript", ".NET", "Copywriting", "Figma",
  "WordPress", "AWS", "SQL", "Logo Design", "Marketing"
];

export default function ProfileComplete() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (user?.role) {
      setLocation("/dashboard");
    }
  }, [user?.role, setLocation]);

  const [role, setRole] = useState<'BUYER' | 'FREELANCER' | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    country: "",
    portfolioLink: "",
    bio: ""
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = customSkill.trim();
      if (val && !selectedSkills.includes(val)) {
        setSelectedSkills([...selectedSkills, val]);
      }
      setCustomSkill("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    let finalSkills = [...selectedSkills];
    const val = customSkill.trim();
    if (val && !finalSkills.includes(val)) {
      finalSkills.push(val);
      setSelectedSkills(finalSkills);
      setCustomSkill("");
    }

    let resumeUrl = undefined;
    if (role === 'FREELANCER' && resumeFile) {
      setIsUploading(true);
      const data = new FormData();
      data.append("document", resumeFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      setIsUploading(false);
      if (res.ok) {
        const json = await res.json();
        resumeUrl = json.url;
      }
    }

    await updateProfile.mutateAsync({
      role,
      country: formData.country,
      bio: formData.bio,
      ...(role === 'BUYER'
        ? { companyName: formData.companyName, phone: formData.phone }
        : { skills: finalSkills.join(", "), portfolioLink: formData.portfolioLink || undefined, resumeUrl })
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
              Hi {user?.firstName}, let's get you set up to use <PaxLogo className="text-base" />. Are you looking to hire or find work?
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
                    <h3 className="font-bold text-lg">Buyer</h3>
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
                    <h3 className="font-bold text-lg">Freelancer</h3>
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
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={value => setFormData({ ...formData, country: value })} required>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      className="bg-muted/50"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      className="bg-muted/50"
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {role === 'FREELANCER' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={value => setFormData({ ...formData, country: value })} required>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label>Key Skills</Label>
                    <div className="flex flex-wrap gap-2">
                       {POPULAR_SKILLS.map(skill => {
                         const isSelected = selectedSkills.includes(skill);
                         return (
                           <button
                             type="button"
                             key={skill}
                             onClick={() => toggleSkill(skill)}
                             className={cn(
                               "px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm",
                               isSelected 
                                ? "bg-gradient-to-r from-blue-600 to-primary text-white border-transparent" 
                                : "bg-card border border-border text-foreground hover:border-primary/50"
                             )}
                           >
                             {skill}
                           </button>
                         );
                       })}
                       {selectedSkills.filter(s => !POPULAR_SKILLS.includes(s)).map(skill => (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent"
                          >
                            {skill} &times;
                          </button>
                       ))}
                    </div>
                    <div className="pt-2 flex gap-2">
                      <Input
                        placeholder="Don't see your skill? Type it here"
                        className="flex-1 bg-muted/50 border-dashed border-2"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyDown={handleAddCustomSkill}
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        disabled={!customSkill.trim()}
                        onClick={(e) => handleAddCustomSkill({ key: 'Enter', preventDefault: () => {} } as any)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolioLink">Portfolio URL (Optional)</Label>
                    <Input
                      id="portfolioLink"
                      type="url"
                      className="bg-muted/50"
                      placeholder="https://"
                      value={formData.portfolioLink}
                      onChange={e => setFormData({ ...formData, portfolioLink: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      className="bg-muted/50"
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume Document (Required)</Label>
                    <Input
                      id="resume"
                      type="file"
                      required={role === 'FREELANCER'}
                      accept=".pdf,.doc,.docx"
                      className="bg-muted/50 pt-2"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={
                  !role || 
                  updateProfile.isPending || 
                  isUploading || 
                  (role === 'FREELANCER' && selectedSkills.length === 0 && customSkill.trim() === "") ||
                  (role === 'FREELANCER' && !resumeFile)
                }
              >
                {updateProfile.isPending || isUploading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
