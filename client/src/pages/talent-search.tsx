import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, Search, MapPin, Briefcase, ExternalLink, Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TalentSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [, setLocation] = useLocation();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (freelancerId: string) => {
    try {
      setConnectingId(freelancerId);
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId })
      });
      if (!res.ok) throw new Error("Failed to create chat");
      const chat = await res.json();
      setLocation(`/inbox/${chat.id}`);
    } catch (err) {
      console.error(err);
      setConnectingId(null);
    }
  };

  const { data: freelancers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/freelancers", queryTerm],
    queryFn: async () => {
      const res = await fetch(`/api/freelancers?search=${encodeURIComponent(queryTerm)}`);
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryTerm(searchTerm);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 md:p-14 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-display font-bold">Find the Perfect Talent</h1>
          <p className="text-blue-100/80 text-lg">
            Search our curated network of highly-skilled VIP talents, ready to execute your project under the secure PAX managed vault.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 mt-8 max-w-3xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                className="w-full text-foreground bg-white text-lg pl-14 pr-6 h-16 rounded-full shadow-lg border-2 border-transparent focus-visible:ring-0 focus-visible:border-amber-400 transition-all"
                placeholder="E.g., React, .NET, UI Design..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
                type="submit" 
                className="w-full sm:w-auto rounded-full px-10 h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl font-bold text-lg transition-transform hover:scale-105"
            >
              Search
            </Button>
          </form>
           <div className="flex flex-wrap justify-center gap-2 pt-2">
            <span className="text-sm text-blue-200 mr-2">Popular:</span>
            {[
              "Full-Stack Development",
              "React.js",
              "Next.js",
              "Python",
              "API Integration",
              "Mobile App Development",
              "Shopify Development",
              "UI/UX Design",
              "Figma",
              "Adobe Creative Suite",
              "Motion Graphics",
              "Brand Identity Design",
              "SEO",
              "Direct Response Copywriting",
              "Social Media Management",
              "Performance Marketing",
              "Data Analytics",
              "AI Prompt Engineering",
              "Project Management",
              "Virtual Assistance"
            ].map(skill => (
              <button 
                key={skill} 
                type="button" 
                onClick={() => { setSearchTerm(skill); setQueryTerm(skill); }}
                className="text-xs bg-white/10 hover:bg-white/20 text-white rounded-full px-3 py-1 transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
           <>
             <div className="flex items-center justify-between px-2">
               <h2 className="text-xl font-bold font-display">
                 {queryTerm ? `Search Results for "${queryTerm}"` : 'Top Available Freelancers'}
                 <span className="text-muted-foreground ml-2 text-sm font-normal">({freelancers?.length || 0} found)</span>
               </h2>
               <Button variant="outline" size="sm" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                 Request Sourcing
               </Button>
             </div>

             {freelancers?.length === 0 ? (
               <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border/60 p-8">
                 <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                 <h3 className="text-xl font-semibold mb-2">No freelancers found</h3>
                 <p className="text-muted-foreground max-w-md mx-auto mb-6">We couldn't find any talent matching that specific skill. Try a different keyword or let our specialized team find them for you.</p>
                 <Button size="lg" className="rounded-full px-8 bg-blue-600">
                   Request White-Glove Sourcing
                 </Button>
               </div>
             ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {freelancers?.map((freelancer) => {
                    const skills = freelancer.skills ? freelancer.skills.split(",").map((s: string) => s.trim()) : [];
                    
                    return (
                      <Card key={freelancer.id} className="hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden group">
                        <CardHeader className="pb-4 bg-muted/10 border-b border-border/30">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4 items-center">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center flex-shrink-0 shadow-inner">
                                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <CardTitle className="text-xl">
                                  {freelancer.firstName && freelancer.lastName 
                                    ? `${freelancer.firstName} ${freelancer.lastName.charAt(0)}.` 
                                    : freelancer.email?.split("@")[0]}
                                </CardTitle>
                                <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground font-medium">
                                  {freelancer.country && (
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> {freelancer.country}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Available
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-background">Top Rated</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                            {freelancer.bio || "This talent hasn't added a bio yet."}
                          </p>
                          
                          <div className="space-y-3">
                            <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5" /> Core Expertise
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {skills.slice(0, 8).map((skill: string, i: number) => (
                                <span 
                                  key={i} 
                                  className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium rounded-full cursor-default transition-colors"
                                >
                                  {skill}
                                </span>
                              ))}
                              {skills.length > 8 && (
                                <span className="px-3 py-1 bg-border/40 text-muted-foreground text-xs font-medium rounded-full">
                                  +{skills.length - 8} more
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 border-t border-border/30 pt-4 flex gap-3">
                           {freelancer.portfolioLink && (
                             <Button variant="outline" className="flex-1 rounded-xl" onClick={() => window.open(freelancer.portfolioLink, '_blank')}>
                               <ExternalLink className="w-4 h-4 mr-2" /> Portfolio
                             </Button>
                           )}
                           {freelancer.resumeUrl && (
                             <Button variant="outline" className="flex-1 rounded-xl" onClick={() => window.open(freelancer.resumeUrl, '_blank')}>
                               <FileText className="w-4 h-4 mr-2" /> Resume
                             </Button>
                           )}
                           <Button 
                              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white" 
                              disabled={connectingId === freelancer.id}
                              onClick={() => handleConnect(freelancer.id)}
                           >
                             {connectingId === freelancer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                           </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
             )}
           </>
        )}
      </div>
    </div>
  );
}
