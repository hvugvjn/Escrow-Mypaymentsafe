import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, MapPin, Phone, Building2, Link as LinkIcon, FileText, Pencil, X, Save, Upload } from "lucide-react";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay",
  "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Profile() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    companyName: user?.companyName ?? "",
    phone: user?.phone ?? "",
    country: user?.country ?? "",
    skills: user?.skills ?? "",
    portfolioLink: user?.portfolioLink ?? "",
    bio: user?.bio ?? "",
  });

  if (!user) return null;

  const isBuyer = user.role === "BUYER";

  const handleEdit = () => {
    // Reset form to current user values when opening edit
    setFormData({
      companyName: user.companyName ?? "",
      phone: user.phone ?? "",
      country: user.country ?? "",
      skills: user.skills ?? "",
      portfolioLink: user.portfolioLink ?? "",
      bio: user.bio ?? "",
    });
    setResumeFile(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setResumeFile(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let resumeUrl: string | undefined = undefined;

    if (!isBuyer && resumeFile) {
      setIsUploading(true);
      const data = new FormData();
      data.append("document", resumeFile);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      setIsUploading(false);
      if (res.ok) {
        const json = await res.json();
        resumeUrl = json.url;
      }
    }

    await updateProfile.mutateAsync({
      role: user.role as "BUYER" | "FREELANCER",
      country: formData.country,
      bio: formData.bio,
      ...(isBuyer
        ? { companyName: formData.companyName, phone: formData.phone }
        : {
            skills: formData.skills,
            portfolioLink: formData.portfolioLink || undefined,
            ...(resumeUrl ? { resumeUrl } : {}),
          }),
    });

    setIsEditing(false);
    setResumeFile(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 w-full">

      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Your Profile</h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                <Pencil className="w-4 h-4" /> Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => (window.location.href = "/api/logout")}>
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2 text-muted-foreground">
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card className="border-border/50 shadow-sm">

        {/* Avatar + Name Header */}
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-border/50">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold uppercase overflow-hidden border shrink-0">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.firstName?.[0] || "U"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl md:text-2xl truncate">
              {user.firstName} {user.lastName}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="font-semibold px-3 py-1">
                {isBuyer ? <Briefcase className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                {isBuyer ? "Buyer" : "Freelancer"}
              </Badge>
              {user.country && !isEditing && (
                <Badge variant="outline" className="font-medium text-muted-foreground border-border/60">
                  <MapPin className="w-3 h-3 mr-1" />
                  {user.country}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">

          {/* ─── VIEW MODE ─────────────────────────────────── */}
          {!isEditing && (
            <div className="space-y-8">

              {/* Bio */}
              <section>
                <h3 className="text-base font-semibold border-b pb-2 mb-3">Bio / Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {user.bio || "No bio provided."}
                </p>
              </section>

              {/* Contact Details */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold border-b pb-2">Contact & Details</h3>
                  {isBuyer ? (
                    <>
                      {user.companyName && (
                        <div className="flex items-center gap-3 text-sm">
                          <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">Company:</span>
                          <span className="text-muted-foreground truncate">{user.companyName}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">Phone:</span>
                          <span className="text-muted-foreground">{user.phone}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {user.portfolioLink && (
                        <div className="flex items-center gap-3 text-sm">
                          <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">Portfolio:</span>
                          <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                            View Portfolio
                          </a>
                        </div>
                      )}
                      {user.resumeUrl && (
                        <div className="flex items-center gap-3 text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">Resume:</span>
                          <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer"
                            className="text-primary hover:underline bg-primary/5 px-2 py-1 rounded border border-primary/20 text-xs">
                            Download
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Freelancer Skills */}
                {!isBuyer && user.skills && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold border-b pb-2">Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.split(",").map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1 bg-muted font-medium hover:bg-muted/80">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Edit prompt */}
              <div className="pt-2 border-t border-border/40">
                <p className="text-sm text-muted-foreground">
                  Want to update your info?{" "}
                  <button onClick={handleEdit} className="text-primary hover:underline font-medium">
                    Click here to edit your profile
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ─── EDIT MODE ─────────────────────────────────── */}
          {isEditing && (
            <form onSubmit={handleSave} className="space-y-6">

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell others about yourself..."
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-muted/40 resize-none"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={val => setFormData({ ...formData, country: val })}>
                  <SelectTrigger className="bg-muted/40">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTRIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buyer-specific fields */}
              {isBuyer && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Your company or brand name"
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      className="bg-muted/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-muted/40"
                    />
                  </div>
                </>
              )}

              {/* Freelancer-specific fields */}
              {!isBuyer && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input
                      id="skills"
                      placeholder="e.g. React, Node.js, Figma"
                      value={formData.skills}
                      onChange={e => setFormData({ ...formData, skills: e.target.value })}
                      className="bg-muted/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolioLink">Portfolio URL (Optional)</Label>
                    <Input
                      id="portfolioLink"
                      type="url"
                      placeholder="https://your-portfolio.com"
                      value={formData.portfolioLink}
                      onChange={e => setFormData({ ...formData, portfolioLink: e.target.value })}
                      className="bg-muted/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resume">
                      Resume / CV{" "}
                      {user.resumeUrl && (
                        <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer"
                          className="text-primary text-xs underline ml-2">
                          (view current)
                        </a>
                      )}
                    </Label>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="resume"
                        className="cursor-pointer flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-dashed border-border/70 bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground"
                      >
                        <Upload className="w-4 h-4" />
                        {resumeFile ? resumeFile.name : "Upload new resume (.pdf, .doc, .docx)"}
                      </label>
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
                        }}
                      />
                      {resumeFile && (
                        <button type="button" onClick={() => setResumeFile(null)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/40">
                <Button
                  type="submit"
                  className="flex-1 gap-2 bg-primary"
                  disabled={updateProfile.isPending || isUploading}
                >
                  <Save className="w-4 h-4" />
                  {updateProfile.isPending || isUploading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>

            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
