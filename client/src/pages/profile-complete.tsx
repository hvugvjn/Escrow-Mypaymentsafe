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

const COUNTRY_DIAL_CODES: Record<string, string> = {
  "Afghanistan": "+93", "Albania": "+355", "Algeria": "+213", "Andorra": "+376", "Angola": "+244", "Antigua and Barbuda": "+1", "Argentina": "+54", "Armenia": "+374", "Australia": "+61", "Austria": "+43", "Azerbaijan": "+994", "Bahamas": "+1", "Bahrain": "+973", "Bangladesh": "+880", "Barbados": "+1", "Belarus": "+375", "Belgium": "+32", "Belize": "+501", "Benin": "+229", "Bhutan": "+975", "Bolivia": "+591", "Bosnia and Herzegovina": "+387", "Botswana": "+267", "Brazil": "+55", "Brunei": "+673", "Bulgaria": "+359", "Burkina Faso": "+226", "Burundi": "+257", "Côte d'Ivoire": "+225", "Cabo Verde": "+238", "Cambodia": "+855", "Cameroon": "+237", "Canada": "+1", "Central African Republic": "+236", "Chad": "+235", "Chile": "+56", "China": "+86", "Colombia": "+57", "Comoros": "+269", "Congo": "+242", "Costa Rica": "+506", "Croatia": "+385", "Cuba": "+53", "Cyprus": "+357", "Czechia": "+420", "Denmark": "+45", "Djibouti": "+253", "Dominica": "+1", "Dominican Republic": "+1", "Ecuador": "+593", "Egypt": "+20", "El Salvador": "+503", "Equatorial Guinea": "+240", "Eritrea": "+291", "Estonia": "+372", "Eswatini": "+268", "Ethiopia": "+251", "Fiji": "+679", "Finland": "+358", "France": "+33", "Gabon": "+241", "Gambia": "+220", "Georgia": "+995", "Germany": "+49", "Ghana": "+233", "Greece": "+30", "Grenada": "+1", "Guatemala": "+502", "Guinea": "+224", "Guinea-Bissau": "+245", "Guyana": "+592", "Haiti": "+509", "Holy See": "+379", "Honduras": "+504", "Hungary": "+36", "Iceland": "+354", "India": "+91", "Indonesia": "+62", "Iran": "+98", "Iraq": "+964", "Ireland": "+353", "Israel": "+972", "Italy": "+39", "Jamaica": "+1", "Japan": "+81", "Jordan": "+962", "Kazakhstan": "+7", "Kenya": "+254", "Kiribati": "+686", "Kuwait": "+965", "Kyrgyzstan": "+996", "Laos": "+856", "Latvia": "+371", "Lebanon": "+961", "Lesotho": "+266", "Liberia": "+231", "Libya": "+218", "Liechtenstein": "+423", "Lithuania": "+370", "Luxembourg": "+352", "Madagascar": "+261", "Malawi": "+265", "Malaysia": "+60", "Maldives": "+960", "Mali": "+223", "Malta": "+356", "Marshall Islands": "+692", "Mauritania": "+222", "Mauritius": "+230", "Mexico": "+52", "Micronesia": "+691", "Moldova": "+373", "Monaco": "+377", "Mongolia": "+976", "Montenegro": "+382", "Morocco": "+212", "Mozambique": "+258", "Myanmar": "+95", "Namibia": "+264", "Nauru": "+674", "Nepal": "+977", "Netherlands": "+31", "New Zealand": "+64", "Nicaragua": "+505", "Niger": "+227", "Nigeria": "+234", "North Korea": "+850", "North Macedonia": "+389", "Norway": "+47", "Oman": "+968", "Pakistan": "+92", "Palau": "+680", "Palestine State": "+970", "Panama": "+507", "Papua New Guinea": "+675", "Paraguay": "+595", "Peru": "+51", "Philippines": "+63", "Poland": "+48", "Portugal": "+351", "Qatar": "+974", "Romania": "+40", "Russia": "+7", "Rwanda": "+250", "Saint Kitts and Nevis": "+1", "Saint Lucia": "+1", "Saint Vincent and the Grenadines": "+1", "Samoa": "+685", "San Marino": "+378", "Sao Tome and Principe": "+239", "Saudi Arabia": "+966", "Senegal": "+221", "Serbia": "+381", "Seychelles": "+248", "Sierra Leone": "+232", "Singapore": "+65", "Slovakia": "+421", "Slovenia": "+386", "Solomon Islands": "+677", "Somalia": "+252", "South Africa": "+27", "South Korea": "+82", "South Sudan": "+211", "Spain": "+34", "Sri Lanka": "+94", "Sudan": "+249", "Suriname": "+597", "Sweden": "+46", "Switzerland": "+41", "Syria": "+963", "Tajikistan": "+992", "Tanzania": "+255", "Thailand": "+66", "Timor-Leste": "+670", "Togo": "+228", "Tonga": "+676", "Trinidad and Tobago": "+1", "Tunisia": "+216", "Turkey": "+90", "Turkmenistan": "+993", "Tuvalu": "+688", "Uganda": "+256", "Ukraine": "+380", "United Arab Emirates": "+971", "United Kingdom": "+44", "United States of America": "+1", "Uruguay": "+598", "Uzbekistan": "+998", "Vanuatu": "+678", "Venezuela": "+58", "Vietnam": "+84", "Yemen": "+967", "Zambia": "+260", "Zimbabwe": "+263"
};
const COUNTRIES = Object.keys(COUNTRY_DIAL_CODES);

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
        ? { companyName: formData.companyName, phone: formData.country && formData.phone ? `${COUNTRY_DIAL_CODES[formData.country] || ''} ${formData.phone}`.trim() : formData.phone }
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
                    <div className="flex">
                      <div className="bg-muted/50 border border-border border-r-0 rounded-l-md px-3 flex items-center justify-center text-sm text-foreground/80 font-medium whitespace-nowrap">
                        {formData.country ? COUNTRY_DIAL_CODES[formData.country] || '+' : '+'}
                      </div>
                      <Input
                        id="phone"
                        className="bg-muted/50 rounded-l-none"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
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
