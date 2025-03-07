
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, CheckCircle2, AlertCircle, Plus, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ResultsView() {
  const [activeTab, setActiveTab] = useState("comparison");
  const [shareUrl, setShareUrl] = useState("");
  const { toast } = useToast();
  
  const improvements = [
    { type: "Skills Match", before: 65, after: 95 },
    { type: "ATS Compatibility", before: 72, after: 98 },
    { type: "Keyword Optimization", before: 58, after: 92 }
  ];

  const keyChanges = [
    { type: "added", text: "Key skills: React.js, TypeScript, AWS" },
    { type: "improved", text: "Action verbs in experience descriptions" },
    { type: "optimized", text: "ATS-friendly formatting structure" },
    { type: "added", text: "Quantifiable achievements and metrics" }
  ];

  const beforeAfterComparison = [
    {
      section: "Professional Summary",
      before: "Experienced frontend developer with 5 years of experience in web development",
      after: "Results-driven frontend developer with 5+ years of expertise in modern web development, specializing in React.js and TypeScript. Proven track record of delivering high-performance applications and optimizing user experiences.",
      highlights: ["Results-driven", "specializing in React.js and TypeScript", "Proven track record"]
    },
    {
      section: "Key Achievements",
      before: "Developed web applications using React",
      after: "Architected and developed scalable React.js applications, increasing user engagement by 45% and reducing load times by 30%",
      highlights: ["increasing user engagement by 45%", "reducing load times by 30%"]
    },
    {
      section: "Technical Skills",
      before: "React, JavaScript, HTML, CSS",
      after: "React.js, TypeScript, Node.js, AWS, REST APIs, GraphQL, CI/CD, Performance Optimization",
      highlights: ["TypeScript", "AWS", "GraphQL", "CI/CD"]
    }
  ];

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: document.querySelector(".optimized-content")?.innerHTML,
          improvements,
          keyChanges: keyChanges.map(k => k.text),
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "optimized-resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Your optimized resume has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: "My Optimized Resume",
        text: "Check out my optimized resume!",
        url: shareUrl || window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Success",
          description: "Resume shared successfully",
        });
      } else {
        const url = shareUrl || window.location.href;
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share the resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume Optimization Results</h1>
          <p className="text-muted-foreground mt-2">
            Your resume has been enhanced for maximum impact
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Resume</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter custom share URL (optional)"
                  value={shareUrl}
                  onChange={(e) => setShareUrl(e.target.value)}
                />
                <Button onClick={handleShare} className="w-full">
                  Share Resume
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {improvements.map((item) => (
          <Card key={item.type}>
            <CardContent className="pt-6">
              <div className="text-sm font-medium">{item.type}</div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Before</span>
                  <span>{item.before}%</span>
                </div>
                <Progress value={item.before} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">After</span>
                  <span className="text-primary">{item.after}%</span>
                </div>
                <Progress value={item.after} className="h-2 bg-primary/20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyChanges.map((change, index) => (
              <div key={index} className="flex items-start gap-3">
                {change.type === "added" ? (
                  <Plus className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                )}
                <span>{change.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {beforeAfterComparison.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-medium text-lg">{section.section}</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Before</div>
                    <div className="p-4 rounded-lg border bg-muted/50">{section.before}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary">After</div>
                    <div className="p-4 rounded-lg border bg-primary/5 relative">
                      {section.after}
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {section.highlights.map((highlight, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {highlight}
                    </Badge>
                  ))}
                </div>
                {index < beforeAfterComparison.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ATS Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium mb-2">Overall ATS Score</div>
                <Progress value={98} className="h-3" />
              </div>
              <div className="text-2xl font-bold text-primary">98%</div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-4">Required Skills Found</div>
                <div className="flex flex-wrap gap-2">
                  {["React.js", "TypeScript", "Node.js", "AWS", "REST APIs"].map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-4">Missing Skills</div>
                <div className="flex flex-wrap gap-2">
                  {["GraphQL"].map((skill) => (
                    <Badge key={skill} variant="outline" className="flex items-center gap-1 text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
