
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, CheckCircle2, AlertCircle, Plus, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ResultsViewProps {
  originalContent: string;
  optimizedContent: string;
  improvements: {
    skillsMatch: number;
    atsCompatibility: number;
    keywordOptimization: number;
  };
  keyChanges: string[];
}

export function ResultsView({ originalContent, optimizedContent, improvements, keyChanges }: ResultsViewProps) {
  const [shareUrl, setShareUrl] = useState("");
  const { toast } = useToast();

  const sections = [
    { title: "Professional Summary", content: originalContent },
    { title: "Experience", content: originalContent },
    { title: "Skills", content: originalContent }
  ].map(section => {
    const originalSection = extractSection(section.title, originalContent);
    const optimizedSection = extractSection(section.title, optimizedContent);
    return {
      ...section,
      before: originalSection,
      after: optimizedSection
    };
  });

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: optimizedContent,
          improvements,
          keyChanges
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
        {Object.entries(improvements).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="text-sm font-medium">{formatMetricName(key)}</div>
              <div className="mt-2">
                <Progress value={value} className="h-2" />
                <div className="text-sm mt-2 text-right">{value}%</div>
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
                <Plus className="h-5 w-5 text-green-500 mt-0.5" />
                <span>{change}</span>
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
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-medium text-lg">{section.title}</h3>
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
                {index < sections.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function extractSection(sectionTitle: string, content: string): string {
  const sections = content.split(/\n(?=[A-Z])/);
  const section = sections.find(s => 
    s.toLowerCase().includes(sectionTitle.toLowerCase())
  );
  return section || "";
}

function formatMetricName(key: string): string {
  return key
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
