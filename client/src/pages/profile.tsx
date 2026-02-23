import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, MapPin, Phone, Building2, Link as LinkIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
    const { user } = useAuth();

    if (!user) return null;

    const isBuyer = user.role === 'BUYER';

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-display font-bold">Your Profile</h1>
                <Button variant="outline" onClick={() => window.location.href = '/api/logout'}>Logout</Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold uppercase overflow-hidden border">
                        {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : user.firstName?.[0] || 'U'}
                    </div>
                    <div>
                        <CardTitle className="text-2xl">{user.firstName} {user.lastName}</CardTitle>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="font-semibold px-3 py-1 bg-secondary text-secondary-foreground">
                                {isBuyer ? <Briefcase className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                {isBuyer ? "Buyer" : "Freelancer"}
                            </Badge>
                            {user.country && (
                                <Badge variant="outline" className="font-medium text-muted-foreground border-border/60">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {user.country}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-8">
                    {/* Bio Section */}
                    <section>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Bio / Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{user.bio || "No bio provided."}</p>
                    </section>

                    {/* Role Specific Info */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Contact & Details</h3>

                            {isBuyer ? (
                                <>
                                    {user.companyName && (
                                        <div className="flex items-center gap-3 text-sm text-foreground">
                                            <Building2 className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Company:</span> <span className="text-muted-foreground">{user.companyName}</span>
                                        </div>
                                    )}
                                    {user.phone && (
                                        <div className="flex items-center gap-3 text-sm text-foreground">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Phone:</span> <span className="text-muted-foreground">{user.phone}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {user.portfolioLink && (
                                        <div className="flex items-center gap-3 text-sm text-foreground">
                                            <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Portfolio:</span>
                                            <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                View Portfolio
                                            </a>
                                        </div>
                                    )}
                                    {user.resumeUrl && (
                                        <div className="flex items-center gap-3 text-sm text-foreground">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Resume:</span>
                                            <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline bg-primary/5 px-2 py-1 rounded border border-primary/20 text-xs">
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
                                <h3 className="text-lg font-semibold border-b pb-2">Top Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.split(',').map((skill, idx) => (
                                        <Badge key={idx} variant="secondary" className="px-3 py-1 bg-muted font-medium hover:bg-muted/80">
                                            {skill.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
